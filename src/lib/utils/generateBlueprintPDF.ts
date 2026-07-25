import jsPDF from 'jspdf';
import { BlueprintData } from '@/components/chat/WealthBlueprint';

// Color palette
const C = {
  primary: [79, 70, 229] as [number, number, number],
  primaryDark: [49, 46, 129] as [number, number, number],
  accent: [129, 140, 248] as [number, number, number],
  text: [30, 41, 59] as [number, number, number],
  textLight: [100, 116, 139] as [number, number, number],
  muted: [148, 163, 184] as [number, number, number],
  emerald: [16, 185, 129] as [number, number, number],
  amber: [180, 83, 9] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  bg: [248, 250, 252] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
};

const MARGIN = 20;
let pageWidth = 210;
let pageHeight = 297;
let contentW = pageWidth - MARGIN * 2;

function footer(doc: jsPDF, pg: number) {
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, pageHeight - 18, pageWidth - MARGIN, pageHeight - 18);
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.setFont('helvetica', 'normal');
  doc.text('Knowith Capital  ·  AI-Generated Wealth Blueprint  ·  Confidential', MARGIN, pageHeight - 12);
  doc.text(`Page ${pg}`, pageWidth - MARGIN, pageHeight - 12, { align: 'right' });
}

function needsBreak(doc: jsPDF, y: number, need: number, pg: { v: number }): number {
  if (y + need > pageHeight - 28) {
    footer(doc, pg.v);
    doc.addPage();
    pg.v++;
    return 32;
  }
  return y;
}

function sectionHead(doc: jsPDF, title: string, y: number, num: number): number {
  doc.setFillColor(...C.primary);
  doc.rect(MARGIN, y, 3, 12, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...C.accent);
  doc.setFont('helvetica', 'normal');
  doc.text(`SECTION ${String(num).padStart(2, '0')}`, MARGIN + 8, y + 4);
  doc.setFontSize(15);
  doc.setTextColor(...C.text);
  doc.setFont('helvetica', 'bold');
  doc.text(title, MARGIN + 8, y + 12);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y + 17, pageWidth - MARGIN, y + 17);
  return y + 24;
}

function wrap(doc: jsPDF, t: string, w: number): string[] {
  return doc.splitTextToSize(t || '', w);
}

function bodyText(doc: jsPDF, text: string, y: number, pg: { v: number }, indent = 0): number {
  doc.setFontSize(9.5);
  doc.setTextColor(...C.text);
  doc.setFont('helvetica', 'normal');
  const lines = wrap(doc, text, contentW - indent);
  y = needsBreak(doc, y, lines.length * 4.5 + 4, pg);
  doc.text(lines, MARGIN + indent, y);
  return y + lines.length * 4.5 + 2;
}

function bulletList(doc: jsPDF, items: string[], y: number, pg: { v: number }, color: [number, number, number] = C.emerald): number {
  items.forEach((item) => {
    const lines = wrap(doc, item, contentW - 12);
    y = needsBreak(doc, y, lines.length * 4.5 + 5, pg);
    doc.setFillColor(...color);
    doc.circle(MARGIN + 4, y - 1, 1.2, 'F');
    doc.setFontSize(9.5);
    doc.setTextColor(...C.text);
    doc.setFont('helvetica', 'normal');
    doc.text(lines, MARGIN + 10, y);
    y += lines.length * 4.5 + 3;
  });
  return y;
}

function titledList(doc: jsPDF, items: { title: string; description: string }[], y: number, pg: { v: number }, titleColor: [number, number, number]): number {
  items.forEach((item) => {
    const tLines = wrap(doc, item.title, contentW - 12);
    const dLines = wrap(doc, item.description, contentW - 12);
    y = needsBreak(doc, y, (tLines.length + dLines.length) * 4.5 + 8, pg);
    doc.setFillColor(...titleColor);
    doc.circle(MARGIN + 4, y - 1, 1.2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(...titleColor);
    doc.setFont('helvetica', 'bold');
    doc.text(tLines, MARGIN + 10, y);
    y += tLines.length * 4.5;
    doc.setFontSize(9);
    doc.setTextColor(...C.textLight);
    doc.setFont('helvetica', 'normal');
    doc.text(dLines, MARGIN + 10, y);
    y += dLines.length * 4.5 + 5;
  });
  return y;
}

export function generateBlueprintPDF(data: BlueprintData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  pageWidth = doc.internal.pageSize.getWidth();
  pageHeight = doc.internal.pageSize.getHeight();
  contentW = pageWidth - MARGIN * 2;
  const pg = { v: 1 };

  // ═══════════════════════════════════════════
  // COVER PAGE
  // ═══════════════════════════════════════════
  doc.setFillColor(...C.primaryDark);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative
  doc.setFillColor(79, 70, 229);
  doc.setGState(doc.GState({ opacity: 0.15 }));
  doc.circle(pageWidth - 20, 40, 65, 'F');
  doc.circle(25, 260, 90, 'F');
  doc.setGState(doc.GState({ opacity: 1 }));

  // Branding
  doc.setFontSize(10);
  doc.setTextColor(...C.accent);
  doc.setFont('helvetica', 'bold');
  doc.text('KNOWITH CAPITAL', MARGIN, 42);

  doc.setFontSize(40);
  doc.setTextColor(...C.white);
  doc.setFont('helvetica', 'bold');
  doc.text('Wealth', MARGIN, 82);
  doc.text('Blueprint', MARGIN, 99);

  doc.setFontSize(12);
  doc.setTextColor(...C.accent);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Personalized Financial Strategy', MARGIN, 114);

  doc.setDrawColor(...C.accent);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, 122, 85, 122);

  // Summary card
  const bx = 148;
  doc.setFillColor(60, 56, 130);
  doc.roundedRect(MARGIN, bx, contentW, 55, 3, 3, 'F');

  // Score
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.setFont('helvetica', 'normal');
  doc.text('HEALTH SCORE', MARGIN + 10, bx + 12);
  doc.setFontSize(32);
  doc.setTextColor(...C.white);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.healthScore || 0}`, MARGIN + 10, bx + 30);
  doc.setFontSize(10);
  doc.setTextColor(...C.accent);
  doc.text('/ 100', MARGIN + 35, bx + 30);

  // Risk
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.setFont('helvetica', 'normal');
  doc.text('RISK PROFILE', MARGIN + 75, bx + 12);
  doc.setFontSize(13);
  doc.setTextColor(...C.white);
  doc.setFont('helvetica', 'bold');
  doc.text(data.riskProfile || 'N/A', MARGIN + 75, bx + 23);

  // Identity
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.setFont('helvetica', 'normal');
  doc.text('INVESTOR TYPE', MARGIN + 75, bx + 33);
  doc.setFontSize(13);
  doc.setTextColor(...C.white);
  doc.setFont('helvetica', 'bold');
  doc.text(data.investorPersonality || 'N/A', MARGIN + 75, bx + 44);

  // Date
  const now = new Date();
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, MARGIN, 228);

  // Disclaimer
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 140);
  const disc = 'This document is auto-generated by AI for educational purposes only and does not constitute financial advice. Please consult a registered SEBI advisor before making investment decisions.';
  doc.text(wrap(doc, disc, contentW), MARGIN, 255);

  // ═══════════════════════════════════════════
  // CONTENT PAGES
  // ═══════════════════════════════════════════
  doc.addPage();
  pg.v++;
  let y = 32;
  let s = 1;

  // --- 1. Executive Summary ---
  y = sectionHead(doc, 'Executive Summary', y, s++);
  (data.executiveSummary || []).forEach((obs) => {
    y = bodyText(doc, `• ${obs}`, y, pg, 2);
    y += 1;
  });
  y += 8;

  // --- 2. Financial Strengths & Weaknesses ---
  y = needsBreak(doc, y, 45, pg);
  y = sectionHead(doc, 'Strengths & Weaknesses', y, s++);

  if (data.strengths?.length) {
    doc.setFontSize(10);
    doc.setTextColor(...C.emerald);
    doc.setFont('helvetica', 'bold');
    doc.text('Strengths', MARGIN, y);
    y += 6;
    y = bulletList(doc, data.strengths, y, pg, C.emerald);
    y += 4;
  }
  if (data.weaknesses?.length) {
    y = needsBreak(doc, y, 20, pg);
    doc.setFontSize(10);
    doc.setTextColor(...C.red);
    doc.setFont('helvetica', 'bold');
    doc.text('Areas to Improve', MARGIN, y);
    y += 6;
    y = bulletList(doc, data.weaknesses, y, pg, C.red);
  }
  y += 8;

  // --- 3. Investor Personality ---
  y = needsBreak(doc, y, 50, pg);
  y = sectionHead(doc, 'Investor Personality', y, s++);

  doc.setFillColor(...C.bg);
  const persLines = wrap(doc, data.personalityDescription || '', contentW - 16);
  const persH = Math.max(30, persLines.length * 4.5 + 20);
  y = needsBreak(doc, y, persH + 5, pg);
  doc.roundedRect(MARGIN, y, contentW, persH, 2, 2, 'F');
  doc.setDrawColor(...C.border);
  doc.roundedRect(MARGIN, y, contentW, persH, 2, 2, 'S');

  doc.setFontSize(15);
  doc.setTextColor(...C.primary);
  doc.setFont('helvetica', 'bold');
  doc.text(data.investorPersonality || '', MARGIN + 8, y + 12);
  doc.setFontSize(9);
  doc.setTextColor(...C.textLight);
  doc.setFont('helvetica', 'normal');
  doc.text(persLines, MARGIN + 8, y + 20);
  y += persH + 8;

  // --- 4. Risk Profile ---
  y = needsBreak(doc, y, 40, pg);
  y = sectionHead(doc, 'Risk Profile', y, s++);
  doc.setFontSize(13);
  doc.setTextColor(...C.text);
  doc.setFont('helvetica', 'bold');
  doc.text(data.riskProfile || '', MARGIN, y);
  y += 7;
  y = bodyText(doc, data.riskExplanation || '', y, pg);
  y += 8;

  // --- 5. Behavioural Insights ---
  if (data.behaviouralBiases?.length || data.likelyMistakes?.length) {
    y = needsBreak(doc, y, 40, pg);
    y = sectionHead(doc, 'Behavioural Insights', y, s++);

    if (data.behaviouralBiases?.length) {
      doc.setFontSize(10);
      doc.setTextColor(...C.primary);
      doc.setFont('helvetica', 'bold');
      doc.text('Cognitive Biases to Watch', MARGIN, y);
      y += 6;
      y = bulletList(doc, data.behaviouralBiases, y, pg, C.primary);
      y += 4;
    }
    if (data.likelyMistakes?.length) {
      y = needsBreak(doc, y, 20, pg);
      doc.setFontSize(10);
      doc.setTextColor(...C.amber);
      doc.setFont('helvetica', 'bold');
      doc.text('Common Mistakes to Avoid', MARGIN, y);
      y += 6;
      y = bulletList(doc, data.likelyMistakes, y, pg, C.amber);
    }
    y += 8;
  }

  // --- 6. Asset Allocation ---
  y = needsBreak(doc, y, 70, pg);
  y = sectionHead(doc, 'Recommended Asset Allocation', y, s++);

  const allocEntries = Object.entries(data.assetAllocation || {});
  const barColors: [number, number, number][] = [
    [79, 70, 229], [129, 140, 248], [199, 210, 254], [99, 102, 241], [49, 46, 129]
  ];
  allocEntries.forEach(([name, value], idx) => {
    y = needsBreak(doc, y, 16, pg);
    const numVal = parseInt(String(value).replace(/\D/g, '')) || 0;
    doc.setFontSize(10);
    doc.setTextColor(...C.text);
    doc.setFont('helvetica', 'bold');
    doc.text(name, MARGIN, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.textLight);
    doc.text(`${numVal}%`, pageWidth - MARGIN, y, { align: 'right' });
    y += 3;
    doc.setFillColor(...C.bg);
    doc.roundedRect(MARGIN, y, contentW, 4, 2, 2, 'F');
    doc.setFillColor(...barColors[idx % barColors.length]);
    doc.roundedRect(MARGIN, y, Math.max(2, (numVal / 100) * contentW), 4, 2, 2, 'F');
    y += 10;
  });

  if (data.allocationReasoning) {
    y += 2;
    const rLines = wrap(doc, data.allocationReasoning, contentW - 14);
    const rH = rLines.length * 4.5 + 10;
    y = needsBreak(doc, y, rH + 4, pg);
    doc.setFillColor(...C.bg);
    doc.roundedRect(MARGIN, y, contentW, rH, 2, 2, 'F');
    doc.setFillColor(...C.primary);
    doc.rect(MARGIN, y, 3, rH, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.setFont('helvetica', 'italic');
    doc.text('ALLOCATION RATIONALE', MARGIN + 8, y + 7);
    doc.setFontSize(9);
    doc.setTextColor(...C.textLight);
    doc.setFont('helvetica', 'normal');
    doc.text(rLines, MARGIN + 8, y + 14);
    y += rH + 8;
  }

  // --- 7. Key Insights ---
  y = needsBreak(doc, y, 35, pg);
  y = sectionHead(doc, 'Key Insights', y, s++);
  y = bulletList(doc, data.insights || [], y, pg, C.emerald);
  y += 8;

  // --- 8. Growth Opportunities ---
  y = needsBreak(doc, y, 35, pg);
  y = sectionHead(doc, 'Growth Opportunities', y, s++);
  y = titledList(doc, data.opportunities || [], y, pg, C.primary);
  y += 8;

  // --- 9. Risk Factors ---
  y = needsBreak(doc, y, 35, pg);
  y = sectionHead(doc, 'Risk Factors', y, s++);
  y = titledList(doc, data.risks || [], y, pg, C.amber);
  y += 8;

  // --- 10. Action Plan ---
  y = needsBreak(doc, y, 45, pg);
  y = sectionHead(doc, 'Action Plan', y, s++);
  (data.actionPlan || []).forEach((action, idx) => {
    const aLines = wrap(doc, action.action, contentW - 40);
    const rH = Math.max(aLines.length * 4.5 + 6, 14);
    y = needsBreak(doc, y, rH + 4, pg);
    if (idx % 2 === 0) {
      doc.setFillColor(...C.bg);
      doc.roundedRect(MARGIN, y - 3, contentW, rH, 2, 2, 'F');
    }
    doc.setFillColor(...C.primary);
    doc.circle(MARGIN + 6, y + 2, 3.5, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...C.white);
    doc.setFont('helvetica', 'bold');
    doc.text(String(idx + 1), MARGIN + 6, y + 3.5, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(...C.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(action.timeframe || '', MARGIN + 15, y + 3);
    doc.setFontSize(9);
    doc.setTextColor(...C.text);
    doc.setFont('helvetica', 'normal');
    doc.text(aLines, MARGIN + 15, y + 9);
    y += rH + 2;
  });
  y += 8;

  // --- 11. Educational Topic ---
  if (data.educationalTopic) {
    y = needsBreak(doc, y, 40, pg);
    y = sectionHead(doc, `Learn: ${data.educationalTopic.title || ''}`, y, s++);
    y = bodyText(doc, data.educationalTopic.content || '', y, pg);
    y += 8;
  }

  // --- 12. FAQs ---
  if (data.faqs?.length) {
    y = needsBreak(doc, y, 35, pg);
    y = sectionHead(doc, 'Frequently Asked Questions', y, s++);
    data.faqs.forEach((faq) => {
      const qLines = wrap(doc, faq.question, contentW - 6);
      const aLines = wrap(doc, faq.answer, contentW - 6);
      y = needsBreak(doc, y, (qLines.length + aLines.length) * 4.5 + 10, pg);
      doc.setFontSize(10);
      doc.setTextColor(...C.text);
      doc.setFont('helvetica', 'bold');
      doc.text(qLines, MARGIN, y);
      y += qLines.length * 4.5 + 1;
      doc.setFontSize(9);
      doc.setTextColor(...C.textLight);
      doc.setFont('helvetica', 'normal');
      doc.text(aLines, MARGIN + 3, y);
      y += aLines.length * 4.5 + 6;
    });
    y += 8;
  }

  // --- 13. Missing Data ---
  if (data.missingData?.length) {
    y = needsBreak(doc, y, 35, pg);
    y = sectionHead(doc, 'Improve This Blueprint', y, s++);
    doc.setFontSize(9);
    doc.setTextColor(...C.textLight);
    doc.setFont('helvetica', 'normal');
    doc.text('We could provide sharper recommendations if you share:', MARGIN, y);
    y += 7;
    y = bulletList(doc, data.missingData, y, pg, C.muted);
  }

  // Footers on all content pages
  const total = doc.getNumberOfPages();
  for (let i = 2; i <= total; i++) {
    doc.setPage(i);
    footer(doc, i - 1);
  }

  doc.save('Knowith_Capital_Wealth_Blueprint.pdf');
}
