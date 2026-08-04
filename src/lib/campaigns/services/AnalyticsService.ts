import { prisma } from '@/lib/prisma';

export default class AnalyticsService {
  static async recordEvent(campaignId: string, recipientId: string, eventType: string, metadata?: any) {
    return await prisma.$transaction(async (tx) => {
      const event = await tx.emailEvent.create({
        data: {
          campaignId,
          recipientId,
          eventType,
          metadata: metadata || {},
        },
      });

      const recipientUpdateStatusMap: Record<string, string> = {
        'DELIVERED': 'DELIVERED',
        'OPENED': 'OPENED',
        'CLICKED': 'CLICKED',
        'BOUNCED': 'BOUNCED',
        'UNSUBSCRIBED': 'UNSUBSCRIBED',
        'FAILED': 'FAILED'
      };

      if (recipientUpdateStatusMap[eventType]) {
        await tx.campaignRecipient.update({
          where: { id: recipientId },
          data: { status: recipientUpdateStatusMap[eventType] },
        });
      }

      // We might want to update campaign counters here based on the event
      const incrementMap: Record<string, string> = {
        'DELIVERED': 'deliveredCount',
        'OPENED': 'openCount',
        'CLICKED': 'clickCount',
        'BOUNCED': 'bounceCount',
        'UNSUBSCRIBED': 'unsubscribeCount',
      };
      
      const counterField = incrementMap[eventType];
      if (counterField) {
        await tx.campaign.update({
          where: { id: campaignId },
          data: { [counterField]: { increment: 1 } },
        });
      }

      return event;
    });
  }

  static async getCampaignStats(campaignId: string) {
    const events = await prisma.emailEvent.findMany({
      where: { campaignId },
    });

    let totalSent = 0;
    let totalDelivered = 0;
    let totalOpened = 0;
    let totalClicked = 0;
    let totalFailed = 0;
    let totalBounced = 0;
    let totalUnsubscribed = 0;

    const uniqueOpensSet = new Set();
    const uniqueClicksSet = new Set();

    events.forEach(e => {
      switch (e.eventType) {
        case 'SENT': totalSent++; break;
        case 'DELIVERED': totalDelivered++; break;
        case 'OPENED': 
          totalOpened++; 
          uniqueOpensSet.add(e.recipientId);
          break;
        case 'CLICKED': 
          totalClicked++; 
          uniqueClicksSet.add(e.recipientId);
          break;
        case 'FAILED': totalFailed++; break;
        case 'BOUNCED': totalBounced++; break;
        case 'UNSUBSCRIBED': totalUnsubscribed++; break;
      }
    });

    const uniqueOpens = uniqueOpensSet.size;
    const uniqueClicks = uniqueClicksSet.size;
    const actualSent = totalSent || 1; // prevent div by zero
    
    return {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalFailed,
      totalBounced,
      totalUnsubscribed,
      uniqueOpens,
      uniqueClicks,
      openRate: (uniqueOpens / actualSent) * 100,
      clickRate: (uniqueClicks / actualSent) * 100,
      clickToOpenRate: uniqueOpens > 0 ? (uniqueClicks / uniqueOpens) * 100 : 0,
      bounceRate: (totalBounced / actualSent) * 100,
      unsubscribeRate: (totalUnsubscribed / actualSent) * 100,
      deliveryRate: (totalDelivered / actualSent) * 100,
    };
  }

  static async getTimelineData(campaignId: string) {
    const events = await prisma.emailEvent.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'asc' },
    });

    const hourlyMap: Record<string, { time: string; opens: number; clicks: number }> = {};

    events.forEach(e => {
      if (e.eventType !== 'OPENED' && e.eventType !== 'CLICKED') return;
      
      const hour = new Date(e.createdAt).toISOString().substring(0, 13) + ':00:00.000Z';
      if (!hourlyMap[hour]) {
        hourlyMap[hour] = { time: hour, opens: 0, clicks: 0 };
      }

      if (e.eventType === 'OPENED') hourlyMap[hour].opens++;
      if (e.eventType === 'CLICKED') hourlyMap[hour].clicks++;
    });

    return Object.values(hourlyMap).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }

  static async getTopLinks(campaignId: string) {
    const clickEvents = await prisma.emailEvent.findMany({
      where: { campaignId, eventType: 'CLICKED' },
    });

    const linkMap: Record<string, number> = {};

    clickEvents.forEach(e => {
      const metadata = e.metadata as any;
      if (metadata && metadata.link) {
        linkMap[metadata.link] = (linkMap[metadata.link] || 0) + 1;
      }
    });

    return Object.entries(linkMap)
      .map(([link, clicks]) => ({ link, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);
  }
}
