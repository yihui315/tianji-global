#!/usr/bin/env node
/**
 * Revenue Autopilot v1 — Step 1
 *
 * Selects up to MAX_SELECTED candidate posts from data/publishing-queue
 * that score highest against a money-intent keyword table and that are
 * still pending manual publish.
 *
 * Outputs:
 *   .ai/REVENUE_AUTOPILOT_SELECTED_POSTS_<DATE>.md
 *   .ai/REVENUE_AUTOPILOT_SELECTED_POSTS_<DATE>.json
 *
 * Behaviour contract (Revenue Self-Run v1, 2026-07-23):
 *   - Empty queue → 0 selected, Self-Run Prep: No-Go, exit 0.
 *   - Fewer than MAX_SELECTED candidates → graceful No-Go, exit 0.
 *   - Only exit code 2 (or higher) on script bugs / I/O failures.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const QUEUE_DIR = path.join(ROOT, "data", "publishing-queue");
const AI_DIR = path.join(ROOT, ".ai");

const TODAY = process.env.REVENUE_RUN_DATE || "20260723";
const OUT_MD = path.join(AI_DIR, `REVENUE_AUTOPILOT_SELECTED_POSTS_${TODAY}.md`);
const OUT_JSON = path.join(AI_DIR, `REVENUE_AUTOPILOT_SELECTED_POSTS_${TODAY}.json`);

const MAX_SELECTED = Number(process.env.REVENUE_SELECT_LIMIT || 3);

const MONEY_KEYWORDS = [
  "love test",
  "free love test",
  "daily oracle",
  "love oracle",
  "ask one question",
  "relationship reading",
  "breakup",
  "get ex back",
  "soulmate",
  "twin flame",
  "tarot",
  "compatibility",
  "marriage",
  "reunion",
  "no contact",
  "healing",
];

const LANDING_MAP = [
  {
    match: ["love test", "compatibility"],
    landingPage: "https://tianji.love/love-test",
    cta: "Take the free love test",
    expectedMetric: "visits_to_love_test",
  },
  {
    match: ["daily oracle", "oracle"],
    landingPage: "https://tianji.love/daily-oracle",
    cta: "Get today's love oracle",
    expectedMetric: "daily_oracle_visits",
  },
  {
    match: [
      "ask one question",
      "relationship reading",
      "tarot",
      "soulmate",
      "twin flame",
      "breakup",
      "get ex back",
    ],
    landingPage: "https://tianji.love/pricing",
    cta: "Ask one private love question",
    expectedMetric: "checkout_started",
  },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function listCsvFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      if (entry.isFile() && entry.name.endsWith(".csv")) out.push(full);
    }
  }
  walk(dir);
  return out;
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
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
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

function lowerAll(row) {
  return Object.values(row)
    .filter((v) => typeof v === "string")
    .join(" ")
    .toLowerCase();
}

function getField(row, candidates) {
  for (const key of candidates) {
    if (row[key] && String(row[key]).trim()) return String(row[key]).trim();
  }
  return "";
}

function scoreRow(row) {
  const text = lowerAll(row);
  let score = 0;
  const reasons = [];

  for (const keyword of MONEY_KEYWORDS) {
    if (text.includes(keyword)) {
      score += 10;
      reasons.push(`keyword:${keyword}`);
    }
  }

  // Status / publish_status must be matched as whole field tokens, not
  // as substrings of longer strings like "not_published" or "manual_published".
  // Otherwise a row whose status is "pending_manual_review" / "not_published"
  // gets falsely flagged as already-published and excluded with score -100.
  const statusField = String(row.status || "").trim().toLowerCase();
  const publishStatusField = String(row.publish_status || "").trim().toLowerCase();

  if (statusField === "pending_manual_review") {
    score += 3;
    reasons.push("status:pending_manual_review");
  }
  if (publishStatusField === "not_published") {
    score += 3;
    reasons.push("publish_status:not_published");
  }

  const alreadyPublished =
    statusField === "published" ||
    statusField === "manual_published" ||
    publishStatusField === "published" ||
    publishStatusField === "manual_published";

  if (alreadyPublished) {
    score -= 100;
    reasons.push("exclude:already_published");
  }

  const platform = getField(row, ["platform", "channel", "network"]).toLowerCase();
  if (["x", "twitter", "reddit", "blog", "seo"].includes(platform)) {
    score += 2;
    reasons.push(`platform:${platform}`);
  }

  const body = getField(row, ["body", "post_body", "content", "copy", "text"]);
  if (body.length >= 80 && body.length <= 900) {
    score += 4;
    reasons.push("copy:length_ok");
  }

  return { score, reasons };
}

function chooseLanding(row) {
  const text = lowerAll(row);
  for (const item of LANDING_MAP) {
    if (item.match.some((m) => text.includes(m))) return item;
  }
  return {
    landingPage: "https://tianji.love/love-test",
    cta: "Take the free love test",
    expectedMetric: "visits",
  };
}

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

function buildUtmUrl(landingPage, row, index) {
  const platform = getField(row, ["platform", "channel", "network"]) || "manual";
  const campaign = `revenue_autopilot_v1_${TODAY}_${index + 1}`;
  const source = slugify(platform) || "manual";
  const medium = "organic";
  const url = new URL(landingPage);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", campaign);
  return url.toString();
}

function buildTitle(row, index) {
  return (
    getField(row, ["title", "headline", "topic", "name"]) ||
    `Revenue Autopilot Selected Post ${index + 1}`
  );
}

function buildBody(row) {
  return (
    getField(row, [
      "body",
      "post_body",
      "content",
      "copy",
      "text",
      "description",
    ]) || "Discover what your relationship energy is trying to tell you today."
  );
}

function main() {
  try {
    ensureDir(AI_DIR);

    const files = listCsvFiles(QUEUE_DIR);
    const candidates = [];

    for (const file of files) {
      const rows = parseCsv(fs.readFileSync(file, "utf8"));
      for (const row of rows) {
        const { score, reasons } = scoreRow(row);
        if (score <= 0) continue;
        candidates.push({
          ...row,
          __queueFile: path.relative(ROOT, file).replaceAll("\\", "/"),
          __score: score,
          __reasons: reasons,
        });
      }
    }

    candidates.sort((a, b) => b.__score - a.__score);

    const selected = candidates.slice(0, MAX_SELECTED).map((row, index) => {
      const landing = chooseLanding(row);
      const title = buildTitle(row, index);
      const finalPostBody = buildBody(row);
      const utmUrl = buildUtmUrl(landing.landingPage, row, index);
      return {
        queue_file: row.__queueFile,
        queue_row_number: row.__rowNumber,
        queue_row_id:
          getField(row, ["id", "row_id", "queue_id", "slug"]) ||
          `${path.basename(row.__queueFile)}:${row.__rowNumber}`,
        platform: getField(row, ["platform", "channel", "network"]) || "manual",
        title,
        final_post_body: finalPostBody,
        cta: landing.cta,
        landing_page: landing.landingPage,
        utm_url: utmUrl,
        why_selected: row.__reasons.join("; "),
        score: row.__score,
        expected_metric: landing.expectedMetric,
        status: "pending_manual_publish",
      };
    });

    const gate =
      selected.length >= MAX_SELECTED
        ? "Go"
        : selected.length === 0
          ? "No-Go — queue is empty or has no qualifying candidates"
          : `No-Go — only ${selected.length} selected, target ${MAX_SELECTED}`;

    const md = [
      `# Revenue Autopilot Selected Posts — ${TODAY}`,
      "",
      "## Result",
      "",
      `- candidates_scanned_files: ${files.length}`,
      `- candidates_total: ${candidates.length}`,
      `- selected: ${selected.length}`,
      `- gate: ${gate}`,
      "",
      "## Selected posts",
      "",
      ...selected.flatMap((item, index) => [
        `### ${index + 1}. ${item.title}`,
        "",
        `- queue_file: ${item.queue_file}`,
        `- queue_row_number: ${item.queue_row_number}`,
        `- queue_row_id: ${item.queue_row_id}`,
        `- platform: ${item.platform}`,
        `- landing_page: ${item.landing_page}`,
        `- utm_url: ${item.utm_url}`,
        `- cta: ${item.cta}`,
        `- expected_metric: ${item.expected_metric}`,
        `- score: ${item.score}`,
        `- status: ${item.status}`,
        `- why_selected: ${item.why_selected}`,
        "",
        "#### Final post body",
        "",
        item.final_post_body,
        "",
      ]),
      "## Gate",
      "",
      `Self-Run Prep: ${gate}`,
      "",
      "Revenue Evidence remains No-Go until real public URLs and real KPI are backfilled.",
      "",
    ].join("\n");

    fs.writeFileSync(
      OUT_JSON,
      `${JSON.stringify(
        {
          date: TODAY,
          queue_files_scanned: files.map((f) =>
            path.relative(ROOT, f).replaceAll("\\", "/")
          ),
          candidates_total: candidates.length,
          selected,
          gate,
        },
        null,
        2
      )}\n`
    );
    fs.writeFileSync(OUT_MD, md);

    console.log(
      `Wrote ${path.relative(ROOT, OUT_MD)} + ${path.relative(ROOT, OUT_JSON)}`
    );
    console.log(`Selected ${selected.length} posts. Gate: ${gate}`);
    // Business No-Go is not a script failure — always exit 0 here.
  } catch (err) {
    // Script bug / I/O failure — non-zero to signal real problem.
    console.error("self-run-select-posts failed:", err && err.message);
    process.exit(2);
  }
}

main();