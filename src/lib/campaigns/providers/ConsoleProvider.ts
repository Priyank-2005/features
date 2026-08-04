import { EmailProvider, EmailPayload, EmailResult } from './EmailProvider';

export class ConsoleProvider implements EmailProvider {
  async send(payload: EmailPayload): Promise<EmailResult> {
    console.log('--- [Console Email Provider] ---');
    console.log(`To: ${payload.to}`);
    console.log(`From: ${payload.fromName} <${payload.from}>`);
    if (payload.replyTo) console.log(`Reply-To: ${payload.replyTo}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`Tags: ${payload.tags?.join(', ') || 'none'}`);
    console.log('Body:');
    console.log(payload.html.substring(0, 500) + (payload.html.length > 500 ? '...' : ''));
    console.log('--------------------------------');

    return { 
      success: true, 
      messageId: `console-msg-${Date.now()}-${Math.random().toString(36).substring(7)}` 
    };
  }

  async sendBatch(payloads: EmailPayload[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];
    
    for (const payload of payloads) {
      results.push(await this.send(payload));
    }
    
    return results;
  }
}
