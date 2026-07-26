import { z } from 'zod';
import { Capability } from '../../../core/types';
import { ExplainabilityEngine } from '../../../core/engines/ExplainabilityEngine';
import { GeminiSDK } from '../../../GeminiSDK';
import { HealthProfile } from '../../../../../schemas/health.schema';

export const HealthAnalysisSchema = z.object({
  strengths: z.array(z.string()).describe("3-4 points highlighting what the user is doing well financially."),
  weaknesses: z.array(z.string()).describe("3-4 critical areas of concern or risk in their finances."),
  keyObservations: z.array(z.string()).describe("2-3 high-level professional insights about their financial trajectory.")
});

export type HealthAnalysisOutput = z.infer<typeof HealthAnalysisSchema>;

export class HealthAnalystCapability implements Capability<HealthProfile, HealthAnalysisOutput> {
  id = 'health_analyst_v1';
  description = 'Analyzes financial health metrics and identifies strengths and weaknesses.';
  schema = HealthAnalysisSchema;

  async execute(context: HealthProfile, metrics: any): Promise<HealthAnalysisOutput> {
    const basePrompt = `You are a Principal Financial Analyst at Knowith Capital.
Your job is to evaluate a client's financial health based on raw data and deterministic metrics.
Provide sharp, professional, and empathetic analysis.

Client Data: ${JSON.stringify(context)}
Calculated Metrics: ${JSON.stringify(metrics)}

Focus on:
1. Strengths: What are they doing right? Be encouraging.
2. Weaknesses: What are the biggest risks? Be direct but constructive.
3. Key Observations: What is the overall financial trajectory?

YOU MUST RESPOND EXACTLY IN THIS JSON FORMAT:
{
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "keyObservations": ["string", "string"]
}`;

    const prompt = ExplainabilityEngine.injectExplainabilityRules(basePrompt);
    
    const messages: { role: 'user' | 'assistant' | 'system', content: string }[] = [
      { role: 'user', content: `Profile & Metrics: ${JSON.stringify({ ...context, metrics })}` }
    ];

    const result = await GeminiSDK.generateStructuredResponse(
      prompt,
      messages,
      HealthAnalysisSchema,
      { temperature: 0.1 }
    );
    
    return result.data;
  }
}
