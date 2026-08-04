import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { z } from 'zod';

const ContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    
    const where = search ? {
      OR: [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } }
      ]
    } : {};

    const contacts = await prisma.emailContact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('[Contacts GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = ContactSchema.parse(body);

    // Check for existing email
    const existing = await prisma.emailContact.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      return NextResponse.json({ error: 'A contact with this email already exists' }, { status: 400 });
    }

    const contact = await prisma.emailContact.create({
      data,
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: (error as any).errors }, { status: 400 });
    }
    console.error('[Contacts POST Error]:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}
