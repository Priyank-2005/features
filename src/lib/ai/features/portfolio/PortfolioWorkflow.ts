import { WorkflowDefinition } from '../../core/types';

export const PortfolioWorkflow: WorkflowDefinition = {
  id: 'portfolio_analyzer_workflow',
  version: '1.0',
  description: 'Multi-Agent Orchestration for Portfolio Analysis',
  stages: [
    {
      id: 'analysis_stage',
      executeType: 'SEQUENTIAL',
      capabilities: [
        'portfolio_analyst_v1',
        'portfolio_risk_manager_v1',
        'portfolio_strategist_v1'
      ]
    }
  ],
  assembler: (stageResults: Record<string, any>, initialInput: any) => {
    const analyst = stageResults['analysis_stage']?.['portfolio_analyst_v1'];
    const risk = stageResults['analysis_stage']?.['portfolio_risk_manager_v1'];
    const strategist = stageResults['analysis_stage']?.['portfolio_strategist_v1'];

    // Construct the fallback current allocation from inputs if needed
    const currentAllocation: Record<string, number> = {};
    if (initialInput?.profile) {
      if (initialInput.profile.equityPercent) currentAllocation['Equity'] = Number(initialInput.profile.equityPercent);
      if (initialInput.profile.debtPercent) currentAllocation['Debt'] = Number(initialInput.profile.debtPercent);
      if (initialInput.profile.goldPercent) currentAllocation['Gold'] = Number(initialInput.profile.goldPercent);
      if (initialInput.profile.realEstatePercent) currentAllocation['Real Estate'] = Number(initialInput.profile.realEstatePercent);
      if (initialInput.profile.cashPercent) currentAllocation['Cash'] = Number(initialInput.profile.cashPercent);
      if (initialInput.profile.alternativesPercent) currentAllocation['Alternatives'] = Number(initialInput.profile.alternativesPercent);
    }

    return {
      totalValue: initialInput?.profile?.totalValue || "Not provided",
      overallScore: analyst?.overallHealthScore || 50,
      scoreMethodology: analyst?.scoreMethodology || "Score is derived from a weighted average of diversification, risk alignment, liquidity, and growth potential metrics.",
      subScores: analyst?.scores ? Object.entries(analyst.scores).map(([name, data]: [string, any]) => ({
        name,
        score: data.score,
        explanation: data.explanation,
        whyItMatters: data.whyItMatters
      })) : [
        { name: "Analysis Failed", score: 0, explanation: "System load", whyItMatters: "Please try again" }
      ],
      investmentPersonality: analyst?.investmentPersonality || "Standard Investor",
      personalityReasoning: analyst?.personalityReasoning || "Based on your balanced allocation strategy.",
      strengths: analyst?.strengths || ["Gathering insights..."],
      areasOfConcern: analyst?.areasOfConcern || ["Gathering insights..."],
      currentAllocation: currentAllocation,
      recommendedAllocation: strategist?.recommendedAllocation || currentAllocation,
      diversificationAnalysis: analyst?.diversificationAnalysis || "Analysis delayed due to system load.",
      concentrationRisks: risk?.concentrationRisks || "Analysis delayed due to system load.",
      scenarios: risk?.scenarios || [
        { name: "Market Stress", expectedBehaviour: "Unknown", risks: "Unknown", suggestedAction: "Regenerate blueprint", confidence: "Low" }
      ],
      rebalancingRoadmap: strategist?.rebalancingRoadmap || [],
      longTermStrategy: strategist?.longTermStrategy || "Maintain discipline and re-evaluate.",
      analysisAssumptions: risk?.analysisAssumptions || ["Assumes data provided is accurate."],
      educationalTopic: strategist?.educationalTopic || { title: "Portfolio Basics", personalizedContent: "Please try generating again." },
      faqs: strategist?.faqs || []
    };
  }
};
