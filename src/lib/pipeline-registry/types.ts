// ============================================================
// FOUR-VIEW REGISTRY: Core Type Definitions
// ============================================================

import type { SystemType } from '@/lib/cultural-coherence';

// ---- View 1: By Workflow ----
export type PipelineStage = 
  | 'input_validation'    // Validate birth data
  | 'calculation'         // sweph + Chinese calendar calculation
  | 'timeline_build'      // Fortune Timeline Builder
  | 'narrative_compose'   // Narrative Composer (hook/body/closure)
  | 'coherence_check'     // Cultural Coherence Checker
  | 'report_render';      // Render to React components

export interface WorkflowNode {
  stage: PipelineStage;
  displayName: string;
  displayNameZh: string;
  description: string;
  nextStages: PipelineStage[];
  prevStages: PipelineStage[];
}

// ---- View 2: By Component ----
export interface ComponentDefinition {
  id: string;
  name: string;
  version: string;
  stage: PipelineStage;
  input: ComponentIOSchema;
  output: ComponentIOSchema;
  timeout: number; // ms
  retryable: boolean;
  dependencies: string[];
}

export interface ComponentIOSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  required: string[];
  properties: Record<string, { type: string; description: string; optional?: boolean }>;
}

export interface ComponentExecution {
  componentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  duration?: number; // ms
  error?: string;
  retryCount: number;
}

export interface HandoffContract<Input, Output> {
  component: string;
  version: string;
  payload: Input;
  expectedResponse: {
    success: Output;
    failure: {
      errorCode: string;
      fallback: Output | null;
      retry: boolean;
    };
  };
  timeoutMs: number;
  invariants: string[]; // Conditions that must be true across calls
}

// ---- View 3: By User Journey ----
export interface JourneyStep {
  step: number;
  id: string;
  displayName: string;
  displayNameZh: string;
  description: string;
  pipelineStages: PipelineStage[];
  userAction: 'input' | 'confirm' | 'wait' | 'read' | 'share' | 'upgrade';
  estimatedDuration?: number; // seconds
}

// ---- View 4: By State ----
export type PipelineState = 
  | 'PENDING'           // Waiting for user input
  | 'PROCESSING'         // AI executing
  | 'VALIDATED'          // Passed all checks
  | 'DELIVERED'          // Report ready
  | 'FAILED';            // Error occurred

export interface StateTransition {
  from: PipelineState;
  to: PipelineState;
  trigger: 'user_action' | 'stage_complete' | 'check_passed' | 'check_failed' | 'error' | 'timeout';
  stage?: PipelineStage;
}

// ---- Unified Registry Entry ----
export interface PipelineRegistryEntry {
  id: string;
  version: string;
  system: SystemType;
  createdAt: string;
  workflow: WorkflowNode[];
  components: ComponentDefinition[];
  journey: JourneyStep[];
  states: StateTransition[];
}