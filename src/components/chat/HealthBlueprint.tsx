import React from 'react';
import { HealthBlueprint } from '@/schemas/health.schema';
import { BlueprintLayout } from '../blueprint/BlueprintLayout';
import { BlueprintHero } from '../blueprint/BlueprintHero';
import { BlueprintSection } from '../blueprint/BlueprintSection';
import { MetricStrip } from '../blueprint/MetricStrip';
import { InsightCallout } from '../blueprint/InsightCallout';
import { RoadmapTimeline } from '../blueprint/RoadmapTimeline';
import { EducationBlock } from '../blueprint/EducationBlock';
import { FAQAccordion } from '../blueprint/FAQAccordion';

interface Props {
  data: HealthBlueprint;
  onDownload: () => void;
}

export default function HealthBlueprintUI({ data, onDownload }: Props) {
  
  // Editorial determination of the top-level summary
  let executiveSummary = "";
  if (data.overallScore >= 80) executiveSummary = "You have established an exceptional financial foundation. Your current trajectory positions you perfectly for aggressive wealth creation. The primary focus now is optimizing capital deployment and maintaining this discipline.";
  else if (data.overallScore >= 50) executiveSummary = "You are doing many things right, with a solid baseline of financial discipline. However, there are specific structural gaps in your current setup that must be addressed to unlock your full wealth-building potential.";
  else executiveSummary = "Your current financial structure requires immediate attention. We need to prioritize stabilizing your cash flow, eliminating high-cost debt, and building a safety net before focusing on long-term wealth creation.";

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 50) return 'Fair';
    return 'Action Required';
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full bg-white ">
      <BlueprintLayout>
        
        <BlueprintHero 
          title="Financial Health Blueprint"
          subtitle={executiveSummary}
          primaryMetric={data.overallScore}
          primaryMetricLabel="Health Score"
          onDownload={onDownload}
        />

        <BlueprintSection>
          <MetricStrip 
            metrics={[
              { label: 'Savings Rate', value: `${data.savingsHealth}%`, max: 100 },
              { label: 'Debt Health', value: getHealthLabel(data.debtHealth) },
              { label: 'Emergency Fund', value: `${Math.round(data.emergencyHealth)}%`, max: 100 },
              { label: 'Investment Readiness', value: `${data.investmentHealth}%`, max: 100 }
            ]}
          />
        </BlueprintSection>

        <BlueprintSection title="Financial Identity">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InsightCallout type="insight" title={data.financialPersonality}>
              {data.personalityDescription}
            </InsightCallout>
          </div>
        </BlueprintSection>

        <BlueprintSection title="Diagnostic Analysis">
          <div className="space-y-6">
            {data.strengths.map((strength, i) => (
              <InsightCallout key={`strength-${i}`} type="strength">
                {strength}
              </InsightCallout>
            ))}
            
            {data.weaknesses.map((weakness, i) => (
              <InsightCallout key={`weakness-${i}`} type="risk">
                {weakness}
              </InsightCallout>
            ))}

            {data.keyObservations.map((obs, i) => (
              <InsightCallout key={`obs-${i}`} type="neutral">
                {obs}
              </InsightCallout>
            ))}
          </div>
        </BlueprintSection>

        <BlueprintSection title="Strategic Roadmap" subtitle="Prioritized steps to elevate your financial health.">
          <RoadmapTimeline steps={data.recommendations} />
        </BlueprintSection>

        <hr className="border-t border-slate-200  print:border-slate-300 my-16" />

        <BlueprintSection>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7">
              <EducationBlock 
                title={data.educationalTopic.title}
                content={data.educationalTopic.content}
              />
            </div>
            <div className="lg:col-span-5">
              <h3 className="font-serif text-2xl font-medium mb-6 text-slate-900  print:text-black">
                Frequently Asked Questions
              </h3>
              <FAQAccordion faqs={data.faqs} />
            </div>
          </div>
        </BlueprintSection>

      </BlueprintLayout>
    </div>
  );
}
