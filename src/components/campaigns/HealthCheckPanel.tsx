"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, XCircle, Info, ShieldCheck, Loader2 } from "lucide-react";

interface HealthCheckPanelProps {
  campaignId: string;
}

interface HealthData {
  total: number;
  valid: number;
  duplicates: number;
  invalid: number;
  suppressed: number;
}

export function HealthCheckPanel({ campaignId }: HealthCheckPanelProps) {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching
    const timer = setTimeout(() => {
      setData({
        total: 1250,
        valid: 1210,
        duplicates: 15,
        invalid: 5,
        suppressed: 20
      });
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [campaignId]);

  if (loading) {
    return (
      <div className="glass-panel p-6 flex flex-col items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm text-gray-400">Analyzing recipient list...</p>
      </div>
    );
  }

  if (!data) return null;

  const isHealthy = data.invalid === 0;

  return (
    <div className="glass-panel overflow-hidden">
      <div className={`p-4 border-b border-[#2E2E3E]/50 flex items-center gap-3 ${isHealthy ? 'bg-emerald-500/5' : 'bg-amber-500/5'}`}>
        {isHealthy ? (
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
        ) : (
          <AlertCircle className="w-6 h-6 text-amber-400" />
        )}
        <div>
          <h3 className="text-white font-medium">List Health Check</h3>
          <p className="text-xs text-gray-400">
            {isHealthy ? "Your list looks good and ready to send." : "Found some issues that will be automatically skipped."}
          </p>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Valid Recipients
            </span>
            <span className="text-white font-medium">{data.valid}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              Total Selected
            </span>
            <span className="text-white font-medium">{data.total}</span>
          </div>
        </div>
        
        <div className="space-y-3 border-l border-[#2E2E3E]/50 pl-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Duplicates
            </span>
            <span className="text-white font-medium">{data.duplicates}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Invalid Emails
            </span>
            <span className="text-white font-medium">{data.invalid}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-500" />
              Suppressed
            </span>
            <span className="text-white font-medium">{data.suppressed}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-[#151515] p-3 px-4 text-xs text-gray-500 flex items-start gap-2">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>Invalid, duplicate, and suppressed emails will be automatically removed from the sending queue to protect your sender reputation.</p>
      </div>
    </div>
  );
}
