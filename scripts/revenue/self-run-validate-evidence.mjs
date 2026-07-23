#!/usr/bin/env node
/**
 * Revenue Autopilot v1 — Step 3
 *
 * Validates manual publish evidence (real public URLs with UTM) and KPI
 * evidence (at least 1 real non-zero row not marked operator_smoke_visit).
 *
 * Inputs:
 *   MANUAL_PUBLISH_EVIDENCE  → optional override; default is
 *     .ai/MANUAL_PUBLISH_EVIDENCE_<REVENUE_RUN_DATE>.md
 *   data/kpi/ (recursive, *.csv)
 *
 * Behaviour (2026-07-23 corrected contract):
 *   - Default evidence file is TODAY's file, not the historical 20260629 file.
 *   - If the today file does not exist, an empty template is created so
 *     the human operator can paste URLs into it later. The gate still
 *     reports Revenue Evidence No-Go. Exit code stays 0.
 *   - Business No-Go (no real URLs, no real KPI, operator-only KPI) is
 *     recorded in the JSON / MD outputs. Exit code 0.
 *   - Only fatal parse failures / write failures trigger exit 2.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AI_DIR = path.join(ROOT, ".ai");
const KPI_DIR = path.join(ROOT, "data", "kpi");

const TODAY = process.env.REVENUE_RUN_DATE || "20260723";

const MANUAL_EVIDENCE = process.env.MANUAL_PUBLISH_EVIDENCE
  ? path.resolve(process.env.MANUAL_PUBLISH_EVIDENCE)
  : path.join(AI_DIR, `MANUAL_PUBLISH_EVIDENCE_${TODAY}.md`);

const OUT_JSON = path.join(AI_DIR, `REVENUE_SELF_RUN_VALIDATION_${TODAY}.json`);
const OUT_MD = path.join(AI_DIR, `KPI_REAL_DATA_EVIDENCE_${TODAY}.md`);

const TEMPLATE_HEADER = `# Manual Publish Evidence — ${TODAY}

> Human-approved Revenue Autopilot v1 manual publish log.
> Paste a real public URL into each \`published_url:\` line.
> The orchestrator gate reads this file. Empty entries → No-Go (business, not script failure).

`;

const TEMPLATE_BLOCK = `\`\`\`yaml
queue_file: 
queue_row_id: 
platform: 
published_url: 
utm_url: 
published_at: 
landing_page: 
cta: 
status: manual_published
operator: 
notes: 
\`\`\`
`;

function listFiles(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      if (entry.isFile() && entry.name.endsWith(ext)) out.push(full);
    }
  }
  walk(dir);
  return out;
}

function parseYamlBlocks(text) {
  const blocks = [];
  const regex = /```yaml\s+([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const raw = match[1];
    const item = {};
    raw.split(/\r?\n/).forEach((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      item[key] = value;
    });
    blocks.push(item);
  }
  return blocks;
}

function isRealPublicUrl(value) {
  if (!value) return false;
  let url;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  const host = url.hostname.toLowerCase();
  if (!["http:", "https:"].includes(url.protocol)) return false;
  if (host === "localhost") return false;
  if (host === "127.0.0.1") return false;
  if (host.endsWith(".local")) return false;
  if (host.includes("example.")) return false;
  if (host.includes("mock")) return false;
  if (host.includes("test.invalid")) return false;
  return true;
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current);
  return result;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((x) => x.trim());
  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, i) => {
      row[header] = values[i] || "";
    });
    row.__rowNumber = index + 2;
    return row;
  });
}

function numberValue(row, key) {
  const value = Number(row[key] || 0);
  return Number.isFinite(value) ? value : 0;
}

function hasNonZeroKpi(row) {
  return [
    "impressions",
    "clicks",
    "visits",
    "leads",
    "checkout_started",
  ].some((key) => numberValue(row, key) > 0);
}

function isOperatorOnly(row) {
  const notes = String(row.notes || row.note || row.source || "").toLowerCase();
  return notes.includes("operator_smoke_visit") || notes.includes("operator smoke");
}

function ensureManualEvidenceTemplate() {
  if (fs.existsSync(MANUAL_EVIDENCE)) return false;
  fs.mkdirSync(path.dirname(MANUAL_EVIDENCE), { recursive: true });
  const body =
    TEMPLATE_HEADER +
    "\n" +
    Array.from({ length: 3 }, () => TEMPLATE_BLOCK).join("\n") +
    "\n";
  fs.writeFileSync(MANUAL_EVIDENCE, body);
  return true;
}

function validateManualEvidence() {
  const created = ensureManualEvidenceTemplate();
  const text = fs.readFileSync(MANUAL_EVIDENCE, "utf8");
  const blocks = parseYamlBlocks(text);
  const realPublicUrls = blocks
    .filter((block) => isRealPublicUrl(block.published_url))
    .map((block) => ({
      queue_file: block.queue_file || "",
      queue_row_id: block.queue_row_id || "",
      platform: block.platform || "",
      published_url: block.published_url,
      utm_url: block.utm_url || "",
      status: block.status || "",
    }));

  const reasons = [];
  if (realPublicUrls.length < 3) {
    reasons.push(
      `need at least 3 real public URLs, found ${realPublicUrls.length}`
    );
  }
  for (const item of realPublicUrls) {
    if (!item.utm_url || !item.utm_url.includes("utm_")) {
      reasons.push(`missing UTM for ${item.published_url}`);
    }
    if (!item.queue_row_id) {
      reasons.push(`missing queue_row_id for ${item.published_url}`);
    }
  }
  if (created) {
    reasons.push("manual evidence file was just created from empty template");
  }

  return {
    evidenceFile: path.relative(ROOT, MANUAL_EVIDENCE),
    created_from_template: created,
    totalBlocks: blocks.length,
    realPublicUrls,
    valid: realPublicUrls.length >= 3,
    reasons,
  };
}

function validateKpi() {
  const files = listFiles(KPI_DIR, ".csv");
  const nonZeroRows = [];
  const operatorOnlyRows = [];

  for (const file of files) {
    const rows = parseCsv(fs.readFileSync(file, "utf8"));
    for (const row of rows) {
      if (!hasNonZeroKpi(row)) continue;
      const item = {
        file: path.relative(ROOT, file).replaceAll("\\", "/"),
        rowNumber: row.__rowNumber,
        date: row.date || "",
        channel: row.channel || row.platform || "",
        url: row.url || row.published_url || "",
        impressions: numberValue(row, "impressions"),
        clicks: numberValue(row, "clicks"),
        visits: numberValue(row, "visits"),
        leads: numberValue(row, "leads"),
        checkout_started: numberValue(row, "checkout_started"),
        notes: row.notes || "",
      };
      if (isOperatorOnly(row)) operatorOnlyRows.push(item);
      else nonZeroRows.push(item);
    }
  }

  const reasons = [];
  if (nonZeroRows.length === 0) {
    reasons.push(
      "need at least 1 real non-zero KPI row not marked operator_smoke_visit"
    );
  }

  return {
    filesScanned: files.map((f) =>
      path.relative(ROOT, f).replaceAll("\\", "/")
    ),
    realNonZeroRows: nonZeroRows,
    operatorOnlyRows,
    valid: nonZeroRows.length > 0,
    reasons,
  };
}

function main() {
  try {
    fs.mkdirSync(AI_DIR, { recursive: true });
    const manual = validateManualEvidence();
    const kpi = validateKpi();

    const result = {
      date: TODAY,
      revenue_evidence_go: manual.valid,
      kpi_learning_input_go: kpi.valid,
      manual_publish_evidence: manual,
      kpi_evidence: kpi,
      note: "Business No-Go is recorded here; the script exits 0 unless it itself failed.",
    };

    const md = [
      `# KPI Real Data Evidence — ${TODAY}`,
      "",
      "## Manual publish evidence",
      "",
      `- file: ${manual.evidenceFile}`,
      `- created_from_template: ${manual.created_from_template}`,
      `- total_blocks: ${manual.totalBlocks}`,
      `- real_public_urls: ${manual.realPublicUrls.length}`,
      `- gate: ${manual.valid ? "Go" : "No-Go"}`,
      "",
      "### URL reasons",
      "",
      ...(manual.reasons.length
        ? manual.reasons.map((x) => `- ${x}`)
        : ["- none"]),
      "",
      "## KPI evidence",
      "",
      `- files_scanned: ${kpi.filesScanned.length}`,
      `- real_non_zero_rows: ${kpi.realNonZeroRows.length}`,
      `- operator_only_rows: ${kpi.operatorOnlyRows.length}`,
      `- gate: ${kpi.valid ? "Go" : "No-Go"}`,
      "",
      "### KPI reasons",
      "",
      ...(kpi.reasons.length
        ? kpi.reasons.map((x) => `- ${x}`)
        : ["- none"]),
      "",
      "## Gate summary",
      "",
      `- Revenue Evidence: ${manual.valid ? "Go" : "No-Go"}`,
      `- KPI Learning Input: ${kpi.valid ? "Go" : "No-Go"}`,
      "- Note: business No-Go is not a script failure; script exit code is 0.",
      "",
    ].join("\n");

    fs.writeFileSync(OUT_JSON, `${JSON.stringify(result, null, 2)}\n`);
    fs.writeFileSync(OUT_MD, md);

    console.log(JSON.stringify(result, null, 2));
    // exit 0 by design — business No-Go is reported in the JSON/MD, not the exit code.
  } catch (err) {
    console.error("self-run-validate-evidence failed:", err && err.message);
    process.exit(2);
  }
}

main();