import type { ComponentDefinition } from './types';

/**
 * Narrative Composer v2 Configuration
 * Liz Greene-style report structure with layered themes
 */
export interface NarrativeComposerV2Config {
  system: 'bazi' | 'ziwei' | 'qizheng' | 'western';
  language: 'zh' | 'en';
  depth: 'basic' | 'premium';  // basic = 2 themes, premium = 4 themes
  includeMonthly: boolean;
}

export const PIPELINE_COMPONENTS: ComponentDefinition[] = [
  {
    id: 'input-validator',
    name: 'Input Validator',
    version: '1.0.0',
    stage: 'input_validation',
    input: {
      type: 'object',
      required: ['birthDate', 'birthTime', 'birthLocation'],
      properties: {
        birthDate: { type: 'string', description: 'YYYY-MM-DD format' },
        birthTime: { type: 'string', description: 'HH:mm format, local time' },
        birthLocation: { type: 'object', description: '{ lat, lng, name }' },
        system: { type: 'string', description: 'bazi|ziwei|qizheng|western' },
      },
    },
    output: {
      type: 'object',
      required: ['valid', 'jd', 'timezone'],
      properties: {
        valid: { type: 'boolean', description: 'Whether input is valid' },
        jd: { type: 'number', description: 'Julian Day for sweph calculation' },
        timezone: { type: 'string', description: 'IANA timezone identifier' },
        errors: { type: 'array', description: 'Validation errors', optional: true },
      },
    },
    timeout: 1000, // 1s
    retryable: false,
    dependencies: [],
  },
  {
    id: 'fortune-calculator',
    name: 'Fortune Calculator',
    version: '1.0.0',
    stage: 'calculation',
    input: {
      type: 'object',
      required: ['jd', 'latitude', 'longitude', 'system'],
      properties: {
        jd: { type: 'number', description: 'Julian Day' },
        latitude: { type: 'number', description: 'Birth latitude' },
        longitude: { type: 'number', description: 'Birth longitude' },
        system: { type: 'string', description: 'bazi|ziwei|qizheng|western' },
        houseSystem: { type: 'string', description: 'PLACIDUS|KOCH|EQUAL', optional: true },
      },
    },
    output: {
      type: 'object',
      required: ['planets', 'houses', 'cusps'],
      properties: {
        planets: { type: 'array', description: 'Planet positions' },
        houses: { type: 'array', description: 'House assignments' },
        cusps: { type: 'array', description: 'House cusp degrees' },
        lunarDate: { type: 'object', description: 'Chinese lunar calendar date' },
      },
    },
    timeout: 5000, // 5s
    retryable: true,
    dependencies: ['input-validator'],
  },
  {
    id: 'timeline-builder',
    name: 'Fortune Timeline Builder',
    version: '1.0.0',
    stage: 'timeline_build',
    input: {
      type: 'object',
      required: ['birthData', 'system', 'targetYear'],
      properties: {
        birthData: { type: 'object', description: 'Output from fortune-calculator' },
        system: { type: 'string', description: 'bazi|ziwei|qizheng|western' },
        targetYear: { type: 'number', description: 'Year to analyze' },
      },
    },
    output: {
      type: 'object',
      required: ['phases', 'keyDates', 'dominantElements'],
      properties: {
        phases: { type: 'array', description: 'Timeline phases with hook/body/closure' },
        keyDates: { type: 'array', description: 'Important dates in the year' },
        dominantElements: { type: 'array', description: 'Dominant five elements' },
      },
    },
    timeout: 15000, // 15s
    retryable: true,
    dependencies: ['fortune-calculator'],
  },
  {
    id: 'narrative-composer',
    name: 'Narrative Composer',
    version: '1.0.0',
    stage: 'narrative_compose',
    input: {
      type: 'object',
      required: ['timelineData', 'userProfile', 'system', 'language'],
      properties: {
        timelineData: { type: 'object', description: 'Output from timeline-builder' },
        userProfile: { type: 'object', description: '{ name, gender, question? }' },
        system: { type: 'string', description: 'bazi|ziwei|qizheng|western' },
        language: { type: 'string', description: 'zh|en' },
      },
    },
    output: {
      type: 'object',
      required: ['hook', 'body', 'closure', 'wordCount'],
      properties: {
        hook: { type: 'string', description: 'Opening hook paragraph' },
        body: { type: 'array', description: 'Narrative blocks for each phase' },
        closure: { type: 'string', description: 'Closing paragraph' },
        wordCount: { type: 'number', description: 'Total word count' },
      },
    },
    timeout: 30000, // 30s
    retryable: true,
    dependencies: ['timeline-builder'],
  },
  {
    id: 'narrative-composer-v2',
    name: 'Narrative Composer V2',
    version: '2.0.0',
    stage: 'narrative_compose',
    description: 'Liz Greene-style narrative report with layered theme structure',
    input: {
      type: 'object',
      required: ['birthData', 'targetYear', 'config'],
      properties: {
        birthData: { type: 'string', description: 'Formatted birth data summary' },
        targetYear: { type: 'number', description: 'Year to analyze' },
        config: {
          type: 'object',
          description: 'NarrativeComposerV2Config',
          properties: {
            system: { type: 'string', description: 'bazi|ziwei|qizheng|western' },
            language: { type: 'string', description: 'zh|en' },
            depth: { type: 'string', description: 'basic|premium' },
            includeMonthly: { type: 'boolean', description: 'Include monthly overview' },
          },
        },
      },
    },
    output: {
      type: 'object',
      required: ['overview', 'themes', 'keywords', 'closure'],
      properties: {
        overview: {
          type: 'object',
          properties: {
            hook: { type: 'string' },
            coreThemes: { type: 'array', items: { type: 'string' } },
            yearEnergy: { type: 'string' },
          },
        },
        themes: { type: 'array', description: '2-4 NarrativeTheme objects' },
        keywords: { type: 'array', items: { type: 'string' }, description: '3-5 keywords' },
        monthlyOverview: { type: 'array', description: '12 months' },
        closure: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            outlook: { type: 'string' },
            empoweringPhrase: { type: 'string' },
          },
        },
      },
    },
    timeout: 60000, // 60s for AI generation
    retryable: true,
    dependencies: ['timeline-builder'],
  },
  {
    id: 'coherence-checker',
    name: 'Cultural Coherence Checker',
    version: '1.0.0',
    stage: 'coherence_check',
    input: {
      type: 'object',
      required: ['content', 'system'],
      properties: {
        content: { type: 'string', description: 'Generated narrative content' },
        system: { type: 'string', description: 'bazi|ziwei|qizheng|western' },
      },
    },
    output: {
      type: 'object',
      required: ['valid', 'violations', 'confidence'],
      properties: {
        valid: { type: 'boolean', description: 'Whether content is culturally coherent' },
        violations: { type: 'array', description: 'List of violations' },
        confidence: { type: 'number', description: 'Confidence score 0-1' },
        canDeliver: { type: 'boolean', description: 'Whether report can be delivered' },
      },
    },
    timeout: 5000, // 5s
    retryable: false,
    dependencies: ['narrative-composer'],
  },
  {
    id: 'report-renderer',
    name: 'Report Renderer',
    version: '1.0.0',
    stage: 'report_render',
    input: {
      type: 'object',
      required: ['narrative', 'metadata'],
      properties: {
        narrative: { type: 'object', description: 'Output from narrative-composer' },
        metadata: { type: 'object', description: '{ system, generatedAt, coherenceResult }' },
      },
    },
    output: {
      type: 'object',
      required: ['html', 'components'],
      properties: {
        html: { type: 'string', description: 'Rendered HTML' },
        components: { type: 'array', description: 'React component tree' },
      },
    },
    timeout: 2000, // 2s
    retryable: false,
    dependencies: ['coherence-checker'],
  },
];

export function getComponentById(id: string): ComponentDefinition | undefined {
  return PIPELINE_COMPONENTS.find(c => c.id === id);
}

export function getComponentByStage(stage: string): ComponentDefinition | undefined {
  return PIPELINE_COMPONENTS.find(c => c.stage === stage);
}