import { NextResponse } from 'next/server';
import { HealthChatRequestSchema } from '@/schemas/health.schema';
import { healthConfig } from '@/lib/config/health.config';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';
import { HealthDeterministicEngine } from '@/lib/ai/features/health/engines/HealthDeterministicEngine';
import { WorkflowExecutor } from '@/lib/ai/core/orchestrator/WorkflowExecutor';
import { HealthWorkflow } from '@/lib/ai/features/health/HealthWorkflow';
import { HealthAnalystCapability } from '@/lib/ai/features/health/capabilities/HealthAnalystCapability';
import { HealthBehaviourCapability } from '@/lib/ai/features/health/capabilities/HealthBehaviourCapability';
import { HealthRecommenderCapability } from '@/lib/ai/features/health/capabilities/HealthRecommenderCapability';
import { HealthEducatorCapability } from '@/lib/ai/features/health/capabilities/HealthEducatorCapability';

const healthRegistry = new Map();
const analyst = new HealthAnalystCapability();
const behaviour = new HealthBehaviourCapability();
const recommender = new HealthRecommenderCapability();
const educator = new HealthEducatorCapability();

healthRegistry.set(analyst.id, analyst);
healthRegistry.set(behaviour.id, behaviour);
healthRegistry.set(recommender.id, recommender);
healthRegistry.set(educator.id, educator);

export const maxDuration = 60; // Max timeout for Vercel

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = HealthChatRequestSchema.parse(body);
    const { message, profileData, currentState, history } = validatedData;

    // --- REPORT_READY INTERCEPT ---
    // If the conversation engine decided it has all 6 fields, it set nextState to 'REPORT_READY'
    if (currentState === 'REPORT_READY') {
      const p = profileData;
      const income = HealthDeterministicEngine.parseCurrency(p.monthlyIncome);
      const expenses = HealthDeterministicEngine.parseCurrency(p.monthlyExpenses);
      const debt = HealthDeterministicEngine.parseCurrency(p.totalDebt);
      const emi = HealthDeterministicEngine.parseCurrency(p.monthlyEMI);
      const emergencyFund = HealthDeterministicEngine.parseCurrency(p.emergencyFund);
      const investments = HealthDeterministicEngine.parseCurrency(p.existingInvestments);

      // Phase 1: Pure Deterministic Calculations (Zero AI Hallucination)
      const savingsRate = HealthDeterministicEngine.calculateSavingsRate(income, expenses);
      const dti = HealthDeterministicEngine.calculateDebtToIncome(income, emi);
      const emergencyCoverage = HealthDeterministicEngine.calculateEmergencyCoverage(expenses, emergencyFund);
      const investmentReadiness = HealthDeterministicEngine.calculateInvestmentReadiness(savingsRate, dti, emergencyCoverage);
      const overallScore = HealthDeterministicEngine.calculateHealthScore(savingsRate, dti, emergencyCoverage, investmentReadiness);

      const metrics = {
        savingsRate,
        dti,
        emergencyCoverage,
        investmentReadiness,
        overallScore,
        // Parsed values for assembler fallbacks
        income,
        expenses,
        debt,
        emi,
        emergencyFund,
        investments
      };

      // Phase 2: Orchestrate the Multi-Agent Workflow
      const executor = new WorkflowExecutor(HealthWorkflow, healthRegistry, { maxConcurrent: 1 });
      const sessionId = `health_${Date.now()}`;
      
      const payload = {
        ...profileData,
        metrics
      };

      const aiResponse = await executor.execute(sessionId, payload, 'user_placeholder');

      return NextResponse.json({
        version: "1.0",
        status: "success",
        message: "Your Financial Health Blueprint is ready.",
        updatedProfile: profileData,
        nextState: "AWAITING_USER_ACTION",
        blueprint: aiResponse.data
      });
    }

    // --- CONVERSATIONAL STATE MACHINE ---
    const conversationMessages = [
      ...history,
      { role: 'user', content: message }
    ] as { role: 'user' | 'assistant' | 'system', content: string }[];

    const profileStatePrompt = `Current Profile State: ${JSON.stringify(profileData, null, 2)}
You must collect: ${healthConfig.profileFields.map(f => f.id).join(', ')}.
If all fields are present and valid, set nextState to "REPORT_READY" immediately.`;

    const systemPrompt = `${healthConfig.systemPrompt}\n\n${profileStatePrompt}`;

    const aiResult = await GeminiSDK.generateStructuredResponse(
      systemPrompt,
      conversationMessages,
      healthConfig.responseSchema as any,
      { temperature: 0.1 }
    );

    return NextResponse.json(aiResult.data);

  } catch (error: any) {
    console.error('Health API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
