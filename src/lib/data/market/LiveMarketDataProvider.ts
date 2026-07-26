import { MarketDataProvider, MarketSnapshotData, MarketStory } from './MarketDataProvider';
import Parser from 'rss-parser';

// Bypass Next.js ESM proxy objects for yahoo-finance2
const yfPkg = require('yahoo-finance2');
const YF = yfPkg.default || yfPkg;
const yahooFinance = typeof YF === 'function' && YF.name === 'YahooFinance' ? new YF() : YF;

export class LiveMarketDataProvider implements MarketDataProvider {
  async getTopStories(limit: number = 10): Promise<MarketStory[]> {
    const parser = new Parser();
    try {
      const feedUrl = 'https://news.google.com/rss/search?q=indian+stock+market+economy+finance&hl=en-IN&gl=IN&ceid=IN:en';
      const feed = await parser.parseURL(feedUrl);
      
      const uniqueStories = new Map<string, MarketStory>();
      
      for (const item of feed.items) {
        // Basic extraction
        const rawTitle = item.title || 'Market Update';
        // Google News often formats titles as "Headline - Publisher"
        const titleParts = rawTitle.split(' - ');
        const headline = titleParts.length > 1 ? titleParts.slice(0, -1).join(' - ') : rawTitle;
        const publisher = item.source || (titleParts.length > 1 ? titleParts[titleParts.length - 1] : 'Google News');
        
        // Deduplication based on exact headline match (or very similar)
        const dedupeKey = headline.toLowerCase().trim();
        if (uniqueStories.has(dedupeKey)) continue;

        uniqueStories.set(dedupeKey, {
          id: `live_${item.guid || Date.now().toString()}`,
          headline: headline,
          summary: item.contentSnippet || headline,
          source: item.source || 'Google News RSS',
          publisher: publisher,
          url: item.link || '',
          timestamp: item.isoDate || item.pubDate || new Date().toISOString(),
          categories: ['Finance', 'India Markets']
        });
      }

      // Rank by recency (assuming pubDate is parseable)
      const rankedStories = Array.from(uniqueStories.values()).sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      return rankedStories.slice(0, limit);
    } catch (error) {
      console.error("[LiveMarketDataProvider] Failed to fetch news RSS", error);
      return [];
    }
  }

  async getMarketSnapshot(): Promise<MarketSnapshotData[]> {
    const indices = [
      { symbol: '^NSEI', name: 'Nifty 50' },
      { symbol: '^BSESN', name: 'Sensex' },
      { symbol: '^NSEBANK', name: 'Bank Nifty' },
      { symbol: 'INR=X', name: 'USD/INR' },
      { symbol: 'GC=F', name: 'Gold (Global)' },
      { symbol: 'BZ=F', name: 'Crude Oil (Brent)' }
    ];

    const snapshotData: MarketSnapshotData[] = [];

    for (const idx of indices) {
      try {
        const quote = await yahooFinance.quote(idx.symbol);
        
        if (quote && quote.regularMarketPrice !== undefined) {
          const currentValue = quote.regularMarketPrice;
          const previousClose = quote.regularMarketPreviousClose || currentValue;
          const changeAmount = quote.regularMarketChange || (currentValue - previousClose);
          const changePercentage = quote.regularMarketChangePercent || ((changeAmount / previousClose) * 100);
          
          let trend: 'up' | 'down' | 'flat' = 'flat';
          if (changeAmount > 0) trend = 'up';
          else if (changeAmount < 0) trend = 'down';

          snapshotData.push({
            indexName: idx.name,
            currentValue,
            changeAmount,
            changePercentage,
            trend
          });
        }
      } catch (error) {
        console.error(`[LiveMarketDataProvider] Failed to fetch quote for ${idx.symbol}`, error);
      }
    }

    return snapshotData;
  }

  async getSentiment(): Promise<{ sentiment: 'Bullish' | 'Bearish' | 'Neutral', confidence: number }> {
    // We let the MarketSummaryCapability AI determine this dynamically from the live news!
    return {
      sentiment: 'Neutral',
      confidence: 50
    };
  }
}
