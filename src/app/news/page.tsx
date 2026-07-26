"use client";

import { useState, useEffect } from "react";

import { MarketBlueprint as MarketBlueprintUI } from "@/components/market/MarketBlueprint";
import { OrchestratorLoading } from "@/components/chat/OrchestratorLoading";
import { MarketBlueprint } from "@/schemas/market.schema";
import { RefreshCw } from "lucide-react";

export default function MarketNewsPage() {
  const [blueprint, setBlueprint] = useState<MarketBlueprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketIntelligence = async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    
    setError(null);
    
    try {
      const response = await fetch('/api/v1/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceRefresh })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error?.message || "Failed to load market intelligence");

      if (data.data?.blueprint) {
        setBlueprint(data.data.blueprint);
      }
    } catch (err: any) {
      console.error(err);
      setError("Unable to generate market intelligence at this time. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMarketIntelligence();
  }, []);

  return (
    <>
      <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden print:bg-white print:h-auto print:overflow-visible">
        
        {/* Top bar for mobile/web structure (consistent with platform but no chat sidebar) */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 shrink-0 z-10 print:hidden shadow-sm">
           <h2 className="font-medium text-indigo-900">Market News</h2>
        </header>

        <main className="flex-1 overflow-y-auto w-full print:overflow-visible">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <OrchestratorLoading />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-4">
                 <RefreshCw size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Analysis Failed</h3>
              <p className="text-slate-500 mb-6">{error}</p>
              <button 
                onClick={() => fetchMarketIntelligence(true)}
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : blueprint ? (
            <div className="max-w-6xl mx-auto p-4 md:p-8">
              <MarketBlueprintUI 
                data={blueprint} 
                onRefresh={() => fetchMarketIntelligence(true)} 
                isRefreshing={isRefreshing}
              />
            </div>
          ) : null}
        </main>
      </div>
    </>
  );
}
