export function generateHealthPDF(data: any) {
  // We now leverage the browser's native print engine with our meticulously crafted
  // Print CSS (Blueprint Design System) rather than manual jsPDF drawing.
  // This ensures pixel-perfect editorial typography, SVG rendering, and layout control.
  
  // Set document title temporarily so the default PDF filename is clean
  const originalTitle = document.title;
  document.title = `Financial_Health_Blueprint_${new Date().toISOString().split('T')[0]}`;
  
  // Trigger print dialog
  window.print();
  
  // Restore title
  document.title = originalTitle;
}
