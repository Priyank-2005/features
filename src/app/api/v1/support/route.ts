import { NextResponse } from 'next/server';
import { SupportEngine } from '@/lib/ai/features/support/engines/SupportEngine';
import { prisma } from '@/lib/prisma';

const engine = new SupportEngine();

export async function POST(req: Request) {
  try {
    const { message, sessionId, userId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      // Create a new session if not provided
      const newSession = await prisma.session.create({
        data: {
          feature: 'SUPPORT',
          promptVersion: 'v1.0.0',
          userId: userId || null
        }
      });
      currentSessionId = newSession.id;
    }

    const response = await engine.processMessage(currentSessionId, userId || null, message);

    return NextResponse.json({
      sessionId: currentSessionId,
      ...response
    });
  } catch (error: any) {
    console.error('[Support API Error]:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing the support message.' },
      { status: 500 }
    );
  }
}
