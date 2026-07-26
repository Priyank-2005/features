import { WorkflowDefinition, Capability, UniversalResponseContract } from '../types';
import { ContextBuilder } from '../context/ContextBuilder';
import { ConcurrencyController } from './ConcurrencyController';

export class WorkflowExecutor {
  private definition: WorkflowDefinition;
  private registry: Map<string, Capability>;
  private concurrency: ConcurrencyController;

  constructor(
    definition: WorkflowDefinition,
    registry: Map<string, Capability>,
    concurrencyConfig?: any
  ) {
    this.definition = definition;
    this.registry = registry;
    this.concurrency = new ConcurrencyController(concurrencyConfig);
  }

  /**
   * Executes the full workflow.
   */
  public async execute(sessionId: string, initialInput: any, userId?: string): Promise<UniversalResponseContract> {
    const startTime = Date.now();
    const contextBuilder = new ContextBuilder(sessionId, initialInput, userId);
    const warnings: string[] = [];
    let capabilitiesExecuted = 0;

    try {
      // Execute each stage sequentially
      for (const stage of this.definition.stages) {
        if (stage.executeType === 'PARALLEL') {
          await this.executeParallelStage(stage, contextBuilder, warnings);
          capabilitiesExecuted += stage.capabilities.length;
        } else {
          await this.executeSequentialStage(stage, contextBuilder, warnings);
          capabilitiesExecuted += stage.capabilities.length;
        }
      }

      // Assemble final payload
      const finalData = this.definition.assembler(contextBuilder.getContext().stageResults, initialInput);

      return {
        workflowId: this.definition.id,
        status: warnings.length > 0 ? 'PARTIAL' : 'SUCCESS',
        data: finalData,
        telemetry: {
          totalDurationMs: Date.now() - startTime,
          capabilitiesExecuted,
          warnings
        }
      };

    } catch (error: any) {
      console.error(`[WorkflowExecutor] Failed executing workflow ${this.definition.id}:`, error);
      return {
        workflowId: this.definition.id,
        status: 'ERROR',
        data: null,
        telemetry: {
          totalDurationMs: Date.now() - startTime,
          capabilitiesExecuted,
          warnings: [...warnings, error.message]
        }
      };
    }
  }

  private async executeParallelStage(stage: any, ctxBuilder: ContextBuilder, warnings: string[]) {
    const tasks = stage.capabilities.map((capId: string) => {
      const capability = this.registry.get(capId);
      if (!capability) {
        warnings.push(`Capability ${capId} not found in registry.`);
        return Promise.resolve();
      }

      return this.concurrency.executeTask(async () => {
        // Build isolated LLM context using stage builder if provided, else raw context
        let inputContext = ctxBuilder.getLLMContext();
        if (stage.contextBuilder) {
           inputContext = stage.contextBuilder(inputContext.initialInput, inputContext.results);
        }
        const result = await capability.execute(inputContext);
        ctxBuilder.addCapabilityResult(stage.id, capId, result);
      }, `Capability-${capId}`);
    });

    await Promise.allSettled(tasks).then(results => {
      results.forEach(res => {
        if (res.status === 'rejected') warnings.push(`Stage ${stage.id} task failed: ${res.reason}`);
      });
    });
  }

  private async executeSequentialStage(stage: any, ctxBuilder: ContextBuilder, warnings: string[]) {
    for (const capId of stage.capabilities) {
      const capability = this.registry.get(capId);
      if (!capability) {
        warnings.push(`Capability ${capId} not found in registry.`);
        continue;
      }

      try {
        await this.concurrency.executeTask(async () => {
          let inputContext = ctxBuilder.getLLMContext();
          if (stage.contextBuilder) {
             inputContext = stage.contextBuilder(inputContext.initialInput, inputContext.results);
          }
          const result = await capability.execute(inputContext);
          ctxBuilder.addCapabilityResult(stage.id, capId, result);
        }, `Capability-${capId}`);
      } catch (error: any) {
        warnings.push(`Sequential Capability ${capId} failed: ${error.message}`);
      }
    }
  }
}
