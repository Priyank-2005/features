import { z } from 'zod';
import { Capability } from '../../../core/types';
import { ExplainabilityEngine } from '../../../core/engines/ExplainabilityEngine';
import { RecommendationEngine } from '../../../core/engines/RecommendationEngine';
import { GeminiSDK } from '../../../GeminiSDK';
import { HealthProfile } from '../../../../../schemas/health.schema';

export const HealthRecommendationSchema = z.object({
  recommendations: z.array(z.object({
    timeframe: z.string().describe("e.g., 'Immediate', 'Next 30 Days', 'Next 6 Months'"),
    action: z.string().describe("The specific, actionable financial step."),
    impact: z.string().describe("The expected result or impact on their health score.")
  })).describe("3-5 highly actionable, prioritized recommendations.")
});

export type HealthRecommendationOutput = z.infer<typeof HealthRecommendationSchema>;

export class HealthRecommenderCapability implements Capability<HealthProfile, HealthRecommendationOutput> {
  id = 'health_recommender_v1';
  description = 'Generates prioritized, actionable financial recommendations to improve health score.';
  schema = HealthRecommendationSchema;

  async execute(context: HealthProfile, metrics: any): Promise<HealthRecommendationOutput> {
    const basePrompt = `You are a Principal Wealth Strategist at Knowith Capital.
Your job is to provide actionable recommendations to improve a client's financial health score.

Client Data: ${JSON.stringify(context)}
Calculated Metrics: ${JSON.stringify(metrics)}

Focus on:
1. High-impact, low-effort quick wins (e.g., clearing high-interest debt, building emergency fund).
2. Prioritize actions based on urgency (e.g., Immediate vs 6 Months).
3. Use the RecommendationEngine pattern for clarity.

YOU MUST RESPOND EXACTLY IN THIS JSON FORMAT:
{
  "recommendations": [
    { "timeframe": "string", "action": "string", "impact": "string" }
  ]
}`;

    const prompt = ExplainabilityEngine.injectExplainabilityRules(basePrompt);
    
    const messages: { role: 'user' | 'assistant' | 'system', content: string }[] = [
      { role: 'user', content: `Profile & Metrics: ${JSON.stringify({ ...context, metrics })}` }
    ];

    const result = await GeminiSDK.generateStructuredResponse(
      prompt,
      messages,
      HealthRecommendationSchema,
      { temperature: 0.1 }
    );
    
    return result.data;
  }
}
