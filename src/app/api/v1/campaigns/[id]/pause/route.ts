import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status === 'SENDING') {
      // Pause a sending campaign
      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          status: 'PAUSED',
          activities: {
            create: { action: 'PAUSED', description: 'Campaign paused during sending' },
          },
        },
      });
      return NextResponse.json({ campaign: updated });
    }

    if (campaign.status === 'SCHEDULED') {
      // Pause a scheduled campaign
      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          status: 'PAUSED',
          activities: {
            create: { action: 'PAUSED', description: 'Scheduled campaign paused' },
          },
        },
      });
      return NextResponse.json({ campaign: updated });
    }

    if (campaign.status === 'PAUSED') {
      // Resume a paused campaign
      const updated = await prisma.campaign.update({
        where: { id },
        data: {
          status: campaign.scheduledAt ? 'SCHEDULED' : 'DRAFT',
          activities: {
            create: { action: 'RESUMED', description: 'Campaign resumed' },
          },
        },
      });
      return NextResponse.json({ campaign: updated });
    }

    return NextResponse.json(
      { error: 'Campaign can only be paused/resumed when SENDING, SCHEDULED, or PAUSED' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[Campaign Pause Error]:', error);
    return NextResponse.json({ error: 'Failed to pause/resume campaign' }, { status: 500 });
  }
}
