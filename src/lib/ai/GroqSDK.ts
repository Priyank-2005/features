import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export interface SDKOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class GroqSDK {
  private static apiKey = process.env.GROK_API_KEY; // Actually Groq key in this env
  private static baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  
  // Latest Llama 3.3 for heavy lifting, Llama 3.1 8B for fast intent classification
  private static defaultModel = 'llama-3.1-8b-instant';
  private static fastModel = 'llama-3.1-8b-instant';

  /**
   * generateStructuredResponse
   * Forces the LLM to output valid JSON matching the provided Zod schema.
   */
  static async generateStructuredResponse<T>(
    systemPrompt: string,
    messages: { role: string; content: string }[],
    schema: z.ZodType<T>,
    options: SDKOptions = {}
  ): Promise<{ data: T; usage: any }> {
    
    // Auto-inject JSON instruction and exact JSON schema for Llama 3.1 8B
    const schemaString = JSON.stringify(zodToJsonSchema(schema as any), null, 2);
    const enhancedPrompt = `${systemPrompt}\n\nIMPORTANT: You must respond in strictly valid JSON format matching this exact schema:\n${schemaString}`;
    
    const payload = {
      model: options.model || this.defaultModel,
      messages: [{ role: 'system', content: enhancedPrompt }, ...messages],
      temperature: options.temperature ?? 0.1, // Low temp for structured adherence
      response_format: { type: 'json_object' },
    };

    const result = await this.executeRequest(payload);
    
    try {
      // Parse and strictly validate against the Zod schema
      const parsedData = JSON.parse(result.content);
      const validatedData = schema.parse(parsedData);
      return { data: validatedData, usage: result.usage };
    } catch (error) {
      console.error("Zod Validation Failed on Groq JSON output.");
      console.error("Raw AI Output:", result.content);
      console.error("Zod Error:", error);
      throw new Error("AI output did not match the expected schema.");
    }
  }

  /**
   * streamChat
   * Uses Server-Sent Events to stream a standard text response.
   */
  static async streamChat(
    systemPrompt: string, 
    messages: { role: string; content: string }[], 
    options: SDKOptions = {}
  ): Promise<Response> {
    const payload = {
      model: options.model || this.defaultModel,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: options.temperature ?? 0.7,
      stream: true,
    };

    return fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload)
    });
  }

  /**
   * classifyIntent
   * Extremely fast classification using an 8B model. Useful for Lead Routing (Feature 8).
   */
  static async classifyIntent(
    userMessage: string,
    intents: string[]
  ): Promise<string> {
    const prompt = `Classify the following message into one of these intents: [${intents.join(', ')}]. Respond with ONLY the exact intent name string. Nothing else.`;
    
    const payload = {
      model: this.fastModel,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0,
    };

    const result = await this.executeRequest(payload);
    return result.content.trim();
  }

  /**
   * summarize
   * Batch summarization job (e.g. for Market News).
   */
  static async summarize(text: string, options: SDKOptions = {}): Promise<string> {
    const payload = {
      model: options.model || this.defaultModel,
      messages: [
        { role: 'system', content: 'You are a master summarizer. Summarize the following text concisely.' },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
    };

    const result = await this.executeRequest(payload);
    return result.content;
  }
  
  /**
   * extractStructuredData
   * Pass 2 extraction parser (e.g. for Portfolio PDF analysis).
   */
  static async extractStructuredData<T>(text: string, schema: z.ZodType<T>): Promise<T> {
     const res = await this.generateStructuredResponse(
       "Extract the relevant financial entities from this text into JSON.",
       [{ role: "user", content: text }],
       schema,
       { temperature: 0 }
     );
     return res.data;
  }

  private static async executeRequest(payload: any, retries = 2): Promise<{ content: string; usage: any }> {
    if (!this.apiKey) throw new Error("API Key missing");

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
        throw new Error(`Groq Error: ${await response.text()}`);
      }

      const data = await response.json();
      return { 
        content: data.choices[0]?.message?.content || '', 
        usage: data.usage 
      };
    } catch (error) {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 1000));
        return this.executeRequest(payload, retries - 1);
      }
      throw error;
    }
  }
}
