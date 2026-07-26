import { z } from 'zod';
import { GeminiSDK } from '@/lib/ai/GeminiSDK';

export const KnowledgeCapability = {
  id: 'support_knowledge_v1',
  description: 'Answers factual questions based on retrieved knowledge base documents.',
  
  execute: async (context: any) => {
    const OutputSchema = z.object({
      response: z.string(),
      sourcesUsed: z.array(z.string()).optional()
    });

    const prompt = `
You are a professional digital relationship manager for Knowith Capital.
Answer the user's question based strictly on the retrieved knowledge documents provided below.
Do not invent facts. If the answer is not in the documents, politely state that you do not have that specific information and suggest speaking with an advisor.

Retrieved Knowledge:
${JSON.stringify(context.knowledgeDocs || [], null, 2)}

Conversation History:
${JSON.stringify(context.history || [], null, 2)}

User's Latest Message:
"${context.latestMessage}"

Keep the tone professional, warm, and concise. Prefer bullets for listing.
`;

    const { data } = await GeminiSDK.generateStructuredResponse(
      prompt,
      [{ role: 'user', content: 'Provide the factual answer.' }],
      OutputSchema,
      { model: "gemini-3.5-flash" }
    );

    return data;
  }
};
