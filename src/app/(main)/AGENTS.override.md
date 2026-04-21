# TianJi landing redesign override

## Scope
Allowed to modify:
- src/app/(main)/**
- src/components/landing/**
- src/components/charts/LifeChart.tsx
- src/design-system/**
- src/app/layout.tsx
- src/app/globals.css
- tailwind.config.js
- public/assets/**

## Hard boundaries
Do NOT modify:
- src/app/api/**
- src/lib/stripe*
- src/lib/auth*
- src/lib/supabase*
- middleware.ts
- env / secrets / Vercel settings
- existing route paths
- API request/response shapes
- Stripe checkout contract
- Supabase table writes / auth flow

## Done means
- Visual / motion upgrade only
- Existing forms still submit to the same endpoints
- Existing share flow remains intact
- Run: npm run typecheck && npm run lint && npm run test && npm run build
- Also run audit scripts already defined in package.json
- Output changed file list and one suggested commit message

## Ignore root relationship experiment workflow for this run
- Do not touch experiments/**
- Do not generate ab-result.json
- Do not update relationship-specific score files
