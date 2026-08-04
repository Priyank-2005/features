import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { template: true, _count: { select: { recipients: true } } },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const newCampaign = await prisma.campaign.create({
      data: {
        name: `Copy of ${campaign.name}`,
        subject: campaign.subject,
        description: campaign.description,
        templateId: campaign.templateId,
        fromName: campaign.fromName,
        fromEmail: campaign.fromEmail,
        replyTo: campaign.replyTo,
        tags: campaign.tags,
        status: 'DRAFT',
        activities: {
          create: {
            action: 'CREATED',
            description: `Duplicated from campaign "${campaign.name}"`,
          },
        },
      },
      include: { template: true },
    });

    return NextResponse.json({ campaign: newCampaign }, { status: 201 });
  } catch (error: any) {
    console.error('[Campaign Duplicate Error]:', error);
    return NextResponse.json({ error: 'Failed to duplicate campaign' }, { status: 500 });
  }
}
