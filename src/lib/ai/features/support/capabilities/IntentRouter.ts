import { z } from 'zod';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';
import { IntentClassificationSchema } from '@/schemas/support.schema';

export const IntentRouter = {
  id: 'support_intent_router_v1',
  description: 'Classifies the intent of the user message to route to appropriate capabilities.',
  
  execute: async (context: any) => {
    const prompt = `
You are an Intent Classification router for a premium financial wealth management firm.
Review the recent conversation history and specifically the user's LATEST message to determine their primary intent.

Recent Conversation History:
${JSON.stringify(context.history || [], null, 2)}

User's Latest Message:
"${context.latestMessage}"

Classify into exactly one of these intents:
- General Question (factual questions about the company, fees, location)
- Product Information (questions about PMS, SIPs, Mutual Funds)
- Educational (asking to explain a concept like CAGR, inflation)
- Lead Intent (expressing interest to invest, start SIP, get a callback, financial planning)
- Human Advisor (explicitly asking to speak with a human)
- Complaint (expressing dissatisfaction)
- Greeting (hello, hi, good morning)
- Unknown (cannot determine)

Also determine a 'confidence' score between 0 and 100 for your classification.
`;

    const { data } = await GeminiSDK.generateStructuredResponse(
      prompt,
      [{ role: 'user', content: 'Classify intent.' }],
      IntentClassificationSchema,
      { model: "gemini-3.5-flash" }
    );

    return data; // { intent, confidence }
  }
};
