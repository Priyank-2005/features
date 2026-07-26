import { z } from 'zod';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';
import { marketConfig } from '@/lib/config/market.config';
import { SectorImpactSchema } from '@/schemas/market.schema';

export const SectorImpactCapability = {
  id: 'sector_impact_v1',
  description: 'Analyzes how current events affect specific sectors.',
  
  execute: async (context: any) => {
    const SectorOutputSchema = z.object({
      sectorImpacts: z.array(SectorImpactSchema)
    });

    const prompt = `${marketConfig.systemPromptBase}
Your task is to provide a Sector Impact Analysis based on the latest top stories.
Identify at least 4 sectors (e.g., Banking, IT, Pharma, Auto, Energy) affected by the events.

CRITICAL INSTRUCTIONS:
- Every sector impact MUST reference an actual supporting event or company mentioned in the stories (e.g., "Infosys reported...").
- Do NOT use generic statements like "Enterprise software demand remains strong".
- Provide the exact sources (publishers) that support this impact in the 'supportingSources' array.

For each sector, provide:
- Sector name
- Direction ('Positive', 'Neutral', 'Negative')
- Confidence (0-100)
- Expected impact
- Concise explanation (citing the specific event)
- Supporting sources

Top Stories:
${JSON.stringify(context.topStories, null, 2)}

EXAMPLE RESPONSE FORMAT:
{
  "sectorImpacts": [
    {
      "sector": "Banking",
      "direction": "Positive",
      "confidence": 85,
      "expectedImpact": "String",
      "explanation": "String",
      "supportingSources": ["String"]
    }
  ]
}
`;

    const { data } = await GeminiSDK.generateStructuredResponse(
      prompt,
      [{ role: 'user', content: 'Analyze sector impacts.' }],
      SectorOutputSchema,
      { model: "gemini-3.5-flash" }
    );

    return data;
  }
};
