"use client";

import React, { useState, useEffect } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageProps } from "@/components/chat/MessageBubble";
import { WealthBlueprint, BlueprintData } from "@/components/chat/WealthBlueprint";
import { advisorConfig } from "@/lib/config/advisor.config";
import { OrchestratorLoading } from "@/components/chat/OrchestratorLoading";

export default function AdvisorPage() {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [profileData, setProfileData] = useState<Record<string, any>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [blueprintData, setBlueprintData] = useState<BlueprintData | null>(null);
  
  // Initialize conversation
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: "Hi there! I'm the Knowith Capital AI Advisor. To give you the best investment strategy, I'd like to understand a bit about your financial profile. To start, what is your primary goal for investing?",
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);

  const handleSendMessage = async (content: string) => {
    // 1. Optimistic UI Update
    const userMessage: MessageProps = { role: "user", content, timestamp: new Date().toISOString() };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    
    // The massive loading screen should ONLY trigger if this is the final piece of missing information
    const missingFieldsCount = advisorConfig.profileFields.filter(f => !profileData[f.id]).length;
    if (missingFieldsCount <= 1) {
      setIsOrchestrating(true);
    } else {
      setIsTyping(true);
    }

    try {
      // 2. Fetch from our robust backend engine
      const response = await fetch("/api/v1/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: messages.map(m => ({ role: m.role, content: m.content })), // Send full history for context
          currentState: profileData, // Inject explicit state machine payload
        }),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to communicate with AI Engine");
      }

      const aiData = result.data; // GroqAdvisorResponse

      // 3. Update the dynamic ProfileSidebar UI
      if (aiData.updatedProfile) {
        setProfileData(prev => ({ ...prev, ...aiData.updatedProfile }));
      }

      // 4. Update the chat window with the AI's rich response
      if (!aiData.blueprint) {
        setMessages([
          ...newHistory,
          {
            role: "assistant",
            content: aiData.botResponse,
            cards: aiData.cards, // Render structured cards generically if any
            timestamp: new Date().toISOString()
          }
        ]);
      } else {
        // We received the massive blueprint payload!
        setBlueprintData(aiData.blueprint);
      }

    } catch (error: any) {
      setMessages([
        ...newHistory,
        {
          role: "assistant",
          content: `⚠️ **Connection Error**: ${error.message}. Please try again.`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsTyping(false);
      setIsOrchestrating(false);
    }
  };

  return (
    <ChatLayout 
      featureTitle={advisorConfig.title}
      sidebarFields={advisorConfig.profileFields}
      profileData={profileData}
    >
      {isOrchestrating ? (
        <OrchestratorLoading />
      ) : blueprintData ? (
        <div className="flex-1 w-full h-full overflow-y-auto bg-white print:overflow-visible print:h-auto print:block">
          <WealthBlueprint data={blueprintData} />
        </div>
      ) : (
        <>
          <ChatWindow messages={messages} isTyping={isTyping} />
          <div className="shrink-0 w-full z-20 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.05)]">
            <ChatInput 
              onSend={handleSendMessage} 
              isLoading={isTyping} 
              placeholder="Enter your response..."
            />
          </div>
        </>
      )}
    </ChatLayout>
  );
}
