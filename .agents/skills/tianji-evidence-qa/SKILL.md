---
name: tianji-evidence-qa
description: Use for TianJi Love evidence packet quality control, including report existence, review packet links, changelog updates, commands recorded, evidence-based verdicts, secret-pattern scans, unsupported claim removal, and final QA handoff format.
---

# Name

tianji-evidence-qa

# When to use

Use this skill before handing TianJi Love work to the Brain thread, after meaningful docs or implementation work, or whenever evidence quality, secret hygiene, and gate claims must be checked.

# Mission

Make sure TianJi Love review packets are complete, evidence-based, secret-safe, and honest about gates.

# TianJi Love context

Current fixed gate state:

```text
Launch: No-Go
Deploy: No-Go
Paid smoke: No-Go
Next safe milestone: masked staging env remediation
```

Evidence quality matters more than optimistic conclusions. Missing evidence must remain a blocker.

# Hard safety rules

- Do not approve launch, deploy, or paid smoke without evidence.
- Do not print secrets.
- Do not scan broad directories if the task only allows new or updated docs.
- Do not claim a command passed unless it was run and the result is known.
- Do not hide skipped or failed checks.
- Do not allow unsupported claims in `.ai/REVIEW_PACKET.md`.
- Do not mutate app source as part of evidence QA unless explicitly requested.

# Required inputs

- List of new or updated files.
- Commands run and results.
- Expected report files.
- Current `.ai/CHANGELOG_AI.md`.
- Current `.ai/REVIEW_PACKET.md`.
- Gate verdicts and evidence sources.
- Secret-pattern scan scope.

# Workflow

1. Verify expected report files exist.
2. Verify `.ai/REVIEW_PACKET.md` links to updated artifacts.
3. Verify `.ai/CHANGELOG_AI.md` records the task.
4. Verify commands are recorded.
5. Verify verdicts are evidence-based.
6. Verify no unsupported launch, deploy, paid-smoke, revenue, or env claims exist.
7. Run a targeted secret-pattern scan over the allowed updated docs.
8. If hits appear, redact and rerun.
9. Produce the required final handoff format.

# Deliverables

- Evidence QA verdict.
- File existence and link check.
- Command record check.
- Secret-pattern scan result.
- Gate verdict.
- Residual risk list.
- Suggested commit message.

# Go / Conditional Go / No-Go standard

- Go: Required reports exist, records are updated, commands are recorded, scan passes, and claims match evidence.
- Conditional Go: Minor documentation cleanup remains but no secret or unsupported safety claim exists.
- No-Go: Any required report is missing, scan hits remain, commands are unrecorded, claims exceed evidence, or gate language is unsafe.

# Output format

1. What changed
2. Files changed
3. Commands run
4. Test/build result
5. Gate verdict
6. Risks and follow-up
7. Suggested commit message
