"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Plus, LayoutTemplate, Database } from 'lucide-react';
import { motion } from 'framer-motion';

import { TemplateCard } from "@/components/campaigns/TemplateCard";

const CATEGORIES = ['All', 'Welcome', 'Newsletter', 'Investment', 'Market', 'Portfolio', 'Tax', 'Event', 'Webinar', 'Greeting', 'Product', 'General'];

export default function TemplatesLibraryPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [seeding, setSeeding] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Failed to fetch templates', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await fetch('/api/v1/templates/seed', { method: 'POST' });
      await fetchTemplates();
    } catch (error) {
      console.error('Failed to seed templates', error);
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/v1/templates/${id}`, { method: 'DELETE' });
      setTemplates(templates.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await fetch(`/api/v1/templates/${id}/duplicate`, { method: 'POST' });
      fetchTemplates();
    } catch (error) {
      console.error('Failed to duplicate', error);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              Email Templates
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Design and manage your communication templates</p>
          </div>
          <Link
            href="/campaigns/templates/new"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Link>
        </div>

        <div className="bg-[#151515]/60 backdrop-blur-xl border border-[#2E2E3E]/50 rounded-2xl shadow-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-[#1E1E2E] text-blue-400 border border-[#2E2E3E]'
                      : 'text-gray-400 hover:text-white hover:bg-[#1A1A24]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="min-h-[400px]">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-[#1A1A24] animate-pulse rounded-xl" />
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4">
                <div className="w-16 h-16 bg-[#1A1A24] rounded-full flex items-center justify-center">
                  <LayoutTemplate className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">No templates found</h3>
                  <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
                    {search ? 'Try adjusting your search criteria.' : 'You have no templates yet. Create your first one or seed the default templates to get started quickly.'}
                  </p>
                </div>
                {!search && templates.length === 0 && (
                  <button
                    onClick={handleSeed}
                    disabled={seeding}
                    className="mt-4 flex items-center gap-2 px-6 py-2 bg-[#1E1E2E] border border-[#2E2E3E] rounded-lg text-sm font-medium hover:bg-[#2A2A3A] transition-colors disabled:opacity-50"
                  >
                    <Database className="w-4 h-4 text-indigo-400" />
                    {seeding ? 'Seeding...' : 'Seed Default Templates'}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map(template => (
                  <TemplateCard 
                    key={template.id} 
                    template={template} 
                    onEdit={() => router.push(`/campaigns/templates/${template.id}/edit`)}
                    onDelete={() => handleDelete(template.id)}
                    onDuplicate={() => handleDuplicate(template.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
