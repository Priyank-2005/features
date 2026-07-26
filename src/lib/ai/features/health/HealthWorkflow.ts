import { WorkflowDefinition, WorkflowStage } from '../../core/types';
import { HealthAnalysisOutput } from './capabilities/HealthAnalystCapability';
import { HealthBehaviourOutput } from './capabilities/HealthBehaviourCapability';
import { HealthRecommendationOutput } from './capabilities/HealthRecommenderCapability';
import { HealthEducationOutput } from './capabilities/HealthEducatorCapability';
import { HealthBlueprint } from '@/schemas/health.schema';

// Sequential to avoid rate-limit storms on free-tier Gemini API
const stage1: WorkflowStage = {
  id: 'health_analysis_stage',
  executeType: 'SEQUENTIAL',
  capabilities: [
    'health_analyst_v1',
    'health_behaviour_v1',
    'health_recommender_v1'
  ]
};

const stage2: WorkflowStage = {
  id: 'health_education_stage',
  executeType: 'SEQUENTIAL',
  capabilities: [
    'health_educator_v1'
  ]
};

/**
 * Helper to format numbers in Indian notation (e.g., 1,00,000)
 */
function formatINR(num: number): string {
  if (num === 0) return '₹0';
  return '₹' + num.toLocaleString('en-IN');
}

export const HealthWorkflow: WorkflowDefinition = {
  id: 'health_blueprint_workflow',
  version: '1.0',
  description: 'Financial Health Blueprint Workflow',
  stages: [stage1, stage2],
  
  assembler: (stageResults: any, initialInput: any): HealthBlueprint => {
    // ─── CRITICAL FIX ───
    // ContextBuilder stores results as stageResults[stageId][capabilityId]
    // NOT as stageResults[capabilityId] directly
    const analysis = stageResults['health_analysis_stage']?.['health_analyst_v1'] as HealthAnalysisOutput | undefined;
    const behaviour = stageResults['health_analysis_stage']?.['health_behaviour_v1'] as HealthBehaviourOutput | undefined;
    const recommender = stageResults['health_analysis_stage']?.['health_recommender_v1'] as HealthRecommendationOutput | undefined;
    const education = stageResults['health_education_stage']?.['health_educator_v1'] as HealthEducationOutput | undefined;
    const metrics = initialInput.metrics;

    // ─── DETERMINISTIC FALLBACK DATA ───
    // If AI capabilities fail (rate limits, etc.), we generate a real, personalized
    // report from the deterministic metrics instead of showing placeholder text.
    const income = metrics.income || 0;
    const expenses = metrics.expenses || 0;
    const debt = metrics.debt || 0;
    const surplus = income - expenses;
    const savingsRate = metrics.savingsRate || 0;
    const dti = metrics.dti || 0;
    const emergencyCoverage = metrics.emergencyCoverage || 0;
    const investmentReadiness = metrics.investmentReadiness || 0;

    // ── Fallback: Financial Personality ──
    let fallbackPersonality = 'Balanced Builder';
    let fallbackPersonalityDesc = '';
    if (savingsRate >= 60 && debt === 0) {
      fallbackPersonality = 'Disciplined Wealth Creator';
      fallbackPersonalityDesc = `With a ${savingsRate}% savings rate and zero debt, you demonstrate exceptional financial discipline. Your high surplus of ${formatINR(surplus)} per month positions you perfectly for aggressive wealth creation.`;
    } else if (savingsRate >= 60) {
      fallbackPersonality = 'Disciplined Saver';
      fallbackPersonalityDesc = `Your ${savingsRate}% savings rate shows outstanding control over spending. Clearing your ${formatINR(debt)} debt will unlock your full wealth-building potential.`;
    } else if (savingsRate >= 30) {
      fallbackPersonality = 'Balanced Builder';
      fallbackPersonalityDesc = `With a ${savingsRate}% savings rate and a surplus of ${formatINR(surplus)}, you have a solid foundation. Focus on optimizing your debt and building an emergency buffer.`;
    } else {
      fallbackPersonality = 'Growth Seeker';
      fallbackPersonalityDesc = `Your current savings rate of ${savingsRate}% shows room for improvement. Small optimizations in your ${formatINR(expenses)} monthly expenses can significantly accelerate your financial trajectory.`;
    }

    // ── Fallback: Strengths ──
    const fallbackStrengths: string[] = [];
    if (savingsRate >= 50) fallbackStrengths.push(`Exceptional savings rate of ${savingsRate}% — well above the recommended 20% benchmark.`);
    else if (savingsRate >= 20) fallbackStrengths.push(`Healthy savings rate of ${savingsRate}% meets the recommended minimum.`);
    if (surplus > 0) fallbackStrengths.push(`Monthly surplus of ${formatINR(surplus)} provides strong wealth-building fuel.`);
    if (dti === 0) fallbackStrengths.push('Zero EMI burden gives you maximum financial flexibility and cash flow freedom.');
    if (dti > 0 && dti < 30) fallbackStrengths.push(`Low debt-to-income ratio of ${dti}% is well within manageable limits.`);
    if (fallbackStrengths.length === 0) fallbackStrengths.push(`Stable monthly income of ${formatINR(income)} provides a foundation to build upon.`);

    // ── Fallback: Weaknesses ──
    const fallbackWeaknesses: string[] = [];
    if (emergencyCoverage < 1) fallbackWeaknesses.push('Zero emergency reserves — any unexpected expense could force high-cost debt.');
    else if (emergencyCoverage < 6) fallbackWeaknesses.push(`Emergency fund covers only ${emergencyCoverage} months — target is 6 months (${formatINR(expenses * 6)}).`);
    if (debt > 0 && dti === 0) fallbackWeaknesses.push(`Outstanding debt of ${formatINR(debt)} with no active repayment plan needs immediate attention.`);
    else if (debt > 0) fallbackWeaknesses.push(`Outstanding debt of ${formatINR(debt)} creates ongoing financial pressure.`);
    if (investmentReadiness < 50) fallbackWeaknesses.push('No existing investments — missing out on compounding growth that builds long-term wealth.');
    if (fallbackWeaknesses.length === 0) fallbackWeaknesses.push('Continue monitoring your financial health regularly.');

    // ── Fallback: Key Observations ──
    const fallbackObservations: string[] = [];
    fallbackObservations.push(`Your monthly surplus of ${formatINR(surplus)} can clear your entire ${formatINR(debt)} debt in ${debt > 0 ? Math.ceil(debt / surplus) : 0} month${Math.ceil(debt / surplus) !== 1 ? 's' : ''}.`);
    if (emergencyCoverage < 6) {
      const monthsToFund = surplus > 0 ? Math.ceil((expenses * 6) / surplus) : 0;
      fallbackObservations.push(`Building a full 6-month emergency fund of ${formatINR(expenses * 6)} would take approximately ${monthsToFund} months at your current savings rate.`);
    }
    fallbackObservations.push(`Investing ${formatINR(Math.round(surplus * 0.5))} monthly via SIP at 12% returns could grow to approximately ${formatINR(Math.round(surplus * 0.5 * 12 * 5 * 1.4))} in 5 years.`);

    // ── Fallback: Recommendations ──
    const fallbackRecommendations = [];
    if (emergencyCoverage < 6) {
      fallbackRecommendations.push({
        timeframe: 'Immediate',
        action: `Open a liquid mutual fund and start building an emergency reserve of ${formatINR(expenses * 6)} (6 months of expenses).`,
        impact: 'Creates a financial safety net, eliminates risk of emergency debt.'
      });
    }
    if (debt > 0) {
      fallbackRecommendations.push({
        timeframe: 'Next 30 Days',
        action: `Create a structured debt repayment plan to clear ${formatINR(debt)} within ${Math.ceil(debt / surplus)} months using your surplus.`,
        impact: 'Eliminates interest burden and improves your overall financial health score.'
      });
    }
    fallbackRecommendations.push({
      timeframe: 'Next 3 Months',
      action: `Start a SIP of ${formatINR(Math.round(surplus * 0.4))} per month in a Nifty 50 index fund.`,
      impact: 'Begins systematic wealth creation through market participation and compounding.'
    });
    if (fallbackRecommendations.length < 3) {
      fallbackRecommendations.push({
        timeframe: 'Next 6 Months',
        action: 'Diversify into a balanced portfolio with equity, debt, and gold allocation.',
        impact: 'Optimizes risk-adjusted returns and builds robust long-term wealth.'
      });
    }

    // ── Fallback: Education ──
    const fallbackEducation = emergencyCoverage < 3
      ? {
          title: 'The Emergency Fund Imperative',
          content: `Financial experts universally recommend maintaining 6 months of essential expenses in liquid savings. For your profile, this means ${formatINR(expenses * 6)}. This buffer protects you from taking on costly debt during emergencies like medical expenses, job transitions, or economic downturns. A liquid mutual fund or sweep-in FD is the ideal vehicle.`
        }
      : {
          title: 'The Power of Compounding',
          content: `Albert Einstein called compounding the "eighth wonder of the world." Starting to invest even ${formatINR(Math.round(surplus * 0.3))} monthly today, at a 12% annual return, could grow to over ${formatINR(Math.round(surplus * 0.3 * 12 * 10 * 2))} in 10 years. The key is starting early — every month you delay costs you significantly in lost compounding.`
        };

    // ── Fallback: FAQs ──
    const fallbackFaqs = [
      {
        question: debt > 0 ? 'Should I pay off debt first or start investing?' : 'How should I allocate my monthly surplus?',
        answer: debt > 0
          ? `With your ${formatINR(debt)} debt, split your ${formatINR(surplus)} surplus: allocate 60% (${formatINR(Math.round(surplus * 0.6))}) to aggressive debt clearance and 40% (${formatINR(Math.round(surplus * 0.4))}) to building your emergency fund. Once debt-free, redirect the full surplus to investments.`
          : `Follow the 50-30-20 rule: 50% to needs, 30% to investments (SIPs), and 20% to short-term goals. With your surplus of ${formatINR(surplus)}, invest at least ${formatINR(Math.round(surplus * 0.6))} monthly.`
      },
      {
        question: `What is the ideal emergency fund size for me?`,
        answer: `Based on your monthly expenses of ${formatINR(expenses)}, you need ${formatINR(expenses * 6)} (6 months) in a liquid fund. If your income is variable or you are the sole earner, consider extending this to 9-12 months (${formatINR(expenses * 9)} to ${formatINR(expenses * 12)}).`
      },
      {
        question: 'Where should I start investing as a beginner in India?',
        answer: `Begin with a Nifty 50 index fund SIP — it gives broad market exposure at minimal cost (0.1-0.2% expense ratio). Start with ${formatINR(Math.round(surplus * 0.3))} per month and increase by 10% annually. Add a PPF contribution of ${formatINR(Math.min(12500, Math.round(surplus * 0.2)))} monthly for tax-efficient debt exposure.`
      }
    ];

    return {
      overallScore: metrics.overallScore || 0,
      savingsHealth: savingsRate,
      debtHealth: Math.max(0, 100 - (dti * 2)),
      emergencyHealth: Math.min(100, (emergencyCoverage / 6) * 100),
      investmentHealth: investmentReadiness,
      financialPersonality: behaviour?.financialPersonality || fallbackPersonality,
      personalityDescription: behaviour?.personalityDescription || fallbackPersonalityDesc,
      strengths: analysis?.strengths || fallbackStrengths,
      weaknesses: analysis?.weaknesses || fallbackWeaknesses,
      keyObservations: analysis?.keyObservations || fallbackObservations,
      recommendations: recommender?.recommendations || fallbackRecommendations,
      educationalTopic: education?.educationalTopic || fallbackEducation,
      faqs: education?.faqs || fallbackFaqs,
      missingData: education?.missingDataPrompt || [
        'Interest rates and type of your outstanding debt (credit card, personal loan, etc.)',
        'Your target financial goals and investment time horizon'
      ]
    };
  }
};
