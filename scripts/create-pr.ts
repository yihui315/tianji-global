#!/usr/bin/env npx tsx
/**
 * create-pr.ts
 *
 * Creates a GitHub PR using the GitHub REST API.
 * Reads codex-upgrade-report.md for the PR body.
 */

import fs from "fs";
import path from "path";

const CWD = process.cwd();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? "";
const REPO_OWNER = "yihui315";
const REPO_NAME = "tianji-global";
const BRANCH = "codex/relationship-ab";
const BASE = "main";

function readFile(filepath: string): string {
  const p = path.join(CWD, filepath);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

async function createOrUpdatePR() {
  const reportPath = path.join(CWD, "codex-upgrade-report.md");
  const reportBody = fs.existsSync(reportPath)
    ? fs.readFileSync(reportPath, "utf8")
    : "Automated A/B experiment result — see codex-upgrade-report.md";

  // Extract title from report
  const titleMatch = reportBody.match(/^# Codex Upgrade Report — (.+)$/m);
  const title = titleMatch
    ? `Codex: ${titleMatch[1]}`
    : `Codex: Relationship A/B evolution — ${new Date().toISOString().substring(0, 10)}`;

  // Check if PR already exists
  const existingPRs = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=open&head=${REPO_OWNER}:${BRANCH}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  ).then(r => r.json()).catch(() => []);

  if (Array.isArray(existingPRs) && existingPRs.length > 0) {
    console.log(`PR already exists: #${existingPRs[0].number} — ${existingPRs[0].title}`);
    return;
  }

  // Create new PR
  const response = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        title,
        body: reportBody,
        head: BRANCH,
        base: BASE,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error(`❌ PR creation failed: ${response.status} — ${err}`);
    process.exit(1);
  }

  const pr = await response.json();
  console.log(`✅ PR created: #${pr.number} — ${pr.title}`);
  console.log(`   ${pr.html_url}`);
}

createOrUpdatePR().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
