# Marketing Automation Sub-Loop Design
**Created:** 2026-06-22 | **Status:** DRAFT

## Loop Overview
```
Visitor → LeadCaptureForm (4 pages) → POST /api/marketing/leads → DB
```

## Pages with Form
- `/ask` (inline, pricing section)
- `/pricing` (inline, pricing section)  
- `/love-reading` (above results)
- `/` (home, hero section)

## Mode: draft_only
- ✅ Lead capture + DB storage
- ✅ Analytics events (lead_capture_viewed/submitted/failed)
- ❌ No auto-email | ❌ No auto-publish | ❌ No auto-Stripe flows

## GDPR
- Consent checkbox required (Zod literal: `consent: z.literal(true)`)
- IP stored as SHA256 hash only
- Email never sent to analytics API

## Database
- Table: `marketing_leads` (created by tianji_app)
- API: `POST /api/marketing/leads` with Zod validation
- Degraded mode: `isSupabaseMutationDisabled()` guard
