"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Save, Send, Calendar, CheckCircle2 } from 'lucide-react';

// Assumed imports
import { StepIndicator } from "@/components/campaigns/StepIndicator";
import { TemplateCard } from "@/components/campaigns/TemplateCard";
import { RecipientSelector } from "@/components/campaigns/RecipientSelector";
import { TemplatePreview } from "@/components/campaigns/TemplatePreview";

const STEPS = [
  'Campaign Details',
  'Choose Template',
  'Select Recipients',
  'Preview',
  'Schedule',
  'Confirmation'
];

export default function NewCampaignWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    fromName: 'Knowith AI',
    fromEmail: 'onboarding@resend.dev',
    replyTo: 'support@knowith.com',
    templateId: '',
    recipients: [],
    sendMode: 'now', // 'now' | 'schedule'
    scheduledDate: '',
    scheduledTime: '',
  });

  useEffect(() => {
    if (currentStep === 2 && templates.length === 0) {
      fetch('/api/v1/templates')
        .then(res => res.json())
        .then(data => setTemplates(data.templates || []))
        .catch(err => console.error('Error fetching templates', err));
    }
  }, [currentStep, templates.length]);

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(c => c + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
    else router.push('/campaigns');
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create campaign
      const campRes = await fetch('/api/v1/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          subject: formData.subject,
          description: formData.description,
          templateId: formData.templateId,
          fromName: formData.fromName,
          fromEmail: formData.fromEmail,
          replyTo: formData.replyTo,
        }),
      });
      const data = await campRes.json();
      const campaignId = data.campaign.id;

      // Add recipients
      if (formData.recipients.length > 0) {
        await fetch(`/api/v1/campaigns/${campaignId}/recipients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contactIds: formData.recipients }),
        });
      }

      // Send or schedule
      if (formData.sendMode === 'now') {
        await fetch(`/api/v1/campaigns/${campaignId}/send`, { method: 'POST' });
      } else {
        await fetch(`/api/v1/campaigns/${campaignId}/schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            scheduledAt: `${formData.scheduledDate}T${formData.scheduledTime}:00Z` 
          }),
        });
      }

      router.push(`/campaigns/${campaignId}`);
    } catch (error) {
      console.error('Submission failed', error);
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Campaign Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Q3 Market Update"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Subject Line</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => updateForm('subject', e.target.value)}
                  className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="Your Portfolio Update"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-300">Description (Internal)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 h-24"
                  placeholder="Notes about this campaign..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">From Name</label>
                <input
                  type="text"
                  value={formData.fromName}
                  onChange={(e) => updateForm('fromName', e.target.value)}
                  className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">From Email</label>
                <input
                  type="email"
                  value={formData.fromEmail}
                  onChange={(e) => updateForm('fromEmail', e.target.value)}
                  className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {templates.length > 0 ? (
                templates.map((tpl: any) => (
                  <div key={tpl.id} onClick={() => updateForm('templateId', tpl.id)} className={`cursor-pointer rounded-xl border-2 transition-all ${formData.templateId === tpl.id ? 'border-blue-500 scale-[1.02]' : 'border-transparent'}`}>
                    <TemplateCard template={tpl} />
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 text-gray-400">Loading templates...</div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <RecipientSelector
              campaignId="new"
              onRecipientsChange={(recs: any) => updateForm('recipients', recs)}
            />
          </div>
        );
      case 4:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[500px] border border-[#2E2E3E] rounded-xl overflow-hidden">
             {formData.templateId ? (
                <TemplatePreview html={templates.find((t: any) => t.id === formData.templateId)?.htmlContent || ""} />
             ) : (
                <div className="flex items-center justify-center h-full text-gray-400">Please select a template in Step 2.</div>
             )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateForm('sendMode', 'now')}
                className={`p-6 rounded-xl border ${formData.sendMode === 'now' ? 'border-blue-500 bg-blue-500/10' : 'border-[#2E2E3E] bg-[#151515] hover:bg-[#1A1A24]'} transition-all text-left flex flex-col gap-3`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Send className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Send Now</h3>
                  <p className="text-sm text-gray-400 mt-1">Campaign will be dispatched immediately.</p>
                </div>
              </button>
              <button
                onClick={() => updateForm('sendMode', 'schedule')}
                className={`p-6 rounded-xl border ${formData.sendMode === 'schedule' ? 'border-indigo-500 bg-indigo-500/10' : 'border-[#2E2E3E] bg-[#151515] hover:bg-[#1A1A24]'} transition-all text-left flex flex-col gap-3`}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Schedule Later</h3>
                  <p className="text-sm text-gray-400 mt-1">Pick a specific date and time for delivery.</p>
                </div>
              </button>
            </div>
            {formData.sendMode === 'schedule' && (
              <div className="grid grid-cols-2 gap-4 bg-[#151515] p-6 rounded-xl border border-[#2E2E3E]">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Date</label>
                  <input type="date" value={formData.scheduledDate} onChange={(e) => updateForm('scheduledDate', e.target.value)} className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg px-4 py-2 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Time</label>
                  <input type="time" value={formData.scheduledTime} onChange={(e) => updateForm('scheduledTime', e.target.value)} className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg px-4 py-2 text-white" />
                </div>
              </div>
            )}
          </div>
        );
      case 6:
        return (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2 mb-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Ready to {formData.sendMode === 'now' ? 'Send' : 'Schedule'}</h2>
              <p className="text-gray-400">Review your campaign details below.</p>
            </div>
            <div className="bg-[#151515] border border-[#2E2E3E] rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-3 border-b border-[#2E2E3E] pb-4">
                <span className="text-gray-500 text-sm">Campaign Name</span>
                <span className="col-span-2 text-white font-medium">{formData.name || 'Untitled'}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-[#2E2E3E] pb-4">
                <span className="text-gray-500 text-sm">Subject</span>
                <span className="col-span-2 text-white font-medium">{formData.subject}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-[#2E2E3E] pb-4">
                <span className="text-gray-500 text-sm">Recipients</span>
                <span className="col-span-2 text-white font-medium">{formData.recipients.length} Selected</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-gray-500 text-sm">Delivery</span>
                <span className="col-span-2 text-white font-medium">
                  {formData.sendMode === 'now' ? 'Immediate' : `${formData.scheduledDate} at ${formData.scheduledTime}`}
                </span>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-[#151515]/60 backdrop-blur-xl border border-[#2E2E3E]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[80vh]">
          <div className="p-6 border-b border-[#2E2E3E]/50 bg-[#0A0A0F]/50">
            <StepIndicator currentStep={currentStep} steps={STEPS} />
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto">
            {renderStepContent()}
          </div>

          <div className="p-6 border-t border-[#2E2E3E]/50 bg-[#0A0A0F]/50 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1A1A24] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>

            {currentStep < 6 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Processing...' : (formData.sendMode === 'now' ? 'Send Campaign' : 'Schedule Campaign')}
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
