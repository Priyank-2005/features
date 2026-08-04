"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = "Confirm",
  variant = 'warning' 
}: ConfirmationModalProps) {
  
  if (!isOpen) return null;

  const styles = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      btn: "bg-red-500 hover:bg-red-600 text-white"
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      btn: "bg-amber-500 hover:bg-amber-600 text-white"
    },
    info: {
      icon: <Info className="w-6 h-6 text-blue-500" />,
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      btn: "bg-blue-500 hover:bg-blue-600 text-white"
    }
  };

  const currentStyle = styles[variant];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel w-full max-w-sm overflow-hidden relative shadow-2xl"
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full flex-shrink-0 ${currentStyle.bg} ${currentStyle.border} border`}>
                {currentStyle.icon}
              </div>
              <div className="pt-1">
                <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400">{message}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-[#2E2E3E]/50 hover:bg-[#2E2E3E] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${currentStyle.btn}`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
