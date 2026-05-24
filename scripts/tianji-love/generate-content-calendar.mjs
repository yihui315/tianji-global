#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { runMiniMaxChat } from "../ai/minimax-chat.mjs";

const outputPath = ".ai/generated/tianji-love-content-calendar.md";

const prompt = `Generate a 7-day TianJi Love content calendar for relationship reading / love astrology / AI emotional guidance.

Requirements:
- Chinese market style
- 小红书 / 抖音 / 视频号 friendly
- 7 days
- each day includes hook, title, content angle, CTA, risk note
- draft only, do not claim posted
- no medical/legal/financial claims
- no guaranteed relationship outcome

Safety gates:
- Do not include platform login guidance, tokens, cookies, captcha bypass, or account automation.
- Do not imply guaranteed reconciliation, love success, pregnancy, health, legal, or financial outcomes.
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
