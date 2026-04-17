import { describe, it, expect } from 'vitest';
import { generateReportWithCoherenceCheck, type PipelineConfig } from '@/lib/cultural-coherence/pipeline';

describe('Pipeline integration', () => {
  describe('generateReportWithCoherenceCheck', () => {
    it('passes clean bazi content', async () => {
      const content = '日主旺相，八字用神为火，大运流年运势平稳。';
      const config: PipelineConfig = { system: 'bazi', enableCoherenceCheck: true, failOnError: true, warnOnColorMismatch: true };
      const result = await generateReportWithCoherenceCheck(content, config);
      expect(result.passed).toBe(true);
      expect(result.canDeliver).toBe(true);
    });

    it('blocks contaminated bazi content', async () => {
      const content = '你的太阳星座在白羊座，紫微星入命宫。';
      const config: PipelineConfig = { system: 'bazi', enableCoherenceCheck: true, failOnError: true, warnOnColorMismatch: true };
      const result = await generateReportWithCoherenceCheck(content, config);
      expect(result.passed).toBe(false);
      expect(result.canDeliver).toBe(false);
      expect(result.coherenceResult.violations.length).toBeGreaterThan(0);
    });

    it('warns but delivers when failOnError is false', async () => {
      const content = '紫微星入命宫，大运流年平稳。';
      const config: PipelineConfig = { system: 'bazi', enableCoherenceCheck: true, failOnError: false, warnOnColorMismatch: true };
      const result = await generateReportWithCoherenceCheck(content, config);
      expect(result.canDeliver).toBe(true); // delivers despite violations
    });
  });
});
