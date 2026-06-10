# TianJi Love Skill Match Matrix - 2026-05-25

## Detection

Commands run:

```text
Get-ChildItem -Force .agents -Recurse -ErrorAction SilentlyContinue
Get-ChildItem -Force C:\Users\Administrator\gstack\.agents\skills -ErrorAction SilentlyContinue
Get-ChildItem -Force .codex -Recurse -ErrorAction SilentlyContinue
rg -n "tianji-vedic-astro|staging-gate|careful-deploy|gstack-autoplan|gstack-qa" .agents C:\Users\Administrator\gstack\.agents\skills .codex -S --glob SKILL.md --glob '*.md'
```

## Matrix

| Skill name | Found / Not Found | Best use | Risk level | Use in this task | Reason |
|---|---|---|---|---|---|
| gstack-autoplan | Found | Break revenue upgrade into implementation lanes and pick highest ROI slice. | Low | Yes | Selected evidence layer as highest ROI safe slice. |
| gstack-plan-ceo-review | Found | Revenue priority, pricing, conversion, paid unlock logic, growth loop. | Low | Yes | Used for conversion framing: evidence preview should create unlock intent. |
| gstack-plan-eng-review | Found | Architecture, feature flags, API contracts, tests, safe integration. | Low | Yes | Used for additive API contracts and privacy-safe analytics boundaries. |
| gstack-plan-design-review | Found | Homepage, Ask, Draw, relationship report, pricing, CTA, trust cues. | Low | Yes | Used for calm premium evidence UI with no fear language. |
| gstack-plan-devex-review | Found | Scripts, CI safety, local reproducibility, evidence format. | Low | Yes | Used for validation command set and evidence packet format. |
| gstack-browse | Found | Browser QA and local route smoke. | Low | Yes | Local browser QA was performed with Chrome headless because no in-app Browser tool was callable. |
| gstack-qa | Found | Browser QA, route QA, smoke QA, copy QA. | Low | Yes | Applied to non-paid local QA for Ask, Draw, Relationship routes. |
| gstack-qa-only | Found | Report-only QA. | Low | No | Full QA was already covered by local tests, audits, and Chrome headless route checks. |
| gstack-investigate | Found | Failing test, missing route, unknown API contract, entitlement issue. | Medium | No | Not needed after normal TDD loop resolved failures. |
| gstack-health | Found | Skill availability and local environment health. | Low | Yes | Used through script validation: typecheck, lint, test, build, audits. |
| gstack-claude | Found | Claude Code wrapper when authenticated and explicitly needed. | Medium | No | Skipped because not required and authentication/safety was not needed. |
| tianji-vedic-astro | Found | Vedic astrology extensions behind safe flags. | Medium | No | Found locally, but skipped because this task targets generic evidence, not Vedic expansion. |
| staging-gate | Not Found | Staging deploy gate. | High | No | Exact skill not found; deploy/staging is out of scope and production deploy remains No-Go. |
| careful-deploy | Not Found | Careful production deployment. | High | No | Exact skill not found; no deploy was performed. |

## Selected Stack

Primary: gstack-autoplan.

Review layer: gstack-plan-ceo-review, gstack-plan-eng-review, gstack-plan-design-review, gstack-plan-devex-review.

Verification: gstack-health, gstack-qa, gstack-browse-equivalent local Chrome route QA.

Skipped: gstack-claude, gstack-investigate, staging/deploy skills.
