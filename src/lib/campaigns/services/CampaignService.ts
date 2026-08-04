import { prisma } from '@/lib/prisma';

export default class CampaignService {
  static async create(data: any) {
    return await prisma.$transaction(async (tx) => {
      const campaign = await tx.campaign.create({
        data,
      });

      await tx.campaignActivity.create({
        data: {
          campaignId: campaign.id,
          action: 'CREATED',
          description: 'Campaign was created',
        },
      });

      return campaign;
    });
  }

  static async update(id: string, data: any) {
    return await prisma.campaign.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.campaignRecipient.deleteMany({
        where: { campaignId: id },
      });
      await tx.campaignActivity.deleteMany({
        where: { campaignId: id },
      });
      await tx.emailEvent.deleteMany({
        where: { campaignId: id },
      });
      return await tx.campaign.delete({
        where: { id },
      });
    });
  }

  static async getById(id: string) {
    return await prisma.campaign.findUnique({
      where: { id },
      include: {
        template: true,
        _count: {
          select: { recipients: true },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  static async list(params: { page?: number; limit?: number; status?: string; search?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { subject: { contains: params.search } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.campaign.count({ where }),
      prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, page, limit, data };
  }

  static async duplicate(id: string) {
    const original = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!original) {
      throw new Error('Campaign not found');
    }

    return await prisma.$transaction(async (tx) => {
      const clone = await tx.campaign.create({
        data: {
          name: `Copy of ${original.name}`,
          subject: original.subject,
          fromName: original.fromName,
          fromEmail: original.fromEmail,
          templateId: original.templateId,
          status: 'DRAFT',
        },
      });

      await tx.campaignActivity.create({
        data: {
          campaignId: clone.id,
          action: 'DUPLICATED',
          description: `Campaign duplicated from ${original.name}`,
        },
      });

      return clone;
    });
  }

  static async schedule(id: string, scheduledAt: Date) {
    return await prisma.$transaction(async (tx) => {
      const campaign = await tx.campaign.update({
        where: { id },
        data: {
          status: 'SCHEDULED',
          scheduledAt,
        },
      });

      await tx.campaignActivity.create({
        data: {
          campaignId: id,
          action: 'SCHEDULED',
          description: `Campaign scheduled for ${scheduledAt.toISOString()}`,
        },
      });

      return campaign;
    });
  }

  static async pause(id: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign || !['SCHEDULED', 'SENDING'].includes(campaign.status)) {
      throw new Error('Only SCHEDULED or SENDING campaigns can be paused');
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.campaign.update({
        where: { id },
        data: { status: 'PAUSED' },
      });

      await tx.campaignActivity.create({
        data: {
          campaignId: id,
          action: 'PAUSED',
          description: 'Campaign was paused',
        },
      });

      return updated;
    });
  }

  static async resume(id: string) {
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.campaign.update({
        where: { id },
        data: { status: 'SCHEDULED' },
      });

      await tx.campaignActivity.create({
        data: {
          campaignId: id,
          action: 'RESUMED',
          description: 'Campaign was resumed',
        },
      });

      return updated;
    });
  }

  static async cancel(id: string) {
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.campaign.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      await tx.campaignActivity.create({
        data: {
          campaignId: id,
          action: 'CANCELLED',
          description: 'Campaign was cancelled',
        },
      });

      return updated;
    });
  }

  static async snapshotAndSend(id: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { template: true },
    });

    if (!campaign) throw new Error('Campaign not found');

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.campaign.update({
        where: { id },
        data: {
          status: 'SENDING',
          renderedHtml: campaign.template?.htmlContent || '',
          renderedSubject: campaign.subject || '',
        },
      });

      await tx.campaignActivity.create({
        data: {
          campaignId: id,
          action: 'SENDING',
          description: 'Campaign snapshot created and sending started',
        },
      });

      return updated;
    });
  }
}
