import { WorkflowDefinition } from '../../core/types';

export const TaxWorkflow: WorkflowDefinition = {
  id: 'tax_strategist_workflow',
  version: '1.0',
  description: 'Multi-Agent Orchestration for Tax Strategy',
  stages: [
    {
      id: 'tax_calculation_stage',
      executeType: 'SEQUENTIAL',
      capabilities: [
        'tax_calculator_v1',
        'tax_strategist_v1'
      ]
    }
  ],
  assembler: (stageResults: Record<string, any>, initialInput: any) => {
    const calc = stageResults['tax_calculation_stage']?.['tax_calculator_v1'];
    const strat = stageResults['tax_calculation_stage']?.['tax_strategist_v1'];

    return {
      totalTaxLiability: (calc?.taxCalculatedOld < calc?.taxCalculatedNew ? calc?.taxCalculatedOld : calc?.taxCalculatedNew) || 0,
      potentialTaxSavings: calc?.potentialSavings || 0,
      recommendedRegime: calc?.recommendedRegime || 'new',
      preparedDate: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      executiveSummary: strat?.executiveSummary || 'Tax strategy compilation delayed.',
      taxEfficiencyScore: strat?.taxEfficiencyScore || { score: 0, explanation: "Pending", whyItMatters: "Pending", breakdown: {} },
      regimeComparison: calc || {
        grossIncome: 0,
        totalDeductionsOld: 0,
        totalDeductionsNew: 0,
        taxableIncomeOld: 0,
        taxableIncomeNew: 0,
        taxCalculatedOld: 0,
        taxCalculatedNew: 0,
        oldRegimeAdvantages: [],
        oldRegimeLimitations: [],
        newRegimeAdvantages: [],
        newRegimeLimitations: [],
        recommendedRegime: 'new',
        potentialSavings: 0,
        reasoning: 'System load prevented full calculation.'
      },
      deductions: strat?.deductions || [],
      missedOpportunities: strat?.missedOpportunities || [],
      taxRiskAndComplianceNotes: strat?.taxRiskAndComplianceNotes || [],
      roadmap: strat?.roadmap || [],
      annualTaxCalendar: strat?.annualTaxCalendar || [],
      educationalNotes: strat?.educationalNotes || { title: 'Tax Basics', content: 'Understanding tax slabs is the first step to optimization.' },
      assumptionsAndDisclaimer: strat?.assumptionsAndDisclaimer || ['This is a projection only.'],
      faqs: strat?.faqs || []
    };
  }
};
