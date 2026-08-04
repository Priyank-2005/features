import { EmailPayload } from '../providers/EmailProvider';

export interface EmailJob {
  id: string;
  campaignId: string;
  recipientId: string;
  payload: EmailPayload;
  retryCount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueueStatus {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

export interface EmailQueue {
  enqueue(job: Omit<EmailJob, 'id' | 'retryCount' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string>;
  processBatch(batchSize: number): Promise<void>;
  getQueueLength(): Promise<number>;
  getStatus(): Promise<QueueStatus>;
}
