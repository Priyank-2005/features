import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const city = searchParams.get('city') || undefined;
    const investmentRange = searchParams.get('investmentRange') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const where: any = {
      email: { not: null },
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { city: { contains: search } },
      ];
    }
    if (city) where.city = city;
    if (investmentRange) where.investmentRange = investmentRange;
    if (status) where.status = status;

    // Exclude unsubscribed emails
    const unsubscribed = await prisma.unsubscribe.findMany({ select: { email: true } });
    const unsubscribedEmails = unsubscribed.map((u) => u.email);
    if (unsubscribedEmails.length > 0) {
      where.email = { ...where.email, notIn: unsubscribedEmails };
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.lead.count({ where }),
    ]);

    // Get distinct values for filter dropdowns
    const [cities, ranges, statuses] = await Promise.all([
      prisma.lead.findMany({ select: { city: true }, distinct: ['city'], where: { city: { not: null } } }),
      prisma.lead.findMany({ select: { investmentRange: true }, distinct: ['investmentRange'], where: { investmentRange: { not: null } } }),
      prisma.lead.findMany({ select: { status: true }, distinct: ['status'] }),
    ]);

    return NextResponse.json({
      leads,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      filters: {
        cities: cities.map((c) => c.city).filter(Boolean),
        investmentRanges: ranges.map((r) => r.investmentRange).filter(Boolean),
        statuses: statuses.map((s) => s.status),
      },
    });
  } catch (error: any) {
    console.error('[Leads List Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, city, investmentRange, status } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name: name || 'Unknown',
        email,
        city: city || null,
        investmentRange: investmentRange || null,
        status: status || 'NEW',
        leadSource: 'Manual',
      }
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error: any) {
    console.error('[Leads Create Error]:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
