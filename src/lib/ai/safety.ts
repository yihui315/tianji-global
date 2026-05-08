const SAFETY_RULES = [
  'Frame the response as self-reflection, relationship insight, and practical life rhythm guidance.',
  'Do not make deterministic or guaranteed future predictions.',
  'Do not provide medical, legal, or financial advice.',
  'Do not claim certainty, supernatural proof, or a guaranteed outcome.',
  'Encourage the user to seek qualified professional help for medical, legal, financial, safety, or crisis decisions.',
];

export function buildSafetyInstructions(): string {
  return SAFETY_RULES.map((rule) => `- ${rule}`).join('\n');
}

export function withSafetyInstructions(systemPrompt: string): string {
  const trimmed = systemPrompt.trim();
  const safety = buildSafetyInstructions();

  return trimmed
    ? `${trimmed}\n\nNon-negotiable safety rules:\n${safety}`
    : `Non-negotiable safety rules:\n${safety}`;
}

export function assertPromptHasSafety(systemPrompt: string): boolean {
  const prompt = systemPrompt.toLowerCase();
  return (
    prompt.includes('do not make deterministic') &&
    prompt.includes('medical') &&
    prompt.includes('legal') &&
    prompt.includes('financial')
  );
}
