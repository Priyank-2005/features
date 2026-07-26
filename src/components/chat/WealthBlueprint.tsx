import React from 'react';
import { BlueprintLayout } from '../blueprint/BlueprintLayout';
import { BlueprintHero } from '../blueprint/BlueprintHero';
import { BlueprintSection } from '../blueprint/BlueprintSection';
import { MetricStrip } from '../blueprint/MetricStrip';
import { InsightCallout } from '../blueprint/InsightCallout';
import { RoadmapTimeline } from '../blueprint/RoadmapTimeline';
import { EducationBlock } from '../blueprint/EducationBlock';
import { FAQAccordion } from '../blueprint/FAQAccordion';
import { generateBlueprintPDF } from '@/lib/utils/generateBlueprintPDF';

export interface BlueprintData {
  healthScore: number;
  executiveSummary: string[];
  healthAnalysis: string;
  strengths: string[];
  weaknesses: string[];
  investorPersonality: string;
  personalityDescription: string;
  riskProfile: string;
  riskExplanation: string;
  behaviouralBiases: string[];
  likelyMistakes: string[];
  assetAllocation: Record<string, string>;
  allocationReasoning: string;
  insights: string[];
  risks: { title: string; description: string }[];
  opportunities: { title: string; description: string }[];
  actionPlan: { timeframe: string; action: string; impact?: string }[];
  missingData: string[];
  educationalTopic: { title: string; content: string };
  faqs: { question: string; answer: string }[];
}

export const WealthBlueprint: React.FC<{ data: BlueprintData }> = ({ data }) => {
  return (
    <div className="w-full bg-white ">
      <BlueprintLayout>
        
        <BlueprintHero 
          title="Wealth Strategy Blueprint"
          subtitle={data.executiveSummary?.join(' ')}
          primaryMetric={data.healthScore}
          primaryMetricLabel="Health Score"
          onDownload={() => generateBlueprintPDF(data)}
        />

        <BlueprintSection>
          <MetricStrip 
            metrics={[
              { label: 'Risk Profile', value: data.riskProfile },
              { label: 'Investor Identity', value: data.investorPersonality },
              { label: 'Missing Context', value: data.missingData?.length || 0 }
            ]}
          />
        </BlueprintSection>

        <BlueprintSection title="Executive Summary">
          <p className="text-lg text-slate-700  leading-relaxed max-w-3xl print:text-black">
            {data.healthAnalysis}
          </p>
        </BlueprintSection>

        <BlueprintSection title="Identity & Biases" subtitle="Understanding your behavioural tendencies">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <InsightCallout type="insight" title={data.investorPersonality}>
              {data.personalityDescription}
            </InsightCallout>
            
            <InsightCallout type="neutral" title={`Risk Tolerance: ${data.riskProfile}`}>
              {data.riskExplanation}
            </InsightCallout>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900  print:text-black">Identified Biases</h4>
              {data.behaviouralBiases?.map((bias, i) => (
                <InsightCallout key={i} type="risk">
                  {bias}
                </InsightCallout>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900  print:text-black">Common Mistakes to Avoid</h4>
              {data.likelyMistakes?.map((mistake, i) => (
                <InsightCallout key={i} type="risk">
                  {mistake}
                </InsightCallout>
              ))}
            </div>
          </div>
        </BlueprintSection>

        <BlueprintSection title="Asset Allocation Strategy">
          <div className="mb-8">
            <p className="text-lg text-slate-700  italic border-l-2 border-indigo-500 pl-4 print:text-black">
              {data.allocationReasoning}
            </p>
          </div>

          {/* Simple tabular representation of allocation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Object.entries(data.assetAllocation || {}).map(([asset, percentage], idx) => (
              <div key={idx} className="p-6 border border-slate-200  rounded-xl print:border-slate-300">
                <div className="text-3xl font-serif text-slate-900  mb-2 print:text-black">{percentage}</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-widest print:text-slate-700">{asset}</div>
              </div>
            ))}
          </div>
        </BlueprintSection>

        <BlueprintSection title="Market Intelligence" subtitle="Opportunities and Risks based on your profile">
          <div className="space-y-6">
            {data.insights?.map((insight, i) => (
              <InsightCallout key={`insight-${i}`} type="insight">
                {insight}
              </InsightCallout>
            ))}
            
            {data.opportunities?.map((opp, i) => (
              <InsightCallout key={`opp-${i}`} type="strength" title={opp.title}>
                {opp.description}
              </InsightCallout>
            ))}

            {data.risks?.map((risk, i) => (
              <InsightCallout key={`risk-${i}`} type="risk" title={risk.title}>
                {risk.description}
              </InsightCallout>
            ))}
          </div>
        </BlueprintSection>

        <BlueprintSection title="Implementation Roadmap" subtitle="Your step-by-step action plan">
          <RoadmapTimeline steps={data.actionPlan?.map(a => ({ ...a, impact: a.impact || '' })) || []} />
        </BlueprintSection>

        <BlueprintSection title="Data Quality">
          <div className="p-6 border border-dashed border-slate-300  rounded-xl max-w-2xl print:border-slate-400">
            <h4 className="font-semibold text-slate-900  mb-2 print:text-black">Improve this Blueprint</h4>
            <p className="text-sm text-slate-600  mb-4 print:text-slate-800">
              We could make even more precise recommendations if you provide:
            </p>
            <div className="flex flex-wrap gap-2">
              {data.missingData?.map((item, idx) => (
                <span key={idx} className="px-3 py-1 bg-slate-100  text-slate-700  text-xs font-medium rounded-full print:border print:border-slate-300 print:bg-white print:text-black">
                  + {item}
                </span>
              ))}
            </div>
          </div>
        </BlueprintSection>

        <hr className="border-t border-slate-200  print:border-slate-300 my-16" />

        <BlueprintSection>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7">
              <EducationBlock 
                title={data.educationalTopic?.title || 'Financial Literacy'}
                content={data.educationalTopic?.content || ''}
              />
            </div>
            <div className="lg:col-span-5">
              <h3 className="font-serif text-2xl font-medium mb-6 text-slate-900  print:text-black">
                Frequently Asked Questions
              </h3>
              <FAQAccordion faqs={data.faqs || []} />
            </div>
          </div>
        </BlueprintSection>

      </BlueprintLayout>
    </div>
  );
};
