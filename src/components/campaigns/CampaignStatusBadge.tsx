"use client";

import React from "react";
import { Loader2 } from "lucide-react";

type CampaignStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "SENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "PAUSED";

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
  className?: string;
}

const statusConfig: Record<CampaignStatus, { bg: string; text: string; border: string; label: string; icon?: boolean }> = {
  DRAFT: { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/20", label: "Draft" },
  SCHEDULED: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", label: "Scheduled" },
  SENDING: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", label: "Sending", icon: true },
  COMPLETED: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20", label: "Completed" },
  FAILED: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", label: "Failed" },
  CANCELLED: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20", label: "Cancelled" },
  PAUSED: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", label: "Paused" },
};

export function CampaignStatusBadge({ status, className = "" }: CampaignStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.DRAFT;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {config.icon && status === "SENDING" && (
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
      )}
      {config.label}
    </span>
  );
}
