import React from 'react';
import { Target, PieChart, AlertCircle, Info, ShieldAlert } from 'lucide-react';

export interface AICard {
  type: string;
  data: any;
}

interface CardRendererProps {
  cards: AICard[];
}

export const CardRenderer: React.FC<CardRendererProps> = ({ cards }) => {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 mt-4 w-full">
      {cards.map((card, index) => {
        switch (card.type) {
          case 'risk-profile':
            return (
              <div key={index} className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg relative">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Target size={120} />
                </div>
                <div className="p-6 relative z-10">
                  <div className="flex items-center gap-2 mb-4 opacity-80">
                    <Target size={18} />
                    <h3 className="font-medium text-sm tracking-wide uppercase">Risk Profile Assessment</h3>
                  </div>
                  <h2 className="text-3xl font-bold mb-2 capitalize">{card.data.description || card.data.profile || 'Balanced'}</h2>
                  <p className="text-indigo-100 text-sm leading-relaxed max-w-[85%]">
                    {card.data.reasoning || "Based on your age, income, and goals, this profile maximizes your potential returns while managing downside risk."}
                  </p>
                </div>
              </div>
            );
          case 'asset-allocation':
            return (
              <div key={index} className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                  <PieChart size={18} className="text-indigo-500" />
                  <h3 className="font-semibold text-slate-800">Recommended Asset Allocation</h3>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(card.data).map(([assetClass, allocation]: [string, any]) => {
                      if (assetClass === 'reasoning') return null;
                      return (
                        <div key={assetClass} className="bg-slate-50 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                          <span className="text-2xl font-bold text-slate-800">{allocation}</span>
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">{assetClass}</span>
                        </div>
                      )
                    })}
                  </div>
                  {card.data.reasoning && (
                     <div className="mt-4 p-3 bg-indigo-50 rounded-lg flex items-start gap-3">
                       <Info size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                       <p className="text-sm text-indigo-900">{card.data.reasoning}</p>
                     </div>
                  )}
                </div>
              </div>
            );
          case 'missing-info':
            return (
              <div key={index} className="p-4 bg-amber-50 border border-amber-200 rounded-xl shadow-sm flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-500 shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">Missing Information</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(card.data.fields || []).map((f: string) => (
                      <span key={f} className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          case 'escalation-handoff':
            return (
              <div key={index} className="rounded-2xl bg-white border border-rose-200 shadow-sm overflow-hidden mt-4">
                <div className="p-4 border-b border-rose-100 bg-rose-50 flex items-center gap-2">
                  <AlertCircle size={18} className="text-rose-600" />
                  <h3 className="font-semibold text-rose-900">Human Advisor Esclation</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reason</h4>
                    <p className="text-sm font-medium text-slate-800">{card.data.reason}</p>
                  </div>
                  <div className="flex gap-4">
                     <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Priority</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        card.data.priority === 'Urgent' || card.data.priority === 'High' 
                          ? 'bg-rose-100 text-rose-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {card.data.priority}
                      </span>
                     </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Recommended Follow-up</h4>
                    <p className="text-sm text-slate-600">{card.data.recommendedFollowUp}</p>
                  </div>
                </div>
              </div>
            );
          case 'disclaimer':
            return (
              <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-slate-500 text-xs mt-2">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <p>{card.data.text || "Educational purposes only. This is not financial advice."}</p>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};
