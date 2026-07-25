import { GeminiService } from '@/lib/services/GeminiService';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, systemPrompt, jsonSchema } = body;

    const { data } = await GeminiService.generateStructuredOutput<any>(
      systemPrompt || 'You are a helpful AI assistant.',
      messages,
      { 
        model: 'gemini-3.5-flash',
        temperature: 0.7,
        jsonMode: !!jsonSchema
      }
    );

    return NextResponse.json({ choices: [{ message: { content: typeof data === 'string' ? data : JSON.stringify(data) } }] });
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
