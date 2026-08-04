import { EmailProvider } from './EmailProvider';
import { ResendProvider } from './ResendProvider';
import { ConsoleProvider } from './ConsoleProvider';

let providerInstance: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (providerInstance) return providerInstance;

  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (resendApiKey) {
    providerInstance = new ResendProvider(resendApiKey);
  } else {
    console.warn('RESEND_API_KEY not found in environment variables. Falling back to ConsoleProvider.');
    providerInstance = new ConsoleProvider();
  }
  
  return providerInstance;
}
