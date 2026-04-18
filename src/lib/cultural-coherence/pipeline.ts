import { checkCoherence, validateReport, type SystemType, type CoherenceResult } from '@/lib/cultural-coherence';

export interface PipelineConfig {
  system: SystemType;
  enableCoherenceCheck: boolean; // default: true in production
  failOnError: boolean; // default: true - block report if contamination detected
  warnOnColorMismatch: boolean; // default: true
}

export async function generateReportWithCoherenceCheck(
  reportContent: string,
  config: PipelineConfig
): Promise<{
  content: string;
  coherenceResult: CoherenceResult;
  passed: boolean;
  canDeliver: boolean;
}> {
  const result = checkCoherence(reportContent, config.system);
  
  const hasErrors = result.violations.some(v => v.severity === 'error');
  
  // Decision: block or warn
  const canDeliver = !hasErrors || !config.failOnError;
  
  // If blocked, log for analytics
  if (hasErrors && config.failOnError) {
    // Fire-and-forget analytics (don't block)
    trackCoherenceViolation(config.system, result.violations).catch(() => {});
  }
  
  return {
    content: canDeliver ? reportContent : '',
    coherenceResult: result,
    passed: result.valid,
    canDeliver
  };
}

// Fire-and-forget analytics tracking
async function trackCoherenceViolation(
  system: SystemType,
  violations: CoherenceResult['violations']
): Promise<void> {
  // TODO: integrate with analytics when available
  // For now, log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('[Cultural Coherence] Violation detected:', {
      system,
      violationCount: violations.length,
      errors: violations.filter(v => v.severity === 'error').length,
      warnings: violations.filter(v => v.severity === 'warning').length
    });
  }
}
