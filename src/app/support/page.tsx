"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { callGrokAPI } from "@/lib/grok";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are a Knowith Capital AI Customer Support & Lead Qualification Assistant.
First, answer any customer queries using general knowledge about investment services, policies, and documentation.
If they show interest in investing, seamlessly transition into asking qualification questions one by one:
1. Income range
2. Expected investment amount
3. Financial goals
4. Occupation
5. Age
Once you have this information, thank them and tell them a human advisor will contact them shortly with a personalized plan.
Format your responses beautifully in Markdown.`;

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am Knowith Capital Support. How can I help you today with your investments or our services?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await callGrokAPI(newMessages, SYSTEM_PROMPT);
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (error: any) {
      setMessages([...newMessages, { role: "assistant", content: `**Error**: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-4xl mx-auto">
      <header className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-bold gradient-text">Support & Lead Assistant</h1>
        <p className="text-gray-400 mt-2">Get your questions answered and start your investment journey.</p>
      </header>

      <div className="flex-1 glass-panel flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-purple-400" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white rounded-br-none' 
                  : 'bg-[#2E2E3E]/50 border border-[#3E3E5E]/50 text-gray-200 rounded-bl-none'
              }`}>
                <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              </div>
              <div className="bg-[#2E2E3E]/50 border border-[#3E3E5E]/50 rounded-2xl rounded-bl-none px-5 py-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-[#2E2E3E]/50 bg-[#151515]/80">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              className="w-full bg-[#0A0A0A] border border-[#2E2E3E] rounded-full pl-6 pr-14 py-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 rounded-full transition-colors text-white"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
