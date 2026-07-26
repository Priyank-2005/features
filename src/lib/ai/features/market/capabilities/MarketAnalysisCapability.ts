import { z } from 'zod';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';
import { marketConfig } from '@/lib/config/market.config';
import { MarketAnalysisSchema, MarketThemeSchema, WatchNextSchema } from '@/schemas/market.schema';

export const MarketAnalysisCapability = {
  id: 'market_analysis_v1',
  description: 'Explains why events happened, broader implications, themes, and what to watch next.',
  
  execute: async (context: any) => {
    const AnalysisOutputSchema = z.object({
      aiAnalysis: z.array(MarketAnalysisSchema),
      emergingThemes: z.array(MarketThemeSchema),
      whatToWatchNext: z.array(WatchNextSchema)
    });

    const prompt = `${marketConfig.systemPromptBase}
Your task is to provide deep Market Analysis as a Senior Equity Research Analyst.
Review the following top stories (market events):
${JSON.stringify(context.topStories, null, 2)}

CRITICAL INSTRUCTIONS:
- Ground EVERY insight in real data from the provided stories. Do NOT invent events or generate generic market commentary.
- Be extremely specific. Ban phrases like "navigating complex landscapes", "evolving macroeconomic dynamics", "measured asset reallocations", "structural divergence", and "balancing liquidity environments".
- For every conclusion, cite the 'supportingSources' (publishers) from the stories.

Provide:
1. Deep AI Analysis for each major event (What happened, why, economic & sector implications, risks, key observations). Reference specific companies, metrics, and events.
2. Group the stories into Emerging Market Themes (e.g., Inflation, Earnings, Geopolitics). Only create a theme if multiple stories support it.
3. Identify "What to Watch Next" - dynamically generate upcoming events (e.g., RBI Meeting, CPI Release, Major Earnings) based ONLY on the current news context. Keep it informational, not predictive.

EXAMPLE RESPONSE FORMAT:
{
  "aiAnalysis": [
    {
      "whatHappened": "String",
      "whyItHappened": "String",
      "economicImplications": "String",
      "sectorImplications": "String",
      "risks": ["String"],
      "keyObservations": ["String"],
      "supportingSources": ["String"]
    }
  ],
  "emergingThemes": [
    {
      "themeName": "String",
      "stories": ["String"],
      "overarchingImpact": "String"
    }
  ],
  "whatToWatchNext": [
    {
      "event": "String",
      "expectedDate": "String",
      "whyMonitor": "String"
    }
  ]
}
`;

    const { data } = await GeminiSDK.generateStructuredResponse(
      prompt,
      [{ role: 'user', content: 'Generate market analysis, themes, and what to watch next.' }],
      AnalysisOutputSchema,
      { model: "gemini-3.5-pro" } // Use Pro for deeper analysis
    );

    return data;
  }
};
