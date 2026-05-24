#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { runMiniMaxChat } from "../ai/minimax-chat.mjs";

const outputPath = ".ai/generated/tianji-love-content-calendar.md";

const prompt = `Generate a 7-day TianJi Love revenue-focused content calendar for relationship reading / love astrology / AI emotional guidance.

Requirements:
- Chinese market style for 小红书 / 抖音 / 视频号
- 7 days
- each day includes channel, hook, title, content angle, publishable caption outline, CTA, product entry, conversion goal, and risk note
- rotate themes across: 他现在到底在想什么, 你们还有没有缘分, 断联后他会不会回来, 暧昧对象是否认真, 复合概率测试, 今日爱情能量, 天机缘分测试
- CTA must point users toward /relationship/new, /ask, /draw, or /pricing
- product entries must map to: 免费引流=天机缘分测试/今日天机, 低价转化=单问题解读 9.9-19.9, 高价转化=深度感情报告
- avoid generic emotional advice; each item should create a concrete next click or purchase intent
- draft only, do not claim posted
- no medical/legal/financial claims
- no guaranteed relationship outcome

Safety gates:
- Do not include platform login guidance, tokens, cookies, captcha bypass, or account automation.
- Do not imply guaranteed reconciliation, love success, pregnancy, health, legal, or financial outcomes.
- Do not invent fake customer numbers, fake screenshots, fake social proof, or fake platform stats.
- Do not claim supernatural certainty or 100% accuracy.
- Keep all outputs as draft-only marketing artifacts.`;

try {
  const content = await runMiniMaxChat(prompt);
  const artifact = `# TianJi Love Content Calendar Draft

Generated at: ${new Date().toISOString()}
Provider: MiniMax OpenAI-compatible Chat Completions
Artifact status: Draft only

${content}

## Gate Status

\`\`\`text
OpenAI Codex Action dependency: Removed from this workflow
MiniMax runtime: Used when MINIMAX_API_KEY is configured
Generated artifact: ${outputPath}
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
