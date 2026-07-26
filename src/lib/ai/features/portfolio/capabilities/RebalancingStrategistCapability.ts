import { z } from 'zod';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';

export const RebalancingStrategistCapability = {
  id: 'portfolio_strategist_v1',
  description: 'Generates the target asset allocation, rebalancing roadmap, and educational content.',
  
  execute: async (context: any) => {
    const StrategistSchema = z.object({
      recommendedAllocation: z.record(z.string(), z.number()),
      rebalancingRoadmap: z.array(z.object({
        assetClass: z.string(),
        currentAllocation: z.string(),
        problem: z.string(),
        recommendation: z.string(),
        expectedBenefit: z.string(),
        priority: z.string(),
        timeframe: z.string(),
        estimatedEffort: z.string()
      })),
      longTermStrategy: z.string(),
      educationalTopic: z.object({
        title: z.string(),
        personalizedContent: z.string()
      }),
      faqs: z.array(z.object({
        question: z.string(),
        answer: z.string()
      }))
    });

    const prompt = `You are the Lead Investment Strategist at Knowith Capital.
Analyze the following portfolio data and propose a strategic rebalancing plan.

Data:
${JSON.stringify(context, null, 2)}

Requirements:
1. Provide a 'recommendedAllocation' mapping asset classes (Equity, Debt, Gold, Real Estate, Cash, Alternatives) to integer percentages summing to 100.
2. The 'rebalancingRoadmap' must be actionable. For each step, define the problem, the specific recommendation, and the expected benefit.
3. Write a 'longTermStrategy' paragraph.
4. Provide an 'educationalTopic' that is specifically tailored to the flaws or opportunities in THEIR portfolio (e.g., explaining Beta if they are too heavy in small caps). Do not be generic.
5. Provide 3 specific 'faqs'.`;

    const { data } = await GeminiSDK.generateStructuredResponse(
      prompt,
      [{ role: 'user', content: 'Generate the rebalancing strategy.' }],
      StrategistSchema,
      { temperature: 0.2, model: 'gemini-3.5-flash' }
    );

    return data;
  }
};
