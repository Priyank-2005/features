import { z } from 'zod';
import { Capability } from '../../../core/types';
import { GeminiSDK } from '../../../../ai/GeminiSDK';
import { ExplainabilityEngine } from '../../../core/engines/ExplainabilityEngine';

export const InvestmentStrategySchema = z.object({
  assetAllocation: z.record(z.string(), z.string()).describe("Map of asset class to percentage (e.g. 'Equity Mutual Funds': '60%')."),
  allocationReasoning: z.record(z.string(), z.string()).describe("A natural, one-sentence rationale for each asset class, referencing the user's specific data."),
  opportunities: z.array(z.object({
    title: z.string(),
    description: z.string()
  })),
  risks: z.array(z.object({
    title: z.string(),
    description: z.string()
  })),
  actionPlan: z.array(z.object({
    timeframe: z.string(),
    action: z.string()
  }))
});

export const StrategistCapability: Capability<any, z.infer<typeof InvestmentStrategySchema>> = {
  id: 'advisor_strategist_v1',
  description: 'Generates asset allocation, opportunities, risks, and an action plan.',
  schema: InvestmentStrategySchema,
  execute: async (context: any) => {
    const basePrompt = `You are a Senior Investment Strategist at Knowith Capital.
Design a highly personalized asset allocation and action plan for the user.
For each asset class, write a brief natural-sounding rationale that references the user's specific numbers (age, surplus, goals). Do NOT use labels like "Why:" or "Because:" — just write a clean sentence.
Do not promise returns. Do not use generic textbook advice. Sound like a real wealth manager writing a private client memo.

YOU MUST RESPOND EXACTLY IN THIS JSON FORMAT:
{
  "assetAllocation": { "Equity Mutual Funds": "60%", "Debt Funds": "30%", "Gold": "10%" },
  "allocationReasoning": { "Equity Mutual Funds": "rationale sentence", "Debt Funds": "rationale sentence", "Gold": "rationale sentence" },
  "opportunities": [{ "title": "...", "description": "..." }],
  "risks": [{ "title": "...", "description": "..." }],
  "actionPlan": [
    { "timeframe": "Next 7 Days", "action": "..." },
    { "timeframe": "Next 30 Days", "action": "..." },
    { "timeframe": "Next 6 Months", "action": "..." },
    { "timeframe": "Next Year", "action": "..." }
  ]
}`;

    const prompt = ExplainabilityEngine.injectExplainabilityRules(basePrompt);
    
    const messages: { role: 'user' | 'assistant' | 'system', content: string }[] = [
      { role: 'user', content: `Profile & Context: ${JSON.stringify(context)}` }
    ];

    const result = await GeminiSDK.generateStructuredResponse(
      prompt,
      messages,
      InvestmentStrategySchema,
      { temperature: 0.1 }
    );

    return result.data;
  }
};
