"use client";

import { useState, useRef, useEffect } from "react";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { TaxBlueprint as TaxBlueprintUI } from "@/components/chat/TaxBlueprint";
import { OrchestratorLoading } from "@/components/chat/OrchestratorLoading";
import { generateTaxPDF } from "@/lib/utils/generateTaxPDF";
import { taxConfig } from "@/lib/config/tax.config";

export default function TaxPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([{
    role: 'assistant',
    content: "Welcome to Knowith Capital. I'm your Lead Tax Strategist. My objective is to analyze your tax position, identify optimization opportunities, and help you select the most efficient tax regime. To begin, could you tell me your annual salary and whether you currently file under the Old or New tax regime?"
  }]);
  
  const [profile, setProfile] = useState<Record<string, any>>({});
  const [blueprint, setBlueprint] = useState<any | null>(null);
  
  const [isTyping, setIsTyping] = useState(false);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  
  const [currentState, setCurrentState] = useState<string>('COLLECTING_L1');

  const handleSendMessage = async (content: string) => {
    const newMessages = [...messages, { role: 'user' as const, content }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await fetch('/api/v1/tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          currentState: profile,
          history: messages
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error?.message || "Something went wrong.");

      if (data.data?.updatedProfile) {
        setProfile(data.data.updatedProfile);
      }

      if (data.data?.nextState === 'REPORT_READY') {
        setCurrentState('REPORT_READY');
        setIsOrchestrating(true);
        if (data.data?.blueprint) {
          setBlueprint(data.data.blueprint);
        }
        setIsOrchestrating(false);
        setIsTyping(false);
        return;
      }

      setCurrentState(data.data?.nextState || currentState);

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.data?.botResponse || "I didn't quite catch that." }
      ]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "I encountered an error connecting to our secure servers. Please try again." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ChatLayout 
      featureTitle={taxConfig.title}
      sidebarFields={taxConfig.profileFields}
      profileData={profile}
    >
      {isOrchestrating ? (
        <OrchestratorLoading />
      ) : blueprint ? (
        <div className="flex-1 w-full h-full overflow-y-auto bg-white print:overflow-visible print:h-auto print:block">
          <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
            <TaxBlueprintUI data={blueprint} />
            
            <div className="mt-12 max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 print:hidden">
              <h3 className="text-xl font-medium text-slate-200 mb-6">Ask Follow-up Questions</h3>
              <ChatWindow messages={messages} isTyping={isTyping} />
              <div className="mt-4">
                <ChatInput 
                  onSend={handleSendMessage} 
                  isLoading={isTyping || isOrchestrating}
                  disabled={isTyping || isOrchestrating}
                  placeholder="Ask about your Tax Strategy..." 
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
