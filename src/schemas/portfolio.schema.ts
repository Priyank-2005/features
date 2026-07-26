import { z } from 'zod';

export const PortfolioChatRequestSchema = z.object({
  message: z.string(),
  currentState: z.record(z.string(), z.any()).optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).optional()
});

export const PortfolioAIResponseSchema = z.object({
  version: z.string(),
  status: z.enum(['success', 'error']),
  message: z.string(),
  updatedProfile: z.record(z.string(), z.any()),
  cards: z.array(z.any()).optional(),
  nextState: z.enum(['GREETING', 'COLLECTING_L1', 'OPTIONAL_PROMPT', 'COLLECTING_L2', 'VALIDATING', 'SUMMARIZING', 'REPORT_READY', 'AWAITING_USER_ACTION']),
  missingFields: z.array(z.string()).optional()
});

export const ScenarioSchema = z.object({
  name: z.string(),
  expectedBehaviour: z.string(),
  risks: z.string(),
  suggestedAction: z.string(),
  confidence: z.string() // e.g. "High", "Medium", "Low"
});

export const RebalancingStepSchema = z.object({
  assetClass: z.string(),
  currentAllocation: z.string(),
  problem: z.string(),
  recommendation: z.string(),
  expectedBenefit: z.string(),
  priority: z.string(), // e.g. "Immediate", "Short-term"
  timeframe: z.string(),
  estimatedEffort: z.string()
});

export const PortfolioBlueprintSchema = z.object({
  totalValue: z.string(),
  overallScore: z.number(),
  scoreMethodology: z.string(),
  subScores: z.array(z.object({ 
    name: z.string(), 
    score: z.number(),
    explanation: z.string(),
    whyItMatters: z.string()
  })),
  investmentPersonality: z.string(),
  personalityReasoning: z.string(),
  strengths: z.array(z.string()),
  areasOfConcern: z.array(z.string()),
  currentAllocation: z.record(z.string(), z.number()),
  recommendedAllocation: z.record(z.string(), z.number()),
  diversificationAnalysis: z.string(),
  concentrationRisks: z.string(),
  scenarios: z.array(ScenarioSchema),
  rebalancingRoadmap: z.array(RebalancingStepSchema),
  longTermStrategy: z.string(),
  analysisAssumptions: z.array(z.string()),
  educationalTopic: z.object({ title: z.string(), personalizedContent: z.string() }),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() }))
});

export type PortfolioBlueprint = z.infer<typeof PortfolioBlueprintSchema>;
