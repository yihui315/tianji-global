import type { WorkflowNode, PipelineStage } from './types';

export const WORKFLOW_NODES: Record<PipelineStage, WorkflowNode> = {
  input_validation: {
    stage: 'input_validation',
    displayName: 'Input Validation',
    displayNameZh: '输入验证',
    description: 'Validate birth date/time/location format and timezone',
    nextStages: ['calculation'],
    prevStages: [],
  },
  calculation: {
    stage: 'calculation',
    displayName: 'Fortune Calculation',
    displayNameZh: '命理计算',
    description: 'Swiss Ephemeris + Chinese calendar calculations',
    nextStages: ['timeline_build'],
    prevStages: ['input_validation'],
  },
  timeline_build: {
    stage: 'timeline_build',
    displayName: 'Fortune Timeline Builder',
    displayNameZh: '运势时间轴',
    description: 'Generate yearly/monthly timeline phases',
    nextStages: ['narrative_compose'],
    prevStages: ['calculation'],
  },
  narrative_compose: {
    stage: 'narrative_compose',
    displayName: 'Narrative Composer',
    displayNameZh: '叙事生成器',
    description: 'Generate hook/body/closure three-layer narrative',
    nextStages: ['coherence_check'],
    prevStages: ['timeline_build'],
  },
  coherence_check: {
    stage: 'coherence_check',
    displayName: 'Cultural Coherence Check',
    displayNameZh: '文化一致性检查',
    description: 'Validate content cultural coherence by system',
    nextStages: ['report_render'],
    prevStages: ['narrative_compose'],
  },
  report_render: {
    stage: 'report_render',
    displayName: 'Report Render',
    displayNameZh: '报告渲染',
    description: 'Render narrative to React components',
    nextStages: [],
    prevStages: ['coherence_check'],
  },
};

export function getPipelineOrder(): PipelineStage[] {
  return [
    'input_validation',
    'calculation',
    'timeline_build',
    'narrative_compose',
    'coherence_check',
    'report_render',
  ];
}

export function getNextStage(current: PipelineStage): PipelineStage | null {
  const node = WORKFLOW_NODES[current];
  return node.nextStages.length > 0 ? node.nextStages[0] : null;
}