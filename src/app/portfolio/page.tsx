"use client";

import { useState } from "react";
import { PieChart, Loader2 } from "lucide-react";
import { callGrokAPI } from "@/lib/grok";
import ReactMarkdown from "react-markdown";

const SYSTEM_PROMPT = `You are a professional AI Portfolio Analyzer for Knowith Capital.
Evaluate the portfolio diversification, asset allocation, sector exposure, and overall risk based on the user's uploaded/pasted portfolio.
Summarize the findings, highlight strengths, weaknesses, and opportunities for improvement.
Format your output beautifully in Markdown.`;

export default function PortfolioPage() {
  const [portfolioData, setPortfolioData] = useState("");
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioData.trim()) return;
    
    setIsLoading(true);
    setReport(null);

    const prompt = `Here is my portfolio data:\\n${portfolioData}\\n\\nPlease analyze this portfolio.`;

    try {
      const reply = await callGrokAPI([{ role: "user", content: prompt }], SYSTEM_PROMPT);
      setReport(reply);
    } catch (error: any) {
      setReport(`**Error**: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto overflow-y-auto">
      <header className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-bold gradient-text">Portfolio Analyzer</h1>
        <p className="text-gray-400 mt-2">Get professional AI insights into your asset allocation and diversification.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both">
        <div className="glass-panel p-6 h-fit">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <PieChart className="text-blue-400 w-5 h-5" />
            Your Portfolio
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Paste your portfolio details (assets, amounts, symbols, etc.)
              </label>
              <textarea 
                required 
                rows={8}
                value={portfolioData} 
                onChange={(e) => setPortfolioData(e.target.value)} 
                className="w-full bg-[#0A0A0A] border border-[#2E2E3E] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none" 
                placeholder="e.g.&#10;HDFC Bank: 50,000 INR&#10;Reliance: 30,000 INR&#10;Nifty 50 Index Fund: 100,000 INR&#10;Gold: 20,000 INR" 
              />
            </div>
            
            <button disabled={isLoading || !portfolioData.trim()} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PieChart className="w-5 h-5" />}
              {isLoading ? "Analyzing Portfolio..." : "Analyze Portfolio"}
            </button>
          </form>
        </div>

        <div className="glass-panel p-6 h-fit min-h-[400px]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            AI Professional Insights
          </h2>
          {isLoading ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-blue-400 gap-4">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="text-sm animate-pulse text-gray-400">Evaluating diversification...</p>
            </div>
          ) : report ? (
            <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm text-center">
              Input your portfolio data and generate a report to see professional insights.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
