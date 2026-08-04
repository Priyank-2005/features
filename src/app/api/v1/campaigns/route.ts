import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { z } from 'zod';

const CreateCampaignBody = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  templateId: z.string().optional(),
  fromName: z.string().optional(),
  fromEmail: z.string().email().optional(),
  replyTo: z.string().email().optional(),
  tags: z.array(z.string()).optional(),
});

const PaginationParams = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const params = PaginationParams.parse({
      page: searchParams.get('page') || 1,
      pageSize: searchParams.get('pageSize') || 20,
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    const where: any = {};
    if (params.status && params.status !== 'ALL') {
      where.status = params.status;
    }
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { subject: { contains: params.search } },
      ];
    }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          template: { select: { id: true, name: true, category: true } },
          _count: { select: { recipients: true, activities: true } },
        },
        orderBy: { [params.sortBy]: params.sortOrder },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.campaign.count({ where }),
    ]);

    return NextResponse.json({
      campaigns,
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize),
      },
    });
  } catch (error: any) {
    console.error('[Campaigns List Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = CreateCampaignBody.parse(body);

    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        subject: data.subject,
        description: data.description || null,
        templateId: data.templateId || null,
        fromName: data.fromName || 'Knowith Capital',
        fromEmail: data.fromEmail || 'onboarding@resend.dev',
        replyTo: data.replyTo || null,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        status: 'DRAFT',
        activities: {
          create: {
            action: 'CREATED',
            description: `Campaign "${data.name}" created`,
          },
        },
      },
      include: {
        template: true,
        _count: { select: { recipients: true } },
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: (error as any).errors }, { status: 400 });
    }
    console.error('[Campaign Create Error]:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
