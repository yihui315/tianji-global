#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { runMiniMaxChat } from "../ai/minimax-chat.mjs";

const kpiPath = ".ai/generated/tianji-love-kpi-analysis.md";
const outputPath = ".ai/generated/tianji-love-conversion-suggestions.md";

async function readKpiArtifact() {
  try {
    return await readFile(kpiPath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

const kpiArtifact = await readKpiArtifact();
const kpiContext = kpiArtifact
  ? kpiArtifact.slice(0, 12000)
  : "KPI artifact was not present in this workflow checkout. Use TianJi Love's known funnel direction: free traffic from TianJi Love relationship tests and daily love energy, low-price single-question interpretation at 9.9-19.9, and high-price deep relationship reports. Clearly mark recommendations as draft suggestions based on current growth direction.";

const prompt = `Generate practical TianJi Love conversion suggestions based on the KPI/growth context below.

KPI/growth context:
${kpiContext}

Must include:
1. Homepage improvement
2. /relationship/new improvement
3. /ask improvement
4. /draw improvement
5. /pricing improvement
6. 3 A/B test ideas
7. 3 revenue-focused CTA improvements
8. risk notes
9. implementation-ready Codex tasks

Output requirements:
- Be specific enough that Codex can turn the top tasks into code PRs later.
- Prioritize revenue and conversion, not generic brand advice.
- Tie suggestions to product entries: 天机缘分测试 / 今日天机 / 单问题解读 9.9-19.9 / 深度感情报告.
- Keep all recommendations draft-only.

Safety gates:
- Do not claim changes were deployed.
- Do not claim production deploy, Stripe checkout, paid smoke, social posting, Supabase mutation, or provider expansion happened.
- Do not invent KPI values, testimonials, customer numbers, platform stats, or screenshots.
- Do not promise guaranteed reconciliation, 100% accuracy, supernatural certainty, medical/legal/financial outcomes, pregnancy, or health outcomes.`;

try {
  const content = await runMiniMaxChat(prompt, { maxTokens: 2200 });
  const artifact = `# TianJi Love Conversion Suggestions Draft

Generated at: ${new Date().toISOString()}
Provider: MiniMax OpenAI-compatible Chat Completions
Artifact status: Draft only
KPI source: ${kpiArtifact ? kpiPath : "not present in workflow checkout; used current growth direction fallback"}

${content}

## Gate Status

\`\`\`text
Generated artifact: ${outputPath}
Auto code changes: Not run
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
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
