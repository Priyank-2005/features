import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GeminiOptions {
  model?: string;
  temperature?: number;
  jsonMode?: boolean;
}

export class GeminiService {
  private static apiKey = process.env.GEMINI_API_KEY || '';
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  
  private static defaultModel = 'gemini-3.5-flash';

  /**
   * Generates a structured JSON response from Gemini.
   */
  static async generateStructuredOutput<T>(
    systemPrompt: string,
    messages: GeminiMessage[],
    options: GeminiOptions = {}
  ): Promise<{ data: T; usage: any }> {
    
    const enhancedSystemPrompt = `${systemPrompt}\n\nIMPORTANT: You must respond in strictly valid JSON format.`;
    
    const model = this.genAI.getGenerativeModel({ 
      model: options.model || this.defaultModel,
      systemInstruction: enhancedSystemPrompt
    });

    const formattedMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    return this.executeRequest<T>(model, formattedMessages, options);
  }

  /**
   * Internal request executor with basic retry logic.
   */
  private static async executeRequest<T>(model: any, contents: any[], options: GeminiOptions, retries = 2): Promise<{ data: T; usage: any }> {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }

    try {
      const result = await model.generateContent({
        contents,
        generationConfig: {
          temperature: options.temperature ?? 0.7,
        }
      });

      const responseText = result.response.text();
      const usage = result.response.usageMetadata;
      
      // If we requested JSON, parse it
      if (options.jsonMode !== false) {
        try {
          const cleanText = responseText.replace(/^```json/mi, '').replace(/```$/m, '').trim();
          const parsedData = JSON.parse(cleanText) as T;
          return { data: parsedData, usage };
        } catch (parseError) {
          throw new Error(`Failed to parse Gemini JSON response: ${responseText}`);
        }
      }

      return { data: responseText as any, usage };

    } catch (error) {
      if (retries > 0) {
        console.warn(`Gemini request failed. Retrying... (${retries} left)`);
        await new Promise(res => setTimeout(res, 1000));
        return this.executeRequest<T>(model, contents, options, retries - 1);
      }
      throw error;
    }
  }
}
