# Marketing Automation Sub-Loop Design
**Created:** 2026-06-22
**Author:** Hermes CEO-Agent
**Status:** DRAFT — pending manual review

---

## 1. Loop Overview

```
Website Visitors
       │
       ▼
LeadCaptureForm (EN/ZH, 4 pages)
  /  /ask
  /  /pricing
  /  / (home)
  /  /love-reading
       │
       ▼  POST /api/marketing/leads
Marketing Leads DB (marketing_leads table)
  status = 'pending_manual_review'
       │
       ▼  [manual review gate]
Email Draft Queue ──► L1 Marketing Content Calendar
```

---

## 2. Consent & GDPR Compliance

| Requirement | Implementation |
|---|---|
| Explicit opt-in | Checkbox required, cannot pre-check |
| Consent version tracking | `consent_version` field (v1.0) |
| IP anonymization | SHA256 hash stored, not raw IP |
| Right to delete | `status=pending_manual_review` blocks auto-processing |
| No email in analytics | `email` never sent to `/api/analytics/track` |

---

## 3. Mode: `draft_only`

| Action | Allowed? |
|---|---|
| Capture leads | ✅ Yes |
| Store in DB | ✅ Yes |
| Analytics events | ✅ Yes |
| Auto-send emails | ❌ No-Go |
| Auto-publish social | ❌ No-Go |
| Auto-trigger Stripe flows | ❌ No-Go |
| Execute paid ad integrations | ❌ No-Go |

---

## 4. Analytics Events

| Event | Trigger | Payload |
|---|---|---|
| `lead_capture_viewed` | Form mounts | source_page, variant, locale |
| `lead_capture_submitted` | API success | source_page, variant, locale |
| `lead_capture_failed` | API error / network error | source_page, variant, locale, reason |

---

## 5. Database Schema: `marketing_leads`

```sql
CREATE TABLE marketing_leads (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  source_page VARCHAR(100) NOT NULL,
  locale VARCHAR(20),
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  utm_content VARCHAR(255),
  utm_term VARCHAR(255),
  consent_given_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consent_version VARCHAR(50) NOT NULL DEFAULT '1.0',
  status VARCHAR(50) NOT NULL DEFAULT 'pending_manual_review',
  ip_hash VARCHAR(128),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 6. API Contract: `POST /api/marketing/leads`

**Request:**
```json
{
  "email": "user@example.com",
  "name": "Yi Hui",
  "source_page": "home",
  "locale": "zh",
  "consent": true,
  "utm_source": "twitter",
  "utm_medium": "social",
  "utm_campaign": "w25-launch"
}
```

**Response 201:** `{"success": true}`
**Response 400:** `{"success": false, "error": "invalid_payload", "details": [...]}`
**Response 202:** `{"success": false, "skipped": true, "reason": "marketing_mutation_disabled"}` (degraded mode)
**Response 500:** `{"success": false, "error": "internal_error"}`

---

## 7. Go/No-Go Checklist

- [x] `marketing_leads` table created with `tianji_app` INSERT grant
- [x] API route validates all fields with Zod
- [x] API route uses `isSupabaseMutationDisabled()` guard
- [x] `consent` must be `true` (Zod literal)
- [x] IP stored as SHA256 hash only
- [x] All lead status initialized to `pending_manual_review`
- [x] Analytics events: viewed, submitted, failed — no email in payload
- [x] 4 pages have form inserted (home, ask, pricing, love-reading)
- [x] Dynamic import used for Server Component pages (love-reading)
- [ ] Build verification (local `npm run build`)
- [ ] PR created and reviewed

**Go/No-Go: Conditional GO — awaiting build verification**
