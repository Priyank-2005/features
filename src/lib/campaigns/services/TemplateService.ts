import { prisma } from '@/lib/prisma';

export default class TemplateService {
  static async create(data: any) {
    return await prisma.emailTemplate.create({ data });
  }

  static async update(id: string, data: any) {
    return await prisma.emailTemplate.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return await prisma.emailTemplate.delete({
      where: { id },
    });
  }

  static async getById(id: string) {
    return await prisma.emailTemplate.findUnique({
      where: { id },
    });
  }

  static async list(params: { category?: string; search?: string; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.category) {
      where.category = params.category;
    }
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { subject: { contains: params.search } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.emailTemplate.count({ where }),
      prisma.emailTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, page, limit, data };
  }

  static async duplicate(id: string) {
    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    return await prisma.emailTemplate.create({
      data: {
        name: `Copy of ${template.name}`,
        subject: template.subject,
        htmlContent: template.htmlContent,
        category: template.category,
        isDefault: false,
      },
    });
  }

  static async seedDefaults() {
    const existing = await prisma.emailTemplate.count({
      where: { isDefault: true },
    });

    if (existing >= 10) return;

    const categories = [
      'Welcome', 'Newsletter', 'Investment', 'Market', 'Portfolio',
      'Tax', 'Event', 'Webinar', 'Greeting', 'Product'
    ];

    const defaults = categories.map((cat, index) => ({
      name: `Default ${cat} Template`,
      subject: `Your Knowith Capital ${cat} Update`,
      category: cat,
      isDefault: true,
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-top: 4px solid #c5a55a; }
    .header { background-color: #1e3a5f; padding: 20px; text-align: center; color: #ffffff; }
    .content { padding: 30px; color: #333333; line-height: 1.6; }
    .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777777; }
    h1 { color: #1e3a5f; }
    .btn { display: inline-block; padding: 10px 20px; background-color: #c5a55a; color: #ffffff; text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Knowith Capital</h2>
    </div>
    <div class="content">
      <h1>Hello {{firstName}},</h1>
      <p>This is your professional ${cat} update from Knowith Capital.</p>
      <p>Here is some important information regarding your account or our services.</p>
      <br/>
      <a href="{{ctaLink}}" class="btn">View Details</a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Knowith Capital. All rights reserved.</p>
      <p>If you no longer wish to receive these emails, you can <a href="{{unsubscribeUrl}}">unsubscribe here</a>.</p>
    </div>
  </div>
</body>
</html>
      `
    }));

    for (const t of defaults) {
      await prisma.emailTemplate.create({ data: t });
    }
  }
}
