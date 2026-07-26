'use client';

import { useState, useEffect } from 'react';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatInput } from '@/components/chat/ChatInput';
import { MessageProps } from '@/components/chat/MessageBubble';
import { OrchestratorLoading } from '@/components/chat/OrchestratorLoading';
import HealthBlueprintUI from '@/components/chat/HealthBlueprint';
import { healthConfig } from '@/lib/config/health.config';
import { HealthProfile, HealthBlueprint } from '@/schemas/health.schema';
import { generateHealthPDF } from '@/lib/utils/generateHealthPDF';

export default function HealthPage() {
  const [messages, setMessages] = useState<MessageProps[]>([
    { 
      role: 'assistant', 
      content: "Welcome to Knowith Capital. I'm your Principal Wealth Strategist. Let's analyze your overall financial health today. To start, could you share your approximate monthly net income?"
    }
  ]);
  const [profile, setProfile] = useState<HealthProfile>({});
  const [currentState, setCurrentState] = useState<string>('COLLECTING_PROFILE');
  const [isTyping, setIsTyping] = useState(false);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [blueprint, setBlueprint] = useState<HealthBlueprint | null>(null);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isTyping || isOrchestrating) return;

    const newMessages: MessageProps[] = [...messages, { role: 'user', content, timestamp: new Date().toISOString() }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await fetch('/api/v1/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          profileData: profile,
          currentState,
          history: messages
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      if (data.updatedProfile) {
        setProfile(data.updatedProfile);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.message, timestamp: new Date().toISOString() }]);
      setCurrentState(data.nextState);

      if (data.nextState === 'REPORT_READY') {
        setIsOrchestrating(true);
        setIsTyping(false);

        const orchestratorResponse = await fetch('/api/v1/health', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: "Generate blueprint",
            profileData: data.updatedProfile,
            currentState: 'REPORT_READY',
            history: [...newMessages, { role: 'assistant', content: data.message }]
          }),
        });

        const orchestratorData = await orchestratorResponse.json();
        
        if (orchestratorData.blueprint) {
          setBlueprint(orchestratorData.blueprint);
          setCurrentState('AWAITING_USER_ACTION');
          setMessages(prev => [...prev, { role: 'assistant', content: orchestratorData.message, timestamp: new Date().toISOString() }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error generating your blueprint due to high system load. Please try again.", timestamp: new Date().toISOString() }]);
        }
        setIsOrchestrating(false);
      } else {
        setIsTyping(false);
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}. Please try again.`, timestamp: new Date().toISOString() }]);
      setIsTyping(false);
      setIsOrchestrating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (blueprint) {
      generateHealthPDF(blueprint);
    }
  };

  return (
    <ChatLayout 
      featureTitle={healthConfig.title}
      sidebarFields={healthConfig.profileFields}
      profileData={profile}
    >
      {isOrchestrating ? (
        <OrchestratorLoading />
      ) : blueprint ? (
        <div className="flex-1 w-full h-full overflow-y-auto bg-white print:overflow-visible print:h-auto print:block">
          <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
            <HealthBlueprintUI data={blueprint} onDownload={handleDownloadPDF} />
            
            {/* Chat interface resumes below the blueprint */}
            <div className="mt-12 max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 print:hidden">
              <h3 className="text-xl font-medium text-slate-200 mb-6">Ask Follow-up Questions</h3>
              <ChatWindow messages={messages} isTyping={isTyping} />
              <div className="mt-4">
                <ChatInput 
                  onSend={handleSendMessage} 
                  isLoading={isTyping || isOrchestrating}
                  disabled={isTyping || isOrchestrating}
                  placeholder="Ask about your Health Blueprint..." 
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <ChatWindow messages={messages} isTyping={isTyping} />
          <div className="shrink-0 w-full z-20 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.05)]">
            <ChatInput onSend={handleSendMessage} isLoading={isTyping || isOrchestrating} disabled={isTyping || isOrchestrating} />
          </div>
        </>
      )}
    </ChatLayout>
  );
}
