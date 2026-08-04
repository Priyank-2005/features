import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const TestEmailBody = z.object({
  email: z.string().email('Valid email address required'),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { email } = TestEmailBody.parse(body);

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { template: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    if (!campaign.template?.htmlContent) {
      return NextResponse.json({ error: 'Campaign has no template' }, { status: 400 });
    }

    const { getEmailProvider } = await import('@/lib/campaigns/providers');
    const { renderMergeTags } = await import('@/lib/campaigns/utils/mergeTagEngine');

    const provider = getEmailProvider();

    const html = renderMergeTags(campaign.template.htmlContent, {
      firstName: 'Test',
      lastName: 'User',
      email: email,
      campaignName: campaign.name,
      recipientId: 'test-recipient',
      campaignId: campaign.id,
    });

    const result = await provider.send({
      to: email,
      from: campaign.fromEmail,
      fromName: campaign.fromName,
      replyTo: campaign.replyTo || undefined,
      subject: `[TEST] ${campaign.subject}`,
      html,
    });

    if (result.success) {
      await prisma.campaignActivity.create({
        data: {
          campaignId: id,
          action: 'TEST_SENT',
          description: `Test email sent to ${email}`,
        },
      });
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json({ error: result.error || 'Failed to send test email' }, { status: 500 });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: (error as any).errors }, { status: 400 });
    }
    console.error('[Test Email Error]:', error);
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
  }
}
