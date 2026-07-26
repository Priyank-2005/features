import { z } from 'zod';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';
import { EscalationHandoffSchema } from '@/schemas/support.schema';

export const HumanEscalationCapability = {
  id: 'support_human_escalation_v1',
  description: 'Generates a structured human handoff object.',
  
  execute: async (context: any) => {
    const OutputSchema = z.object({
      response: z.string(),
      handoff: EscalationHandoffSchema
    });

    const prompt = `
You are a Relationship Manager at Knowith Capital.
The user has requested to speak with a human advisor, or the conversation requires complex financial planning beyond your capabilities.
Your task is to politely inform the user that you are transferring them to an advisor, and generate a structured handoff object for the human agent.

Known Lead Data:
${JSON.stringify(context.leadData || {}, null, 2)}

Conversation History:
${JSON.stringify(context.history || [], null, 2)}

User's Latest Message:
"${context.latestMessage}"

Instructions for response:
- Be polite and professional.
- Acknowledge their request.
- Let them know an advisor will be in touch shortly.

Instructions for handoff object:
- Summarize the conversation concisely.
- Determine priority (Low, Medium, High, Urgent). High/Urgent if large investment is mentioned or they are angry.
- Suggest a recommended follow-up action for the human advisor.
`;

    const { data } = await GeminiSDK.generateStructuredResponse(
      prompt,
      [{ role: 'user', content: 'Generate human handoff.' }],
      OutputSchema,
      { model: "gemini-3.5-flash" }
    );

    return data;
  }
};
