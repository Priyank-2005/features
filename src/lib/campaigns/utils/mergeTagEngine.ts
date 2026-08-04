export interface MergeTagData {
  firstName?: string;
  lastName?: string;
  email?: string;
  city?: string;
  investmentRange?: string;
  advisorName?: string;
  campaignName?: string;
  companyAddress?: string;
  supportEmail?: string;
  campaignId?: string;
  recipientId?: string;
}

export const AVAILABLE_MERGE_TAGS = [
  { tag: '{{firstName}}', description: "Recipient's first name", example: 'John' },
  { tag: '{{lastName}}', description: "Recipient's last name", example: 'Doe' },
  { tag: '{{email}}', description: "Recipient's email address", example: 'john@example.com' },
  { tag: '{{city}}', description: "Recipient's city", example: 'New York' },
  { tag: '{{investmentRange}}', description: "Recipient's investment range", example: '$10k - $50k' },
  { tag: '{{advisorName}}', description: 'Assigned advisor name', example: 'Sarah Smith' },
  { tag: '{{currentDate}}', description: 'Current formatted date', example: new Date().toLocaleDateString() },
  { tag: '{{currentYear}}', description: 'Current year', example: new Date().getFullYear().toString() },
  { tag: '{{campaignName}}', description: 'Name of the campaign', example: 'Q3 Newsletter' },
  { tag: '{{companyAddress}}', description: 'Company physical address', example: '123 Finance St, NY' },
  { tag: '{{supportEmail}}', description: 'Support email address', example: 'support@knowith.com' },
  { tag: '{{unsubscribe}}', description: 'Unsubscribe link', example: 'https://...' },
  { tag: '{{viewInBrowser}}', description: 'View in browser link', example: 'https://...' },
];

export function renderMergeTags(html: string, data: MergeTagData): string {
  let renderedHtml = html;
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const currentDate = new Date();
  
  const tags: Record<string, string> = {
    '{{firstName}}': data.firstName || '',
    '{{lastName}}': data.lastName || '',
    '{{email}}': data.email || '',
    '{{city}}': data.city || '',
    '{{investmentRange}}': data.investmentRange || '',
    '{{advisorName}}': data.advisorName || 'Your Advisor',
    '{{currentDate}}': currentDate.toLocaleDateString(),
    '{{currentYear}}': currentDate.getFullYear().toString(),
    '{{campaignName}}': data.campaignName || '',
    '{{companyAddress}}': data.companyAddress || 'Knowith Capital Headquarters',
    '{{supportEmail}}': data.supportEmail || 'support@knowith.com',
  };

  // Generate dynamic links if ids are provided
  if (data.campaignId && data.recipientId) {
    tags['{{unsubscribe}}'] = `${baseUrl}/api/v1/campaigns/unsubscribe?c=${data.campaignId}&r=${data.recipientId}`;
    tags['{{viewInBrowser}}'] = `${baseUrl}/campaigns/view?c=${data.campaignId}&r=${data.recipientId}`;
  } else {
    tags['{{unsubscribe}}'] = `${baseUrl}/unsubscribe`;
    tags['{{viewInBrowser}}'] = `${baseUrl}/view`;
  }

  // Replace all tags in the HTML
  for (const [tag, value] of Object.entries(tags)) {
    // Escape string for regex and replace all occurrences globally
    const regex = new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    renderedHtml = renderedHtml.replace(regex, value);
  }

  return renderedHtml;
}
