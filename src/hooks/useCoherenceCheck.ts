'use client';

import { useState, useCallback } from 'react';
import { checkCoherence, type SystemType, type CoherenceResult } from '@/lib/cultural-coherence';

export function useCoherenceCheck() {
  const [result, setResult] = useState<CoherenceResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const check = useCallback((content: string, system: SystemType) => {
    setIsChecking(true);
    const coherenceResult = checkCoherence(content, system);
    setResult(coherenceResult);
    setIsChecking(false);
    return coherenceResult;
  }, []);

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  return {
    result,
    isChecking,
    check,
    reset,
    hasErrors: result?.violations.some(v => v.severity === 'error') ?? false,
    hasWarnings: result?.violations.some(v => v.severity === 'warning') ?? false
  };
}
