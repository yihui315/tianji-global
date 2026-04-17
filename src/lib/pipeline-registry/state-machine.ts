import type { PipelineState, StateTransition, PipelineStage } from './types';

export const STATE_TRANSITIONS: StateTransition[] = [
  { from: 'PENDING', to: 'PROCESSING', trigger: 'user_action', stage: 'input_validation' },
  { from: 'PENDING', to: 'PROCESSING', trigger: 'stage_complete' }, // Implicit transition when first stage starts
  { from: 'PROCESSING', to: 'PROCESSING', trigger: 'stage_complete' },
  { from: 'PROCESSING', to: 'VALIDATED', trigger: 'check_passed' },
  { from: 'VALIDATED', to: 'DELIVERED', trigger: 'stage_complete', stage: 'report_render' },
  { from: 'PROCESSING', to: 'FAILED', trigger: 'check_failed' },
  { from: 'PROCESSING', to: 'FAILED', trigger: 'error' },
  { from: 'PROCESSING', to: 'FAILED', trigger: 'timeout' },
  { from: 'FAILED', to: 'PENDING', trigger: 'user_action' }, // retry
];

export const STATE_DISPLAY: Record<PipelineState, { label: string; labelZh: string; color: string }> = {
  PENDING: { label: 'Pending', labelZh: '等待输入', color: '#9E9E9E' },
  PROCESSING: { label: 'Processing', labelZh: '生成中', color: '#2196F3' },
  VALIDATED: { label: 'Validated', labelZh: '审核通过', color: '#4CAF50' },
  DELIVERED: { label: 'Delivered', labelZh: '报告已生成', color: '#8BC34A' },
  FAILED: { label: 'Failed', labelZh: '生成失败', color: '#F44336' },
};

export class PipelineStateMachine {
  private currentState: PipelineState = 'PENDING';
  private currentStage: PipelineStage | null = null;

  getState(): PipelineState {
    return this.currentState;
  }

  getStage(): PipelineStage | null {
    return this.currentStage;
  }

  transition(trigger: StateTransition['trigger'], stage?: PipelineStage): PipelineState {
    const transition = STATE_TRANSITIONS.find(
      t => t.from === this.currentState && t.trigger === trigger && 
           (t.stage === undefined || t.stage === stage)
    );

    if (!transition) {
      return this.currentState;
    }

    this.currentState = transition.to;
    if (stage) {
      this.currentStage = stage;
    }
    return this.currentState;
  }

  canTransition(trigger: StateTransition['trigger'], stage?: PipelineStage): boolean {
    return STATE_TRANSITIONS.some(
      t => t.from === this.currentState && t.trigger === trigger &&
           (t.stage === undefined || t.stage === stage)
    );
  }

  reset(): void {
    this.currentState = 'PENDING';
    this.currentStage = null;
  }

  toJSON(): { state: PipelineState; stage: PipelineStage | null } {
    return { state: this.currentState, stage: this.currentStage };
  }
}