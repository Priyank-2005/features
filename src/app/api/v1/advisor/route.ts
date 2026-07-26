import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';
import { AdvisorChatRequestSchema } from '@/schemas/advisor.schema';
import { advisorConfig, AdvisorAIResponseSchema } from '@/lib/config/advisor.config';
import { WorkflowExecutor } from '@/lib/ai/core/orchestrator/WorkflowExecutor';
import { AdvisorWorkflow } from '@/lib/ai/features/advisor/AdvisorWorkflow';
import { AnalystCapability } from '@/lib/ai/features/advisor/capabilities/AnalystCapability';
import { StrategistCapability } from '@/lib/ai/features/advisor/capabilities/StrategistCapability';
import { PsychologistCapability } from '@/lib/ai/features/advisor/capabilities/PsychologistCapability';
import { EducatorCapability } from '@/lib/ai/features/advisor/capabilities/EducatorCapability';
import { DeterministicEngine } from '@/lib/ai/features/advisor/engines/DeterministicEngine';

// Build the local registry for this endpoint
const advisorRegistry = new Map();
advisorRegistry.set(AnalystCapability.id, AnalystCapability);
advisorRegistry.set(StrategistCapability.id, StrategistCapability);
advisorRegistry.set(PsychologistCapability.id, PsychologistCapability);
advisorRegistry.set(EducatorCapability.id, EducatorCapability);

const workflowExecutor = new WorkflowExecutor(
  AdvisorWorkflow,
  advisorRegistry,
  { maxConcurrent: 1, maxRetries: 3 } // Changed to 1 to prevent rate-limit cascade
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Zod Validation on incoming request
    const parsed = AdvisorChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      );
    }

    const { message, currentState, history = [] } = parsed.data;

    // 2. We use the original LLM purely as a conversational router to collect data.
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

    const { data: aiData, usage } = await GeminiSDK.generateStructuredResponse<z.infer<typeof AdvisorAIResponseSchema>>(
      advisorConfig.systemPrompt,
      messages,
      AdvisorAIResponseSchema, 
      { temperature: 0.1, model: 'gemini-3.5-flash' } 
    );

    // 3. Multi-Agent Orchestration Intercept
    // If the LLM transitions to REPORT_READY, we pause the standard flow 
    // and hand over to our massive parallel Enterprise AI Framework.
    let massiveBlueprint = null;

    if (aiData.nextState === 'REPORT_READY') {
      console.log("[Orchestrator] Initiating Multi-Agent Workflow: advisor_blueprint_workflow");
      
      // Calculate deterministic math
      const surplus = DeterministicEngine.calculateSurplus(aiData.updatedProfile.monthlyIncome || 0, aiData.updatedProfile.monthlyExpenses || 0);
      const savingsRate = DeterministicEngine.calculateSavingsRate(surplus, aiData.updatedProfile.monthlyIncome || 0);
      const readiness = DeterministicEngine.calculateReadinessScore(aiData.updatedProfile.age || 30, savingsRate, aiData.updatedProfile.existingInvestments || 0, surplus);
      
      const mathContext = {
        profile: aiData.updatedProfile,
        metrics: { surplus, savingsRate, readinessScore: readiness }
      };

      // Execute Workflow! (Runs Analyst, Strategist, Psychologist in parallel, then Educator)
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

    // 4. Return to Frontend
    return NextResponse.json({
      success: true,
      data: {
        updatedProfile: aiData.updatedProfile,
        botResponse: aiData.message || "Please provide the next piece of information.",
        cards: aiData.cards, 
        blueprint: massiveBlueprint || undefined, // Overwrite with our orchestrated blueprint
        nextState: aiData.nextState,
        missingFields: aiData.missingFields
      }
    });

  } catch (error: any) {
    console.error('Advisor API Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
