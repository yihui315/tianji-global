import type { NarrativeComposerConfig, NarrativeReport } from './templates';
import { buildPrompt } from './prompts';
import { validateReport } from '@/lib/cultural-coherence';
import type { SystemType } from '@/lib/cultural-coherence';

export interface GenerateNarrativeOptions {
  config: NarrativeComposerConfig;
  birthData: string;        // Formatted birth data summary for prompt
  targetYear: number;
  onProgress?: (stage: string) => void;
}

export interface GenerateNarrativeResult {
  success: boolean;
  report?: NarrativeReport;
  errors?: string[];
  warnings?: string[];
  coherenceResult?: {
    valid: boolean;
    violations: unknown[];
  };
}

/**
 * Narrative Composer v2 Service
 * 
 * Generates Liz Greene-style narrative reports with:
 * 1. Structured template
 * 2. System-specific prompts
 * 3. Cultural coherence validation
 */
export async function generateNarrative(
  options: GenerateNarrativeOptions
): Promise<GenerateNarrativeResult> {
  const { config, birthData, targetYear } = options;
  
  options.onProgress?.('prompt-building');
  
  // Build the prompt
  const prompt = buildPrompt(config, birthData, targetYear);
  
  options.onProgress?.('ai-generating');
  
  // TODO: Integrate with actual AI API
  // For now, return a mock structure demonstrating the format
  const mockReport = generateMockReport(config, targetYear);
  
  options.onProgress?.('coherence-checking');
  
  // Validate the report
  const narrativeText = reportToText(mockReport);
  const coherenceResult = validateReport(narrativeText, config.system as SystemType);
  
  if (!coherenceResult.passed) {
    return {
      success: false,
      errors: coherenceResult.errors,
      warnings: coherenceResult.warnings,
      coherenceResult: {
        valid: coherenceResult.passed,
        violations: [],
      },
    };
  }
  
  options.onProgress?.('complete');
  
  return {
    success: true,
    report: mockReport,
    warnings: coherenceResult.warnings,
    coherenceResult: {
      valid: true,
      violations: [],
    },
  };
}

/**
 * Convert a NarrativeReport to plain text for coherence checking
 */
function reportToText(report: NarrativeReport): string {
  const parts: string[] = [];
  parts.push(report.overview.hook);
  parts.push(...report.overview.coreThemes);
  report.themes.forEach(t => {
    parts.push(t.hook);
    parts.push(...t.body);
    parts.push(...t.opportunities);
    parts.push(...t.challenges);
    parts.push(...t.actions);
  });
  parts.push(...report.keywords);
  report.monthlyOverview.forEach(m => parts.push(m.summary));
  parts.push(report.closure.summary);
  parts.push(report.closure.outlook);
  return parts.join(' ');
}

/**
 * Generate a mock report demonstrating the structure
 * TODO: Replace with actual AI API call
 */
function generateMockReport(config: NarrativeComposerConfig, year: number): NarrativeReport {
  const themeCount = config.depth === 'basic' ? 2 : 4;
  
  return {
    overview: {
      hook: `当${year}年的能量缓缓展开，命运的织机开始编织新的图案...`,
      coreThemes: [
        '这是一个关于转化与突破的年份',
        '内在的成长将带来外在的改变',
      ],
      yearEnergy: `${year}年的核心能量是变化与整合`,
    },
    themes: Array.from({ length: themeCount }, (_, i) => ({
      id: `theme-${i + 1}`,
      title: `主题${i + 1}`,
      timeRange: i === 0 ? '上半年' : '下半年',
      hook: '这个主题如同黎明前的曙光，蕴含着转变的可能...',
      body: [
        '在命理的解读中，这个组合揭示了深层的机遇...',
        '它既带来挑战，也带来成长的礼物...',
      ],
      opportunities: ['机遇一：把握新出现的机会', '机遇二：善用人际关系'],
      challenges: ['挑战一：需要面对旧有模式', '挑战二：耐心等待时机'],
      actions: ['行动一：主动出击', '行动二：保持耐心'],
      keyPhrase: '金句：顺势而为，静待花开',
    })),
    keywords: ['成长', '转化', '突破', '整合', '觉醒'],
    monthlyOverview: Array.from({ length: 12 }, (_, i) => ({
      month: `${i + 1}月`,
      summary: `这是${i + 1}月的能量描述...`,
    })),
    closure: {
      summary: `回顾${year}年，这是成长的一年。`,
      outlook: '展望未来，愿你在命运的河流中找到自己的方向。',
      empoweringPhrase: '记住：命运掌握在自己手中。',
    },
  };
}
