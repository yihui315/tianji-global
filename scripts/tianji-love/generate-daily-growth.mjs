#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { runMiniMaxChat } from "../ai/minimax-chat.mjs";

const outputPath = ".ai/generated/tianji-love-daily-growth.md";
const requestedDay =
  process.env.TIANJI_LOVE_DAY?.trim() || process.argv[2]?.trim() || "";

const prompt = `Generate today's TianJi Love growth execution plan.

Requested day input: ${requestedDay || "not provided"}

Requirements:
- 5 concrete traffic actions
- 3 landing page conversion improvements
- 3 content hooks
- 2 A/B test ideas
- 1 risk warning
- draft only

Safety gates:
- Do not claim content was published.
- Do not request or reference social platform credentials.
- Do not include Stripe checkout execution, paid smoke, Supabase mutation, provider live expansion, server mutation, or production deploy steps.
- Do not invent KPI values, testimonials, customer numbers, or guaranteed relationship outcomes.`;

try {
  const content = await runMiniMaxChat(prompt);
  const artifact = `# TianJi Love Daily Growth Draft

Generated at: ${new Date().toISOString()}
Requested day input: ${requestedDay || "not provided"}
Provider: MiniMax OpenAI-compatible Chat Completions
Artifact status: Draft only

${content}

## Gate Status

\`\`\`text
OpenAI Codex Action dependency: Removed from this workflow
MiniMax runtime: Used when MINIMAX_API_KEY is configured
Generated artifact: ${outputPath}
Publisher bridge: Prepared but no credentials
Social auto-posting: No-Go
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Secrets printed: No
\`\`\`
`;

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, artifact, "utf8");
  console.log(`Wrote ${outputPath}`);
} catch (error) {
  console.error(error?.message ?? error);
  process.exit(error?.exitCode ?? 1);
}
