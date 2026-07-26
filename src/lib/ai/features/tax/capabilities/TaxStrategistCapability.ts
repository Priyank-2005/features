import { z } from 'zod';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';
import { DeductionUtilisationSchema, MissedOpportunitySchema, TaxRoadmapStepSchema, TaxEfficiencyScoreSchema, AnnualTaxCalendarSchema } from '@/schemas/tax.schema';

export const TaxStrategistCapability = {
  id: 'tax_strategist_v1',
  description: 'Identifies unutilized deductions, missed opportunities, and generates a Tax Optimization Roadmap.',
  
  execute: async (context: any) => {
    const StrategistSchema = z.object({
      executiveSummary: z.string(),
      taxEfficiencyScore: TaxEfficiencyScoreSchema,
      deductions: z.array(DeductionUtilisationSchema),
      missedOpportunities: z.array(MissedOpportunitySchema),
      taxRiskAndComplianceNotes: z.array(z.string()),
      roadmap: z.array(TaxRoadmapStepSchema),
      annualTaxCalendar: z.array(AnnualTaxCalendarSchema),
      educationalNotes: z.object({
        title: z.string(),
        content: z.string()
      }),
      assumptionsAndDisclaimer: z.array(z.string()),
      faqs: z.array(z.object({
        question: z.string(),
        answer: z.string()
      }))
    });

    const prompt = `You are the Lead Tax Strategist at Knowith Capital.
Analyze the user's tax profile and the deterministic tax calculation, and generate a strategic tax optimization plan. Ensure every recommendation references the user's actual financial information.

Context Data:
${JSON.stringify(context, null, 2)}

Requirements:
1. Provide a concise 'executiveSummary' evaluating their current tax efficiency.
2. Provide a 'taxEfficiencyScore' (out of 100) along with an 'explanation', 'whyItMatters', and a 'breakdown' of 3-4 sub-scores (e.g. Regime Alignment, Deduction Utilization) out of 100 with a specific insight for each.
3. For 'deductions', analyze the utilisation of major limits (e.g., 80C limit is 150000). Show limit, utilised, remaining, and a specific suggestion. Use STRINGS for name and section, NUMBERS for limit, utilised, remaining.
4. For 'missedOpportunities', suggest specific tax-saving products. Include 'opportunity', 'currentSituation', 'estimatedTaxBenefit' (String), 'effortRequired' (Easy/Moderate/Hard), 'priority', 'recommendedAction', and 'expectedOutcome'.
5. Provide 'taxRiskAndComplianceNotes' (e.g., "Ensure proof of investments are submitted by Jan 31"). Output as an array of STRINGS.
6. Provide an actionable 'roadmap' to optimize their taxes before the end of the financial year.
7. Provide an 'annualTaxCalendar' (4 quarters) that guides users through the financial year (Q1 Apr-Jun, Q2 Jul-Sep, etc.) with a focus and action items.
8. Provide an 'educationalNotes' block explaining a complex tax concept relevant to them.
9. State 3 'assumptionsAndDisclaimer' (e.g., "This is an estimation, not legal advice"). Output as an array of STRINGS.
10. Provide 3 context-aware 'faqs'.

EXAMPLE RESPONSE FORMAT FOR ARRAYS:
{
  "annualTaxCalendar": [
    { "quarter": "Q1 (Apr-Jun)", "focus": "Planning", "actionItems": ["String 1", "String 2"] }
  ]
}
`;

    const { data } = await GeminiSDK.generateStructuredResponse(
      prompt,
      [{ role: 'user', content: 'Generate the tax strategy.' }],
      StrategistSchema,
      { temperature: 0.2, model: 'gemini-3.5-flash' }
    );

    return data;
  }
};
