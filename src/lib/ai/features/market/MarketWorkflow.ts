import { WorkflowDefinition } from '../../core/types';
import { MarketNewsCapability } from './capabilities/MarketNewsCapability';
import { MarketAnalysisCapability } from './capabilities/MarketAnalysisCapability';
import { SectorImpactCapability } from './capabilities/SectorImpactCapability';
import { InvestorEducationCapability } from './capabilities/InvestorEducationCapability';
import { MarketSummaryCapability } from './capabilities/MarketSummaryCapability';
import { MarketBlueprint } from '@/schemas/market.schema';
import { marketConfig } from '@/lib/config/market.config';

export const marketWorkflow: WorkflowDefinition = {
  id: 'market_intelligence_workflow',
  version: '1.0',
  description: 'Analyzes market news and computes impact',
  stages: [
    {
      id: 'news_processing_stage',
      executeType: 'PARALLEL',
      capabilities: [MarketNewsCapability.id],
    },
    {
      id: 'analysis_stage',
      executeType: 'PARALLEL',
      capabilities: [MarketAnalysisCapability.id, SectorImpactCapability.id, InvestorEducationCapability.id],
    },
    {
      id: 'summary_stage',
      executeType: 'PARALLEL',
      capabilities: [MarketSummaryCapability.id],
    }
  ],
  assembler: (stageResults: Record<string, any>, initialInput: any): MarketBlueprint => {
    const newsResult = stageResults['news_processing_stage']?.['market_news_v1'];
    const analysisResult = stageResults['analysis_stage']?.['market_analysis_v1'];
    const sectorResult = stageResults['analysis_stage']?.['sector_impact_v1'];
    const eduResult = stageResults['analysis_stage']?.['investor_education_v1'];
    const summaryResult = stageResults['summary_stage']?.['market_summary_v1'];

    // Collect all unique sources
    const sourcesAnalyzed = Array.from(new Set(initialInput.feed.map((s: any) => s.publisher || s.source)));

    return {
      generatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      numberOfStoriesAnalyzed: initialInput.feed.length,
      sourcesAnalyzed: sourcesAnalyzed as string[],
      
      executiveSummary: summaryResult?.executiveSummary || "Analysis generation incomplete.",
      overallSentiment: summaryResult?.overallSentiment || "Neutral",
      confidenceScore: summaryResult?.confidenceScore || 0,
      confidenceExplanation: summaryResult?.confidenceExplanation || "Insufficient data to calculate a robust confidence score.",

      marketSnapshot: initialInput.snapshot || [],
      rawNewsFeed: initialInput.feed || [],

      topStories: newsResult?.topStories || [],
      aiAnalysis: analysisResult?.aiAnalysis || [],
      sectorImpacts: sectorResult?.sectorImpacts || [],
      emergingThemes: analysisResult?.emergingThemes || [],
      investorTakeaways: eduResult?.investorTakeaways || [],
      historicalContexts: eduResult?.historicalContexts || [],
      whatToWatchNext: analysisResult?.whatToWatchNext || [],
      
      assumptions: marketConfig.assumptions,
      faqs: eduResult?.faqs || []
    };
  }
};
