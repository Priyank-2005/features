import { SupportChat } from '@/components/chat/SupportChat';

export const metadata = {
  title: 'Knowith Support | Digital Relationship Manager',
  description: 'AI-powered support and relationship management for Knowith Capital.',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 pt-16">
      <SupportChat />
    </div>
  );
}
