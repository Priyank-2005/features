import { z } from 'zod';

export const TaxChatRequestSchema = z.object({
  message: z.string(),
  currentState: z.record(z.string(), z.any()).optional(),
  history: z.array(z.object({
    role: z.string(),
    content: z.string()
  })).optional()
});

export const TaxAIResponseSchema = z.object({
  version: z.string(),
  status: z.enum(['success', 'error']),
  message: z.string(),
  updatedProfile: z.record(z.string(), z.any()),
  cards: z.array(z.any()).optional(),
  nextState: z.enum(['GREETING', 'COLLECTING_L1', 'OPTIONAL_PROMPT', 'COLLECTING_L2', 'VALIDATING', 'SUMMARIZING', 'REPORT_READY', 'AWAITING_USER_ACTION']),
  missingFields: z.array(z.string()).optional()
});

export const RegimeComparisonSchema = z.object({
  grossIncome: z.number(),
  totalDeductionsOld: z.number(),
  totalDeductionsNew: z.number(),
  taxableIncomeOld: z.number(),
  taxableIncomeNew: z.number(),
  taxCalculatedOld: z.number(),
  taxCalculatedNew: z.number(),
  oldRegimeAdvantages: z.array(z.string()),
  oldRegimeLimitations: z.array(z.string()),
  newRegimeAdvantages: z.array(z.string()),
  newRegimeLimitations: z.array(z.string()),
  recommendedRegime: z.enum(['old', 'new']),
  potentialSavings: z.number(),
  reasoning: z.string()
});

export const DeductionUtilisationSchema = z.object({
  name: z.string(),
  section: z.string(),
  limit: z.number(),
  utilised: z.number(),
  remaining: z.number(),
  suggestion: z.string()
});

export const MissedOpportunitySchema = z.object({
  opportunity: z.string(),
  currentSituation: z.string(),
  estimatedTaxBenefit: z.string(),
  effortRequired: z.string(), // Easy, Moderate, Hard
  priority: z.string(), // High, Medium, Low
  recommendedAction: z.string(),
  expectedOutcome: z.string()
});

export const TaxRoadmapStepSchema = z.object({
  priority: z.string(),
  action: z.string(),
  reasoning: z.string(),
  expectedBenefit: z.string(),
  estimatedTaxImpact: z.string(),
  timeframe: z.string()
});

export const TaxEfficiencyScoreSchema = z.object({
  score: z.number(),
  explanation: z.string(),
  whyItMatters: z.string(),
  breakdown: z.record(z.string(), z.object({
    score: z.number(),
    insight: z.string()
  })) // e.g. { "Regime Alignment": { score: 90, insight: "..." } }
});

export const AnnualTaxCalendarSchema = z.object({
  quarter: z.string(), // e.g. "Q1 (Apr - Jun)", "Q4 (Jan - Mar)"
  focus: z.string(),
  actionItems: z.array(z.string())
});

export const TaxBlueprintSchema = z.object({
  totalTaxLiability: z.number(),
  potentialTaxSavings: z.number(),
  recommendedRegime: z.string(),
  preparedDate: z.string(),
  executiveSummary: z.string(),
  taxEfficiencyScore: TaxEfficiencyScoreSchema,
  regimeComparison: RegimeComparisonSchema,
  deductions: z.array(DeductionUtilisationSchema),
  missedOpportunities: z.array(MissedOpportunitySchema),
  taxRiskAndComplianceNotes: z.array(z.string()),
  roadmap: z.array(TaxRoadmapStepSchema),
  annualTaxCalendar: z.array(AnnualTaxCalendarSchema),
  educationalNotes: z.object({
    title: z.string(),
    content: z.string()
  }),
  assumptionsAndDisclaimer: z.array(z.string()),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string()
  }))
});

export type TaxBlueprint = z.infer<typeof TaxBlueprintSchema>;
