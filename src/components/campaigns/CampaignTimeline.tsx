"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Mail, Play, Pause, XCircle } from "lucide-react";

export interface Activity {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  type?: 'creation' | 'update' | 'status_change' | 'send' | 'error';
}

interface CampaignTimelineProps {
  activities: Activity[];
}

export function CampaignTimeline({ activities }: CampaignTimelineProps) {
  
  const getIcon = (type?: string, action?: string) => {
    const act = action?.toLowerCase() || '';
    if (act.includes('creat')) return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (act.includes('send') || act.includes('sent')) return <Mail className="w-4 h-4 text-blue-400" />;
    if (act.includes('start')) return <Play className="w-4 h-4 text-indigo-400" />;
    if (act.includes('paus')) return <Pause className="w-4 h-4 text-amber-400" />;
    if (act.includes('fail') || act.includes('error')) return <XCircle className="w-4 h-4 text-red-400" />;
    if (type === 'status_change') return <Clock className="w-4 h-4 text-gray-400" />;
    return <Circle className="w-4 h-4 text-gray-400" />;
  };

  if (!activities || activities.length === 0) {
    return <div className="text-gray-500 text-sm italic">No activity recorded yet.</div>;
  }

  return (
    <div className="relative pl-6 py-2">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-[#2E2E3E] to-transparent rounded-full" />
      
      <div className="space-y-8 relative">
        {activities.map((activity, index) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            key={activity.id} 
            className="relative flex gap-4"
          >
            {/* Timeline node */}
            <div className="absolute -left-6 top-1 bg-[#050505] p-1 rounded-full z-10 border border-[#2E2E3E]">
              {getIcon(activity.type, activity.action)}
            </div>
            
            <div className="flex-1 glass-card p-3 rounded-lg border border-[#2E2E3E]/30 bg-[#151515]/50">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-medium text-white">{activity.action}</h4>
                <span className="text-[10px] text-gray-500 whitespace-nowrap ml-4">
                  {new Date(activity.createdAt).toLocaleString(undefined, { 
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-xs text-gray-400">{activity.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
