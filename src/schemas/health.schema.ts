import { z } from 'zod';
import { ConversationState } from '../lib/config/types';

// The profile data expected for Health Analyzer
export const HealthProfileSchema = z.object({
  monthlyIncome: z.union([z.number(), z.string()]).optional().describe("The user's net monthly income."),
  monthlyExpenses: z.union([z.number(), z.string()]).optional().describe("The user's total monthly expenses."),
  totalDebt: z.union([z.number(), z.string()]).optional().describe("The user's total outstanding debt."),
  monthlyEMI: z.union([z.number(), z.string()]).optional().describe("The user's total monthly EMI payments."),
  emergencyFund: z.union([z.number(), z.string()]).optional().describe("The user's total emergency fund savings."),
  existingInvestments: z.union([z.number(), z.string()]).optional().describe("The total value of the user's existing investments."),
});

export type HealthProfile = z.infer<typeof HealthProfileSchema>;

export const HealthChatRequestSchema = z.object({
  message: z.string(),
  profileData: HealthProfileSchema,
  currentState: z.enum(['GREETING', 'COLLECTING_PROFILE', 'VALIDATING', 'SUMMARIZING', 'REPORT_READY', 'AWAITING_USER_ACTION', 'COMPLETED']),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  }))
});

export type HealthChatRequest = z.infer<typeof HealthChatRequestSchema>;

export const HealthBlueprintSchema = z.object({
  overallScore: z.number(),
  savingsHealth: z.number(),
  debtHealth: z.number(),
  emergencyHealth: z.number(),
  investmentHealth: z.number(),
  financialPersonality: z.string(),
  personalityDescription: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  keyObservations: z.array(z.string()),
  recommendations: z.array(z.object({
    timeframe: z.string(),
    action: z.string(),
    impact: z.string()
  })),
  educationalTopic: z.object({
    title: z.string(),
    content: z.string()
  }),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })),
  missingData: z.array(z.string())
});

export type HealthBlueprint = z.infer<typeof HealthBlueprintSchema>;

export const GroqHealthResponseSchema = z.object({
  version: z.string(),
  status: z.enum(['success', 'error']),
  message: z.string(),
  updatedProfile: HealthProfileSchema,
  nextState: z.enum(['GREETING', 'COLLECTING_PROFILE', 'VALIDATING', 'SUMMARIZING', 'REPORT_READY', 'AWAITING_USER_ACTION', 'COMPLETED']),
  missingFields: z.array(z.string()).optional(),
  blueprint: HealthBlueprintSchema.optional()
});

export type GroqHealthResponse = z.infer<typeof GroqHealthResponseSchema>;
