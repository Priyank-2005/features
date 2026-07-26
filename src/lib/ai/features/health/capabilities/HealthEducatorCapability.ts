import { z } from 'zod';
import { Capability } from '../../../core/types';
import { ExplainabilityEngine } from '../../../core/engines/ExplainabilityEngine';
import { GeminiSDK } from '../../../GeminiSDK';

export const HealthEducationSchema = z.object({
  educationalTopic: z.object({
    title: z.string(),
    content: z.string().describe("A 3-4 sentence educational paragraph relevant to the client's biggest weakness (e.g., debt snowball method, power of compounding).")
  }),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).length(3).describe("Exactly 3 FAQs anticipating the client's most pressing concerns based on their health score."),
  missingDataPrompt: z.array(z.string()).describe("1-2 pieces of information that would help make the health analysis more accurate (e.g., 'interest rates on your debt').")
});

export type HealthEducationOutput = z.infer<typeof HealthEducationSchema>;

export class HealthEducatorCapability implements Capability<any, HealthEducationOutput> {
  id = 'health_educator_v1';
  description = 'Provides targeted educational content and FAQs based on aggregated health analysis.';
  schema = HealthEducationSchema;

  async execute(context: any): Promise<HealthEducationOutput> {
    const basePrompt = `You are the Client Education Director at Knowith Capital.
Review the aggregated financial health analysis produced by your colleagues.

Aggregated Context:
${JSON.stringify(context)}

Your Task:
1. Provide ONE highly relevant educational topic based on their biggest weakness or most urgent recommendation.
2. Generate exactly 3 personalized FAQs they are likely to ask right now.
3. Suggest 1-2 pieces of missing data that would refine this blueprint next time.

YOU MUST RESPOND EXACTLY IN THIS JSON FORMAT:
{
  "educationalTopic": { "title": "string", "content": "string" },
  "faqs": [
    { "question": "string", "answer": "string" },
    { "question": "string", "answer": "string" },
    { "question": "string", "answer": "string" }
  ],
  "missingDataPrompt": ["string", "string"]
}`;

    const prompt = ExplainabilityEngine.injectExplainabilityRules(basePrompt);
    
    const messages: { role: 'user' | 'assistant' | 'system', content: string }[] = [
      { role: 'user', content: `Aggregated Context: ${JSON.stringify(context)}` }
    ];

    const result = await GeminiSDK.generateStructuredResponse(
      prompt,
      messages,
      HealthEducationSchema,
      { temperature: 0.3 }
    );
    
    return result.data;
  }
}
