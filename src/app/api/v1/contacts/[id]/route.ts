import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateContactSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  mobile: z.string().optional().nullable(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = UpdateContactSchema.parse(body);

    if (data.email) {
      const existing = await prisma.emailContact.findFirst({
        where: { email: data.email, id: { not: id } }
      });
      if (existing) {
        return NextResponse.json({ error: 'Email already in use by another contact' }, { status: 400 });
      }
    }

    const contact = await prisma.emailContact.update({
      where: { id },
      data,
    });

    return NextResponse.json({ contact });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: (error as any).errors }, { status: 400 });
    }
    console.error('[Contacts PUT Error]:', error);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Check if used in campaigns
    const inUse = await prisma.campaignRecipient.findFirst({
      where: { contactId: id }
    });

    if (inUse) {
      return NextResponse.json({ error: 'Cannot delete contact because it is part of a campaign.' }, { status: 400 });
    }

    await prisma.emailContact.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Contacts DELETE Error]:', error);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}
