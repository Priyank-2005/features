"use client";

import React from "react";
import { Edit2, Copy, Trash2, LayoutTemplate } from "lucide-react";
import { motion } from "framer-motion";

type Template = {
  id: string;
  name: string;
  description?: string;
  category: string;
  updatedAt: string;
};

interface TemplateCardProps {
  template: Template;
  onSelect?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDuplicate?: (template: Template) => void;
  onDelete?: (template: Template) => void;
}

export function TemplateCard({ template, onSelect, onEdit, onDuplicate, onDelete }: TemplateCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card overflow-hidden group cursor-pointer flex flex-col h-full"
      onClick={() => onSelect?.(template)}
    >
      <div className="h-32 bg-[#151515]/80 border-b border-[#2E2E3E]/50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
        <LayoutTemplate className="w-12 h-12 text-gray-600/50 group-hover:text-indigo-400/50 transition-colors" />
        
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider bg-white/5 border border-white/10 rounded text-gray-300 backdrop-blur-sm">
            {template.category}
          </span>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h4 className="text-white font-medium mb-1 line-clamp-1 font-playfair">{template.name}</h4>
        <p className="text-gray-400 text-xs line-clamp-2 mb-4 flex-1">
          {template.description || "No description provided."}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
          <span className="text-[10px] text-gray-500">
            Updated {new Date(template.updatedAt).toLocaleDateString()}
          </span>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <button 
                onClick={() => onEdit(template)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDuplicate && (
              <button 
                onClick={() => onDuplicate(template)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                title="Duplicate"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(template)}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
