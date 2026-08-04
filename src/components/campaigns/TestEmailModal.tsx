"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface TestEmailModalProps {
  campaignId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TestEmailModal({ campaignId, isOpen, onClose }: TestEmailModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // In real app: await fetch(\`/api/v1/campaigns/\${campaignId}/test\`, { method: 'POST', body: JSON.stringify({ email }) })
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setEmail("");
      }, 2000);
    } catch (error) {
      setStatus('error');
      setErrorMessage("Failed to send test email. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-panel w-full max-w-md overflow-hidden relative shadow-2xl"
        >
          <div className="flex items-center justify-between p-4 border-b border-[#2E2E3E]/50">
            <h3 className="text-lg font-medium text-white font-playfair">Send Test Email</h3>
            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <CheckCircle className="w-12 h-12 text-emerald-400 mb-3" />
                </motion.div>
                <h4 className="text-lg font-medium text-white mb-1">Test Sent Successfully</h4>
                <p className="text-sm text-gray-400">A test email has been sent to {email}</p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-4">
                <p className="text-sm text-gray-400">
                  Send a preview of this campaign to your inbox to verify formatting and links before sending to your list.
                </p>
                
                <div className="space-y-1.5">
                  <label htmlFor="test-email" className="text-xs font-medium text-gray-300">Email Address</label>
                  <input
                    id="test-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#151515] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={status === 'loading'}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'loading' || !email}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:hover:shadow-none transition-all"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send Test
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
