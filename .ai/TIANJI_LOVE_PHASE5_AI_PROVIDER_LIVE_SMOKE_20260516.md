# TianJi Love Phase 5 AI Provider Live Smoke - 2026-05-16

## Decision

```text
Ollama live smoke: Not-run
DeepSeek Flash live smoke: Not-run
DeepSeek Pro fallback smoke: Not-run
MiniMax quota smoke: Not-run
```

## Reason

Staging env readiness is No-Go and no explicit approval was given for live provider smoke. The only AI provider smoke run in Phase 5 was dry-run mode:

```bash
npm run smoke:ai-providers
```

## Safety Boundary

- No live provider call was made.
- No prompt body was logged.
- No response body was logged.
- No relationship, birth, location, timezone, or user private data was sent.
- MiniMax remains internal/research only and is not a public production default.
