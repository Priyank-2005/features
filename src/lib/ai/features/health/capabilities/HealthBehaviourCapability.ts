import { z } from 'zod';
import { Capability } from '../../../core/types';
import { ExplainabilityEngine } from '../../../core/engines/ExplainabilityEngine';
import { GeminiSDK } from '../../../GeminiSDK';
import { HealthProfile } from '../../../../../schemas/health.schema';

export const HealthBehaviourSchema = z.object({
  financialPersonality: z.string().describe("A professional, empathetic label for their financial personality (e.g., 'Cautious Saver', 'Over-leveraged Earner', 'Balanced Builder')."),
  personalityDescription: z.string().describe("A 2-3 sentence paragraph explaining their behavioral tendencies, biases, and how it impacts their financial health.")
});

export type HealthBehaviourOutput = z.infer<typeof HealthBehaviourSchema>;

export class HealthBehaviourCapability implements Capability<HealthProfile, HealthBehaviourOutput> {
  id = 'health_behaviour_v1';
  description = 'Analyzes the behavioral psychology and spending patterns behind financial data.';
  schema = HealthBehaviourSchema;

  async execute(context: HealthProfile, metrics: any): Promise<HealthBehaviourOutput> {
    const basePrompt = `You are a Behavioral Finance Psychologist at Knowith Capital.
Your job is to read between the lines of a client's financial data to determine their psychological relationship with money.

Client Data: ${JSON.stringify(context)}
Calculated Metrics: ${JSON.stringify(metrics)}

Your task:
1. Assign a professional financial personality archetype.
2. Explain their likely behavioral biases and money habits based on their income vs. spending and debt levels.
Keep the tone empathetic and empowering. No judgement.

YOU MUST RESPOND EXACTLY IN THIS JSON FORMAT:
{
  "financialPersonality": "string",
  "personalityDescription": "string"
}`;

    const prompt = ExplainabilityEngine.injectExplainabilityRules(basePrompt);
    
    const messages: { role: 'user' | 'assistant' | 'system', content: string }[] = [
      { role: 'user', content: `Profile & Metrics: ${JSON.stringify({ ...context, metrics })}` }
    ];

    const result = await GeminiSDK.generateStructuredResponse(
      prompt,
      messages,
      HealthBehaviourSchema,
      { temperature: 0.2 }
    );
    
    return result.data;
  }
}
