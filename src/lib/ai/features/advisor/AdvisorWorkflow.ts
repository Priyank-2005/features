import { WorkflowDefinition } from '../../core/types';
import { DeterministicEngine } from './engines/DeterministicEngine';

export const AdvisorWorkflow: WorkflowDefinition = {
  id: 'advisor_blueprint_workflow',
  version: '2.0',
  description: 'Multi-Agent Orchestration for the 16-section Wealth Blueprint',
  stages: [
    {
      id: 'analysis_and_strategy',
      executeType: 'PARALLEL',
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
    // 1. Extract inputs
    const analysis = stageResults['analysis_and_strategy']?.['advisor_analyst_v1'];
    const strategy = stageResults['analysis_and_strategy']?.['advisor_strategist_v1'];
    const behaviour = stageResults['analysis_and_strategy']?.['advisor_psychologist_v1'];
    const education = stageResults['education']?.['advisor_educator_v1'];

    // If any critical capability failed, we can throw or return a partial blueprint
    if (!analysis || !strategy || !behaviour || !education) {
      throw new Error('Workflow failed to assemble Blueprint due to missing capability outputs.');
    }

    // 2. We merge the outputs into the universal `WealthBlueprintSchema` expected by the UI.
    // The UI expects exactly what we defined in `WealthBlueprint.tsx`.
    // Wait, the UI schema is slightly different now (16 sections). We'll map it as closely as possible to the existing UI for now, 
    // and the user can update the UI component later to match this perfectly.
    
    return {
      healthScore: initialInput.metrics.readinessScore || 0,
      executiveSummary: analysis.executiveSummary,
      healthAnalysis: analysis.strengths.join(' '),
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      investorPersonality: behaviour.investorIdentity,
      personalityDescription: behaviour.identityExplanation,
      riskProfile: behaviour.riskProfile,
      riskExplanation: behaviour.riskExplanation,
      behaviouralBiases: behaviour.behaviouralBiases,
      likelyMistakes: behaviour.likelyMistakes,
      assetAllocation: strategy.assetAllocation,
      allocationReasoning: Object.values(strategy.allocationReasoning).join(' '),
      insights: analysis.whatWeNoticed,
      risks: strategy.risks,
      opportunities: strategy.opportunities,
      actionPlan: strategy.actionPlan,
      missingData: education.missingDataPrompt.fields,
      educationalTopic: education.educationalTopic,
      faqs: education.faqs
    };
  }
};
