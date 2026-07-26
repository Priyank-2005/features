export interface MarketStory {
  id: string;
  headline: string;
  summary: string;
  source: string;
  publisher: string;
  url: string;
  timestamp: string;
  categories: string[];
}

export interface MarketSnapshotData {
  indexName: string;
  currentValue: number;
  changeAmount: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'flat';
}

export interface MarketDataProvider {
  getTopStories(limit?: number): Promise<MarketStory[]>;
  getMarketSnapshot(): Promise<MarketSnapshotData[]>;
  getSentiment(): Promise<{ sentiment: 'Bullish' | 'Bearish' | 'Neutral', confidence: number }>;
}
