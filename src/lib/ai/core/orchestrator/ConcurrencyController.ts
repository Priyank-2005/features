import { ConcurrencyConfig } from '../types';

export class ConcurrencyController {
  private config: ConcurrencyConfig;
  private activeCount: number = 0;
  private queue: Array<() => void> = [];

  constructor(config?: Partial<ConcurrencyConfig>) {
    this.config = {
      maxConcurrent: config?.maxConcurrent || 5,
      initialDelayMs: config?.initialDelayMs || 1000,
      maxDelayMs: config?.maxDelayMs || 10000,
      maxRetries: config?.maxRetries || 3,
      backoffFactor: config?.backoffFactor || 2,
      jitterMs: config?.jitterMs || 500,
    };
  }

  /**
   * Executes a task function (e.g., an AI Capability execution) governed by concurrency limits.
   * Automatically handles HTTP 429s and generic errors via exponential backoff.
   */
  public async executeTask<T>(taskFn: () => Promise<T>, taskName: string = 'UnnamedTask'): Promise<T> {
    await this.acquireSlot();

    try {
      return await this.executeWithBackoff(taskFn, taskName);
    } finally {
      this.releaseSlot();
    }
  }

  /**
   * Queue management for max concurrency.
   */
  private async acquireSlot(): Promise<void> {
    if (this.activeCount < this.config.maxConcurrent) {
      this.activeCount++;
      return;
    }

    return new Promise((resolve) => {
      this.queue.push(() => {
        this.activeCount++;
        resolve();
      });
    });
  }

  private releaseSlot(): void {
    this.activeCount--;
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    }
  }

  /**
   * Exponential backoff specific to the isolated task.
   */
  private async executeWithBackoff<T>(taskFn: () => Promise<T>, taskName: string, attempt: number = 1): Promise<T> {
    try {
      return await taskFn();
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Rate limit');
      
      if (attempt > this.config.maxRetries) {
        throw new Error(`[ConcurrencyController] ${taskName} failed after ${this.config.maxRetries} retries. Error: ${error.message}`);
      }

      // Calculate exponential backoff with jitter
      const exponentialDelay = this.config.initialDelayMs * Math.pow(this.config.backoffFactor, attempt - 1);
      const jitter = Math.random() * this.config.jitterMs;
      const finalDelay = Math.min(exponentialDelay + jitter, this.config.maxDelayMs);

      console.warn(`[ConcurrencyController] ${taskName} failed (Attempt ${attempt}/${this.config.maxRetries}). Retrying in ${Math.round(finalDelay)}ms... Reason: ${isRateLimit ? 'HTTP 429 Rate Limit' : error.message}`);

      await this.sleep(finalDelay);
      
      return this.executeWithBackoff(taskFn, taskName, attempt + 1);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
