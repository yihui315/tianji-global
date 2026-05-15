---
name: stripe-subscription-builder
description: Build Tianji Stripe subscriptions, one-time report purchases, usage credits, webhook handling, entitlement checks, and billing tests with signature verification and idempotent event processing.
---

# Stripe Subscription Builder

## Purpose

Implement payment and entitlement flows safely.

## When to use

Use for subscriptions, one-time reports, credits, Stripe Checkout, webhook handling, billing portal, and entitlement synchronization.

## Inputs

- Stripe routes and helpers
- Entitlement code
- Database schema and migrations
- `.env.example`
- Billing tests
- Stripe dashboard assumptions from the user

## Actions

1. Confirm product and price IDs are env-driven.
2. Verify webhook signatures.
3. Process webhook events idempotently.
4. Grant entitlements from trusted server-side Stripe events, not frontend redirects.
5. Add tests for paid, failed, duplicate, canceled, and downgraded states.

## Constraints

- Do not grant entitlements from untrusted client state.
- Do not delete user data on payment failure.
- Do not log full payment payloads or secrets.
- Do not edit real env files.
- Do not add migrations without Brain review.

## Definition of Done

- Webhook verification and idempotency are covered.
- Entitlement state follows Stripe events.
- Tests cover key billing transitions.
- Env requirements are documented safely.

## Validation

- `npm run test`
- `npm run typecheck`
- Stripe webhook targeted tests when available.
