import { z } from 'zod';

/**
 * Universal Response Contract
 * Every AI feature output adheres to this base contract.
 */
export interface UniversalResponseContract<T = any> {
  workflowId: string;
  status: 'SUCCESS' | 'PARTIAL' | 'ERROR';
  data: T;
  telemetry: {
    totalDurationMs: number;
    capabilitiesExecuted: number;
    warnings: string[];
  };
}

/**
 * Capability Interface
 * Replaces the 'Agent' concept. A Capability is a stateless, pure function-like 
 * executor that takes a structured Context and returns a specific structured output.
 */
export interface Capability<Input = any, Output = any> {
  id: string;
  description: string;
  schema: z.ZodType<Output>;
  execute(context: Input, options?: CapabilityOptions): Promise<Output>;
}

export interface CapabilityOptions {
  model?: string;
  temperature?: number;
  maxRetries?: number;
}

/**
 * Workflow Definition
 * A declarative definition of how Capabilities should be orchestrated.
 */
export interface WorkflowDefinition {
  id: string;
  version: string;
  description: string;
  stages: WorkflowStage[];
  assembler: (stageResults: Record<string, any>, initialInput: any) => any;
}

/**
 * A Stage can execute multiple capabilities in parallel.
 * The output of a stage becomes available in the Context for subsequent stages.
 */
export interface WorkflowStage {
  id: string;
  executeType: 'PARALLEL' | 'SEQUENTIAL';
  capabilities: string[]; // Capability IDs to run
}

/**
 * Workflow Context
 * The unified memory available during a workflow execution.
 */
export interface WorkflowContext {
  userId?: string;
  sessionId: string;
  initialInput: any;
  stageResults: Record<string, any>;
  metadata: Record<string, any>;
}

/**
 * Concurrency Config
 */
export interface ConcurrencyConfig {
  maxConcurrent: number;
  initialDelayMs: number;
  maxDelayMs: number;
  maxRetries: number;
  backoffFactor: number;
  jitterMs: number;
}
