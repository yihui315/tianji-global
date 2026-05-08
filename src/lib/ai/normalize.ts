export function normalizeAiText(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function appendReflectionFooter(value: string, footer: string): string {
  const normalized = normalizeAiText(value);
  const normalizedFooter = footer.trim();

  if (!normalizedFooter) return normalized;
  if (normalized.includes(normalizedFooter)) return normalized;

  return `${normalized}\n\n${normalizedFooter}`;
}
