import { prisma } from '@/lib/prisma';
import CampaignService from './CampaignService';
import EmailQueueService from './EmailQueueService';

export default class SchedulerService {
  static async checkAndExecuteScheduled() {
    const now = new Date();
    
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          lte: now,
        }
      }
    });

    for (const campaign of campaigns) {
      try {
        await CampaignService.snapshotAndSend(campaign.id);
        
        // Non-blocking processing
        EmailQueueService.processCampaign(campaign.id).catch(err => {
          console.error(`Error processing campaign ${campaign.id}:`, err);
        });
      } catch (error) {
        console.error(`Error executing scheduled campaign ${campaign.id}:`, error);
        
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'FAILED' }
        });
        
        await prisma.campaignActivity.create({
          data: {
            campaignId: campaign.id,
            action: 'ERROR',
            description: `Scheduled execution failed: ${error instanceof Error ? error.message : 'Unknown'}`,
          }
        });
      }
    }
  }

  static async getUpcomingScheduled() {
    return await prisma.campaign.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          gt: new Date(),
        }
      },
      orderBy: {
        scheduledAt: 'asc',
      }
    });
  }
}
