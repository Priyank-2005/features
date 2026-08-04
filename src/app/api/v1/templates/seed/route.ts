import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { defaultTemplates } from '@/lib/campaigns/templates/defaults';

// POST: Seed default templates
export async function POST() {
  try {
    const existingDefaults = await prisma.emailTemplate.count({
      where: { isDefault: true },
    });

    if (existingDefaults > 0) {
      return NextResponse.json({
        message: 'Default templates already exist',
        count: existingDefaults,
      });
    }

    const created = await prisma.emailTemplate.createMany({
      data: defaultTemplates.map((t) => ({
        name: t.name,
        description: t.description,
        category: t.category,
        subject: t.subject,
        htmlContent: t.htmlContent,
        isDefault: true,
      })),
    });

    return NextResponse.json({
      message: `Seeded ${created.count} default templates`,
      count: created.count,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[Seed Templates Error]:', error);
    return NextResponse.json({ error: 'Failed to seed templates' }, { status: 500 });
  }
}
