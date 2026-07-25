import { z } from 'zod';
import { Capability } from '../../../core/types';
import { GroqSDK } from '../../../../ai/GroqSDK';
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
    const basePrompt = `You are a Behavioral Psychologist specializing in Wealth Management.
Create a memorable Investor Identity (e.g. 'The Strategic Accumulator').
Explain how this specific user will likely react during market volatility based on their age and risk appetite.
Identify their likely behavioral biases (e.g. Recency Bias, Loss Aversion) and common mistakes they might make.

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
    
    const messages = [
      { role: 'user', content: `Profile & Context: ${JSON.stringify(context)}` }
    ];

    const result = await GroqSDK.generateStructuredResponse(
      prompt,
      messages,
      BehaviourSchema,
      { temperature: 0.2 }
    );

    return result.data;
  }
};
