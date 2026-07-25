"use client";

import { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { callGrokAPI } from "@/lib/grok";
import ReactMarkdown from "react-markdown";

const SYSTEM_PROMPT = `You are an AI Tax Saving Advisor for Knowith Capital.
The user wants to reduce their tax liability. Evaluate their salary, chosen tax regime, current deductions, and investments.
Recommend suitable tax-saving products (like ELSS, PPF, NPS, Insurance) and strategies available through the company.
Explain how much tax they can potentially save. Format your output beautifully in Markdown.`;

export default function TaxAdvisorPage() {
  const [formData, setFormData] = useState({
    salary: "",
    regime: "old",
    deductions80C: "",
    healthInsurance: "",
    otherInvestments: ""
  });
  
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setReport(null);

    const prompt = `Please provide tax saving advice based on my details:
Annual Salary: ₹${formData.salary}
Preferred Tax Regime: ${formData.regime === 'old' ? 'Old Regime' : 'New Regime'}
Current Section 80C Deductions (EPF, PPF, LIC, etc.): ₹${formData.deductions80C}
Health Insurance Premium (Section 80D): ₹${formData.healthInsurance}
Other Tax-Saving Investments: ₹${formData.otherInvestments}

What are the best tax-saving strategies and products for me?`;

    try {
      const reply = await callGrokAPI([{ role: "user", content: prompt }], SYSTEM_PROMPT);
      setReport(reply);
    } catch (error: any) {
      setReport(`**Error**: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto overflow-y-auto">
      <header className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-bold gradient-text">Tax Saving Advisor</h1>
        <p className="text-gray-400 mt-2">Get personalized strategies to legally reduce your tax liability.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both">
        <div className="glass-panel p-6 h-fit">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <ShieldCheck className="text-blue-400 w-5 h-5" />
            Your Tax Profile
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Annual Salary (₹)</label>
              <input required type="number" name="salary" value={formData.salary} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. 1500000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Preferred Tax Regime</label>
              <select name="regime" value={formData.regime} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option value="old">Old Regime</option>
                <option value="new">New Regime</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Current 80C Deductions (₹)</label>
              <input required type="number" name="deductions80C" value={formData.deductions80C} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. 50000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Health Insurance (80D) (₹)</label>
              <input required type="number" name="healthInsurance" value={formData.healthInsurance} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. 25000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Other Tax-Saving Investments (₹)</label>
              <input type="number" name="otherInvestments" value={formData.otherInvestments} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. NPS, HRA, etc. (Optional)" />
            </div>
            
            <button disabled={isLoading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              {isLoading ? "Analyzing..." : "Get Tax Advice"}
            </button>
          </form>
        </div>

        <div className="glass-panel p-6 h-fit min-h-[400px]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            AI Tax Saving Recommendations
          </h2>
          {isLoading ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-blue-400 gap-4">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="text-sm animate-pulse text-gray-400">Finding the best deductions...</p>
            </div>
          ) : report ? (
            <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm text-center">
              Submit your tax profile to get AI-powered recommendations for saving tax.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
