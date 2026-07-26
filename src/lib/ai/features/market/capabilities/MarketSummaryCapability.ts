import { z } from 'zod';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';
import { marketConfig } from '@/lib/config/market.config';
import { MarketSummarySchema } from '@/schemas/market.schema';

export const MarketSummaryCapability = {
  id: 'market_summary_v1',
  description: 'Synthesizes outputs into a concise Executive Summary for the Hero section.',
  
  execute: async (context: any) => {
    // We expect context to have the analyzed data from other agents
    const prompt = `${marketConfig.systemPromptBase}
Your task is to act as the Chief Strategist and write an Executive Summary.
Review the analysis performed by your team:

Top Stories:
${JSON.stringify(context.topStories, null, 2)}

Themes:
${JSON.stringify(context.emergingThemes, null, 2)}

Sector Impacts:
${JSON.stringify(context.sectorImpacts, null, 2)}

Write a concise, premium "Executive Summary" (2-3 paragraphs) that captures the essence of today's market based STRICTLY on the events provided. Do not use generic filler language like "markets are navigating". Say exactly what happened today, why it moved markets, and which sectors were affected.
Also determine the overall market sentiment and a confidence score for that sentiment (0-100).
Explain the confidence score ('confidenceExplanation') based on the number of independent publishers, agreement between sources, and data freshness.

EXAMPLE RESPONSE FORMAT:
{
  "executiveSummary": "String",
  "overallSentiment": "Bullish",
  "confidenceScore": 80,
  "confidenceExplanation": "String"
}
`;

    const { data } = await GeminiSDK.generateStructuredResponse(
      prompt,
      [{ role: 'user', content: 'Generate Executive Summary.' }],
      MarketSummarySchema,
      { model: "gemini-3.5-flash" }
    );

    return data;
  }
};
