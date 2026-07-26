import { z } from 'zod';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';

export const PortfolioAnalystCapability = {
  id: 'portfolio_analyst_v1',
  description: 'Analyzes diversification, calculates sub-scores, and determines investment personality.',
  
  execute: async (context: any) => {
    const AnalystSchema = z.object({
      scores: z.record(z.string(), z.object({
        score: z.number(),
        explanation: z.string(),
        whyItMatters: z.string()
      })),
      overallHealthScore: z.number(),
      scoreMethodology: z.string(),
      investmentPersonality: z.string(),
      personalityReasoning: z.string(),
      strengths: z.array(z.string()),
      areasOfConcern: z.array(z.string()),
      diversificationAnalysis: z.string()
    });

    const prompt = `You are the Lead Portfolio Analyst at Knowith Capital.
Analyze the following portfolio data and provide a rigorous evaluation.
Score out of 100 for each sub-metric inside the 'scores' object. You MUST include exactly these 4 keys in 'scores': "Diversification", "Risk Alignment", "Liquidity", "Growth Potential".
For each score, provide the 'score', a 1-sentence 'explanation' of why they got that score, and a 1-sentence 'whyItMatters' explaining the impact.
The overallHealthScore should be a weighted average.

Data:
${JSON.stringify(context, null, 2)}

Requirements:
1. Provide 3 deep, specific 'strengths' and 'areasOfConcern' as simple STRINGS (NOT objects).
2. Define a unique 'investmentPersonality' (e.g., "Aggressive Growth Seeker", "Conservative Income Builder") and provide a 1-sentence 'personalityReasoning' justifying this title.
3. Keep the 'scoreMethodology' transparent and easy to understand.
4. 'diversificationAnalysis' should explain how well the assets complement each other.

EXAMPLE RESPONSE FORMAT:
{
  "scores": {
    "Diversification": {
      "score": 85,
      "explanation": "...",
      "whyItMatters": "..."
    }
    // ... exactly 4 keys
  },
  "overallHealthScore": 80,
  "scoreMethodology": "...",
  "investmentPersonality": "...",
  "personalityReasoning": "...",
  "strengths": [
    "String 1...",
    "String 2..."
  ],
  "areasOfConcern": [
    "String 1...",
    "String 2..."
  ],
  "diversificationAnalysis": "..."
}`;

    const { data } = await GeminiSDK.generateStructuredResponse(
      prompt,
      [{ role: 'user', content: 'Generate the portfolio analysis.' }],
      AnalystSchema,
      { temperature: 0.2, model: 'gemini-3.5-flash' }
    );

    return data;
  }
};
