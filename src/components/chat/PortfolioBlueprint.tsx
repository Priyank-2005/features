import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { BlueprintLayout } from '../blueprint/BlueprintLayout';
import { BlueprintHero } from '../blueprint/BlueprintHero';
import { BlueprintSection } from '../blueprint/BlueprintSection';
import { MetricStrip } from '../blueprint/MetricStrip';
import { InsightCallout } from '../blueprint/InsightCallout';
import { RoadmapTimeline } from '../blueprint/RoadmapTimeline';
import { EducationBlock } from '../blueprint/EducationBlock';
import { FAQAccordion } from '../blueprint/FAQAccordion';
import { PortfolioBlueprint as PortfolioBlueprintType } from '@/schemas/portfolio.schema';
import { generatePortfolioPDF } from '@/lib/utils/generatePortfolioPDF';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#64748b'];

export const PortfolioBlueprint: React.FC<{ data: PortfolioBlueprintType }> = ({ data }) => {
  
  // Format allocation data for Recharts
  const allocationData = Object.keys(data.currentAllocation || {}).map(asset => ({
    name: asset,
    Current: (data.currentAllocation as any)[asset],
    Recommended: (data.recommendedAllocation as any)?.[asset] || (data.currentAllocation as any)[asset]
  }));

  return (
    <div className="w-full bg-white">
      <BlueprintLayout>
        
        <BlueprintHero 
          title="Portfolio Intelligence Blueprint"
          subtitle={`A comprehensive wealth management analysis tailored for a ${data.investmentPersonality}.`}
          primaryMetric={data.overallScore}
          primaryMetricLabel="Health Score"
          onDownload={() => generatePortfolioPDF(data)}
        />

        <BlueprintSection title="Portfolio Health Scores" subtitle={data.scoreMethodology}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {data.subScores?.map((s, idx) => (
              <div key={idx} className="p-6 border border-slate-200 rounded-xl bg-slate-50 print:bg-white print:border-slate-300">
                <div className="flex justify-between items-end mb-4">
                  <h4 className="font-semibold text-slate-800 text-lg print:text-black">{s.name}</h4>
                  <span className="text-2xl font-serif text-indigo-700 print:text-indigo-900">{s.score}/100</span>
                </div>
                <div className="space-y-3 text-sm">
                  <p><strong className="text-slate-700 print:text-slate-900">Analysis:</strong> <span className="text-slate-600 print:text-slate-800">{s.explanation}</span></p>
                  <p><strong className="text-slate-700 print:text-slate-900">Why it matters:</strong> <span className="text-slate-600 print:text-slate-800">{s.whyItMatters}</span></p>
                </div>
              </div>
            ))}
          </div>
        </BlueprintSection>

        <BlueprintSection title="Executive Summary" subtitle="Your current positioning and high-level strategy">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <InsightCallout type="insight" title={data.investmentPersonality}>
              {data.personalityReasoning}
            </InsightCallout>
            <InsightCallout type="neutral" title="Total Analyzed Value">
              <span className="text-2xl font-serif">{data.totalValue}</span>
            </InsightCallout>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 print:text-black">Portfolio Strengths</h4>
              {data.strengths?.map((strength, i) => (
                <InsightCallout key={i} type="strength">{strength}</InsightCallout>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 print:text-black">Areas of Concern</h4>
              {data.areasOfConcern?.map((concern, i) => (
                <InsightCallout key={i} type="risk">{concern}</InsightCallout>
              ))}
            </div>
          </div>
        </BlueprintSection>

        <BlueprintSection title="Asset Allocation Strategy" subtitle="Current vs Recommended Asset Mix">
          <div className="h-96 w-full mb-12">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocationData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Current" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Recommended" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 print:text-black">Diversification Analysis</h4>
              <p className="text-slate-600 leading-relaxed print:text-slate-800">{data.diversificationAnalysis}</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 print:text-black">Concentration Risks</h4>
              <p className="text-slate-600 leading-relaxed print:text-slate-800">{data.concentrationRisks}</p>
            </div>
          </div>
        </BlueprintSection>

        <BlueprintSection title="Macroeconomic Scenario Analysis" subtitle="How your portfolio behaves under stress">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.scenarios?.map((scenario, i) => (
              <div key={i} className="p-6 border border-slate-200 rounded-xl bg-slate-50 print:bg-white print:border-slate-300">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-semibold text-indigo-900 text-lg print:text-black">{scenario.name}</h4>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase rounded-md print:border print:border-indigo-200">
                    Confidence: {scenario.confidence}
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <p><strong className="text-slate-700 print:text-slate-900">Expected Behaviour:</strong> <span className="text-slate-600 print:text-slate-800">{scenario.expectedBehaviour}</span></p>
                  <p><strong className="text-slate-700 print:text-slate-900">Risks:</strong> <span className="text-slate-600 print:text-slate-800">{scenario.risks}</span></p>
                  <p><strong className="text-slate-700 print:text-slate-900">Suggested Action:</strong> <span className="text-slate-600 print:text-slate-800">{scenario.suggestedAction}</span></p>
                </div>
              </div>
            ))}
          </div>
        </BlueprintSection>

        <BlueprintSection title="Rebalancing Roadmap" subtitle="Strategic steps to achieve your target allocation">
          <RoadmapTimeline steps={
            data.rebalancingRoadmap?.map(step => ({
              timeframe: step.timeframe,
              action: `[${step.priority}] Rebalance ${step.assetClass}: ${step.recommendation}`,
              impact: `Problem: ${step.problem} → Benefit: ${step.expectedBenefit} (Estimated Effort: ${step.estimatedEffort || 'Unknown'})`
            })) || []
          } />
        </BlueprintSection>

        <BlueprintSection title="Long-Term Strategy & Assumptions">
          <div className="prose prose-slate max-w-none print:text-black">
            <p className="text-lg leading-relaxed text-slate-700 mb-8 print:text-slate-900">{data.longTermStrategy}</p>
            
            <h4 className="font-semibold text-sm uppercase tracking-widest text-slate-400 mb-4 print:text-slate-600">Analysis Assumptions</h4>
            <ul className="text-sm text-slate-500 space-y-2 list-disc pl-5 print:text-slate-700">
              {data.analysisAssumptions?.map((assumption, i) => (
                <li key={i}>{assumption}</li>
              ))}
            </ul>
          </div>
        </BlueprintSection>

        <hr className="border-t border-slate-200 print:border-slate-300 my-16" />

        <BlueprintSection>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7">
              <EducationBlock 
                title={data.educationalTopic?.title || 'Portfolio Concepts'}
                content={data.educationalTopic?.personalizedContent || ''}
              />
            </div>
            <div className="lg:col-span-5">
              <h3 className="font-serif text-2xl font-medium mb-6 text-slate-900 print:text-black">
                Strategic FAQs
              </h3>
              <FAQAccordion faqs={data.faqs || []} />
            </div>
          </div>
        </BlueprintSection>

      </BlueprintLayout>
    </div>
  );
};
