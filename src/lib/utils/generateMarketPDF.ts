import { MarketBlueprint } from '@/schemas/market.schema';

export const generateMarketPDF = (data: MarketBlueprint) => {
  // Set document title temporarily so the default PDF filename is clean
  const originalTitle = document.title;
  document.title = `Market_Intelligence_Blueprint_${new Date().toISOString().split('T')[0]}`;
  
  // Add a small delay to ensure rendering is complete before printing
  setTimeout(() => {
    window.print();
    // Restore original title
    document.title = originalTitle;
  }, 100);
};
