import { TaxBlueprint } from '@/schemas/tax.schema';

export function generateTaxPDF(data: TaxBlueprint) {
  const originalTitle = document.title;
  document.title = `Tax_Strategy_Blueprint_${new Date().toISOString().split('T')[0]}`;
  
  window.print();
  
  document.title = originalTitle;
}
