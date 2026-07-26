const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, regex, replacement) {
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = content.replace(regex, replacement);
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log('Fixed:', filePath);
  }
}

const files = [
  'src/lib/ai/features/market/capabilities/MarketAnalysisCapability.ts',
  'src/lib/ai/features/market/capabilities/MarketNewsCapability.ts',
  'src/lib/ai/features/market/capabilities/MarketSummaryCapability.ts',
  'src/lib/ai/features/market/capabilities/SectorImpactCapability.ts',
  'src/lib/ai/features/support/capabilities/ComplianceCapability.ts',
  'src/lib/ai/features/support/capabilities/EducationalCapability.ts',
  'src/lib/ai/features/support/capabilities/HumanEscalationCapability.ts',
  'src/lib/ai/features/support/capabilities/IntentRouter.ts',
  'src/lib/ai/features/support/capabilities/KnowledgeCapability.ts',
  'src/lib/ai/features/support/capabilities/LeadQualificationCapability.ts',
];

for (const file of files) {
  const fullPath = path.join(process.cwd(), file);
  replaceInFile(fullPath, /"gemini-3\.5-flash"/g, '{ model: "gemini-3.5-flash" }');
  replaceInFile(fullPath, /"gemini-3\.5-pro"/g, '{ model: "gemini-3.5-pro" }');
}
