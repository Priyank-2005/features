import React from 'react';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';

export interface RoadmapStep {
  timeframe: string;
  action: string;
  impact?: string;
}

interface RoadmapTimelineProps {
  steps: RoadmapStep[];
}

/**
 * Editorial timeline replacing generic card lists for Action Plans.
 */
export function RoadmapTimeline({ steps }: RoadmapTimelineProps) {
  return (
    <div className="relative border-l border-slate-200  ml-3 md:ml-4 space-y-12 print:space-y-8 print:border-slate-300">
      {steps.map((step, idx) => (
        <div key={idx} className="relative pl-8 md:pl-10">
          {/* Timeline Node */}
          <div className="absolute left-[-17px] top-1 flex items-center justify-center w-8 h-8 rounded-full bg-white  border-2 border-indigo-500 print:border-black print:bg-white">
            <span className="text-xs font-bold text-indigo-500 print:text-black">{idx + 1}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-3">
            <h4 className="font-semibold text-lg text-slate-900  print:text-black">
              {step.action}
            </h4>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100  text-xs font-medium text-slate-600  uppercase tracking-wider print:bg-transparent print:border print:border-slate-300 print:text-black">
              <Clock className="w-3.5 h-3.5" />
              {step.timeframe}
            </span>
          </div>

          {step.impact && (
            <p className="text-slate-600  text-sm leading-relaxed max-w-2xl print:text-slate-800">
              <span className="font-medium text-slate-900  print:text-black">Impact:</span> {step.impact}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
