import React from 'react';
import { Lightbulb, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

export type InsightType = 'insight' | 'strength' | 'risk' | 'neutral';

interface InsightCalloutProps {
  type: InsightType;
  title?: string;
  children: React.ReactNode;
}

const typeStyles = {
  insight: 'bg-blue-50  border-blue-500 text-blue-900 ',
  strength: 'bg-emerald-50  border-emerald-500 text-emerald-900 ',
  risk: 'bg-rose-50  border-rose-500 text-rose-900 ',
  neutral: 'bg-slate-50  border-slate-400 text-slate-800 '
};

const TypeIcon = ({ type, className }: { type: InsightType, className?: string }) => {
  switch (type) {
    case 'insight': return <Lightbulb className={className} />;
    case 'strength': return <ShieldCheck className={className} />;
    case 'risk': return <AlertTriangle className={className} />;
    case 'neutral': return <Info className={className} />;
  }
};

/**
 * Editorial callout block.
 * Replaces generic cards with a minimal left-bordered container.
 */
export function InsightCallout({ type, title, children }: InsightCalloutProps) {
  return (
    <div className={`flex items-start gap-4 p-6 border-l-4 rounded-r-2xl print:border-l-2 print:bg-transparent print:p-4 print:my-4 ${typeStyles[type]}`}>
      <div className="shrink-0 mt-0.5 opacity-80">
        <TypeIcon type={type} className="w-5 h-5" />
      </div>
      <div className="flex-1">
        {title && (
          <h4 className="font-semibold text-base mb-1">{title}</h4>
        )}
        <div className="text-sm leading-relaxed opacity-90">
          {children}
        </div>
      </div>
    </div>
  );
}
