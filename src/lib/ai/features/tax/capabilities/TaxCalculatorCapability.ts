import { z } from 'zod';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';

export const TaxCalculatorCapability = {
  id: 'tax_calculator_v1',
  description: 'Calculates the tax liability under both Old and New regimes using 2024-2025 Indian tax slabs.',
  
  execute: async (context: any) => {
    const CalculatorSchema = z.object({
      grossIncome: z.number(),
      totalDeductionsOld: z.number(),
      totalDeductionsNew: z.number(),
      taxableIncomeOld: z.number(),
      taxableIncomeNew: z.number(),
      taxCalculatedOld: z.number(),
      taxCalculatedNew: z.number(),
      oldRegimeAdvantages: z.array(z.string()),
      oldRegimeLimitations: z.array(z.string()),
      newRegimeAdvantages: z.array(z.string()),
      newRegimeLimitations: z.array(z.string()),
      recommendedRegime: z.enum(['old', 'new']),
      potentialSavings: z.number(),
      reasoning: z.string()
    });

    const prompt = `You are the Lead Tax Calculator at Knowith Capital.
Perform an accurate deterministic tax estimation for the FY 2024-2025 (AY 2025-2026) Indian Tax slabs based on the user's profile.

Profile Data:
${JSON.stringify(context, null, 2)}

Rules:
1. 'grossIncome' is the annualSalary. Standard deduction of ₹50,000 applies to BOTH Old and New regimes.
2. Calculate 'totalDeductionsOld' by summing all valid deductions (80C max 1.5L, 80D max 25k/50k, NPS 80CCD(1B) max 50k, HRA, Home Loan Interest max 2L).
3. 'totalDeductionsNew' is generally just the ₹50,000 standard deduction (unless specific exemptions apply).
4. Calculate 'taxableIncomeOld' and 'taxableIncomeNew'.
5. Apply the standard Old Regime tax slabs to calculate 'taxCalculatedOld'.
6. Apply the standard New Regime tax slabs to calculate 'taxCalculatedNew'.
7. Provide 2-3 strings each for 'oldRegimeAdvantages', 'oldRegimeLimitations', 'newRegimeAdvantages', 'newRegimeLimitations'.
8. Compare both to determine the 'recommendedRegime'.
9. Calculate 'potentialSavings' as the absolute difference between the two tax amounts.
10. Provide a concise 'reasoning' for the recommendation.

Ensure your calculations are mathematically rigorous.

EXAMPLE RESPONSE FORMAT:
{
  "grossIncome": 500000,
  "totalDeductionsOld": 50000,
  "totalDeductionsNew": 50000,
  "taxableIncomeOld": 450000,
  "taxableIncomeNew": 450000,
  "taxCalculatedOld": 0,
  "taxCalculatedNew": 0,
  "oldRegimeAdvantages": ["String 1", "String 2"],
  "oldRegimeLimitations": ["String 1", "String 2"],
  "newRegimeAdvantages": ["String 1", "String 2"],
  "newRegimeLimitations": ["String 1", "String 2"],
  "recommendedRegime": "new",
  "potentialSavings": 0,
  "reasoning": "A concise reasoning string"
}
`;

    const { data } = await GeminiSDK.generateStructuredResponse(
      prompt,
      [{ role: 'user', content: 'Perform the deterministic tax calculation.' }],
      CalculatorSchema,
      { temperature: 0.0, model: 'gemini-3.5-flash' }
    );

    return data;
  }
};
