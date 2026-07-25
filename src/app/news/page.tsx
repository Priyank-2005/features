"use client";

import { useState, useEffect } from "react";
import { Newspaper, Loader2, RefreshCw } from "lucide-react";
import { callGrokAPI } from "@/lib/grok";
import ReactMarkdown from "react-markdown";

const SYSTEM_PROMPT = `You are an AI Market News Summarizer for Knowith Capital.
Since we don't have a live news feed connected yet, generate a realistic, simulated "Daily Market Summary" for today's Indian and Global financial markets.
Include 3-4 major news headlines, summarize important developments, and highlight potential market impacts (e.g., impact on Nifty 50, specific sectors).
Format beautifully in Markdown. Be concise but informative.`;

export default function MarketNewsPage() {
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNewsSummary = async () => {
    setIsLoading(true);
    setReport(null);

    try {
      const reply = await callGrokAPI([{ role: "user", content: "Generate today's market news summary and analysis." }], SYSTEM_PROMPT);
      setReport(reply);
    } catch (error: any) {
      setReport(`**Error**: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsSummary();
  }, []);

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto overflow-y-auto">
      <header className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Market News Summarizer</h1>
          <p className="text-gray-400 mt-2">Daily AI-curated updates on global and domestic financial markets.</p>
        </div>
        <button 
          onClick={fetchNewsSummary}
          disabled={isLoading}
          className="bg-[#1E1E2E] hover:bg-[#2E2E3E] border border-[#3E3E5E] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      <div className="glass-panel p-8 min-h-[60vh] animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 border-b border-[#2E2E3E] pb-4">
          <Newspaper className="text-blue-400 w-6 h-6" />
          Today's Market Pulse
        </h2>
        
        {isLoading ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-blue-400 gap-4">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="text-sm animate-pulse text-gray-400">Aggregating and summarizing global news...</p>
          </div>
        ) : report ? (
          <div className="prose prose-invert max-w-none prose-h3:text-blue-400 prose-a:text-indigo-400 leading-relaxed whitespace-pre-wrap">
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-gray-500 text-sm text-center">
            Failed to load news summary.
          </div>
        )}
      </div>
    </div>
  );
}
