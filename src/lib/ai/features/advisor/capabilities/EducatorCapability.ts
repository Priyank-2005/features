import { z } from 'zod';
import { Capability } from '../../../core/types';
import { GroqSDK } from '../../../../ai/GroqSDK';
import { ExplainabilityEngine } from '../../../core/engines/ExplainabilityEngine';

export const EducationSchema = z.object({
  educationalTopic: z.object({
    title: z.string(),
    content: z.string()
  }),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })),
  missingDataPrompt: z.object({
    explanation: z.string(),
    fields: z.array(z.string())
  })
});

export const EducatorCapability: Capability<any, z.infer<typeof EducationSchema>> = {
  id: 'advisor_educator_v1',
  description: 'Generates educational content and FAQs based on the aggregated findings of other agents.',
  schema: EducationSchema,
  execute: async (context: any) => {
    const basePrompt = `You are a Financial Educator at Knowith Capital.
Review the aggregated findings from the Analyst, Strategist, and Psychologist.
1. Generate a single highly relevant educational topic based specifically on their profile (e.g. if they are young, explain compounding; if high income, explain tax efficiency).
2. Generate exactly 8 follow-up questions they are likely asking right now, with brief, intelligent answers.
3. Identify what critical financial information is missing from their profile that would make this report better. Explain WHY it matters.

YOU MUST RESPOND EXACTLY IN THIS JSON FORMAT:
{
  "educationalTopic": {
    "title": "Topic title",
    "content": "Educational content..."
  },
  "faqs": [
    { "question": "Q1", "answer": "A1" },
    { "question": "Q2", "answer": "A2" },
    { "question": "Q3", "answer": "A3" },
    { "question": "Q4", "answer": "A4" },
    { "question": "Q5", "answer": "A5" },
    { "question": "Q6", "answer": "A6" },
    { "question": "Q7", "answer": "A7" },
    { "question": "Q8", "answer": "A8" }
  ],
  "missingDataPrompt": {
    "explanation": "Why this data is needed...",
    "fields": ["Insurance", "Dependents", "Tax Regime"]
  }
}`;

    const prompt = ExplainabilityEngine.injectExplainabilityRules(basePrompt);
    
    const messages = [
      { role: 'user', content: `Aggregated Context: ${JSON.stringify(context)}` }
    ];

    const result = await GroqSDK.generateStructuredResponse(
      prompt,
      messages,
      EducationSchema,
      { temperature: 0.2 }
    );

    return result.data;
  }
};
