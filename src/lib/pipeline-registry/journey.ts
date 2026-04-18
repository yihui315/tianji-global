import type { JourneyStep } from './types';

export const USER_JOURNEY_STEPS: JourneyStep[] = [
  {
    step: 1,
    id: 'system-select',
    displayName: 'Select Fortune System',
    displayNameZh: '选择命理系统',
    description: 'User chooses bazi, ziwei, qizheng, or western astrology',
    pipelineStages: [],
    userAction: 'input',
    estimatedDuration: 10,
  },
  {
    step: 2,
    id: 'birth-input',
    displayName: 'Enter Birth Data',
    displayNameZh: '输入出生信息',
    description: 'User enters birth date, time, and location',
    pipelineStages: ['input_validation'],
    userAction: 'input',
    estimatedDuration: 30,
  },
  {
    step: 3,
    id: 'chart-preview',
    displayName: 'View Chart Preview',
    displayNameZh: '查看命盘预览',
    description: 'System displays birth chart summary (free hook)',
    pipelineStages: ['calculation'],
    userAction: 'wait',
    estimatedDuration: 3,
  },
  {
    step: 4,
    id: 'report-option',
    displayName: 'Choose Report Option',
    displayNameZh: '选择报告类型',
    description: 'Free basic report vs premium deep report',
    pipelineStages: [],
    userAction: 'upgrade',
    estimatedDuration: 15,
  },
  {
    step: 5,
    id: 'report-generating',
    displayName: 'Generating Report',
    displayNameZh: '生成报告中',
    description: 'AI pipeline executing (show progress)',
    pipelineStages: ['timeline_build', 'narrative_compose', 'coherence_check'],
    userAction: 'wait',
    estimatedDuration: 45,
  },
  {
    step: 6,
    id: 'report-read',
    displayName: 'Read Report',
    displayNameZh: '阅读报告',
    description: 'User reads the three-layer narrative report',
    pipelineStages: ['report_render'],
    userAction: 'read',
  },
  {
    step: 7,
    id: 'report-share',
    displayName: 'Share Report',
    displayNameZh: '分享报告',
    description: 'User shares via card, image, or link',
    pipelineStages: [],
    userAction: 'share',
  },
];

export function getJourneyStep(stepId: string): JourneyStep | undefined {
  return USER_JOURNEY_STEPS.find(s => s.id === stepId);
}