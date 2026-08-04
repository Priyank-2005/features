import { Resend } from 'resend';
import { EmailProvider, EmailPayload, EmailResult } from './EmailProvider';

export class ResendProvider implements EmailProvider {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async send(payload: EmailPayload): Promise<EmailResult> {
    try {
      const from = `${payload.fromName} <${payload.from}>`;
      
      const { data, error } = await this.resend.emails.send({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        replyTo: payload.replyTo,
        tags: payload.tags?.map(tag => ({ name: 'campaign', value: tag })),
        attachments: payload.attachments,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Unknown error occurred' };
    }
  }

  async sendBatch(payloads: EmailPayload[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];
    
    for (const payload of payloads) {
      const result = await this.send(payload);
      results.push(result);
      
      // Delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    
    return results;
  }
}
