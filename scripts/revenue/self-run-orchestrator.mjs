#!/usr/bin/env node
/**
 * Revenue Autopilot v1 — Step 4
 *
 * Combines the select / pack / validate outputs into a single orchestrator
 * gate decision. Safe-merges into .ai/AUTOPILOT_STATUS.json: only the
 * `revenue_self_run_v1` key is updated; every other top-level key is
 * preserved verbatim. If the existing status file is unreadable / invalid
 * JSON, it is NOT overwritten and a *_WRITE_SKIPPED_*.md evidence note
 * is emitted instead.
 *
 * Outputs:
 *   .ai/ORCHESTRATOR_GATE_DECISION.json
 *   .ai/REVENUE_SELF_RUN_V1_REVIEW_<DATE>.md
 *   .ai/AUTOPILOT_STATUS.json                  (safe-merged)
 *   .ai/AUTOPILOT_STATUS_WRITE_SKIPPED_<DATE>.md (only on parse failure)
 *
 * Behaviour contract:
 *   - Business No-Go (Revenue Evidence, KPI, Paid Smoke) → decision=no_go
 *     or conditional_go, exit 0.
 *   - Conditional Go only when Revenue Evidence + KPI both green; Paid
 *     Smoke is hard-locked false until explicit human approval.
 *   - exit 2 only on script bug / write failure.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AI_DIR = path.join(ROOT, ".ai");
const TODAY = process.env.REVENUE_RUN_DATE || "20260723";

const VALIDATION_JSON = path.join(AI_DIR, `REVENUE_SELF_RUN_VALIDATION_${TODAY}.json`);
const OUT_DECISION = path.join(AI_DIR, "ORCHESTRATOR_GATE_DECISION.json");
const OUT_REVIEW = path.join(AI_DIR, `REVENUE_SELF_RUN_V1_REVIEW_${TODAY}.md`);
const AUTOPILOT_STATUS = path.join(AI_DIR, "AUTOPILOT_STATUS.json");
const SKIPPED_NOTE = path.join(AI_DIR, `AUTOPILOT_STATUS_WRITE_SKIPPED_${TODAY}.md`);

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    return { __parse_error: String(err && err.message) };
  }
}

function main() {
  try {
    fs.mkdirSync(AI_DIR, { recursive: true });

    const validation = readJson(VALIDATION_JSON, null);
    const revenueEvidenceGo = Boolean(validation?.revenue_evidence_go);
    const kpiLearningInputGo = Boolean(validation?.kpi_learning_input_go);

    // Hard-locked: never auto-flip to true. Stripe test paid smoke requires
    // explicit human approval and is recorded as a separate evidence file.
    const paidSmokeGo = false;
    const paidSmokeReason =
      "Stripe test paid smoke evidence not present in this gate (hard-locked)";

    let decision = "no_go";
    let executionGo = false;
    const reasons = [];

    if (!revenueEvidenceGo) {
      reasons.push(
        "Need at least 3 real public published URLs with UTM evidence."
      );
    }
    if (!kpiLearningInputGo) {
      reasons.push(
        "Need at least 1 real non-zero KPI row not marked operator_smoke_visit."
      );
    }
    if (!paidSmokeGo) {
      reasons.push(paidSmokeReason);
    }

    if (revenueEvidenceGo && kpiLearningInputGo && !paidSmokeGo) {
      decision = "conditional_go";
      executionGo = false;
      reasons.push(
        "Publishing + KPI loop has evidence, but paid smoke remains No-Go."
      );
    }
    if (revenueEvidenceGo && kpiLearningInputGo && paidSmokeGo) {
      decision = "go";
      executionGo = true;
    }

    const payload = {
      generated_at: new Date().toISOString(),
      date: TODAY,
      system: "tianji-love-revenue-autopilot-v1",
      decision,
      execution_go: executionGo,
      gates: {
        revenue_evidence_go: revenueEvidenceGo,
        kpi_learning_input_go: kpiLearningInputGo,
        stripe_test_paid_smoke_go: paidSmokeGo,
      },
      reasons,
      boundaries: {
        production_deploy: "forbidden",
        live_stripe: "forbidden",
        production_supabase: "forbidden",
        real_paid_smoke: "forbidden",
        auto_merge: "forbidden",
        staging_004: "blocked_until_154_217_241_238_ssh_recovers",
      },
    };

    const reviewMd = [
      `# Revenue Self-Run v1 Review — ${TODAY}`,
      "",
      "## Result",
      "",
      `- decision: ${decision}`,
      `- execution_go: ${executionGo}`,
      "",
      "## Gates",
      "",
      `- Revenue Evidence: ${revenueEvidenceGo ? "Go" : "No-Go"}`,
      `- KPI Learning Input: ${kpiLearningInputGo ? "Go" : "No-Go"}`,
      `- Stripe Test Paid Smoke: ${paidSmokeGo ? "Go" : "No-Go"}`,
      "",
      "## Reasons",
      "",
      ...reasons.map((reason) => `- ${reason}`),
      "",
      "## Next human action",
      "",
      revenueEvidenceGo
        ? "- Revenue URLs exist. Continue KPI collection."
        : `- Manually publish at least 3 selected posts and paste real public URLs into \`.ai/MANUAL_PUBLISH_EVIDENCE_${TODAY}.md\`.`,
      kpiLearningInputGo
        ? "- KPI input exists. A small KPI-driven PR may be planned after review."
        : "- Add at least 1 real non-zero KPI row before any KPI learning PR.",
      "- Stripe test paid smoke requires explicit test-mode approval before execution.",
      "",
      "## Boundaries",
      "",
      "- No production deploy",
      "- No live Stripe",
      "- No production Supabase",
      "- No real paid smoke",
      "- No auto merge",
      "- Do not touch STAGING-004 until 154.217.241.238 SSH recovers",
      "",
    ].join("\n");

    fs.writeFileSync(OUT_DECISION, `${JSON.stringify(payload, null, 2)}\n`);
    fs.writeFileSync(OUT_REVIEW, reviewMd);

    // Safe merge into AUTOPILOT_STATUS.json
    const statusRaw = fs.existsSync(AUTOPILOT_STATUS)
      ? fs.readFileSync(AUTOPILOT_STATUS, "utf8")
      : null;

    let status = null;
    let parseError = null;
    if (statusRaw !== null) {
      try {
        status = JSON.parse(statusRaw);
        if (status === null || typeof status !== "object" || Array.isArray(status)) {
          parseError = "existing AUTOPILOT_STATUS.json is not a JSON object";
          status = null;
        }
      } catch (err) {
        parseError = String(err && err.message);
      }
    }

    if (parseError) {
      // Do NOT overwrite. Emit a skipped note so the human knows.
      const skippedMd = [
        `# AUTOPILOT_STATUS write skipped — ${TODAY}`,
        "",
        "The existing `.ai/AUTOPILOT_STATUS.json` could not be safely parsed.",
        "Per the v1 safety contract, the file is left untouched and the new",
        "`revenue_self_run_v1` decision is published only in the standalone",
        "outputs above.",
        "",
        `- parse_error: ${parseError}`,
        "",
        "## Human action",
        "",
        "Inspect `.ai/AUTOPILOT_STATUS.json` manually, fix the JSON, and rerun",
        "`npm run revenue:self-run:gate`. The orchestrator will then perform",
        "a safe key-level merge.",
        "",
      ].join("\n");
      fs.writeFileSync(SKIPPED_NOTE, skippedMd);
      console.log(
        JSON.stringify({ ...payload, status_write_skipped: true, parse_error: parseError }, null, 2)
      );
      return;
    }

    const baseStatus = status && typeof status === "object" ? status : {};
    const nextStatus = {
      ...baseStatus,
      revenue_self_run_v1: {
        updated_at: payload.generated_at,
        decision,
        execution_go: executionGo,
        gates: payload.gates,
        next_human_action: revenueEvidenceGo
          ? "Backfill real KPI and continue daily report"
          : "Publish 3 selected posts and backfill real public URLs",
      },
    };
    fs.writeFileSync(AUTOPILOT_STATUS, `${JSON.stringify(nextStatus, null, 2)}\n`);

    console.log(JSON.stringify(payload, null, 2));
    // exit 0 by design — even decision=no_go is a successful orchestrator run.
  } catch (err) {
    console.error("self-run-orchestrator failed:", err && err.message);
    process.exit(2);
  }
}

main();