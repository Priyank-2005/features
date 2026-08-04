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
      include: { template: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    if (campaign.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Only draft campaigns can be sent' }, { status: 400 });
    }

    const recipientCount = await prisma.campaignRecipient.count({
      where: { campaignId: id },
    });
    if (recipientCount === 0) {
      return NextResponse.json({ error: 'Campaign has no recipients' }, { status: 400 });
    }

    if (!campaign.template?.htmlContent) {
      return NextResponse.json({ error: 'Campaign has no template with HTML content' }, { status: 400 });
    }

    // Snapshot template at send time
    await prisma.campaign.update({
      where: { id },
      data: {
        status: 'SENDING',
        renderedHtml: campaign.template.htmlContent,
        renderedSubject: campaign.subject,
        sentAt: new Date(),
        totalRecipients: recipientCount,
        activities: {
          create: {
            action: 'SENDING_STARTED',
            description: `Campaign sending started to ${recipientCount} recipients`,
          },
        },
      },
    });

    // Process emails synchronously for Vercel serverless environments
    try {
      await processEmails(id);
    } catch (err) {
      console.error(`[Campaign Send Error] Campaign ${id}:`, err);
    }

    return NextResponse.json({ success: true, message: 'Campaign is being sent', recipientCount });
  } catch (error: any) {
    console.error('[Campaign Send Error]:', error);
    return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 });
  }
}

async function processEmails(campaignId: string) {
  try {
    const { getEmailProvider } = await import('@/lib/campaigns/providers');
    const { renderMergeTags } = await import('@/lib/campaigns/utils/mergeTagEngine');

    const provider = getEmailProvider();
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || !campaign.renderedHtml) return;

    const recipients = await prisma.campaignRecipient.findMany({
      where: { campaignId, status: 'PENDING' },
    });

    const BATCH_SIZE = 10;
    let delivered = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);

      for (const recipient of batch) {
        try {
          const html = renderMergeTags(campaign.renderedHtml!, {
            firstName: recipient.name?.split(' ')[0] || '',
            lastName: recipient.name?.split(' ').slice(1).join(' ') || '',
            email: recipient.email,
            campaignName: campaign.name,
            recipientId: recipient.id,
            campaignId: campaign.id,
          });

          const result = await provider.send({
            to: recipient.email,
            from: campaign.fromEmail,
            fromName: campaign.fromName,
            replyTo: campaign.replyTo || undefined,
            subject: campaign.renderedSubject || campaign.subject,
            html,
          });

          if (result.success) {
            await prisma.campaignRecipient.update({
              where: { id: recipient.id },
              data: { status: 'SENT', sentAt: new Date() },
            });
            delivered++;
          } else {
            await prisma.campaignRecipient.update({
              where: { id: recipient.id },
              data: {
                status: 'FAILED',
                errorMessage: result.error || 'Unknown error',
                retryCount: { increment: 1 },
              },
            });
            failed++;
          }
        } catch (err: any) {
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: {
              status: 'FAILED',
              errorMessage: err.message || 'Send error',
              retryCount: { increment: 1 },
            },
          });
          failed++;
        }
      }

      // Update counters after each batch
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { totalDelivered: delivered, totalFailed: failed },
      });

      // Rate limit: wait 1 second between batches
      if (i + BATCH_SIZE < recipients.length) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    // Mark campaign as completed
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: failed === recipients.length ? 'FAILED' : 'COMPLETED',
        completedAt: new Date(),
        totalDelivered: delivered,
        totalFailed: failed,
        activities: {
          create: {
            action: failed === recipients.length ? 'FAILED' : 'COMPLETED',
            description: `Campaign ${failed === recipients.length ? 'failed' : 'completed'}. Delivered: ${delivered}, Failed: ${failed}`,
          },
        },
      },
    });
  } catch (error) {
    console.error('[ProcessEmails Error]:', error);
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'FAILED',
        activities: {
          create: {
            action: 'FAILED',
            description: `Campaign failed with error: ${(error as Error).message}`,
          },
        },
      },
    });
  }
}
