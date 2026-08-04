import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tracking pixel for email opens - returns a 1x1 transparent GIF
export async function GET(
  req: Request,
  { params }: { params: Promise<{ recipientId: string }> }
) {
  try {
    const { recipientId } = await params;

    // Record the open event (fire-and-forget, don't block response)
    prisma.campaignRecipient.findUnique({ where: { id: recipientId } }).then(async (recipient) => {
      if (recipient && !recipient.openedAt) {
        await prisma.campaignRecipient.update({
          where: { id: recipientId },
          data: { status: 'OPENED', openedAt: new Date() },
        });

        await prisma.campaign.update({
          where: { id: recipient.campaignId },
          data: { totalOpened: { increment: 1 } },
        });

        await prisma.emailEvent.create({
          data: {
            campaignId: recipient.campaignId,
            recipientId: recipientId,
            eventType: 'OPENED',
          },
        });
      }
    }).catch((err) => {
      console.error('[Tracking Open Error]:', err);
    });

    // Return 1x1 transparent GIF
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new Response(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    // Always return the pixel even if tracking fails
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    return new Response(pixel, {
      headers: { 'Content-Type': 'image/gif' },
    });
  }
}
