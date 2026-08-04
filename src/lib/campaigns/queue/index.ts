import { EmailQueue } from './EmailQueue';
import { InMemoryQueue } from './InMemoryQueue';

let queueInstance: EmailQueue | null = null;

export function getEmailQueue(): EmailQueue {
  if (!queueInstance) {
    // In a real production app you'd return Redis/BullMQ queue here
    queueInstance = new InMemoryQueue();
  }
  return queueInstance;
}
