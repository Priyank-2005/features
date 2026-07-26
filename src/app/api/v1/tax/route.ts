import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';
import { TaxChatRequestSchema, TaxAIResponseSchema } from '@/schemas/tax.schema';
import { taxConfig } from '@/lib/config/tax.config';
import { WorkflowExecutor } from '@/lib/ai/core/orchestrator/WorkflowExecutor';
import { TaxWorkflow } from '@/lib/ai/features/tax/TaxWorkflow';
import { TaxCalculatorCapability } from '@/lib/ai/features/tax/capabilities/TaxCalculatorCapability';
import { TaxStrategistCapability } from '@/lib/ai/features/tax/capabilities/TaxStrategistCapability';

const taxRegistry = new Map();
taxRegistry.set(TaxCalculatorCapability.id, TaxCalculatorCapability);
taxRegistry.set(TaxStrategistCapability.id, TaxStrategistCapability);

const workflowExecutor = new WorkflowExecutor(
  TaxWorkflow,
  taxRegistry,
  { maxConcurrent: 1, maxRetries: 3 }
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const parsed = TaxChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      );
    }

    const { message, currentState, history = [] } = parsed.data;

    const messages = [
      { 
        role: 'system' as const, 
        content: `Current Profile State Data: ${JSON.stringify(currentState || {})}`
      },
      ...history.map(h => ({ role: h.role as any, content: h.content })),
      { 
        role: 'user' as const, 
        content: message 
      }
    ];

    const { data: aiData, usage } = await GeminiSDK.generateStructuredResponse<z.infer<typeof TaxAIResponseSchema>>(
      taxConfig.systemPrompt,
      messages,
      TaxAIResponseSchema, 
      { temperature: 0.1, model: 'gemini-3.5-flash' } 
    );

    let massiveBlueprint = null;

    if (aiData.nextState === 'REPORT_READY') {
      console.log("[Orchestrator] Initiating Multi-Agent Workflow: tax_strategist_workflow");
      
      const mathContext = {
        profile: aiData.updatedProfile
      };

      const workflowResult = await workflowExecutor.execute(
        `session-${Date.now()}`,
        mathContext
      );

      if (workflowResult.status === 'ERROR') {
        throw new Error(`Orchestration failed: ${workflowResult.telemetry.warnings.join(', ')}`);
      }

      console.log(`[Orchestrator] Workflow Complete. Latency: ${workflowResult.telemetry.totalDurationMs}ms`);
      massiveBlueprint = workflowResult.data;
    }

    return NextResponse.json({
      success: true,
      data: {
        updatedProfile: aiData.updatedProfile,
        botResponse: aiData.message || "Please provide the next piece of information.",
        cards: aiData.cards, 
        nextState: aiData.nextState,
        blueprint: massiveBlueprint
      },
      meta: { usage }
    });

  } catch (error: any) {
    console.error('[Tax API] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
