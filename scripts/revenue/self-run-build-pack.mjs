#!/usr/bin/env node
/**
 * Revenue Autopilot v1 — Step 2
 *
 * Generates a human-approved publishing pack from the JSON produced by
 * self-run-select-posts. Each selected post gets three copy variants
 * (X, Reddit/community, short blog/SEO) and a manual evidence block
 * template.
 *
 * Outputs:
 *   .ai/HUMAN_APPROVED_PUBLISHING_PACK_<DATE>.md
 *
 * Behaviour contract:
 *   - Empty / missing selected JSON → exit 0 with empty pack; orchestrator
 *     will read the gate from the JSON, not from this script.
 *   - Only exit code 2 on script bugs.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AI_DIR = path.join(ROOT, ".ai");

const TODAY = process.env.REVENUE_RUN_DATE || "20260723";
const IN_JSON = path.join(AI_DIR, `REVENUE_AUTOPILOT_SELECTED_POSTS_${TODAY}.json`);
const OUT_MD = path.join(AI_DIR, `HUMAN_APPROVED_PUBLISHING_PACK_${TODAY}.md`);

function assertFile(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required file: ${path.relative(ROOT, file)}`);
  }
}

function trimTo(input, max) {
  const text = String(input || "").trim().replace(/\s+/g, " ");
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function buildXPost(item) {
  const body = trimTo(item.final_post_body, 180);
  return `${body}\n\n${item.cta}: ${item.utm_url}`;
}

function buildRedditPost(item) {
  return [
    item.title,
    "",
    item.final_post_body,
    "",
    `I made this as a simple love clarity prompt. ${item.cta}: ${item.utm_url}`,
    "",
    "Note: keep the tone soft, non-spammy, and community-safe. Do not overclaim results.",
  ].join("\n");
}

function buildSeoShort(item) {
  return [
    `# ${item.title}`,
    "",
    item.final_post_body,
    "",
    `If you want a quick next step, ${item.cta.toLowerCase()}: ${item.utm_url}`,
    "",
    "This post is for entertainment and reflection, not professional advice.",
  ].join("\n");
}

function main() {
  try {
    assertFile(IN_JSON);
    const payload = JSON.parse(fs.readFileSync(IN_JSON, "utf8"));
    const selected = payload.selected || [];

    const lines = [
      `# Human-approved Publishing Pack — ${TODAY}`,
      "",
      "## Instructions",
      "",
      "Publish manually. Do not mark any queue item as published until a real public URL is pasted into the manual evidence file.",
      "",
      "Required after publishing:",
      "",
      "- public URL",
      "- UTM URL used",
      "- platform",
      "- published time",
      "- queue row",
      "- notes",
      "",
    ];

    selected.forEach((item, index) => {
      lines.push(
        `## ${index + 1}. ${item.title}`,
        "",
        "### Metadata",
        "",
        `- queue_file: ${item.queue_file}`,
        `- queue_row_id: ${item.queue_row_id}`,
        `- platform: ${item.platform}`,
        `- landing_page: ${item.landing_page}`,
        `- utm_url: ${item.utm_url}`,
        `- cta: ${item.cta}`,
        `- expected_metric: ${item.expected_metric}`,
        "",
        "### X / Twitter version",
        "",
        "```text",
        buildXPost(item),
        "```",
        "",
        "### Reddit / community version",
        "",
        "```text",
        buildRedditPost(item),
        "```",
        "",
        "### Short blog / SEO version",
        "",
        "```text",
        buildSeoShort(item),
        "```",
        "",
        "### Publish checklist",
        "",
        "- [ ] Human reviewed copy",
        "- [ ] UTM link included",
        "- [ ] No medical/financial/legal claims",
        "- [ ] No guaranteed relationship outcome claims",
        "- [ ] Published manually",
        "- [ ] Real public URL copied",
        "- [ ] Evidence file updated",
        "",
        "### Manual evidence block to paste",
        "",
        "```yaml",
        `queue_file: ${item.queue_file}`,
        `queue_row_id: ${item.queue_row_id}`,
        `platform: ${item.platform}`,
        "published_url: ",
        `utm_url: ${item.utm_url}`,
        "published_at: ",
        `landing_page: ${item.landing_page}`,
        `cta: ${item.cta}`,
        "status: manual_published",
        "operator: ",
        "notes: ",
        "```",
        ""
      );
    });

    const gate =
      selected.length >= 3
        ? "Go — ready for human manual publishing."
        : `No-Go — ${selected.length} selected items (need ≥ 3).`;

    lines.push(
      "## Gate",
      "",
      `Publishing Pack: ${gate}`,
      "",
      "Revenue Evidence remains No-Go until at least 3 real public URLs are backfilled.",
      ""
    );

    fs.writeFileSync(OUT_MD, lines.join("\n"));
    console.log(`Wrote ${path.relative(ROOT, OUT_MD)}`);
  } catch (err) {
    console.error("self-run-build-pack failed:", err && err.message);
    process.exit(2);
  }
}

main();