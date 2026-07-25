export type EventName = 
  | 'CONVERSATION_STARTED'
  | 'PROFILE_UPDATED'
  | 'VALIDATION_FAILED'
  | 'REPORT_GENERATED'
  | 'SESSION_COMPLETED'
  | 'SESSION_ABANDONED'
  | 'API_RETRY'
  | 'AI_ERROR';

export class Telemetry {
  static trackEvent(event: EventName, metadata?: Record<string, any>) {
    // In production, this pushes to PostHog, Mixpanel, or custom DB
    console.log(`[Analytics Event]: ${event}`, metadata || {});
  }
}
