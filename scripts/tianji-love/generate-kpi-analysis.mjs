#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { runMiniMaxChat } from "../ai/minimax-chat.mjs";

const outputPath = ".ai/generated/tianji-love-kpi-analysis.md";
const day = process.env.TIANJI_LOVE_DAY?.trim() || process.argv[2]?.trim() || "";
const reportDate =
  process.env.TIANJI_LOVE_REPORT_DATE?.trim() ||
  process.argv[3]?.trim() ||
  "";

const prompt = `Generate a TianJi Love KPI analysis template and conversion-focused sample interpretation.

Day input: ${day || "not provided"}
Report date input: ${reportDate || "not provided"}

Requirements:
- DAU
- landing conversion
- ask conversion
- draw conversion
- paid unlock rate
- CAC
- revenue
- retention
- actions if metrics go up/down
- identify the biggest daily money leak in the funnel
- recommend one homepage CTA improvement, one /relationship/new improvement, one /ask paid-entry improvement, one /draw unlock improvement, and one /pricing packaging improvement
- separate traffic growth actions from revenue conversion actions
- use placeholder/sample interpretation labels clearly marked as examples
- draft only

Safety gates:
- Do not invent real business metrics.
- Use placeholder/sample interpretation labels clearly marked as examples.
- Do not claim paid smoke, checkout, deployment, social posting, or provider live expansion happened.
- Do not include medical, legal, financial, or guaranteed relationship outcome claims.
- Do not promise guaranteed reconciliation, 100% accuracy, supernatural certainty, or fake social proof.`;

try {
  const content = await runMiniMaxChat(prompt);
  const artifact = `# TianJi Love KPI Analysis Draft

Generated at: ${new Date().toISOString()}
Day input: ${day || "not provided"}
Report date input: ${reportDate || "not provided"}
Provider: MiniMax OpenAI-compatible Chat Completions
Artifact status: Draft only

${content}

## Gate Status

\`\`\`text
OpenAI Codex Action dependency: Removed from this workflow
MiniMax runtime: Used when MINIMAX_API_KEY is configured
Generated artifact: ${outputPath}
Fake metrics: No-Go
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
