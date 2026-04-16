# TianJi Codex Instructions

## Mission
Improve TianJi by making small, high-confidence upgrades that strengthen:
- result pages
- relationship reading
- fortune timeline
- sharing systems
- conversion
- trust and privacy

## Rules
1. Never merge directly to main.
2. Always create or update a branch and prepare a PR summary.
3. Do not expose birth date, birth time, birth location, or timezone on public share pages by default.
4. Prefer rule-based scoring + AI explanations.
5. Keep premium dark visual style and CTA consistency.
6. Do not remove pricing, FAQ, trust, disclaimer, or premium upgrade paths.
7. Run required checks before claiming success.

## Required checks
- npm run typecheck
- npm run lint
- npm run test
- npm run build
- npm run audit:routes
- npm run audit:copy
- npm run audit:share
- npm run audit:upgrade
