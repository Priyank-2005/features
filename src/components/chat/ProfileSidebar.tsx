import React from 'react';
import { FieldMetadata } from '@/lib/config/types';
import { CheckCircle2, Circle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileSidebarProps {
  fields: FieldMetadata[];
  profileData: Record<string, any>;
  title?: string;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ fields, profileData, title = "Your Financial Snapshot" }) => {
  // Calculate completion percentage
  const totalRequired = fields.filter(f => f.required).length;
  const completedRequired = fields.filter(f => f.required && profileData[f.id] !== undefined && profileData[f.id] !== null).length;
  const progress = totalRequired === 0 ? 100 : Math.round((completedRequired / totalRequired) * 100);

  // Financial Readiness Score (Visual only for now, based on progress)
  const readinessScore = Math.min(progress, 99); // Max 99 until fully computed in the Blueprint

  return (
    <div className="w-80 border-l border-slate-200 bg-slate-50/50 backdrop-blur-xl h-full flex flex-col hidden lg:flex shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] z-10">
      
      {/* Header & Readiness Score */}
      <div className="p-8 border-b border-slate-200 bg-white relative overflow-hidden">
        {/* Decorative Gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <h2 className="text-xl font-bold text-slate-800 tracking-tight relative z-10">{title}</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6 relative z-10">Data secured by Knowith AI</p>
        
        {/* Animated Circular Score */}
        <div className="flex items-center gap-5 relative z-10">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="28" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
              <motion.circle 
                cx="32" 
                cy="32" 
                r="28" 
                fill="transparent" 
                stroke="url(#gradient)" 
                strokeWidth="6" 
                strokeDasharray="175.93" 
                initial={{ strokeDashoffset: 175.93 }}
                animate={{ strokeDashoffset: 175.93 - (175.93 * progress) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-lg font-bold text-slate-800 leading-none">{progress}%</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Readiness Score</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {progress === 100 ? "Ready for Blueprint" : "Collecting insights..."}
            </p>
          </div>
        </div>
      </div>

      {/* Verified Fields List */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="space-y-6">
          {fields.map((field, idx) => {
            const val = profileData[field.id];
            const isCompleted = val !== undefined && val !== null;
            
            return (
              <motion.div 
                key={field.id} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="relative group"
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <AnimatePresence mode="wait">
                    {isCompleted ? (
                      <motion.div
                        key="completed"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      >
                        <ShieldCheck size={18} className="text-indigo-500 drop-shadow-sm" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="pending"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Circle size={18} className="text-slate-200" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <label className={`text-sm font-semibold ${isCompleted ? 'text-slate-800' : 'text-slate-500'} transition-colors`}>
                    {field.label} {field.required && !isCompleted && <span className="text-red-400">*</span>}
                  </label>
                </div>
                
                <div className="pl-7 border-l-2 border-transparent group-hover:border-slate-100 transition-colors py-0.5">
                  <AnimatePresence mode="wait">
                    {isCompleted ? (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-indigo-950 bg-white py-2 px-3 rounded-lg border border-slate-200/60 shadow-sm font-medium"
                      >
                        {field.type === 'currency' 
                          ? (typeof val === 'number' ? `₹ ${val.toLocaleString('en-IN')}` : String(val).includes('₹') ? val : `₹ ${val}`) 
                          : String(val)}
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs font-medium text-slate-400 bg-slate-100/50 py-1.5 px-3 rounded-md inline-block"
                      >
                        Awaiting response...
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
