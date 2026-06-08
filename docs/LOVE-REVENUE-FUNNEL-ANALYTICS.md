# Love Revenue Funnel Analytics

## Canonical Event Map

| Canonical Event | Existing / Target Mapping | Notes |
|---|---|---|
| `relationship_form_start` | `love_form_start` or relationship UI event | User starts free preview form |
| `relationship_form_submit` | `love_session_created` | Session created without public birth data |
| `relationship_free_report_view` | `love_result_view` | Free teaser/canonical preview viewed |
| `relationship_share_click` | `relationship_share_click` / relationship analytics | Public share CTA clicked |
| `relationship_upgrade_click` | `love_unlock_click` | Premium CTA clicked |
| `checkout_start` | `love_checkout_created` | Checkout session created |
| `checkout_success` | `love_checkout_success` | Webhook or success callback observed |
| `checkout_cancel` | target event from `checkout=cancelled` | User returned without payment |
| `premium_report_ready` | `love_report_completed` | Report job completed |
| `premium_report_view` | target event | Paid report viewed |
| `premium_report_recovery_click` | target event | Recovery email/link clicked |

## Allowed Properties

- `locale`
- `report_type`
- `archetype_key`
- `score_band`
- `has_birth_time_boolean`
- `has_birth_place_boolean`
- `surface`
- `cta_variant`
- `price_variant`

## Forbidden Properties

- `full_birth_date`
- `exact_birth_time`
- `birth_place`
- `full_name`
- `private_question`
- `raw_report`
- `payment_card_info`
- `raw_engine_output`
- `payment_state_on_public_share`
- `stripe_secret`
- `webhook_secret`
- `provider_prompt`

## AB Recommendations

1. Hero CTA: `开始缘分测试` vs `查看你们的关系合盘`.
2. Upgrade CTA: `解锁完整关系报告` vs `查看未来 30 天关系窗口`.
3. Price: `9.9` vs `19.9` vs `29.9`.
4. Share card: mystery angle vs practical insight angle vs romantic archetype angle.
5. Waiting page: premium analysis in progress vs relationship map being generated.

## Safety Notes

- Analytics payloads must use sanitized primitive fields only.
- Do not include birth date, birth time, birth place, private question, payment state, raw engine output, or provider prompts.
- Do not run paid smoke until masked test-mode staging evidence exists.
