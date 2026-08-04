"use client";

import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="relative flex items-center justify-between w-full">
        {/* Background track line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-[#2E2E3E]/50 rounded-full" />
        
        {/* Active track line */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: `${(Math.max(0, currentStep - 1) / (steps.length - 1)) * 100}%` }} 
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <motion.div 
                initial={false}
                animate={{
                  backgroundColor: isActive || isCompleted ? "rgb(59 130 246)" : "rgb(30 30 46)",
                  borderColor: isActive || isCompleted ? "rgb(99 102 241)" : "rgba(46, 46, 62, 0.5)",
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  isActive 
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] text-white" 
                    : isCompleted 
                      ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400" 
                      : "bg-[#1E1E2E] border-[#2E2E3E]/50 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-semibold">{stepNumber}</span>
                )}
              </motion.div>
              <div className="absolute top-10 flex flex-col items-center">
                <span className={`text-xs font-medium whitespace-nowrap transition-colors duration-300 ${
                  isActive ? "text-white" : isCompleted ? "text-gray-300" : "text-gray-500"
                }`}>
                  {step}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="h-10" /> {/* Spacer for labels */}
    </div>
  );
}
