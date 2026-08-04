import { prisma } from '@/lib/prisma';

export default class RecipientService {
  static async getFilteredLeads(filters: {
    city?: string;
    investmentRange?: string;
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const where: any = {
      email: {
        notIn: (await prisma.unsubscribe.findMany({ select: { email: true } })).map((u: any) => u.email),
      },
    };

    if (filters.city) where.city = filters.city;
    if (filters.investmentRange) where.investmentRange = filters.investmentRange;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search } },
        { lastName: { contains: filters.search } },
        { email: { contains: filters.search } },
      ];
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    return await prisma.lead.findMany({
      where,
    });
  }

  static async addRecipientsFromLeads(campaignId: string, leadIds: string[]) {
    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds } },
    });

    const existingRecipients = await prisma.campaignRecipient.findMany({
      where: { campaignId },
      select: { email: true },
    });
    const existingEmails = new Set(existingRecipients.map(r => r.email));

    const toCreate = leads
      .filter(l => l.email !== null && !existingEmails.has(l.email))
      .map(l => ({
        campaignId,
        leadId: l.id,
        email: l.email!,
        name: l.name,
        status: 'PENDING',
      }));

    if (toCreate.length > 0) {
      await prisma.$transaction([
        prisma.campaignRecipient.createMany({
          data: toCreate,
        }),
        prisma.campaignActivity.create({
          data: {
            campaignId,
            action: 'RECIPIENTS_ADDED',
            description: `Added ${toCreate.length} recipients to campaign`,
          },
        }),
      ]);
    }

    return toCreate.length;
  }

  static async removeRecipients(campaignId: string, recipientIds: string[]) {
    await prisma.campaignRecipient.deleteMany({
      where: {
        id: { in: recipientIds },
        campaignId,
      },
    });
  }

  static async getRecipientsByCampaign(campaignId: string, pagination: { page?: number; limit?: number }) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 50;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      prisma.campaignRecipient.count({ where: { campaignId } }),
      prisma.campaignRecipient.findMany({
        where: { campaignId },
        skip,
        take: limit,
      }),
    ]);

    return { total, page, limit, data };
  }

  static async healthCheck(campaignId: string) {
    const recipients = await prisma.campaignRecipient.findMany({
      where: { campaignId },
    });

    const unsubscribed = await prisma.unsubscribe.findMany({
      select: { email: true },
    });
    const suppressedSet = new Set(unsubscribed.map(u => u.email));

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let duplicateEmails = 0;
    let invalidEmails = 0;
    let suppressedEmails = 0;
    
    const seen = new Set();

    recipients.forEach(r => {
      if (seen.has(r.email)) duplicateEmails++;
      else seen.add(r.email);

      if (!emailRegex.test(r.email)) invalidEmails++;
      if (suppressedSet.has(r.email)) suppressedEmails++;
    });

    const validRecipients = recipients.length - duplicateEmails - invalidEmails - suppressedEmails;

    return {
      totalRecipients: recipients.length,
      duplicateEmails,
      invalidEmails,
      suppressedEmails,
      validRecipients: validRecipients < 0 ? 0 : validRecipients,
    };
  }

  static async createSegment(data: any) {
    return await prisma.recipientSegment.create({
      data,
    });
  }

  static async listSegments() {
    return await prisma.recipientSegment.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async deleteSegment(id: string) {
    return await prisma.recipientSegment.delete({
      where: { id },
    });
  }

  static async applySegment(segmentId: string) {
    const segment = await prisma.recipientSegment.findUnique({
      where: { id: segmentId },
    });

    if (!segment) throw new Error('Segment not found');

    const filters = segment.filters as any;
    return await this.getFilteredLeads(filters);
  }
}
