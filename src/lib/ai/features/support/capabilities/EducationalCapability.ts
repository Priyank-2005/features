import { z } from 'zod';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';

export const EducationalCapability = {
  id: 'support_education_v1',
  description: 'Explains financial concepts clearly and objectively.',
  
  execute: async (context: any) => {
    const OutputSchema = z.object({
      response: z.string()
    });

    const prompt = `
You are an Educational Relationship Manager for Knowith Capital.
Explain the financial concept the user asked about clearly and simply.

Structure your response using this exact format:
Explanation
(Clear, simple definition)

Example
(A real-world or mathematical example to illustrate)

Important Note
(A key takeaway or risk factor)

Never recommend specific products, stocks, or predict returns.

Conversation History:
${JSON.stringify(context.history || [], null, 2)}

User's Latest Message:
"${context.latestMessage}"
`;

    const { data } = await GeminiSDK.generateStructuredResponse(
      prompt,
      [{ role: 'user', content: 'Provide educational explanation.' }],
      OutputSchema,
      { model: "gemini-3.5-flash" }
    );

    return data;
  }
};
