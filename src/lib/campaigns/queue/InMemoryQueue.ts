import { EmailQueue, EmailJob, QueueStatus } from './EmailQueue';
import { getEmailProvider } from '../providers';

export class InMemoryQueue implements EmailQueue {
  private jobs: Map<string, EmailJob> = new Map();
  private maxRetries = 3;

  async enqueue(jobInput: Omit<EmailJob, 'id' | 'retryCount' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `job-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const now = new Date();
    
    const job: EmailJob = {
      ...jobInput,
      id,
      retryCount: 0,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };
    
    this.jobs.set(id, job);
    return id;
  }

  async processBatch(batchSize: number): Promise<void> {
    const pendingJobs = Array.from(this.jobs.values())
      .filter(job => job.status === 'PENDING' || (job.status === 'FAILED' && job.retryCount < this.maxRetries))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, batchSize);

    if (pendingJobs.length === 0) return;

    const provider = getEmailProvider();

    for (const job of pendingJobs) {
      job.status = 'PROCESSING';
      job.updatedAt = new Date();
      
      try {
        const result = await provider.send(job.payload);
        
        if (result.success) {
          job.status = 'COMPLETED';
        } else {
          job.status = 'FAILED';
          job.error = result.error;
          job.retryCount++;
        }
      } catch (error: any) {
        job.status = 'FAILED';
        job.error = error.message;
        job.retryCount++;
      }
      
      job.updatedAt = new Date();
      // Optional: Add a small delay between processing individual jobs even in the same batch
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  async getQueueLength(): Promise<number> {
    let count = 0;
    for (const job of this.jobs.values()) {
      if (job.status === 'PENDING') {
        count++;
      }
    }
    return count;
  }

  async getStatus(): Promise<QueueStatus> {
    const status: QueueStatus = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      total: this.jobs.size,
    };

    for (const job of this.jobs.values()) {
      switch (job.status) {
        case 'PENDING': status.pending++; break;
        case 'PROCESSING': status.processing++; break;
        case 'COMPLETED': status.completed++; break;
        case 'FAILED': status.failed++; break;
      }
    }

    return status;
  }
}
