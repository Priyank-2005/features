import { z } from 'zod';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';
import { marketConfig } from '@/lib/config/market.config';
import { MarketStorySchema } from '@/schemas/market.schema';

export const MarketNewsCapability = {
  id: 'market_news_v1',
  description: 'Organizes articles, removes duplicates, ranks importance, and extracts core stories.',
  
  execute: async (context: any) => {
    const NewsOutputSchema = z.object({
      topStories: z.array(MarketStorySchema)
    });

    const prompt = `${marketConfig.systemPromptBase}
Your task is to act as the News Desk Editor.
Review the structured JSON feed of market stories and cluster related articles into distinct Market Events.
Keep only the most important clustered events (up to 5).
For each event, provide a clear headline, synthesize the summary, and explain "why it matters" (immediate significance).
You MUST carry over the \`publisher\`, \`url\` (as originalUrl), and \`timestamp\` (as publishedTime) from the primary article in that cluster.

Preprocessed Structured Feed:
${JSON.stringify(context.feed, null, 2)}

EXAMPLE RESPONSE FORMAT:
{
  "topStories": [
    {
      "headline": "String",
      "publisher": "String",
      "publishedTime": "String",
      "originalUrl": "String",
      "summary": "String",
      "whyItMatters": "String"
    }
  ]
}
`;

    const { data } = await GeminiSDK.generateStructuredResponse(
      prompt,
      [{ role: 'user', content: 'Process the raw news feed into top stories.' }],
      NewsOutputSchema,
      { model: "gemini-3.5-flash" }
    );

    return data;
  }
};
