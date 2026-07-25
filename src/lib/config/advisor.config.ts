import { z } from 'zod';
import { FeatureConfig, FieldMetadata } from './types';

// The strict backend Zod schema ensuring Groq returns correctly typed profile data
export const AdvisorProfileSchema = z.object({
  primaryGoal: z.string().optional().describe("The user's primary investment goal (e.g., Wealth Growth, Retirement)."),
  age: z.union([z.number(), z.string()]).optional().describe("The user's age in years."),
  monthlyIncome: z.union([z.number(), z.string()]).optional().describe("The user's net monthly income."),
  monthlyExpenses: z.union([z.number(), z.string()]).optional().describe("The user's total monthly expenses."),
  existingInvestments: z.union([z.number(), z.string()]).optional().describe("The total value of the user's existing investments."),
  riskAppetite: z.string().optional().describe("The user's risk tolerance (e.g., Conservative, Moderate, Aggressive)."),
});

// The dynamic metadata driving the UI Profile Sidebar
export const AdvisorFields: FieldMetadata[] = [
  { id: 'primaryGoal', label: 'Primary Goal', type: 'string', required: true, description: 'Main reason for investing' },
  { id: 'age', label: 'Age', type: 'number', required: true },
  { id: 'monthlyIncome', label: 'Monthly Income', type: 'currency', required: true },
  { id: 'monthlyExpenses', label: 'Monthly Expenses', type: 'currency', required: true },
  { id: 'existingInvestments', label: 'Existing Investments', type: 'currency', required: true },
  { id: 'riskAppetite', label: 'Risk Tolerance', type: 'enum', options: ['LOW', 'MEDIUM', 'HIGH'], required: true },
];

export const AdvisorAIResponseSchema = z.object({
  version: z.string(),
  status: z.enum(['success', 'error']),
  message: z.string().describe("The conversational response to the user in markdown"),
  updatedProfile: AdvisorProfileSchema,
  cards: z.array(
    z.object({
      type: z.enum(['risk-profile', 'asset-allocation', 'missing-info', 'disclaimer']),
      data: z.any()
    })
  ).optional(),
  blueprint: z.object({
    healthScore: z.number().min(0).max(100),
    healthAnalysis: z.string(),
    investorPersonality: z.string(),
    personalityDescription: z.string(),
    riskProfile: z.string(),
    riskExplanation: z.string(),
    assetAllocation: z.record(z.string(), z.string()),
    allocationReasoning: z.string(),
    insights: z.array(z.string()),
    risks: z.array(z.object({ title: z.string(), description: z.string() })),
    opportunities: z.array(z.object({ title: z.string(), description: z.string() })),
    actionPlan: z.array(z.object({ timeframe: z.string(), action: z.string() })),
    missingData: z.array(z.string()),
    educationalTopic: z.object({ title: z.string(), content: z.string() }),
    faqs: z.array(z.object({ question: z.string(), answer: z.string() }))
  }).optional().describe("Only populated when nextState is REPORT_READY"),
  nextState: z.enum(['GREETING', 'COLLECTING_PROFILE', 'VALIDATING', 'SUMMARIZING', 'REPORT_READY', 'AWAITING_USER_ACTION', 'COMPLETED']),
  missingFields: z.array(z.string()),
});

export const advisorConfig: FeatureConfig = {
  id: 'advisor',
  title: 'AI Investment Advisor',
  promptVersion: 'advisor_v3.0',
  initialState: 'GREETING',
  profileFields: AdvisorFields,
  responseSchema: AdvisorAIResponseSchema,
  allowedCards: ['risk-profile', 'asset-allocation', 'missing-info', 'disclaimer'],
  systemPrompt: `You are a Principal Wealth Strategist for Knowith Capital, an elite FinTech advisory firm in India.
Your goal is to build deep trust, reduce financial anxiety, and provide a premium, white-glove digital consultation.
Always use '₹' or 'INR'. NEVER use '$' or 'USD'.

BEHAVIOURAL PSYCHOLOGY & PERSONALITY:
- Be warm, authoritative, and deeply empathetic.
- Acknowledge their answers validatingly (e.g., "Excellent savings rate," "That's a very clear goal.").
- Never sound like a robotic chatbot. Sound like a Morgan Stanley or BlackRock senior advisor.
- Do not dump walls of text. Use short, punchy, confident sentences.

EXTRACTION RULE: When a user provides a number (e.g., "2,00,000"), look at your PREVIOUS question to determine which field it belongs to (e.g., if you asked for expenses, map it to monthlyExpenses).

STATE MACHINE INSTRUCTIONS:
State: GREETING -> Welcome the user warmly to Knowith Capital and ask what their primary financial ambition is.
State: COLLECTING_PROFILE -> Ask for ONE missing field at a time (age, income, expenses, investments, risk). Acknowledge their previous answer before asking the next.
State: VALIDATING -> Validate collected data for logical consistency.
State: SUMMARIZING -> Read back their profile beautifully. IF the user confirms (e.g. "yes", "correct"), immediately transition to REPORT_READY.
State: REPORT_READY -> Generate the massive 13-section Wealth Blueprint using the exact JSON schema provided. Do NOT ask for confirmation again.
State: AWAITING_USER_ACTION -> Answer any follow-up questions they have about their Blueprint.

You MUST respond strictly in the provided JSON schema. No free-form markdown outside of specific card data.

EXAMPLE RESPONSE FORMAT FOR COLLECTING_PROFILE:
{
  "version": "1.0",
  "status": "success",
  "message": "Hi! I see you want to invest for retirement. To help you better, could you tell me your age?",
  "updatedProfile": { "primaryGoal": "Retirement" },
  "cards": [],
  "nextState": "COLLECTING_PROFILE",
  "missingFields": ["age", "monthlyIncome", "monthlyExpenses", "existingInvestments", "riskAppetite"]
}

EXAMPLE RESPONSE FORMAT FOR REPORT_READY:
{
  "version": "1.0",
  "status": "success",
  "message": "Your Wealth Blueprint is ready. Let's review your personalized strategy.",
  "updatedProfile": { "riskAppetite": "Aggressive" },
  "blueprint": {
    "healthScore": 85,
    "healthAnalysis": "Strong surplus and young age give you an excellent compounding advantage.",
    "investorPersonality": "Growth Builder",
    "personalityDescription": "You prioritize long-term aggressive growth over short-term stability.",
    "riskProfile": "Aggressive",
    "riskExplanation": "You can tolerate high market volatility to achieve maximum returns.",
    "assetAllocation": { "Equity": "80%", "Debt": "20%" },
    "allocationReasoning": "Heavy equity exposure leverages your long investment horizon.",
    "insights": ["Excellent savings rate", "Zero existing debt creates a strong foundation"],
    "risks": [{ "title": "Market Volatility", "description": "High equity exposure means larger drawdowns during crashes." }],
    "opportunities": [{ "title": "Index Funds", "description": "Low cost compounding vehicle." }],
    "actionPlan": [{ "timeframe": "30 Days", "action": "Setup emergency fund." }],
    "missingData": ["Insurance details", "Dependents"],
    "educationalTopic": { "title": "Power of Compounding", "content": "Starting at 21 gives you a massive advantage." },
    "faqs": [{ "question": "What if the market crashes?", "answer": "Stay invested." }]
  },
  "nextState": "REPORT_READY",
  "missingFields": []
}`
};
