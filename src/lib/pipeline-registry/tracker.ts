import type { ComponentExecution, PipelineStage, PipelineState } from './types';
import { PipelineStateMachine } from './state-machine';
import { getPipelineOrder } from './workflow';

export interface PipelineRun {
  id: string;
  system: string;
  startedAt: string;
  completedAt?: string;
  currentStage: PipelineStage | null;
  stateMachine: PipelineStateMachine;
  executions: Map<string, ComponentExecution>;
  metadata: Record<string, unknown>;
}

export class PipelineTracker {
  private runs: Map<string, PipelineRun> = new Map();

  createRun(id: string, system: string): PipelineRun {
    const run: PipelineRun = {
      id,
      system,
      startedAt: new Date().toISOString(),
      currentStage: null,
      stateMachine: new PipelineStateMachine(),
      executions: new Map(),
      metadata: {},
    };
    this.runs.set(id, run);
    return run;
  }

  getRun(id: string): PipelineRun | undefined {
    return this.runs.get(id);
  }

  startStage(runId: string, componentId: string, stage: PipelineStage): void {
    const run = this.runs.get(runId);
    if (!run) return;

    run.stateMachine.transition('stage_complete', stage);
    run.currentStage = stage;
    run.executions.set(componentId, {
      componentId,
      status: 'running',
      startedAt: new Date().toISOString(),
      retryCount: 0,
    });
  }

  completeStage(runId: string, componentId: string): void {
    const run = this.runs.get(runId);
    if (!run) return;

    const execution = run.executions.get(componentId);
    if (execution) {
      execution.status = 'completed';
      execution.completedAt = new Date().toISOString();
      execution.duration = new Date(execution.completedAt).getTime() - 
                           new Date(execution.startedAt!).getTime();
    }

    run.stateMachine.transition('stage_complete', run.currentStage!);
  }

  failStage(runId: string, componentId: string, error: string): void {
    const run = this.runs.get(runId);
    if (!run) return;

    const execution = run.executions.get(componentId);
    if (execution) {
      execution.status = 'failed';
      execution.error = error;
      execution.completedAt = new Date().toISOString();
    }

    run.stateMachine.transition('error');
  }

  skipStage(runId: string, componentId: string): void {
    const run = this.runs.get(runId);
    if (!run) return;

    run.executions.set(componentId, {
      componentId,
      status: 'skipped',
      retryCount: 0,
    });
  }

  completeRun(runId: string): void {
    const run = this.runs.get(runId);
    if (!run) return;

    run.completedAt = new Date().toISOString();
    const sm = run.stateMachine;
    if (sm.getState() === 'PROCESSING') {
      sm.transition('check_passed');
      if (run.currentStage === 'report_render') {
        sm.transition('stage_complete');
      }
    }
  }

  getProgress(runId: string): { current: number; total: number; percentage: number; stage: PipelineStage | null } {
    const run = this.runs.get(runId);
    if (!run) return { current: 0, total: 0, percentage: 0, stage: null };

    const stages = getPipelineOrder();
    const currentIndex = run.currentStage ? stages.indexOf(run.currentStage) : -1;
    return {
      current: Math.max(0, currentIndex + 1),
      total: stages.length,
      percentage: Math.round(((currentIndex + 1) / stages.length) * 100),
      stage: run.currentStage,
    };
  }
}

// Singleton instance for the pipeline
export const pipelineTracker = new PipelineTracker();