import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Click tracking redirect - records click then redirects to original URL
export async function GET(
  req: Request,
  { params }: { params: Promise<{ recipientId: string }> }
) {
  try {
    const { recipientId } = await params;
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
    }

    // Record click event (fire-and-forget)
    prisma.campaignRecipient.findUnique({ where: { id: recipientId } }).then(async (recipient) => {
      if (recipient) {
        if (!recipient.clickedAt) {
          await prisma.campaignRecipient.update({
            where: { id: recipientId },
            data: { status: 'CLICKED', clickedAt: new Date() },
          });

          await prisma.campaign.update({
            where: { id: recipient.campaignId },
            data: { totalClicked: { increment: 1 } },
          });
        }

        await prisma.emailEvent.create({
          data: {
            campaignId: recipient.campaignId,
            recipientId: recipientId,
            eventType: 'CLICKED',
            metadata: JSON.stringify({ url }),
          },
        });
      }
    }).catch((err) => {
      console.error('[Tracking Click Error]:', err);
    });

    // Redirect to actual URL
    return NextResponse.redirect(url);
  } catch (error) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    if (url) return NextResponse.redirect(url);
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
  }
}
