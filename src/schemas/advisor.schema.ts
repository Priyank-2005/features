import { z } from 'zod';

// The state of the user profile collected during the conversation
export const AdvisorProfileSchema = z.object({
  primaryGoal: z.string().optional().describe("User's main reason for investing"),
  age: z.union([z.number(), z.string()]).optional().describe("User's current age"),
  dependents: z.number().min(0).optional().describe("Number of financial dependents"),
  monthlyIncome: z.union([z.number(), z.string()]).optional().describe("Net monthly income in INR"),
  monthlyExpenses: z.union([z.number(), z.string()]).optional().describe("Total monthly expenses in INR"),
  existingInvestments: z.union([z.number(), z.string()]).optional().describe("Total current investment value"),
  emergencyFund: z.union([z.number(), z.string()]).optional().describe("Current liquid emergency savings"),
  riskAppetite: z.string().optional().describe("User's risk tolerance"),
  investmentHorizonYears: z.union([z.number(), z.string()]).optional().describe("Years until the primary goal"),
  taxRegime: z.enum(['OLD', 'NEW']).optional().describe("Chosen income tax regime"),
  hasHealthInsurance: z.boolean().optional().describe("Whether they have active health insurance"),
  hasLifeInsurance: z.boolean().optional().describe("Whether they have active life insurance"),
});

export type AdvisorProfile = z.infer<typeof AdvisorProfileSchema>;

// The payload sent from the client to the API
export const AdvisorChatRequestSchema = z.object({
  sessionId: z.string().uuid().optional(),
  message: z.string().min(1).max(1000),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string()
    })
  ).optional(),
  currentState: AdvisorProfileSchema.optional(),
});

export type AdvisorChatRequest = z.infer<typeof AdvisorChatRequestSchema>;

// The structured JSON response we demand from Groq
export const WealthBlueprintSchema = z.object({
  healthScore: z.number().min(0).max(100).describe("Algorithmic financial health score"),
  healthAnalysis: z.string().describe("Short explanation of why they got this score"),
  investorPersonality: z.string().describe("E.g., 'Growth Builder', 'Income Seeker'"),
  personalityDescription: z.string(),
  riskProfile: z.string(),
  riskExplanation: z.string(),
  assetAllocation: z.record(z.string(), z.string()).describe("Key-value pair of Asset Class to Percentage string (e.g. { Equity: '70%' })"),
  allocationReasoning: z.string(),
  insights: z.array(z.string()).describe("5-10 tailored bullet points on strengths"),
  risks: z.array(z.object({ title: z.string(), description: z.string() })),
  opportunities: z.array(z.object({ title: z.string(), description: z.string() })),
  actionPlan: z.array(z.object({ timeframe: z.string(), action: z.string() })),
  missingData: z.array(z.string()).describe("Fields that would improve recommendations"),
  educationalTopic: z.object({ title: z.string(), content: z.string() }),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() }))
});

export const GroqAdvisorResponseSchema = z.object({
  updatedProfile: AdvisorProfileSchema,
  missingFields: z.array(z.string()).optional(),
  botResponse: z.string().describe("Conversational response"),
  nextState: z.enum(['GREETING', 'COLLECTING_PROFILE', 'VALIDATING', 'SUMMARIZING', 'REPORT_READY', 'AWAITING_USER_ACTION', 'COMPLETED'])
});

export type GroqAdvisorResponse = z.infer<typeof GroqAdvisorResponseSchema>;
