import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status') || undefined;

    const where: any = { campaignId: id };
    if (status) where.status = status;

    const [recipients, total] = await Promise.all([
      prisma.campaignRecipient.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.campaignRecipient.count({ where }),
    ]);

    return NextResponse.json({
      recipients,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error: any) {
    console.error('[Recipients Get Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch recipients' }, { status: 500 });
  }
}

const AddRecipientsBody = z.object({
  contactIds: z.array(z.string()).min(1, 'At least one contact is required'),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { contactIds } = AddRecipientsBody.parse(body);

    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Fetch contacts
    const contacts = await prisma.emailContact.findMany({
      where: { id: { in: contactIds } },
    });

    // Get existing recipient emails to deduplicate
    const existingRecipients = await prisma.campaignRecipient.findMany({
      where: { campaignId: id },
      select: { email: true },
    });
    const existingEmails = new Set(existingRecipients.map((r) => r.email.toLowerCase()));

    // Get unsubscribed emails
    const unsubscribed = await prisma.unsubscribe.findMany({
      select: { email: true },
    });
    const unsubscribedEmails = new Set(unsubscribed.map((u) => u.email.toLowerCase()));

    // Filter out duplicates and unsubscribed
    const newRecipients = contacts
      .filter((contact) => {
        const email = contact.email.toLowerCase();
        return email && !existingEmails.has(email) && !unsubscribedEmails.has(email);
      })
      .map((contact) => ({
        campaignId: id,
        contactId: contact.id,
        email: contact.email,
        name: `${contact.firstName} ${contact.lastName}`,
        status: 'PENDING',
      }));

    if (newRecipients.length > 0) {
      await prisma.campaignRecipient.createMany({ data: newRecipients });
    }

    // Update campaign recipient count
    const totalRecipients = await prisma.campaignRecipient.count({ where: { campaignId: id } });
    await prisma.campaign.update({
      where: { id },
      data: {
        totalRecipients,
        activities: {
          create: {
            action: 'RECIPIENT_ADDED',
            description: `Added ${newRecipients.length} recipients (${contacts.length - newRecipients.length} skipped: duplicates or unsubscribed)`,
          },
        },
      },
    });

    return NextResponse.json({
      added: newRecipients.length,
      skipped: contacts.length - newRecipients.length,
      total: totalRecipients,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: (error as any).errors }, { status: 400 });
    }
    console.error('[Recipients Add Error]:', error);
    return NextResponse.json({ error: 'Failed to add recipients' }, { status: 500 });
  }
}

const RemoveRecipientsBody = z.object({
  recipientIds: z.array(z.string()).min(1),
});

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { recipientIds } = RemoveRecipientsBody.parse(body);

    await prisma.campaignRecipient.deleteMany({
      where: { id: { in: recipientIds }, campaignId: id },
    });

    const totalRecipients = await prisma.campaignRecipient.count({ where: { campaignId: id } });
    await prisma.campaign.update({
      where: { id },
      data: { totalRecipients },
    });

    return NextResponse.json({ success: true, total: totalRecipients });
  } catch (error: any) {
    console.error('[Recipients Remove Error]:', error);
    return NextResponse.json({ error: 'Failed to remove recipients' }, { status: 500 });
  }
}
