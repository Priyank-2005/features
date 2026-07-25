import { z } from 'zod';
import { Capability } from '../../../core/types';
import { GeminiSDK } from '../../../../ai/GeminiSDK'; // old path, actually src/lib/ai/GeminiSDK.ts
import { ExplainabilityEngine } from '../../../core/engines/ExplainabilityEngine';

export const FinancialAnalysisSchema = z.object({
  executiveSummary: z.array(z.string()).describe("Personalized observations about what immediately stood out."),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  whatWeNoticed: z.array(z.string()).describe("Extremely specific observations referencing user data.")
});

export const AnalystCapability: Capability<any, z.infer<typeof FinancialAnalysisSchema>> = {
  id: 'advisor_analyst_v1',
  description: 'Analyzes user profile and deterministic math to produce an executive summary.',
  schema: FinancialAnalysisSchema,
  execute: async (context: any) => {
    const basePrompt = `You are a Senior Financial Analyst at Knowith Capital. 
Analyze this user's profile and produce a sharp, personalized Executive Summary.
Write like you are drafting a private client research note. Be specific — reference their exact numbers (age, income, surplus ratio, investment gap).
Keep each observation to 1-2 clean sentences. Never use labels like "Why:" or "So what:" — weave reasoning naturally into each sentence.

YOU MUST RESPOND EXACTLY IN THIS JSON FORMAT:
{
  "executiveSummary": ["obs1", "obs2", "obs3", "obs4"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1"],
  "whatWeNoticed": ["detail1", "detail2", "detail3", "detail4", "detail5", "detail6", "detail7", "detail8"]
}`;

    const prompt = ExplainabilityEngine.injectExplainabilityRules(basePrompt);
    
    const messages: { role: 'user' | 'assistant' | 'system', content: string }[] = [
      { role: 'user', content: `Profile & Context: ${JSON.stringify(context)}` }
    ];

    const result = await GeminiSDK.generateStructuredResponse(
      prompt,
      messages,
      FinancialAnalysisSchema,
      { temperature: 0.1 }
    );

    return result.data;
  }
};
