import { describe, it, expect, beforeEach } from 'vitest';
import { PipelineStateMachine } from '@/lib/pipeline-registry/state-machine';

describe('PipelineStateMachine', () => {
  let sm: PipelineStateMachine;

  beforeEach(() => {
    sm = new PipelineStateMachine();
  });

  it('starts in PENDING state', () => {
    expect(sm.getState()).toBe('PENDING');
  });

  it('transitions from PENDING to PROCESSING on user_action', () => {
    const newState = sm.transition('user_action', 'input_validation');
    expect(newState).toBe('PROCESSING');
  });

  it('transitions from PROCESSING to VALIDATED on check_passed', () => {
    sm.transition('user_action', 'input_validation');
    const newState = sm.transition('check_passed');
    expect(newState).toBe('VALIDATED');
  });

  it('transitions from PROCESSING to FAILED on error', () => {
    sm.transition('user_action', 'input_validation');
    const newState = sm.transition('error');
    expect(newState).toBe('FAILED');
  });

  it('transitions from FAILED to PENDING on retry', () => {
    sm.transition('user_action', 'input_validation');
    sm.transition('error');
    const newState = sm.transition('user_action');
    expect(newState).toBe('PENDING');
  });

  it('resets to PENDING', () => {
    sm.transition('user_action', 'input_validation');
    sm.reset();
    expect(sm.getState()).toBe('PENDING');
  });

  it('canTransition returns true for valid transitions', () => {
    sm.transition('user_action', 'input_validation');
    expect(sm.canTransition('check_passed')).toBe(true);
  });

  it('canTransition returns false for invalid transitions', () => {
    sm.transition('user_action', 'input_validation');
    expect(sm.canTransition('user_action')).toBe(false);
  });
});