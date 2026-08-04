"use client";

import React, { useState, useRef, useEffect } from "react";
import { Braces, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MergeTagSelectorProps {
  onInsert: (tag: string) => void;
}

const AVAILABLE_TAGS = [
  { tag: "{{firstName}}", label: "First Name", description: "Recipient's first name" },
  { tag: "{{lastName}}", label: "Last Name", description: "Recipient's last name" },
  { tag: "{{email}}", label: "Email Address", description: "Recipient's email" },
  { tag: "{{city}}", label: "City", description: "Recipient's city location" },
  { tag: "{{investmentRange}}", label: "Investment Range", description: "Preferred investment size" },
  { tag: "{{company}}", label: "Company", description: "Knowith Capital" },
];

export function MergeTagSelector({ onInsert }: MergeTagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#2E2E3E]/50 text-gray-300 hover:text-white hover:bg-[#2E2E3E] rounded-md transition-colors border border-[#2E2E3E]"
      >
        <Braces className="w-3.5 h-3.5 text-indigo-400" />
        <span>Insert Variable</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-56 glass-panel border border-[#2E2E3E] rounded-lg shadow-xl overflow-hidden right-0"
          >
            <div className="p-2 border-b border-[#2E2E3E]/50 bg-[#151515]">
              <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Available Tags</span>
            </div>
            <div className="max-h-64 overflow-y-auto p-1">
              {AVAILABLE_TAGS.map((item) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => {
                    onInsert(item.tag);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-[#2E2E3E]/70 transition-colors flex flex-col gap-0.5 group"
                >
                  <span className="text-sm font-medium text-gray-200 group-hover:text-white">{item.label}</span>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] text-gray-500">{item.description}</span>
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1 rounded">{item.tag}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
