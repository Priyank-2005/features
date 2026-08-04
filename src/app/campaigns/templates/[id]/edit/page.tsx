"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { ArrowLeft, Save, LayoutTemplate } from 'lucide-react';
import { TemplateEditor } from "@/components/campaigns/TemplateEditor";

const CATEGORIES = ['Welcome', 'Newsletter', 'Investment', 'Market', 'Portfolio', 'Tax', 'Event', 'Webinar', 'Greeting', 'Product', 'General'];

export default function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'settings'>('editor');
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    subject: '',
    htmlContent: '',
    jsonContent: '',
    description: ''
  });

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await fetch(`/api/v1/templates/${id}`);
        if (res.ok) {
          const data = await res.json();
          const t = data.template;
          setFormData({
            name: t.name || '',
            category: t.category || 'General',
            subject: t.subject || '',
            htmlContent: t.htmlContent || '',
            jsonContent: t.jsonContent || '',
            description: t.description || ''
          });
        } else {
          router.push('/campaigns/templates');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [id, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        router.push('/campaigns/templates');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save template');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#050505] text-white p-8 flex items-center justify-center">Loading template...</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/campaigns/templates')}
            className="p-2 hover:bg-[#1A1A24] rounded-lg transition-colors text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-blue-400" />
              Edit Template
            </h1>
            <p className="text-gray-400 text-sm">{formData.name}</p>
          </div>
        </div>
        
        <div className="flex bg-[#151515] rounded-lg p-1 border border-[#2E2E3E]">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'editor' 
                ? 'bg-[#2E2E3E] text-white shadow-sm' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Design
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'settings' 
                ? 'bg-[#2E2E3E] text-white shadow-sm' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Settings
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !formData.name || !formData.htmlContent}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
          <Save className="w-4 h-4" />
        </button>
      </div>

      <main className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 bg-[#0A0A0F] overflow-y-auto">
          {activeTab === 'editor' ? (
            <TemplateEditor 
              initialContent={formData.jsonContent} 
              onChange={(html, json) => {
                setFormData(prev => ({ ...prev, htmlContent: html, jsonContent: json }));
              }} 
            />
          ) : (
            <div className="max-w-2xl mx-auto p-8 space-y-6">
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-[#151515]/60 backdrop-blur-xl border border-[#2E2E3E]/50 rounded-2xl p-6 space-y-4">
                  <h2 className="text-lg font-medium text-white mb-4">Template Settings</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Template Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="e.g., Q3 Investment Update"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none transition-colors"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Default Subject Line</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Exciting opportunities await!"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 h-24 resize-none transition-colors"
                      placeholder="Internal description for this template..."
                    />
                  </div>
                </div>

                <div className="bg-[#151515]/60 backdrop-blur-xl border border-[#2E2E3E]/50 rounded-2xl p-6">
                  <h2 className="text-lg font-medium text-white mb-4">Raw HTML (Advanced)</h2>
                  <p className="text-sm text-gray-400 mb-4">You can manually edit the HTML code here, though using the visual editor is recommended.</p>
                  <textarea
                    value={formData.htmlContent}
                    onChange={(e) => setFormData({...formData, htmlContent: e.target.value})}
                    className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg p-4 text-sm text-green-400 font-mono focus:outline-none focus:border-blue-500 overflow-y-auto h-64 resize-y transition-colors"
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
