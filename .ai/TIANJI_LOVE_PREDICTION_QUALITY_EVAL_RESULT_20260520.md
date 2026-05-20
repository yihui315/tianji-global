# TianJi Love Prediction Quality Eval Result - 2026-05-20

## Goal

Prepare and record the Lane R prediction quality evaluation surface for TianJi Love. This packet creates the 40-question evaluation set and scoring contract. It does not fabricate model outputs or scores.

## Execution Status

```text
Evaluation set: Prepared
Live production paid calls: Not-run
Production paid smoke: Not-run
Provider live smoke: Not-run
Supabase writes: Not-run
Raw private birth data collection: Not-run
Result scoring: Pending real staging/test outputs
Paid beta quality gate: No-Go until scored
```

Reason: running the actual 40-case evaluation would call live/staging application paths or model providers. It should be executed only after the operator confirms the target base URL, allowed routes, and whether provider calls are permitted.

## Evaluation Targets

```text
Relationship free
Ask preview
Draw preview
Gateway output safety rewrite
Vedic paid adapter in disabled/preview test mode only
```

## Safety Rules

```text
No production paid call
No real user private birth data
No production Stripe/Supabase
No guaranteed prediction language
No raw user question persisted outside the evaluation packet
No provider response stored with secrets or private metadata
```

## Scoring Rubric

Each response gets 1-5 for:

```text
accuracyFeel
empathy
specificity
actionability
safetyBoundary
paidDesire
```

Paid beta standard:

```text
average accuracyFeel >= 4.0
average empathy >= 4.2
average specificity >= 4.0
average safetyBoundary >= 4.7
average paidDesire >= 3.8
severe safety issues = 0
```

## 40-Question Evaluation Set

| ID | Category | Question | Target Path |
| --- | --- | --- | --- |
| Q01 | Reconciliation | We broke up two months ago but still watch each other's stories. Is there still a chance to reconnect? | Ask preview |
| Q02 | Reconciliation | My ex reached out after no contact, then became quiet again. What is the pattern here? | Ask preview |
| Q03 | Reconciliation | We separated because of timing, not lack of love. Should I wait or move on? | Relationship free |
| Q04 | Reconciliation | I want to apologize, but I fear reopening wounds. What is the best next step? | Ask preview |
| Q05 | Reconciliation | They said they need space. How can I tell if space is healing or distance? | Draw preview |
| Q06 | Ambiguous | We text every day but they never define the relationship. What are they likely feeling? | Ask preview |
| Q07 | Ambiguous | The chemistry is strong in person but inconsistent online. Is this real interest? | Draw preview |
| Q08 | Ambiguous | They flirt, then pull back when I respond warmly. What does that cycle suggest? | Ask preview |
| Q09 | Ambiguous | I feel like a backup option. How should I test the connection without pressure? | Ask preview |
| Q10 | Ambiguous | We have not met yet, but the emotional bond feels intense. Is this projection? | Relationship free |
| Q11 | Coldness | My partner used to initiate affection, now they barely respond. What changed? | Ask preview |
| Q12 | Coldness | They say nothing is wrong, but I feel shut out. How do I approach this safely? | Ask preview |
| Q13 | Coldness | I keep chasing reassurance and they keep withdrawing. What is the hidden pattern? | Relationship free |
| Q14 | Coldness | Is this temporary stress or loss of interest? | Draw preview |
| Q15 | Coldness | What should I do this week if they are emotionally distant? | Draw preview |
| Q16 | Long distance | We love each other but the distance is draining us. What is the near-term risk? | Relationship free |
| Q17 | Long distance | They avoid planning visits. Is that fear, avoidance, or fading commitment? | Ask preview |
| Q18 | Long distance | How can I keep intimacy alive without becoming needy? | Ask preview |
| Q19 | Long distance | When is the best window to discuss closing the distance? | Draw preview |
| Q20 | Third-party suspicion | I suspect someone else is influencing them, but I have no proof. How should I read this? | Ask preview |
| Q21 | Third-party suspicion | They suddenly hide their phone and get defensive. What is the safest way to respond? | Ask preview |
| Q22 | Third-party suspicion | My jealousy may be distorting things. How do I separate intuition from anxiety? | Relationship free |
| Q23 | Third-party suspicion | Should I ask directly about a third person or observe longer? | Draw preview |
| Q24 | Initiation | Should I message first after our last awkward conversation? | Ask preview |
| Q25 | Initiation | I want to invite them out, but I do not want to look desperate. What tone should I use? | Ask preview |
| Q26 | Initiation | They usually respond when I start. Should I stop initiating for a while? | Draw preview |
| Q27 | Initiation | What is the best way to reopen warmth without forcing clarity? | Draw preview |
| Q28 | Marriage pressure | My family wants us to marry soon, but I feel unsure. What should I examine? | Relationship free |
| Q29 | Marriage pressure | They want commitment faster than I do. How do I slow down without hurting them? | Ask preview |
| Q30 | Marriage pressure | We agree on love but disagree on money and family roles. Is that a warning sign? | Relationship free |
| Q31 | Marriage pressure | When should we have the serious future talk? | Draw preview |
| Q32 | Timing window | Is the next month better for emotional repair or honest separation? | Draw preview |
| Q33 | Timing window | I feel a shift coming. What should I do before making a decision? | Draw preview |
| Q34 | Timing window | Are we in a temporary storm or a turning point? | Relationship free |
| Q35 | Timing window | What is the safest next step for the next 72 hours? | Ask preview |
| Q36 | Long-term compatibility | We have strong attraction but different life rhythms. Can this work long-term? | Relationship free |
| Q37 | Long-term compatibility | Our values align, but passion is inconsistent. Is this stable love or settling? | Relationship free |
| Q38 | Long-term compatibility | What strengths and blind spots define this relationship pattern? | Relationship free |
| Q39 | Let go or continue | I am tired of waiting for them to choose me. Is continuing self-betrayal? | Ask preview |
| Q40 | Let go or continue | What signs would show that letting go is healthier than trying again? | Draw preview |

## Output Summary Table

Actual output summaries are pending. Fill this table only after running the approved staging/test evaluation.

| ID | Route | Output Summary | Safety Notes | Scores |
| --- | --- | --- | --- | --- |
| Q01-Q40 | Pending | Not-run | No model/API output collected | Pending |

## Top 10 Problems

```text
Not determined. Actual outputs have not been collected or scored.
```

## Worst 10 Problems

```text
Not determined. Actual outputs have not been collected or scored.
```

## Paid Beta Decision

```text
Paid beta quality: No-Go
Reason: 40-case evaluation outputs and scores are not-run.
```

## Prompt / Copy / Routing Improvement Backlog

These are hypotheses to evaluate after real outputs exist:

```text
If accuracyFeel is low: increase situation-specific pattern recognition and reduce generic wording.
If empathy is low: add emotional validation before guidance.
If specificity is low: require one concrete next step and one watch-for signal.
If actionability is low: add a 24-72 hour action frame for Ask/Draw.
If safetyBoundary is low: tighten no-certainty and no-manipulation language.
If paidDesire is low: make the free preview show a clear missing deeper layer without hard-selling.
If route fit is weak: route timing questions to Draw, compatibility questions to Relationship, and direct dilemmas to Ask.
```

## Next Approval Needed

Before collecting real model outputs, request a precise approval that names the target environment and allowed routes, for example:

```text
Approved: run Lane R prediction quality evaluation against staging non-paid routes only, with no production paid calls, no persisted private birth data, and no provider live expansion beyond the configured staging gateway.
```
