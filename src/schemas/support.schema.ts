import { z } from 'zod';

export const IntentClassificationSchema = z.object({
  intent: z.enum([
    'General Question',
    'Product Information',
    'Educational',
    'Lead Intent',
    'Human Advisor',
    'Complaint',
    'Greeting',
    'Unknown'
  ]),
  confidence: z.number().min(0).max(100)
});

export type IntentClassification = z.infer<typeof IntentClassificationSchema>;

export const LeadCaptureSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  investmentRange: z.string().optional()
});

export type LeadCapture = z.infer<typeof LeadCaptureSchema>;

export const EscalationHandoffSchema = z.object({
  reason: z.string(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  conversationSummary: z.string(),
  collectedDetails: LeadCaptureSchema,
  recommendedFollowUp: z.string()
});

export type EscalationHandoff = z.infer<typeof EscalationHandoffSchema>;

export const SupportResponseSchema = z.object({
  message: z.string(),
  suggestedQuestions: z.array(z.string()).optional(),
  isEscalated: z.boolean().optional(),
  escalationDetails: EscalationHandoffSchema.optional()
});

export type SupportResponse = z.infer<typeof SupportResponseSchema>;
