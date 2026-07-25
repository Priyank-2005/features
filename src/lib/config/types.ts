import { z } from 'zod';

export type ConversationState = 
  | 'GREETING'
  | 'COLLECTING_PROFILE'
  | 'VALIDATING'
  | 'SUMMARIZING'
  | 'REPORT_READY'
  | 'AWAITING_USER_ACTION'
  | 'COMPLETED';

export interface FieldMetadata {
  id: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'currency';
  required: boolean;
  options?: string[]; // for enums
  description?: string;
}

export interface FeatureConfig {
  id: string;
  title: string;
  promptVersion: string;
  initialState: ConversationState;
  
  // Dynamic Schema metadata for the UI to render the sidebar / progress tracker
  profileFields: FieldMetadata[];
  
  // Zod schema for backend validation
  responseSchema: z.ZodType;
  
  // The system prompt logic
  systemPrompt: string;
  
  // Allowed UI Card components for the CardRenderer
  allowedCards: string[];
}
