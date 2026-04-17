import { describe, it, expect } from 'vitest';
import { PipelineTracker } from '@/lib/pipeline-registry/tracker';

describe('PipelineTracker', () => {
  const tracker = new PipelineTracker();

  it('creates a new run', () => {
    const run = tracker.createRun('run-1', 'bazi');
    expect(run.id).toBe('run-1');
    expect(run.system).toBe('bazi');
    expect(run.stateMachine.getState()).toBe('PENDING');
  });

  it('tracks stage progress', () => {
    tracker.createRun('run-2', 'bazi');
    tracker.startStage('run-2', 'input-validator', 'input_validation');
    expect(tracker.getProgress('run-2').current).toBe(1);
  });

  it('completes a stage', () => {
    tracker.createRun('run-3', 'bazi');
    tracker.startStage('run-3', 'input-validator', 'input_validation');
    tracker.completeStage('run-3', 'input-validator');
    const run = tracker.getRun('run-3');
    const exec = run!.executions.get('input-validator');
    expect(exec?.status).toBe('completed');
    expect(exec?.duration).toBeGreaterThanOrEqual(0); // May be 0 in fast unit tests
  });

  it('fails a stage', () => {
    tracker.createRun('run-4', 'bazi');
    tracker.startStage('run-4', 'input-validator', 'input_validation');
    tracker.failStage('run-4', 'input-validator', 'Validation error');
    const run = tracker.getRun('run-4');
    expect(run!.stateMachine.getState()).toBe('FAILED');
  });

  it('calculates progress percentage', () => {
    tracker.createRun('run-5', 'bazi');
    tracker.startStage('run-5', 'input-validator', 'input_validation');
    tracker.completeStage('run-5', 'input-validator');
    const progress = tracker.getProgress('run-5');
    expect(progress.percentage).toBeCloseTo(16.67, 0); // 1/6 stages
  });
});