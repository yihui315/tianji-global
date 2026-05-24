#!/usr/bin/env node

import process from "node:process";
import { setTimeout as sleep } from "node:timers/promises";
import { pathToFileURL } from "node:url";

const DEFAULT_BASE_URL = "https://api.minimaxi.com/v1";
const DEFAULT_MODEL = "MiniMax-M2.7";
const DEFAULT_TEMPERATURE = 0.4;
const DEFAULT_MAX_TOKENS = 700;
const RATE_LIMIT_RETRY_DELAYS_MS = [20_000, 60_000];

function redactSecrets(value, apiKey = "") {
  let text = String(value ?? "");

  if (apiKey) {
    text = text.split(apiKey).join("[REDACTED_MINIMAX_API_KEY]");
  }

  return text
    .replace(/Bearer\s+[A-Za-z0-9._\-+/=]{12,}/gi, "Bearer [REDACTED]")
    .replace(/sk-[A-Za-z0-9_*.\-]{8,}/g, "[REDACTED_OPENAI_SHAPED_KEY]")
    .replace(/ghp_[A-Za-z0-9]{8,}/g, "[REDACTED_GITHUB_TOKEN]")
    .replace(/github_pat_[A-Za-z0-9_]{8,}/g, "[REDACTED_GITHUB_TOKEN]");
}

function asPositiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function runMiniMaxChat(prompt, options = {}) {
  const apiKey = process.env.MINIMAX_API_KEY?.trim();
  const baseUrl =
    options.baseUrl?.trim() ||
    process.env.MINIMAX_BASE_URL?.trim() ||
    DEFAULT_BASE_URL;
  const model =
    options.model?.trim() ||
    process.env.MINIMAX_MODEL?.trim() ||
    DEFAULT_MODEL;
  const temperature = asPositiveNumber(
    options.temperature ?? process.env.MINIMAX_TEMPERATURE,
    DEFAULT_TEMPERATURE,
  );
  const maxTokens = asPositiveNumber(
    options.maxTokens ?? process.env.MINIMAX_MAX_TOKENS,
    DEFAULT_MAX_TOKENS,
  );

  if (!apiKey) {
    const error = new Error("MINIMAX_API_KEY is missing.");
    error.exitCode = 2;
    throw error;
  }

  if (!prompt?.trim()) {
    const error = new Error("Prompt is required.");
    error.exitCode = 2;
    throw error;
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  let response;
  let bodyText = "";

  for (let attempt = 0; attempt <= RATE_LIMIT_RETRY_DELAYS_MS.length; attempt += 1) {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are TianJi Love growth automation assistant. Return concise, practical, safe, non-sensitive output. Do not claim to have posted content. Produce draft-only artifacts.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature,
        max_completion_tokens: maxTokens,
      }),
    });

    bodyText = await response.text();

    if (response.status !== 429 || attempt >= RATE_LIMIT_RETRY_DELAYS_MS.length) {
      break;
    }

    const delayMs = RATE_LIMIT_RETRY_DELAYS_MS[attempt];
    console.error(
      `MiniMax API rate limited: HTTP 429. Retrying in ${delayMs / 1000}s ` +
        `(attempt ${attempt + 2}/${RATE_LIMIT_RETRY_DELAYS_MS.length + 1}).`,
    );
    await sleep(delayMs);
  }

  if (!response.ok) {
    console.error(`MiniMax API failed: HTTP ${response.status}`);
    if (response.status === 429) {
      console.error(
        "MiniMax API rate limited: HTTP 429. Free Token Plan quota/rate limit is currently unavailable.",
      );
    }
    console.error(redactSecrets(bodyText, apiKey).slice(0, 1200));
    process.exitCode = 1;
    throw new Error(`MiniMax API request failed with HTTP ${response.status}.`);
  }

  let json;
  try {
    json = JSON.parse(bodyText);
  } catch {
    console.error("MiniMax API returned non-JSON response.");
    console.error(redactSecrets(bodyText, apiKey).slice(0, 1200));
    process.exitCode = 1;
    throw new Error("MiniMax API returned non-JSON response.");
  }

  const content = json?.choices?.[0]?.message?.content;

  if (!content) {
    console.error("MiniMax API returned no message content.");
    console.error(redactSecrets(JSON.stringify(json), apiKey).slice(0, 1200));
    process.exitCode = 1;
    throw new Error("MiniMax API returned no message content.");
  }

  return content.trim();
}

async function main() {
  const prompt = process.argv.slice(2).join(" ").trim();

  if (!prompt) {
    console.error("Usage: node scripts/ai/minimax-chat.mjs <prompt>");
    process.exit(2);
  }

  try {
    const content = await runMiniMaxChat(prompt);
    console.log(content);
  } catch (error) {
    if (!process.exitCode) {
      console.error(redactSecrets(error?.message ?? error));
      process.exitCode = error?.exitCode ?? 1;
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
