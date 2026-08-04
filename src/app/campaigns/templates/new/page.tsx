"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, LayoutTemplate, Settings } from 'lucide-react';

import { TemplateEditor } from "@/components/campaigns/TemplateEditor";
import { TemplatePreview } from "@/components/campaigns/TemplatePreview";

const CATEGORIES = ['Welcome', 'Newsletter', 'Investment', 'Market', 'Portfolio', 'Tax', 'Event', 'Webinar', 'Greeting', 'Product', 'General'];

export default function NewTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'settings'>('editor');
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    subject: '',
    description: '',
    content: '',
    jsonContent: ''
  });

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.content) return;
    setLoading(true);
    try {
      await fetch('/api/v1/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          htmlContent: formData.content,
        }),
      });
      router.push('/campaigns/templates');
    } catch (error) {
      console.error('Failed to save template', error);
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden">
      
      {/* Header */}
      <header className="h-16 border-b border-[#1F1F1F] bg-[#0A0A0A] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/campaigns/templates" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-px h-6 bg-[#2E2E3E]" />
          <input
            type="text"
            placeholder="Untitled Template"
            value={formData.name}
            onChange={(e) => updateForm('name', e.target.value)}
            className="bg-transparent border-none focus:outline-none text-lg font-medium text-white placeholder:text-gray-600 w-64"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#151515] rounded-lg p-1 border border-[#2E2E3E]">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'editor' ? 'bg-[#2E2E3E] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <LayoutTemplate className="w-4 h-4" /> Design
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'settings' ? 'bg-[#2E2E3E] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
          </div>
          
          <button
            onClick={handleSave}
            disabled={loading || !formData.name || !formData.content}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Editor Area */}
        <div className="flex-1 bg-[#0A0A0F] overflow-y-auto">
          {activeTab === 'editor' ? (
            <TemplateEditor 
              initialContent={formData.jsonContent} 
              onChange={(html, json) => {
                setFormData(prev => ({ ...prev, content: html, jsonContent: json }));
              }} 
            />
          ) : (
            <div className="max-w-2xl mx-auto p-8 space-y-6">
              <h2 className="text-xl font-bold mb-6">Template Settings</h2>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Template Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => updateForm('category', e.target.value)}
                  className="w-full bg-[#151515] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Default Subject Line</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => updateForm('subject', e.target.value)}
                  placeholder="Subject line when this template is used..."
                  className="w-full bg-[#151515] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  placeholder="Internal description of what this template is for..."
                  className="w-full bg-[#151515] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 h-32"
                />
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
