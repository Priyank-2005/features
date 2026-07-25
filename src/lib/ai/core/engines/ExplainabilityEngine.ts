/**
 * ExplainabilityEngine
 * Enforces the strict "WHY?" requirement across all outputs.
 * Provides standard wrappers and prompt injections to ensure AI capabilities 
 * always justify their decisions using user-specific data.
 */
export class ExplainabilityEngine {
  
  /**
   * Appends explainability rules to any system prompt.
   */
  public static injectExplainabilityRules(basePrompt: string): string {
    return `${basePrompt}

CRITICAL EXPLAINABILITY RULES:
1. You must answer "WHY?" for every single recommendation or observation.
2. You must answer "SO WHAT?" explaining the direct impact on the user.
3. You must use the user's explicit data (age, surplus, goals) in your reasoning.
4. Never state a generic financial fact without tying it back to the user's specific context.`;
  }
}
