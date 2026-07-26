import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface SDKOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class GeminiSDK {
  private static apiKey = process.env.GEMINI_API_KEY || '';
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  
  private static defaultModel = 'gemini-3.5-flash';
  private static fastModel = 'gemini-3.5-flash-lite';
  
  // Gemini 3.5 Flash is the latest stable version with massive free tier limits
  // Priority ordered fallback list to bypass 429 limits
  private static fallbackModels = [
    'gemini-3.5-flash',
    'gemini-flash-lite-latest',
    'gemini-flash-latest',
    'gemini-2.0-flash-001'
  ];

  public static async generateStructuredResponse<T>(
    systemPrompt: string,
    messages: { role: 'user' | 'assistant' | 'system', content: string }[],
    schema: z.ZodType<T>,
    options: { temperature?: number, model?: string } = {}
  ): Promise<{ data: T, usage: any }> {
    
    const formattedMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const schemaString = JSON.stringify(zodToJsonSchema(schema as any), null, 2);
    const enhancedPrompt = `${systemPrompt}\n\nIMPORTANT: You must respond in strictly valid JSON format matching this exact schema:\n${schemaString}`;

    // Prepend the requested model to the fallback list, removing duplicates
    const modelsToTry = options.model 
      ? Array.from(new Set([options.model, ...this.fallbackModels])) 
      : this.fallbackModels;
    
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      let attempts = 0;
      const maxAttempts = 2; // Try up to 2 times per model for parsing errors
      
      while (attempts < maxAttempts) {
        attempts++;
        let responseText = "";
        try {
          const model = this.genAI.getGenerativeModel({ model: modelName, systemInstruction: enhancedPrompt });
          
          const result = await model.generateContent({
            contents: formattedMessages,
            generationConfig: {
              temperature: options.temperature ?? 0.1,
              responseMimeType: "application/json",
            }
          });
          
          responseText = result.response.text();
          
          const cleanText = responseText.replace(/^```json/mi, '').replace(/```$/m, '').trim();
          const parsedData = JSON.parse(cleanText);
          const validatedData = schema.parse(parsedData);
          
          return { data: validatedData, usage: result.response.usageMetadata };

        } catch (error: any) {
          lastError = error;
          
          // If it's a rate limit or API error, break the while loop to fall back to the next model
          if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota') || error.message?.includes('fetch')) {
            console.warn(`[GeminiSDK] ${modelName} failed (Rate Limit/API). Falling back...`);
            await new Promise(resolve => setTimeout(resolve, 1500));
            break; // Move to the next model in modelsToTry
          }

          // If it's a Zod/parsing error, we can retry on the same model by appending the error
          if (attempts < maxAttempts) {
             console.warn(`[GeminiSDK] Parsing/Validation failed on ${modelName}, retrying (${attempts}/${maxAttempts})...`);
             formattedMessages.push({ role: 'model', parts: [{ text: responseText }] });
             formattedMessages.push({ role: 'user', parts: [{ text: `Validation failed: ${error.message}. Please fix the JSON output to strictly match the schema.` }] });
             continue;
          }

          console.error("Zod Validation Failed permanently on Gemini JSON output.");
          console.error("Raw AI Output:", responseText);
          console.error("Zod Error:", error);
          break; // Exhausted attempts for this model, move to next model (though likely it will fail there too if it's a prompt issue)
        }
      }
    }

    throw new Error(`All fallback models exhausted. Last error: ${lastError?.message}`);
  }

  /**
   * streamChat
   */
  static async streamChat(
    systemPrompt: string, 
    messages: { role: string; content: string }[], 
    options: SDKOptions = {}
  ): Promise<ReadableStream> {
    throw new Error("Not implemented yet for generic streaming in this scaffold");
  }

  /**
   * classifyIntent
   */
  static async classifyIntent(
    userMessage: string,
    intents: string[]
  ): Promise<string> {
    const prompt = `Classify the following message into one of these intents: [${intents.join(', ')}]. Respond with ONLY the exact intent name string. Nothing else.`;
    
    const model = this.genAI.getGenerativeModel({ 
      model: this.fastModel,
      systemInstruction: prompt
    });

    const result = await model.generateContent(userMessage);
    return result.response.text().trim();
  }

  /**
   * summarize
   */
  static async summarize(text: string, options: SDKOptions = {}): Promise<string> {
    const model = this.genAI.getGenerativeModel({ 
      model: options.model || this.defaultModel,
      systemInstruction: 'You are a master summarizer. Summarize the following text concisely.'
    });

    const result = await model.generateContent(text);
    return result.response.text();
  }
  
  /**
   * extractStructuredData
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
}
