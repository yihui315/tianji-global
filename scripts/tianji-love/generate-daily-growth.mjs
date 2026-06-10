#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { runMiniMaxChat } from "../ai/minimax-chat.mjs";

const outputPath = ".ai/generated/tianji-love-daily-growth.md";
const requestedDay =
  process.env.TIANJI_LOVE_DAY?.trim() || process.argv[2]?.trim() || "";

const prompt = `Generate today's TianJi Love revenue-focused growth execution pack.

Requested day input: ${requestedDay || "not provided"}

Requirements:
- Write in practical Chinese short-video / Xiaohongshu growth style.
- Include 1 Xiaohongshu note draft, 1 Douyin short-video script, and 1 WeChat Channels emotional-test draft.
- Prioritize these themes: 他现在到底在想什么, 你们还有没有缘分, 断联后他会不会回来, 暧昧对象是否认真, 复合概率测试, 今日爱情能量, 天机缘分测试.
- Include 5 concrete traffic actions tied to a channel and expected user action.
- Include 3 landing page conversion improvements for /, /relationship/new, /ask, /draw, or /pricing.
- Include 3 strong hooks, 2 A/B test ideas, and 1 risk warning.
- Every content item must include a clear CTA to TianJi Love and one product entry: 天机缘分测试 / 今日天机 / 单问题解读 9.9-19.9 / 深度感情报告.
- Make the output useful for revenue, not generic emotional advice.
- draft only

Safety gates:
- Do not claim content was published.
- Do not request or reference social platform credentials.
- Do not include Stripe checkout execution, paid smoke, Supabase mutation, provider live expansion, server mutation, or production deploy steps.
- Do not invent KPI values, testimonials, customer numbers, platform stats, or guaranteed relationship outcomes.
- Do not promise guaranteed reconciliation, 100% accuracy, supernatural certainty, medical/legal/financial outcomes, pregnancy, or health outcomes.
- Do not create fake user testimonials unless clearly labeled as placeholders.`;

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
