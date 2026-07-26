import { WorkflowDefinition } from '../../core/types';
import { DeterministicEngine } from './engines/DeterministicEngine';

export const AdvisorWorkflow: WorkflowDefinition = {
  id: 'advisor_blueprint_workflow',
  version: '2.0',
  description: 'Multi-Agent Orchestration for the 16-section Wealth Blueprint',
  stages: [
    {
      id: 'analysis_and_strategy',
      executeType: 'SEQUENTIAL', // Changed from PARALLEL to prevent rate limit storms
      capabilities: [
        'advisor_analyst_v1',
        'advisor_strategist_v1',
        'advisor_psychologist_v1'
      ]
    },
    {
      id: 'education',
      executeType: 'SEQUENTIAL',
      capabilities: [
        'advisor_educator_v1'
      ]
    }
  ],
  assembler: (stageResults: Record<string, any>, initialInput: any) => {
    // 1. Extract inputs safely
    const analysis = stageResults['analysis_and_strategy']?.['advisor_analyst_v1'];
    const strategy = stageResults['analysis_and_strategy']?.['advisor_strategist_v1'];
    const behaviour = stageResults['analysis_and_strategy']?.['advisor_psychologist_v1'];
    const education = stageResults['education']?.['advisor_educator_v1'];

    // 2. We merge the outputs into the universal `WealthBlueprintSchema` expected by the UI.
    // If any capability failed (e.g. due to rate limits), we use graceful fallbacks instead of crashing.
    return {
      healthScore: initialInput.metrics?.readinessScore || 0,
      executiveSummary: analysis?.executiveSummary || ["Your financial profile is currently being analyzed.", "Please hold while we synchronize your data."],
      healthAnalysis: analysis?.strengths?.join(' ') || "Analysis pending due to high system load.",
      strengths: analysis?.strengths || ["Gathering insights..."],
      weaknesses: analysis?.weaknesses || ["Gathering insights..."],
      investorPersonality: behaviour?.investorIdentity || "Analysis Pending",
      personalityDescription: behaviour?.identityExplanation || "Behavioral analysis was delayed due to high load. Please regenerate.",
      riskProfile: behaviour?.riskProfile || "Moderate",
      riskExplanation: behaviour?.riskExplanation || "Standard risk profile assigned pending deeper analysis.",
      behaviouralBiases: behaviour?.behaviouralBiases || ["Data gathering pending"],
      likelyMistakes: behaviour?.likelyMistakes || ["Data gathering pending"],
      assetAllocation: strategy?.assetAllocation || [{ category: "Equity", percentage: 60, rationale: "Default growth allocation" }, { category: "Debt", percentage: 40, rationale: "Default safety allocation" }],
      allocationReasoning: strategy?.allocationReasoning ? Object.values(strategy.allocationReasoning).join(' ') : "Standard allocation applied.",
      insights: analysis?.whatWeNoticed || ["System load is currently high, try regenerating in a moment."],
      risks: strategy?.risks || [{ risk: "Analysis Delayed", mitigation: "Regenerate blueprint to view full risks." }],
      opportunities: strategy?.opportunities || [{ opportunity: "Analysis Delayed", strategy: "Regenerate blueprint to view opportunities." }],
      actionPlan: strategy?.actionPlan || [{ timeframe: "Immediate", action: "Regenerate your blueprint to resolve API rate limits.", impact: "Restores full AI analysis" }],
      missingData: education?.missingDataPrompt?.fields || ["Goal timelines", "Specific risk tolerance parameters"],
      educationalTopic: education?.educationalTopic || { title: "System Status", content: "Our AI is experiencing temporary high load. Please try again in a moment." },
      faqs: education?.faqs || []
    };
  }
};
