const CERTAINTY_RISK_PATTERN =
  /\b(100%|guarantee|guaranteed|definitely|destined|must marry|will marry|will divorce|disaster|death prediction)\b/i;

export function containsVedicCertaintyRisk(value: string) {
  return CERTAINTY_RISK_PATTERN.test(value);
}

export function assertVedicOutputSafe(value: string) {
  if (containsVedicCertaintyRisk(value)) {
    throw new Error('Vedic report output contains certainty-risk language');
  }
}

export const VEDIC_ENTERTAINMENT_DISCLAIMER =
  'This Vedic relationship report is for entertainment and self-reflection only. It describes possible patterns and timing windows, not fixed outcomes, and it is not medical, legal, or financial advice.';
