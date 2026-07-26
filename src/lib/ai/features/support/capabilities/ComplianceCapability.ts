import { z } from 'zod';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';

export const ComplianceCapability = {
  id: 'support_compliance_v1',
  description: 'Final review to ensure the response contains no personalized advice or guarantees.',
  
  execute: async (context: any) => {
    const OutputSchema = z.object({
      isCompliant: z.boolean(),
      revisedResponse: z.string().optional(),
      reason: z.string().optional()
    });

    const prompt = `
You are the Chief Compliance Officer AI for Knowith Capital.
Review the proposed response from our Support Assistant to ensure it complies with SEBI regulations and company policy.

Rules:
1. NEVER recommend specific stocks, mutual funds, or products.
2. NEVER predict returns or guarantee profits.
3. NEVER provide personalized investment advice or portfolio allocation.
4. DO NOT replace a human SEBI-registered advisor.

Proposed Response:
"${context.proposedResponse}"

If the response violates any rules, set isCompliant to false and provide a 'revisedResponse' that removes the offending content and instead suggests speaking with a qualified advisor.
If it is compliant, set isCompliant to true.
`;

    const { data } = await GeminiSDK.generateStructuredResponse(
      prompt,
      [{ role: 'user', content: 'Review for compliance.' }],
      OutputSchema,
      { model: "gemini-3.5-flash" }
    );

    return data;
  }
};
