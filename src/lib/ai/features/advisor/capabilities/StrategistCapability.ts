import { z } from 'zod';
import { Capability } from '../../../core/types';
import { GroqSDK } from '../../../../ai/GroqSDK';
import { ExplainabilityEngine } from '../../../core/engines/ExplainabilityEngine';

export const InvestmentStrategySchema = z.object({
  assetAllocation: z.record(z.string(), z.string()).describe("Map of asset class to percentage (e.g. 'Equity Mutual Funds': '60%')."),
  allocationReasoning: z.record(z.string(), z.string()).describe("A specific 'WHY' for every single asset class allocated."),
  opportunities: z.array(z.object({
    title: z.string(),
    description: z.string()
  })),
  risks: z.array(z.object({
    title: z.string(),
    description: z.string()
  })),
  actionPlan: z.array(z.object({
    timeframe: z.enum(['Next 7 Days', 'Next 30 Days', 'Next 6 Months', 'Next Year']),
    action: z.string()
  }))
});

export const StrategistCapability: Capability<any, z.infer<typeof InvestmentStrategySchema>> = {
  id: 'advisor_strategist_v1',
  description: 'Generates asset allocation, opportunities, risks, and an action plan.',
  schema: InvestmentStrategySchema,
  execute: async (context: any) => {
    const basePrompt = `You are a Senior Investment Strategist at Knowith Capital.
Design a highly personalized asset allocation and action plan.
For EVERY asset class you allocate to, you MUST provide a dedicated reasoning string explaining why that specific asset was chosen for THIS specific user.
Do not promise returns. Do not use generic textbook advice.

YOU MUST RESPOND EXACTLY IN THIS JSON FORMAT:
{
  "assetAllocation": { "Equity Mutual Funds": "60%", "Debt Funds": "30%", "Gold": "10%" },
  "allocationReasoning": { "Equity Mutual Funds": "reason", "Debt Funds": "reason", "Gold": "reason" },
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
    
    const messages = [
      { role: 'user', content: `Profile & Context: ${JSON.stringify(context)}` }
    ];

    const result = await GroqSDK.generateStructuredResponse(
      prompt,
      messages,
      InvestmentStrategySchema,
      { temperature: 0.1 }
    );

    return result.data;
  }
};
