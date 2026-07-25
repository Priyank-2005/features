/**
 * ExplainabilityEngine
 * Enforces personalized, human-sounding reasoning across all AI outputs.
 * Prevents generic textbook advice and ensures every insight references user data.
 */
export class ExplainabilityEngine {
  
  /**
   * Appends explainability rules to any system prompt.
   */
  public static injectExplainabilityRules(basePrompt: string): string {
    return `${basePrompt}

WRITING STYLE RULES:
1. Write like a senior wealth advisor speaking directly to a client in a private consultation — warm, confident, and conversational.
2. Every recommendation must naturally reference the user's specific data (age, surplus, goals) woven into the sentence. Do NOT use labels like "WHY:" or "SO WHAT:" or any mechanical formatting.
3. Use concise, punchy sentences. Avoid filler phrases, repetition, or restating the same point differently.
4. Never start sentences with "Why:" or "So what:" or any label. Just write naturally.
5. Sound like a Bloomberg or Morgan Stanley research note — authoritative, data-driven, and human.
6. Use INR (₹) for all currency references. Never use USD.`;
  }
}
