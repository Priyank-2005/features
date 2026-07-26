import { z } from 'zod';

export const MarketStorySchema = z.object({
  headline: z.string(),
  publisher: z.string(),
  publishedTime: z.string(),
  originalUrl: z.string(),
  summary: z.string(),
  whyItMatters: z.string()
});

export const MarketAnalysisSchema = z.object({
  whatHappened: z.string(),
  whyItHappened: z.string(),
  economicImplications: z.string(),
  sectorImplications: z.string(),
  risks: z.array(z.string()),
  keyObservations: z.array(z.string()),
  supportingSources: z.array(z.string())
});

export const SectorImpactSchema = z.object({
  sector: z.string(),
  direction: z.enum(['Positive', 'Neutral', 'Negative']),
  confidence: z.number(), // out of 100
  expectedImpact: z.string(),
  explanation: z.string(),
  supportingSources: z.array(z.string())
});

export const MarketThemeSchema = z.object({
  themeName: z.string(),
  stories: z.array(z.string()),
  overarchingImpact: z.string()
});

export const EducationalTakeawaySchema = z.object({
  concept: z.string(),
  whyItMatters: z.string(),
  commonMisconceptions: z.string(),
  longTermPerspective: z.string()
});

export const HistoricalContextSchema = z.object({
  historicalEvent: z.string(),
  whatHappenedThen: z.string(),
  similarities: z.array(z.string()),
  differences: z.array(z.string()),
  keyLesson: z.string()
});

export const WatchNextSchema = z.object({
  event: z.string(),
  expectedDate: z.string(),
  whyMonitor: z.string()
});

export const MarketSummarySchema = z.object({
  executiveSummary: z.string(),
  overallSentiment: z.enum(['Bullish', 'Bearish', 'Neutral']),
  confidenceScore: z.number(),
  confidenceExplanation: z.string()
});

export const RawArticleSchema = z.object({
  id: z.string(),
  headline: z.string(),
  summary: z.string(),
  publisher: z.string(),
  url: z.string(),
  timestamp: z.string(),
  categories: z.array(z.string())
});

// The final Blueprint schema aggregated by the Orchestrator
export const MarketBlueprintSchema = z.object({
  generatedAt: z.string(),
  lastUpdated: z.string(),
  numberOfStoriesAnalyzed: z.number(),
  sourcesAnalyzed: z.array(z.string()),
  
  executiveSummary: z.string(),
  overallSentiment: z.enum(['Bullish', 'Bearish', 'Neutral']),
  confidenceScore: z.number(),
  confidenceExplanation: z.string(),

  marketSnapshot: z.array(z.object({
    indexName: z.string(),
    currentValue: z.number(),
    changeAmount: z.number(),
    changePercentage: z.number(),
    trend: z.enum(['up', 'down', 'flat'])
  })),

  rawNewsFeed: z.array(RawArticleSchema),
  topStories: z.array(MarketStorySchema),
  aiAnalysis: z.array(MarketAnalysisSchema),
  sectorImpacts: z.array(SectorImpactSchema),
  emergingThemes: z.array(MarketThemeSchema),
  investorTakeaways: z.array(EducationalTakeawaySchema),
  historicalContexts: z.array(HistoricalContextSchema),
  whatToWatchNext: z.array(WatchNextSchema),
  
  assumptions: z.array(z.string()),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string()
  }))
});

export type MarketBlueprint = z.infer<typeof MarketBlueprintSchema>;
