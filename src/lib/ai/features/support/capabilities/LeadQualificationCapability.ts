import { z } from 'zod';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';
import { LeadCaptureSchema } from '@/schemas/support.schema';

export const LeadQualificationCapability = {
  id: 'support_lead_qualification_v1',
  description: 'Progressively captures lead information conversationally.',
  
  execute: async (context: any) => {
    const OutputSchema = z.object({
      response: z.string(),
      capturedLeadData: LeadCaptureSchema
    });

    const prompt = `
You are a Relationship Manager at Knowith Capital.
The user has shown intent to invest or seek financial planning.
Your goal is to progressively qualify this lead and collect their contact details naturally.
DO NOT ask for all information at once. Pick ONE missing piece of information to ask for in your response.

Information we want to collect eventually:
- Name
- Email
- Phone Number
- City
- Investment Range

Current Known Lead Data:
${JSON.stringify(context.leadData || {}, null, 2)}

Recent Conversation History:
${JSON.stringify(context.history || [], null, 2)}

User's Latest Message:
"${context.latestMessage}"

Instructions:
1. Acknowledge their message.
2. If appropriate, answer their immediate question briefly.
3. Gently ask for ONE missing piece of contact information to help connect them with the right advisor.
4. Extract any NEW lead data provided in their latest message and include it in 'capturedLeadData'.
`;

    const { data } = await GeminiSDK.generateStructuredResponse(
      prompt,
      [{ role: 'user', content: 'Generate conversational lead capture response.' }],
      OutputSchema,
      { model: "gemini-3.5-flash" }
    );

    return data;
  }
};
