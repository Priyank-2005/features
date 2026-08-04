import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateCampaignBody = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  description: z.string().optional(),
  templateId: z.string().optional(),
  fromName: z.string().optional(),
  fromEmail: z.string().email().optional(),
  replyTo: z.string().email().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        template: true,
        recipients: {
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        _count: {
          select: { recipients: true },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Calculate analytics
    const recipientStats = await prisma.campaignRecipient.groupBy({
      by: ['status'],
      where: { campaignId: id },
      _count: true,
    });

    const stats = recipientStats.reduce((acc: Record<string, number>, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {});

    const totalSent = campaign.totalRecipients;
    const delivered = campaign.totalDelivered;
    const opened = campaign.totalOpened;
    const clicked = campaign.totalClicked;

    const analytics = {
      totalRecipients: campaign.totalRecipients,
      totalDelivered: delivered,
      totalOpened: opened,
      totalClicked: clicked,
      totalFailed: campaign.totalFailed,
      totalBounced: campaign.totalBounced,
      deliveryRate: totalSent > 0 ? ((delivered / totalSent) * 100).toFixed(1) : '0',
      openRate: delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : '0',
      clickRate: delivered > 0 ? ((clicked / delivered) * 100).toFixed(1) : '0',
      clickToOpenRate: opened > 0 ? ((clicked / opened) * 100).toFixed(1) : '0',
      bounceRate: totalSent > 0 ? ((campaign.totalBounced / totalSent) * 100).toFixed(1) : '0',
      recipientStatusBreakdown: stats,
    };

    return NextResponse.json({ campaign, analytics });
  } catch (error: any) {
    console.error('[Campaign Get Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = UpdateCampaignBody.parse(body);

    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    if (existing.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Only draft campaigns can be edited' }, { status: 400 });
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...data,
        tags: data.tags ? JSON.stringify(data.tags) : undefined,
      },
      include: { template: true },
    });

    return NextResponse.json({ campaign });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: (error as any).errors }, { status: 400 });
    }
    console.error('[Campaign Update Error]:', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Delete in correct order due to foreign keys
    await prisma.emailEvent.deleteMany({ where: { campaignId: id } });
    await prisma.campaignActivity.deleteMany({ where: { campaignId: id } });
    await prisma.campaignRecipient.deleteMany({ where: { campaignId: id } });
    await prisma.campaign.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Campaign Delete Error]:', error);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}
