"use client";

import { useState } from "react";
import { Activity, Loader2 } from "lucide-react";
import { callGrokAPI } from "@/lib/grok";
import ReactMarkdown from "react-markdown";

const SYSTEM_PROMPT = `You are an AI Financial Health Analyzer. 
The user will provide their income, expenses, savings, liabilities, and investments.
Calculate important financial metrics (e.g., debt-to-income ratio, savings rate) and generate an easy-to-understand report with personalized recommendations to improve their financial health.
Format the output beautifully in Markdown. Use bullet points and bold text for key metrics.`;

export default function FinancialHealthPage() {
  const [formData, setFormData] = useState({
    income: "",
    expenses: "",
    savings: "",
    liabilities: "",
    investments: ""
  });
  
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setReport(null);

    const prompt = `Please analyze my financial health based on the following:
Income: ${formData.income}
Monthly Expenses: ${formData.expenses}
Current Savings: ${formData.savings}
Total Liabilities (Debt): ${formData.liabilities}
Total Investments: ${formData.investments}`;

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
        <h1 className="text-3xl font-bold gradient-text">Financial Health Analyzer</h1>
        <p className="text-gray-400 mt-2">Get a comprehensive AI analysis of your current financial situation.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both">
        <div className="glass-panel p-6 h-fit">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Activity className="text-blue-400 w-5 h-5" />
            Enter Your Details
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Monthly Income (₹)</label>
              <input required type="number" name="income" value={formData.income} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. 100000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Monthly Expenses (₹)</label>
              <input required type="number" name="expenses" value={formData.expenses} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. 40000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Total Savings (₹)</label>
              <input required type="number" name="savings" value={formData.savings} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. 500000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Total Liabilities / Debt (₹)</label>
              <input required type="number" name="liabilities" value={formData.liabilities} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. 150000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Total Investments (₹)</label>
              <input required type="number" name="investments" value={formData.investments} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. 300000" />
            </div>
            
            <button disabled={isLoading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
              {isLoading ? "Analyzing..." : "Generate AI Report"}
            </button>
          </form>
        </div>

        <div className="glass-panel p-6 h-fit min-h-[400px]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            AI Analysis Report
          </h2>
          {isLoading ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-blue-400 gap-4">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="text-sm animate-pulse text-gray-400">Crunching the numbers...</p>
            </div>
          ) : report ? (
            <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm text-center">
              Fill out your details and generate a report to see your financial health metrics and personalized AI recommendations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
