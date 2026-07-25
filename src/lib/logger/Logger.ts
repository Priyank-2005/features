export class Logger {
  static info(message: string, context?: Record<string, any>) {
    console.info(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message, ...context }));
  }

  static error(message: string, error?: any, context?: Record<string, any>) {
    console.error(JSON.stringify({ 
      level: 'ERROR', 
      timestamp: new Date().toISOString(), 
      message, 
      error: error?.message || String(error),
      stack: error?.stack,
      ...context 
    }));
  }

  static logAITokens(requestId: string, sessionId: string, model: string, usage: any, latencyMs: number) {
    this.info("AI Request Fulfilled", {
      type: "AI_METRICS",
      requestId,
      sessionId,
      model,
      inputTokens: usage?.prompt_tokens,
      outputTokens: usage?.completion_tokens,
      totalTokens: usage?.total_tokens,
      latencyMs
    });
  }
}
