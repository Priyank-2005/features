import { prisma } from '@/lib/prisma';
import { getEmailProvider } from '../providers/index';
import { renderMergeTags } from '../utils/mergeTagEngine';

export default class EmailQueueService {
  static async processCampaign(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) throw new Error('Campaign not found');

    const recipients = await prisma.campaignRecipient.findMany({
      where: { campaignId, status: 'PENDING' },
    });

    let sent = 0;
    let failed = 0;

    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (recipient) => {
        try {
          const provider = getEmailProvider();
          
          const htmlContent = renderMergeTags(campaign.renderedHtml || '', {
            firstName: recipient.name?.split(' ')[0] || '',
            lastName: recipient.name?.split(' ').slice(1).join(' ') || '',
            email: recipient.email,
            // Additional variables mapping
          });

          const subject = renderMergeTags(campaign.renderedSubject || '', {
            firstName: recipient.name?.split(' ')[0] || '',
            lastName: recipient.name?.split(' ').slice(1).join(' ') || '',
          });

          await provider.send({
            to: recipient.email,
            subject,
            html: htmlContent,
            fromName: campaign.fromName,
            from: campaign.fromEmail,
          });

          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: { status: 'SENT', sentAt: new Date() },
          });
          
          await prisma.emailEvent.create({
            data: {
              campaignId,
              recipientId: recipient.id,
              eventType: 'SENT',
            }
          });

          sent++;
        } catch (error) {
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: { 
              status: 'FAILED', 
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
              retryCount: { increment: 1 } 
            },
          });
          failed++;
        }
      }));

      // 1-second delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: failed === recipients.length && recipients.length > 0 ? 'FAILED' : 'COMPLETED',
        totalDelivered: { increment: sent },
        totalFailed: { increment: failed },
      }
    });

    await prisma.campaignActivity.create({
      data: {
        campaignId,
        action: 'PROCESSED',
        description: `Campaign processed: ${sent} sent, ${failed} failed`,
      }
    });
  }

  static async retryFailed(campaignId: string) {
    const recipients = await prisma.campaignRecipient.findMany({
      where: { 
        campaignId, 
        status: 'FAILED',
        retryCount: { lt: 3 }
      },
    });

    if (recipients.length === 0) return 0;

    await prisma.campaignRecipient.updateMany({
      where: {
        id: { in: recipients.map(r => r.id) }
      },
      data: { status: 'PENDING' }
    });

    await prisma.campaignActivity.create({
      data: {
        campaignId,
        action: 'RETRY',
        description: `Retrying ${recipients.length} failed emails`,
      }
    });

    // Fire and forget processing
    this.processCampaign(campaignId).catch(console.error);
    
    return recipients.length;
  }

  static async getCampaignProgress(campaignId: string) {
    const counts = await prisma.campaignRecipient.groupBy({
      by: ['status'],
      where: { campaignId },
      _count: true,
    });

    const statusCounts = counts.reduce((acc, curr) => {
      acc[curr.status] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    const completed = (statusCounts['SENT'] || 0) + (statusCounts['DELIVERED'] || 0) + (statusCounts['OPENED'] || 0) + (statusCounts['CLICKED'] || 0);
    
    return {
      progressPercentage: total === 0 ? 0 : Math.round((completed / total) * 100),
      statusCounts,
      total,
    };
  }
}
