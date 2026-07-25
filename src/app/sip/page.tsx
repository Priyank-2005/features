"use client";

import { useState } from "react";
import { Target, Loader2 } from "lucide-react";
import { callGrokAPI } from "@/lib/grok";
import ReactMarkdown from "react-markdown";

const SYSTEM_PROMPT = `You are an AI SIP Goal Calculator for Knowith Capital.
The user wants to achieve a specific financial goal.
Explain the SIP calculation simply, discuss the feasibility of their goal, and provide investment planning guidance.
Format your output beautifully in Markdown.`;

export default function SIPCalculatorPage() {
  const [formData, setFormData] = useState({
    targetAmount: "",
    durationYears: "",
    expectedReturn: "12"
  });
  
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedSip, setCalculatedSip] = useState<number | null>(null);

  const calculateSIP = (targetAmount: number, years: number, expectedReturn: number) => {
    const months = years * 12;
    const monthlyRate = expectedReturn / 12 / 100;
    // FV = P × ({[1 + i]^n - 1} / i) × (1 + i)
    const sip = (targetAmount * monthlyRate) / ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate));
    return Math.round(sip);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setReport(null);

    const target = parseFloat(formData.targetAmount);
    const years = parseFloat(formData.durationYears);
    const returns = parseFloat(formData.expectedReturn);

    const sip = calculateSIP(target, years, returns);
    setCalculatedSip(sip);

    const prompt = `I want to achieve a target amount of ₹${target} in ${years} years.
I am expecting an annual return of ${returns}%.
My calculated required monthly SIP is ₹${sip}.
Can you explain this calculation to me, assess if my expectations are realistic, and provide guidance on how to plan this investment?`;

    try {
      const reply = await callGrokAPI([{ role: "user", content: prompt }], SYSTEM_PROMPT);
      setReport(reply);
    } catch (error: any) {
      setReport(`**Error**: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto overflow-y-auto">
      <header className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-bold gradient-text">SIP Goal Calculator</h1>
        <p className="text-gray-400 mt-2">Find out how much you need to invest monthly to reach your target.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both">
        <div className="glass-panel p-6 h-fit">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Target className="text-blue-400 w-5 h-5" />
            Set Your Goal
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Target Amount (₹)</label>
              <input required type="number" name="targetAmount" value={formData.targetAmount} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. 10000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Investment Duration (Years)</label>
              <input required type="number" name="durationYears" value={formData.durationYears} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. 10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Expected Annual Return (%)</label>
              <input required type="number" name="expectedReturn" value={formData.expectedReturn} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. 12" />
            </div>
            
            <button disabled={isLoading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
              {isLoading ? "Calculating..." : "Calculate SIP"}
            </button>
          </form>

          {calculatedSip !== null && !isLoading && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center animate-in zoom-in duration-300">
              <p className="text-sm text-gray-400 mb-1">Required Monthly SIP</p>
              <p className="text-3xl font-bold text-blue-400">₹{calculatedSip.toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="glass-panel p-6 h-fit min-h-[400px]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            AI Investment Planning Guidance
          </h2>
          {isLoading ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-blue-400 gap-4">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="text-sm animate-pulse text-gray-400">Consulting AI Advisor...</p>
            </div>
          ) : report ? (
            <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm text-center">
              Calculate your SIP to get an AI-generated explanation and feasibility check for your financial goal.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
