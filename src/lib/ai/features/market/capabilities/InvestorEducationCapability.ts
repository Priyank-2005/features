import { z } from 'zod';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';
import { marketConfig } from '@/lib/config/market.config';
import { EducationalTakeawaySchema, HistoricalContextSchema } from '@/schemas/market.schema';

export const InvestorEducationCapability = {
  id: 'investor_education_v1',
  description: 'Generates educational takeaways and historical context without giving financial advice.',
  
  execute: async (context: any) => {
    const EduOutputSchema = z.object({
      investorTakeaways: z.array(EducationalTakeawaySchema),
      historicalContexts: z.array(HistoricalContextSchema),
      faqs: z.array(z.object({
        question: z.string(),
        answer: z.string()
      }))
    });

    const prompt = `${marketConfig.systemPromptBase}
Your task is to provide Investor Education and Historical Context based on the latest top stories.
Do NOT give any investment advice or buy/sell recommendations. Focus on long-term understanding.

Top Stories:
${JSON.stringify(context.topStories, null, 2)}

Provide:
1. Investor Takeaways (concepts to understand, common misconceptions, long-term perspective). Ground this in the current events.
2. Historical Context (identify a similar past event). CRITICAL: If no highly relevant, meaningful historical comparison exists, return an empty array []. Do NOT fabricate or force a weak comparison.
3. 3-4 Frequently Asked Questions related to the current market events with objective answers.

EXAMPLE RESPONSE FORMAT:
{
  "investorTakeaways": [
    {
      "concept": "String",
      "whyItMatters": "String",
      "commonMisconceptions": "String",
      "longTermPerspective": "String"
    }
  ],
  "historicalContexts": [
    {
      "historicalEvent": "String",
      "whatHappenedThen": "String",
      "similarities": ["String"],
      "differences": ["String"],
      "keyLesson": "String"
    }
  ],
  "faqs": [
    {
      "question": "String",
      "answer": "String"
    }
  ]
}
`;

    const { data } = await GeminiSDK.generateStructuredResponse(
      prompt,
      [{ role: 'user', content: 'Provide educational takeaways and historical context.' }],
      EduOutputSchema,
      { model: "gemini-3.5-flash" }
    );

    return data;
  }
};
