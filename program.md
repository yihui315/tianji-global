# TianJi Autonomous Upgrade Program

## Current focus
Improve Relationship Reading to premium-level product quality.

## Allowed files
- src/app/relationship/**
- src/components/relationship/**
- src/components/share/**
- src/lib/relationship-engine.ts
- src/lib/synastry-engine.ts

## Protected files
- auth
- billing
- deployment config
- privacy policy
- share privacy safeguards
- environment config

## Success criteria
A successful experiment must:
- pass all CI checks
- improve upgrade score
- preserve privacy safety
- improve at least one:
  - relationship clarity
  - share usability
  - premium upgrade visibility

## Failure policy
Discard experiment if:
- upgrade score decreases
- audit fails
- privacy regression detected
- duplicated bilingual content increases

## Iteration rules
- only one module per run
- max 8 files changed
- max 1 retry on failure
- must produce PR summary
