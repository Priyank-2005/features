import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, TrendingUp, AlertTriangle, Lightbulb, CheckCircle2, Download, ArrowRight } from 'lucide-react';

export interface BlueprintData {
  healthScore: number;
  healthAnalysis: string;
  investorPersonality: string;
  personalityDescription: string;
  riskProfile: string;
  riskExplanation: string;
  assetAllocation: Record<string, string>;
  allocationReasoning: string;
  insights: string[];
  risks: { title: string; description: string }[];
  opportunities: { title: string; description: string }[];
  actionPlan: { timeframe: string; action: string }[];
  missingData: string[];
  educationalTopic: { title: string; content: string };
  faqs: { question: string; answer: string }[];
}

export const WealthBlueprint: React.FC<{ data: BlueprintData }> = ({ data }) => {
  // Animation Variants
  const sectionVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } }
  };

  // Process Asset Allocation for Recharts
  const chartData = Object.entries(data.assetAllocation || {}).map(([name, value]) => {
    const numericValue = parseInt(String(value).replace(/\D/g, '')) || 0;
    return { name, value: numericValue };
  });
  
  const COLORS = ['#4f46e5', '#818cf8', '#c7d2fe', '#e0e7ff', '#312e81'];

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 md:px-8 bg-white text-slate-800">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center mb-20"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-widest mb-6">
          <ShieldCheck size={14} /> Knowith Capital AI
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
          Your Wealth Blueprint
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          A personalized financial strategy generated specifically for you, balancing growth potential with your unique risk tolerance.
        </p>
      </motion.div>

      <div className="space-y-24">
        
        {/* Section 1 & 2: Health Score & Personality */}
        <motion.section 
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 gap-8"
        >
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex flex-col items-center text-center">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-6">Financial Health</h3>
            
            {/* Custom Animated Gauge */}
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                <motion.circle 
                  cx="96" 
                  cy="96" 
                  r="80" 
                  fill="transparent" 
                  stroke="url(#blue-gradient)" 
                  strokeWidth="16" 
                  strokeDasharray="502.65" 
                  initial={{ strokeDashoffset: 502.65 }}
                  whileInView={{ strokeDashoffset: 502.65 - (502.65 * (data.healthScore || 0)) / 100 }}
                  transition={{ duration: 2, ease: "easeOut" as const }}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-5xl font-black text-slate-800 tracking-tighter">{data.healthScore}</span>
                <span className="text-xs font-bold text-slate-400 uppercase mt-1">Score</span>
              </div>
            </div>
            
            <p className="text-slate-600 font-medium">{data.healthAnalysis}</p>
          </div>

          <div className="bg-indigo-950 rounded-3xl p-8 text-white flex flex-col justify-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-indigo-300 mb-6 relative z-10">Investor Identity</h3>
            <h2 className="text-4xl font-bold mb-4 relative z-10">{data.investorPersonality}</h2>
            <p className="text-indigo-100/80 text-lg leading-relaxed relative z-10">{data.personalityDescription}</p>
          </div>
        </motion.section>

        {/* Section 4 & 5: Risk Profile & Asset Allocation */}
        <motion.section 
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-12 items-center">
            
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">Risk Profile</h3>
                <h2 className="text-3xl font-bold text-slate-800">{data.riskProfile}</h2>
              </div>
              <p className="text-slate-600 text-lg">{data.riskExplanation}</p>
              
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">Allocation Strategy</h3>
                <p className="text-slate-700 italic border-l-4 border-indigo-500 pl-4 py-1">{data.allocationReasoning}</p>
              </div>
            </div>

            <div className="w-full md:w-1/2 h-80 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={1500}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value}%`, 'Allocation']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <TrendingUp size={32} className="text-indigo-600 mb-2" />
                <span className="font-bold text-slate-800">Target</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Section 6 & 7 & 8: Insights, Risks, Opportunities */}
        <motion.section 
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-6"
        >
          {/* Insights */}
          <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Key Insights</h3>
            <ul className="space-y-4">
              {(data.insights || []).map((insight, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                  <span className="text-slate-700 text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <Lightbulb className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Opportunities</h3>
            <ul className="space-y-6">
              {(data.opportunities || []).map((opp, idx) => (
                <li key={idx}>
                  <h4 className="font-bold text-indigo-900 text-sm mb-1">{opp.title}</h4>
                  <p className="text-slate-600 text-sm">{opp.description}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Risks */}
          <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Watch Out</h3>
            <ul className="space-y-6">
              {(data.risks || []).map((risk, idx) => (
                <li key={idx}>
                  <h4 className="font-bold text-amber-900 text-sm mb-1">{risk.title}</h4>
                  <p className="text-slate-600 text-sm">{risk.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* Section 9: Action Plan */}
        <motion.section 
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-8 text-center">Your Next Steps</h3>
            
            <div className="max-w-2xl mx-auto space-y-6">
              {(data.actionPlan || []).map((action, idx) => (
                <div key={idx} className="flex items-center gap-6 bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-24 text-right shrink-0 font-bold text-indigo-400">{action.timeframe}</div>
                  <div className="w-px h-12 bg-slate-700 shrink-0 hidden sm:block"></div>
                  <div className="text-slate-200">{action.action}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Missing Data & Educational */}
        <motion.section 
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 gap-8"
        >
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl">
            <h3 className="font-bold text-slate-800 mb-4">Improve this Blueprint</h3>
            <p className="text-slate-500 text-sm mb-6">We could make even better recommendations if we knew your:</p>
            <div className="flex flex-wrap gap-2">
              {(data.missingData || []).map((item, idx) => (
                <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                  + {item}
                </span>
              ))}
            </div>
          </div>

          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200">
            <h3 className="font-bold text-indigo-900 mb-2">Learn: {data.educationalTopic?.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{data.educationalTopic?.content}</p>
          </div>
        </motion.section>

        {/* Footer CTAs */}
        <motion.section 
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-12 border-t border-slate-100"
        >
          <button 
            onClick={() => window.print()}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
          >
            Download PDF <Download size={18} />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-full border border-slate-200 transition-colors flex items-center justify-center gap-2">
            Book Consultation <ArrowRight size={18} />
          </button>
        </motion.section>

      </div>
    </div>
  );
};
