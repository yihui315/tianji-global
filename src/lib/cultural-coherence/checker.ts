import { SystemType, CoherenceResult, CoherenceViolation } from './types';
import { SYSTEM_FORBIDDEN_MAP } from './forbidden-concepts';
import { COLOR_SEMANTICS } from './color-semantics';
import { TIME_RULES } from './time-rules';

const ERROR_CODES = {
  CROSS_SYSTEM_CONTAMINATION: 'CROSS_SYSTEM_CONTAMINATION',
  COLOR_MISMATCH: 'COLOR_MISMATCH',
  TIME_AMBIGUITY: 'TIME_AMBIGUITY',
} as const;

export function checkCoherence(
  content: string,
  system: SystemType
): CoherenceResult {
  const violations: CoherenceViolation[] = [];
  const forbiddenConcepts = SYSTEM_FORBIDDEN_MAP[system];

  // Rule 1: Forbidden concept detection
  for (const concept of forbiddenConcepts) {
    // Direct string inclusion check for Chinese text (word boundaries don't work well)
    if (content.includes(concept)) {
      violations.push({
        severity: 'error',
        code: ERROR_CODES.CROSS_SYSTEM_CONTAMINATION,
        message: `禁止概念 "${concept}" 出现在 ${system} 报告中`,
        found: [concept]
      });
    }
  }

  // Rule 2: Color semantic warnings
  const colorWords = Object.keys(COLOR_SEMANTICS);
  for (const color of colorWords) {
    if (content.includes(color)) {
      const expectedSemantics = COLOR_SEMANTICS[color][system];
      if (!expectedSemantics) {
        violations.push({
          severity: 'warning',
          code: ERROR_CODES.COLOR_MISMATCH,
          message: `颜色 "${color}" 在 ${system} 系统中的语义未定义`,
          found: [color]
        });
      }
    }
  }

  // Rule 3: Time rule checks
  for (const rule of TIME_RULES) {
    if (rule.check(content)) {
      violations.push({
        severity: 'info',
        code: ERROR_CODES.TIME_AMBIGUITY,
        message: rule.message,
        found: []
      });
    }
  }

  const hasErrors = violations.some(v => v.severity === 'error');
  const confidence = hasErrors ? 0.5 : 0.95;

  return {
    valid: !hasErrors,
    violations,
    confidence,
    checked_at: new Date().toISOString(),
    system
  };
}

// Convenience function for pipeline use
export function validateReport(
  content: string,
  system: SystemType
): { passed: boolean; errors: string[]; warnings: string[] } {
  const result = checkCoherence(content, system);
  return {
    passed: result.valid,
    errors: result.violations
      .filter(v => v.severity === 'error')
      .map(v => v.message),
    warnings: result.violations
      .filter(v => v.severity === 'warning')
      .map(v => v.message)
  };
}
