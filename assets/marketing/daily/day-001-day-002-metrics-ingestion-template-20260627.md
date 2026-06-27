# TianJi Love Day 1 / Day 2 Metrics Ingestion Template - 2026-06-27

Status: no real data yet.

Use this only after a human provides real live URLs or platform exports. Do not estimate impressions, clicks, leads, paid intent, paid success, revenue, conversion, or ROI.

## Rules

- If no real live URL exists, write `no real data yet`.
- If a metric is unknown, leave it blank or write `not supplied`; do not use `0` unless the platform or approved evidence shows zero.
- Revenue must remain blank or `no real data yet` unless approved real payment evidence exists.
- Paid success must remain blank or `no real data yet` until Stripe test-mode or approved revenue evidence is supplied.
- Do not paste private user data, payment data, raw exports with customer identifiers, or secrets.

## Ingestion Table

| date | day | item_id | channel | live_url | impressions/views | clicks | leads | paid_intent | paid_success | revenue | evidence_source | reviewed_by | notes |
| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 2026-06-26 | Day 1 | TBD | TBD | no real data yet | no real data yet | no real data yet | no real data yet | no real data yet | no real data yet | no real data yet | not supplied | TBD | Waiting for real live URL. |
| 2026-06-27 | Day 2 | TBD | TBD | no real data yet | no real data yet | no real data yet | no real data yet | no real data yet | no real data yet | no real data yet | not supplied | TBD | Waiting for real live URL. |

## If Live URLs Are Provided

Create one row per URL and attach only safe evidence:

```text
date=
day=
item_id=
channel=
live_url=
impressions_or_views=
clicks=
leads=
paid_intent=
paid_success=
revenue=
evidence_source=platform screenshot/export/manual operator note
reviewed_by=<masked human label>
notes=
```
