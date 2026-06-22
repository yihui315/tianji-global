# Marketing KPI Report Template
**Period:** {{PERIOD}}
**Generated:** {{DATE}}

---

## Lead Capture Funnel

| Metric | Value |
|---|---|
| Form Views (lead_capture_viewed) | TBD |
| Submissions (lead_capture_submitted) | TBD |
| Failed (lead_capture_failed) | TBD |
| Conversion Rate (submitted/viewed) | TBD |

**By Page:**
| Page | Views | Submitted | Rate |
|---|---|---|---|
| / (home) | TBD | TBD | TBD |
| /ask | TBD | TBD | TBD |
| /pricing | TBD | TBD | TBD |
| /love-reading | TBD | TBD | TBD |

---

## Traffic Sources

Query `analytics_events` WHERE event = 'lead_capture_viewed' with UTM dimensions.

---

## Next Actions

- Review `marketing_leads` WHERE status = 'pending_manual_review'
- Draft email sequence (draft_only mode — no auto send)
- Schedule social content

---

*Update: query analytics_events DB for actual numbers before each report.*
