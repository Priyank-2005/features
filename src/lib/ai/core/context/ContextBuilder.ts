import { WorkflowContext } from '../types';

/**
 * ContextBuilder
 * Dynamically constructs and queries the unified state memory for workflows.
 * Capabilities interact with this Context to read prerequisite data and write their outputs.
 */
export class ContextBuilder {
  private context: WorkflowContext;

  constructor(sessionId: string, initialInput: any, userId?: string) {
    this.context = {
      sessionId,
      userId,
      initialInput,
      stageResults: {},
      metadata: {
        startTime: Date.now()
      }
    };
  }

  /**
   * Adds the execution result of a Capability to the specific stage's memory.
   */
  public addCapabilityResult(stageId: string, capabilityId: string, data: any) {
    if (!this.context.stageResults[stageId]) {
      this.context.stageResults[stageId] = {};
    }
    this.context.stageResults[stageId][capabilityId] = data;
  }

  /**
   * Retrieves data from a previous capability execution.
   */
  public getCapabilityResult(stageId: string, capabilityId: string): any {
    return this.context.stageResults[stageId]?.[capabilityId];
  }

  /**
   * Returns a flattened view of all context data suitable for feeding into an LLM Capability prompt.
   * Excludes metadata to reduce token consumption.
   */
  public getLLMContext(): Record<string, any> {
    return {
      initialInput: this.context.initialInput,
      results: this.context.stageResults
    };
  }

  /**
   * Retrieves the raw Context object.
   */
  public getContext(): WorkflowContext {
    return this.context;
  }
}
