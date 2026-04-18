export * from './types';
export * from './workflow';
export * from './components';
export * from './journey';
export * from './state-machine';

// Convenience: create a registry entry for a specific system
import type { PipelineRegistryEntry } from './types';
import { WORKFLOW_NODES, getPipelineOrder } from './workflow';
import { PIPELINE_COMPONENTS } from './components';
import { USER_JOURNEY_STEPS } from './journey';
import { STATE_TRANSITIONS } from './state-machine';
import type { SystemType } from '@/lib/cultural-coherence';

export function createRegistryEntry(system: SystemType, version: string = '1.0.0'): PipelineRegistryEntry {
  return {
    id: `pipeline-registry-${system}-${Date.now()}`,
    version,
    system,
    createdAt: new Date().toISOString(),
    workflow: getPipelineOrder().map(stage => WORKFLOW_NODES[stage]),
    components: PIPELINE_COMPONENTS,
    journey: USER_JOURNEY_STEPS,
    states: STATE_TRANSITIONS,
  };
}