import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  isLoading, 
  disabled = false,
  placeholder = "Type your message..."
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !disabled) {
      onSend(input.trim());
      setInput('');
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="p-4 bg-white border-t border-slate-200">
      <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder={disabled ? "Conversation locked." : placeholder}
          className="flex-1 max-h-32 min-h-[44px] bg-slate-50 border border-slate-300 rounded-2xl py-3 pl-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:bg-slate-100 transition-all shadow-sm text-slate-900 placeholder:text-slate-400"
          rows={1}
        />
        
        <button
          type="submit"
          disabled={!input.trim() || isLoading || disabled}
          className={`absolute right-3 bottom-2.5 p-1.5 rounded-full flex items-center justify-center transition-all
            ${input.trim() && !isLoading && !disabled 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
              : 'bg-transparent text-slate-300'
            }`}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin text-indigo-600" />
          ) : (
            <Send size={18} className={input.trim() && !isLoading && !disabled ? 'text-white' : ''} />
          )}
        </button>
      </form>
      <div className="max-w-4xl mx-auto text-center mt-2">
        <span className="text-[10px] text-slate-400 font-medium tracking-wide">
          Secured by Knowith Capital AI • Built on Llama 3
        </span>
      </div>
    </div>
  );
};
