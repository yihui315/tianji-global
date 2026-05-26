# AI Task Board

## Current task

### Task ID: 20260526-tianji-love-automation-manual-first-enforcement

- Status: done-with-codex-executor
- Owner: Codex Executor
- Goal: Create a minimal PR from trusted `origin/main` that disables scheduled runs for the two TianJi Love content generation workflows while retaining manual `workflow_dispatch`.
- Result: The branch `chore/tianji-automation-manual-first-20260526` was created from `origin/main@1c188ff0b062b28952f25b785f4fd1ad66465b72`. Active scheduled triggers were removed from `tianji-love-content-calendar.yml` and `tianji-love-daily-growth.yml`; both workflows retain `workflow_dispatch`. Evidence was recorded in `.ai/TIANJI_LOVE_AUTOMATION_MANUAL_FIRST_ENFORCEMENT_20260526.md`.
- Gate status: Manual-first enforcement PR Go; content calendar schedule Disabled; daily growth schedule Disabled; workflow_dispatch retained Go; production deploy No-Go; paid smoke No-Go; social auto-posting No-Go.
- Follow-up: Open and merge the PR after review. PR #60 still needs authenticated superseded comment or close action.

## Backlog

- Re-enable schedules only after one supervised week and owner confirmation.
- Manually run content-calendar and daily-growth once under supervision to review generated artifacts, cost behavior, and safety.
