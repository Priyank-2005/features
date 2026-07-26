import { z } from 'zod';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';

export const RiskManagerCapability = {
  id: 'portfolio_risk_manager_v1',
  description: 'Identifies concentration risks and performs macroeconomic scenario analysis.',
  
  execute: async (context: any) => {
    const RiskSchema = z.object({
      concentrationRisks: z.string(),
      analysisAssumptions: z.array(z.string()),
      scenarios: z.array(z.object({
        name: z.string(),
        expectedBehaviour: z.string(),
        risks: z.string(),
        suggestedAction: z.string(),
        confidence: z.string()
      }))
    });

    const prompt = `You are the Chief Risk Officer at Knowith Capital.
Analyze the following portfolio data and provide a rigorous risk evaluation.

Data:
${JSON.stringify(context, null, 2)}

Requirements:
1. Identify any 'concentrationRisks' (e.g., "Too much exposure to illiquid real estate").
2. List 3-4 'analysisAssumptions' (e.g., "Assumes inflation remains above 5%", "Assumes historical equity risk premiums hold").
3. Generate EXACTLY 4 macroeconomic scenarios:
   - Equity Market Decline (Bear Market)
   - Rising Interest Rates
   - High Inflation Environment
   - Strong Bull Market
   For each scenario, detail the expectedBehaviour of this specific portfolio, the risks, the suggestedAction, and your confidence level ("High", "Medium", "Low").
   This is educational scenario planning, NOT forecasting.`;

    const { data } = await GeminiSDK.generateStructuredResponse(
      prompt,
      [{ role: 'user', content: 'Generate the risk and scenario analysis.' }],
      RiskSchema,
      { temperature: 0.2, model: 'gemini-3.5-flash' }
    );

    return data;
  }
};
