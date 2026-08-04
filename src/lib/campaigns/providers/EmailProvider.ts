export interface EmailPayload {
  to: string;
  from: string;
  fromName: string;
  replyTo?: string;
  subject: string;
  html: string;
  tags?: string[];
  attachments?: { filename: string; content: string; }[];
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailProvider {
  send(payload: EmailPayload): Promise<EmailResult>;
  sendBatch(payloads: EmailPayload[]): Promise<EmailResult[]>;
}
