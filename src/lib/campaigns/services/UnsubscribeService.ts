import { prisma } from '@/lib/prisma';

export default class UnsubscribeService {
  static async unsubscribe(email: string, reason?: string, campaignId?: string) {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.unsubscribe.findUnique({
        where: { email }
      });

      if (!existing) {
        await tx.unsubscribe.create({
          data: {
            email,
            reason,
            campaignId,
          }
        });
      }

      await tx.campaignRecipient.updateMany({
        where: { email },
        data: { status: 'UNSUBSCRIBED' }
      });

      if (campaignId) {
        const recipient = await tx.campaignRecipient.findFirst({
          where: { email, campaignId }
        });
        
        if (recipient) {
          await tx.emailEvent.create({
            data: {
              campaignId,
              recipientId: recipient.id,
              eventType: 'UNSUBSCRIBED',
              metadata: JSON.stringify({ reason })
            }
          });
        }
      }

      return true;
    });
  }

  static async isUnsubscribed(email: string) {
    const count = await prisma.unsubscribe.count({
      where: { email }
    });
    return count > 0;
  }

  static async getUnsubscribeList(pagination: { page?: number; limit?: number }) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 50;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      prisma.unsubscribe.count(),
      prisma.unsubscribe.findMany({
        skip,
        take: limit,
        orderBy: { unsubscribedAt: 'desc' }
      })
    ]);

    return { total, page, limit, data };
  }

  static async resubscribe(email: string) {
    try {
      await prisma.unsubscribe.delete({
        where: { email }
      });
      return true;
    } catch (e) {
      // Ignored if not found
      return false;
    }
  }

  static async getUnsubscribeCount() {
    return await prisma.unsubscribe.count();
  }
}
