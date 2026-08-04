import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreateTemplateBody = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  subject: z.string().optional(),
  htmlContent: z.string().min(1, 'HTML content is required'),
  jsonContent: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const where: any = {};
    if (category && category !== 'All') where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('[Templates List Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = CreateTemplateBody.parse(body);

    const template = await prisma.emailTemplate.create({
      data: {
        name: data.name,
        description: data.description || null,
        category: data.category || 'General',
        subject: data.subject || null,
        htmlContent: data.htmlContent,
        jsonContent: data.jsonContent || null,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: (error as any).errors }, { status: 400 });
    }
    console.error('[Template Create Error]:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
