import { NextResponse } from 'next/server';
import { WorkflowExecutor } from '@/lib/ai/core/orchestrator/WorkflowExecutor';
import { marketWorkflow } from '@/lib/ai/features/market/MarketWorkflow';
import { LiveMarketDataProvider } from '@/lib/data/market/LiveMarketDataProvider';
import { MarketNewsCapability } from '@/lib/ai/features/market/capabilities/MarketNewsCapability';
import { MarketAnalysisCapability } from '@/lib/ai/features/market/capabilities/MarketAnalysisCapability';
import { SectorImpactCapability } from '@/lib/ai/features/market/capabilities/SectorImpactCapability';
import { InvestorEducationCapability } from '@/lib/ai/features/market/capabilities/InvestorEducationCapability';
import { MarketSummaryCapability } from '@/lib/ai/features/market/capabilities/MarketSummaryCapability';

const marketRegistry = new Map();
marketRegistry.set(MarketNewsCapability.id, MarketNewsCapability);
marketRegistry.set(MarketAnalysisCapability.id, MarketAnalysisCapability);
marketRegistry.set(SectorImpactCapability.id, SectorImpactCapability);
marketRegistry.set(InvestorEducationCapability.id, InvestorEducationCapability);
marketRegistry.set(MarketSummaryCapability.id, MarketSummaryCapability);

let cachedBlueprint: any = null;
let lastCacheTime: number = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const forceRefresh = body.forceRefresh === true;

    // Caching Strategy
    if (!forceRefresh && cachedBlueprint && (Date.now() - lastCacheTime < CACHE_TTL_MS)) {
      console.log("[Market API] Serving cached blueprint.");
      return NextResponse.json({
        status: 'success',
        data: { blueprint: cachedBlueprint }
      });
    }

    const dataProvider = new LiveMarketDataProvider();
    
    console.log("[Market API] Fetching mock market data...");
    const feed = await dataProvider.getTopStories(10);
    const snapshot = await dataProvider.getMarketSnapshot();

    const executor = new WorkflowExecutor(marketWorkflow, marketRegistry);
    
    console.log("[Market API] Starting Market Intelligence workflow...");
    const result = await executor.execute('market_session_1', {
      feed,
      snapshot
    });

    const blueprint = result.data;

    if (result.status === 'SUCCESS' || result.status === 'PARTIAL') {
      cachedBlueprint = blueprint;
      lastCacheTime = Date.now();
    }

    return NextResponse.json({
      status: 'success',
      data: {
        blueprint
      }
    });

  } catch (error: any) {
    console.error("[Market API Error]:", error);
    return NextResponse.json(
      { error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
