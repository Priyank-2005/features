/**
 * GroqService
 * 
 * Centralized service layer for interacting with the Groq API.
 * Handles rate limiting, retries, cost tracking, and structured JSON outputs.
 */

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqOptions {
  model?: string;
  temperature?: number;
  jsonMode?: boolean;
}

export class GroqService {
  private static apiKey = process.env.GROK_API_KEY; // Reusing the same key env var for now
  private static baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  
  // Default to Llama 3.3 for all production inference
  private static defaultModel = 'llama-3.1-8b-instant';

  /**
   * Generates a structured JSON response from Groq.
   * Ensures the system prompt enforces a valid JSON structure.
   */
  static async generateStructuredOutput<T>(
    systemPrompt: string,
    messages: GroqMessage[],
    options: GroqOptions = {}
  ): Promise<{ data: T; usage: any }> {
    
    // Auto-inject JSON instruction to prevent schema hallucinations
    const enhancedSystemPrompt = `${systemPrompt}\n\nIMPORTANT: You must respond in strictly valid JSON format.`;
    
    const payload = {
      model: options.model || this.defaultModel,
      messages: [
        { role: 'system', content: enhancedSystemPrompt },
        ...messages
      ],
      temperature: options.temperature ?? 0.3, // Lower temp for more deterministic JSON
      response_format: options.jsonMode !== false ? { type: 'json_object' } : undefined,
    };

    return this.executeRequest<T>(payload);
  }

  /**
   * Internal request executor with basic retry logic.
   */
  private static async executeRequest<T>(payload: any, retries = 2): Promise<{ data: T; usage: any }> {
    if (!this.apiKey) {
      throw new Error("GROK_API_KEY environment variable is not set.");
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Groq API Error (${response.status}): ${errorData}`);
      }

      const responseData = await response.json();
      
      const content = responseData.choices[0]?.message?.content;
      const usage = responseData.usage;
      
      // If we requested JSON, parse it
      if (payload.response_format?.type === 'json_object') {
        try {
          const parsedData = JSON.parse(content) as T;
          return { data: parsedData, usage };
        } catch (parseError) {
          throw new Error(`Failed to parse Groq JSON response: ${content}`);
        }
      }

      return { data: content as any, usage };

    } catch (error) {
      if (retries > 0) {
        console.warn(`Groq request failed. Retrying... (${retries} left)`);
        // Simple backoff
        await new Promise(res => setTimeout(res, 1000));
        return this.executeRequest<T>(payload, retries - 1);
      }
      throw error;
    }
  }
}
