import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ recipientId: string }> }
) {
  try {
    const { recipientId } = await params;
    const { searchParams } = new URL(req.url);
    const reason = searchParams.get('reason') || 'User requested unsubscribe';

    const recipient = await prisma.campaignRecipient.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return new Response(unsubscribeHtml('Email not found.', false), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Add to global unsubscribe list
    const existing = await prisma.unsubscribe.findUnique({
      where: { email: recipient.email },
    });

    if (!existing) {
      await prisma.unsubscribe.create({
        data: {
          email: recipient.email,
          reason,
          campaignId: recipient.campaignId,
        },
      });
    }

    // Update recipient status
    await prisma.campaignRecipient.update({
      where: { id: recipientId },
      data: { status: 'UNSUBSCRIBED' },
    });

    // Record event
    await prisma.emailEvent.create({
      data: {
        campaignId: recipient.campaignId,
        recipientId: recipientId,
        eventType: 'UNSUBSCRIBED',
        metadata: JSON.stringify({ reason }),
      },
    });

    return new Response(unsubscribeHtml('You have been successfully unsubscribed.', true), {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error: any) {
    console.error('[Unsubscribe Error]:', error);
    return new Response(unsubscribeHtml('An error occurred. Please try again.', false), {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

function unsubscribeHtml(message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Unsubscribe - Knowith Capital</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0a0a0a; color: #ededed; }
    .card { text-align: center; padding: 3rem; background: #151515; border: 1px solid #2e2e3e; border-radius: 1rem; max-width: 450px; }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    h1 { font-size: 1.25rem; margin: 0.5rem 0; }
    p { color: #9ca3af; font-size: 0.875rem; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '✓' : '✗'}</div>
    <h1>${message}</h1>
    <p>Knowith Capital respects your email preferences.</p>
  </div>
</body>
</html>`;
}
