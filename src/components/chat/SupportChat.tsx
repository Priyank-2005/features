"use client";

import React, { useState, useEffect } from 'react';
import { ChatWindow } from './ChatWindow';
import { ChatInput } from './ChatInput';
import { MessageProps } from './MessageBubble';

export const SupportChat: React.FC = () => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Check if we have an existing session in localStorage
    const savedSessionId = localStorage.getItem('knowith_support_session_id');
    if (savedSessionId) {
      setSessionId(savedSessionId);
      // In a full app, we would fetch message history here
    }
  }, []);

  const handleSendMessage = async (message: string) => {
    const newUserMsg: MessageProps = { role: 'user', content: message, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/v1/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          sessionId: sessionId || undefined 
        })
      });

      const data = await response.json();
      
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem('knowith_support_session_id', data.sessionId);
      }

      let cards = [];
      if (data.isEscalated && data.escalationDetails) {
        cards.push({
          type: 'escalation-handoff',
          data: data.escalationDetails
        });
      }

      const newBotMsg: MessageProps = {
        role: 'assistant',
        content: data.message,
        cards: cards.length > 0 ? cards : undefined,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, newBotMsg]);

    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting right now. Please try again later.", timestamp: new Date().toISOString() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full max-w-5xl mx-auto border-x border-slate-200 shadow-sm bg-white overflow-hidden rounded-t-2xl">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 px-6 flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            K
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-slate-900 leading-tight">Knowith Support</h1>
            <p className="text-xs text-indigo-600 font-medium">Digital Relationship Manager</p>
          </div>
        </div>
      </div>
      
      {/* Chat Area */}
      <ChatWindow messages={messages} isTyping={isTyping} />
      
      {/* Input Area */}
      <div className="bg-white border-t border-slate-200">
        <ChatInput onSend={handleSendMessage} isLoading={isTyping} disabled={isTyping} placeholder="Ask about Knowith Capital, PMS, SIPs..." />
      </div>
    </div>
  );
};
