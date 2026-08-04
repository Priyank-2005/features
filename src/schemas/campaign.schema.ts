import { z } from 'zod';

export const CreateCampaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  templateId: z.string().optional(),
  fromName: z.string().optional(),
  fromEmail: z.string().email('Invalid email').optional(),
  replyTo: z.string().email('Invalid email').optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateCampaignSchema = CreateCampaignSchema.partial();

export const ScheduleCampaignSchema = z.object({
  scheduledAt: z.coerce.date(),
});

export const CreateTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  subject: z.string().optional(),
  htmlContent: z.string().min(1, 'HTML content is required'),
  jsonContent: z.string().optional(),
});

export const UpdateTemplateSchema = CreateTemplateSchema.partial();

export const RecipientFilterSchema = z.object({
  investmentRange: z.string().optional(),
  city: z.string().optional(),
  status: z.string().optional(),
  tags: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().optional(),
});

export const SendTestEmailSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const CreateSegmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  filters: z.record(z.string(), z.any()),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
});

export const AttachmentValidationSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().max(10 * 1024 * 1024, 'File size must be 10MB or less'),
  mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
});
