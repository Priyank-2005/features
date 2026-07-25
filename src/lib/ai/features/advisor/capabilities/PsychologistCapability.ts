import { z } from 'zod';
import { Capability } from '../../../core/types';
import { GeminiSDK } from '../../../../ai/GeminiSDK';
import { ExplainabilityEngine } from '../../../core/engines/ExplainabilityEngine';

export const BehaviourSchema = z.object({
  investorIdentity: z.string().describe("E.g. 'The Growth Builder' or 'The Strategic Accumulator'"),
  identityExplanation: z.string(),
  riskProfile: z.string(),
  riskExplanation: z.string().describe("How they will likely behave during market crashes."),
  behaviouralBiases: z.array(z.string()),
  likelyMistakes: z.array(z.string())
});

export const PsychologistCapability: Capability<any, z.infer<typeof BehaviourSchema>> = {
  id: 'advisor_psychologist_v1',
  description: 'Analyzes the human behind the numbers to determine behavioral biases and identity.',
  schema: BehaviourSchema,
  execute: async (context: any) => {
    const basePrompt = `You are a Behavioral Finance Psychologist at Knowith Capital.
Create a memorable Investor Identity label (e.g. 'The Strategic Accumulator', 'The Steady Compounder').
Write a warm, insightful personality profile explaining how this person likely thinks about money based on their age, risk appetite, and financial position.
Explain how they will likely react during market downturns. Identify behavioral biases they may have, and common investing mistakes they should watch for.
Write naturally, like a psychologist's private assessment — never use labels like "Why:" or "So what:".

YOU MUST RESPOND EXACTLY IN THIS JSON FORMAT:
{
  "investorIdentity": "The Growth Builder",
  "identityExplanation": "reasoning...",
  "riskProfile": "Aggressive",
  "riskExplanation": "explanation...",
  "behaviouralBiases": ["Bias 1", "Bias 2"],
  "likelyMistakes": ["Mistake 1", "Mistake 2"]
}`;

    const prompt = ExplainabilityEngine.injectExplainabilityRules(basePrompt);
    
    const messages: { role: 'user' | 'assistant' | 'system', content: string }[] = [
      { role: 'user', content: `Profile & Context: ${JSON.stringify(context)}` }
    ];

    const result = await GeminiSDK.generateStructuredResponse(
      prompt,
      messages,
      BehaviourSchema,
      { temperature: 0.2 }
    );

    return result.data;
  }
};
