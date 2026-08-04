import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ScheduleBody = z.object({
  scheduledAt: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, 'Scheduled date must be a valid future date'),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { scheduledAt } = ScheduleBody.parse(body);

    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    if (campaign.status !== 'DRAFT' && campaign.status !== 'PAUSED') {
      return NextResponse.json({ error: 'Only draft or paused campaigns can be scheduled' }, { status: 400 });
    }

    const recipientCount = await prisma.campaignRecipient.count({ where: { campaignId: id } });
    if (recipientCount === 0) {
      return NextResponse.json({ error: 'Campaign has no recipients' }, { status: 400 });
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        status: 'SCHEDULED',
        scheduledAt: new Date(scheduledAt),
        totalRecipients: recipientCount,
        activities: {
          create: {
            action: 'SCHEDULED',
            description: `Campaign scheduled for ${new Date(scheduledAt).toLocaleString()}`,
          },
        },
      },
    });

    return NextResponse.json({ campaign: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: (error as any).errors }, { status: 400 });
    }
    console.error('[Campaign Schedule Error]:', error);
    return NextResponse.json({ error: 'Failed to schedule campaign' }, { status: 500 });
  }
}

// Cancel a scheduled campaign
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    if (campaign.status !== 'SCHEDULED') {
      return NextResponse.json({ error: 'Only scheduled campaigns can be unscheduled' }, { status: 400 });
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        status: 'DRAFT',
        scheduledAt: null,
        activities: {
          create: {
            action: 'CANCELLED',
            description: 'Scheduled campaign was cancelled and returned to draft',
          },
        },
      },
    });

    return NextResponse.json({ campaign: updated });
  } catch (error: any) {
    console.error('[Campaign Unschedule Error]:', error);
    return NextResponse.json({ error: 'Failed to unschedule campaign' }, { status: 500 });
  }
}
