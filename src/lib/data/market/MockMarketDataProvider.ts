import { MarketDataProvider, MarketSnapshotData, MarketStory } from './MarketDataProvider';

export class MockMarketDataProvider implements MarketDataProvider {
  async getTopStories(limit: number = 10): Promise<MarketStory[]> {
    const stories: MarketStory[] = [
      {
        id: '1',
        headline: 'RBI Maintains Status Quo on Repo Rate at 6.5%',
        summary: 'The Reserve Bank of India decided to keep the benchmark repo rate unchanged for the consecutive time, citing persistent food inflation concerns despite a moderating core inflation trend.',
        source: 'Simulated Central Bank Feed',
        timestamp: new Date().toISOString(),
        publisher: 'Knowith Capital',
        url: 'https://knowith.com/news',
        categories: ['Macroeconomics', 'Central Bank', 'Interest Rates']
      },
      {
        id: '2',
        headline: 'IT Sector Q3 Earnings Show Signs of Recovery',
        summary: 'Major Indian IT services companies reported better-than-expected Q3 earnings, with management commentary suggesting stabilization in discretionary spending across US and European markets.',
        source: 'Simulated Earnings Feed',
        timestamp: new Date().toISOString(),
        publisher: 'Knowith Capital',
        url: 'https://knowith.com/news',
        categories: ['Corporate Earnings', 'IT Sector']
      },
      {
        id: '3',
        headline: 'Government Announces New PLI Scheme for Semiconductor Manufacturing',
        summary: 'In a major push to make India a global manufacturing hub, the government has unveiled a $10 Billion Production Linked Incentive (PLI) scheme dedicated to semiconductor fabrication and design.',
        source: 'Simulated Government Policy Feed',
        timestamp: new Date().toISOString(),
        publisher: 'Knowith Capital',
        url: 'https://knowith.com/news',
        categories: ['Government Policy', 'Manufacturing', 'Technology']
      },
      {
        id: '4',
        headline: 'Global Crude Prices Surge Amid Middle East Tensions',
        summary: 'Brent crude surpassed $85 per barrel following renewed geopolitical tensions in the Middle East, raising concerns about potential impacts on import-dependent economies.',
        source: 'Simulated Global Commodities Feed',
        timestamp: new Date().toISOString(),
        publisher: 'Knowith Capital',
        url: 'https://knowith.com/news',
        categories: ['Global Markets', 'Commodities', 'Geopolitics']
      },
      {
        id: '5',
        headline: 'Auto Sales Hit Record High During Festive Season',
        summary: 'Domestic automobile manufacturers reported a 15% year-on-year surge in passenger vehicle sales, driven by robust rural demand and new SUV launches.',
        source: 'Simulated Auto Industry Data',
        timestamp: new Date().toISOString(),
        publisher: 'Knowith Capital',
        url: 'https://knowith.com/news',
        categories: ['Auto Sector', 'Consumer Demand']
      }
    ];
    return stories.slice(0, limit);
  }

  async getMarketSnapshot(): Promise<MarketSnapshotData[]> {
    return [
      { indexName: 'Nifty 50', currentValue: 22150.45, changeAmount: 110.20, changePercentage: 0.50, trend: 'up' },
      { indexName: 'Sensex', currentValue: 72940.30, changeAmount: 380.15, changePercentage: 0.52, trend: 'up' },
      { indexName: 'Bank Nifty', currentValue: 46850.10, changeAmount: -45.60, changePercentage: -0.10, trend: 'down' },
      { indexName: 'Gold (10g)', currentValue: 63200.00, changeAmount: 450.00, changePercentage: 0.72, trend: 'up' },
      { indexName: 'USD/INR', currentValue: 83.05, changeAmount: 0.12, changePercentage: 0.14, trend: 'up' },
      { indexName: 'Crude Oil (Brent)', currentValue: 86.40, changeAmount: 1.20, changePercentage: 1.41, trend: 'up' },
    ];
  }

  async getSentiment(): Promise<{ sentiment: 'Bullish' | 'Bearish' | 'Neutral', confidence: number }> {
    return {
      sentiment: 'Bullish',
      confidence: 78
    };
  }
}
