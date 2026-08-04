"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Plus, Trash2, Copy, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// We assume these components exist in the repository
// If they don't, you'll need to create them following the design system
import { CampaignTable } from "@/components/campaigns/CampaignTable";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";

type Campaign = {
  id: string;
  name: string;
  status: 'Draft' | 'Scheduled' | 'Sending' | 'Completed' | 'Failed' | 'Cancelled';
  subject: string;
  createdAt: string;
  sentAt?: string;
};

const TABS = ['All', 'Draft', 'Scheduled', 'Sending', 'Completed', 'Failed', 'Cancelled'];

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/v1/campaigns/${id}`, { method: 'DELETE' });
      setCampaigns(campaigns.filter((c) => c.id !== id));
      setDeleteModal({ isOpen: false, id: null });
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await fetch(`/api/v1/campaigns/${id}/duplicate`, { method: 'POST' });
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to duplicate', error);
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesTab = activeTab === 'All' || c.status.toUpperCase() === activeTab.toUpperCase();
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.subject.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              Campaigns
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Manage your email marketing campaigns</p>
          </div>
          <Link
            href="/campaigns/new"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </Link>
        </div>

        <div className="bg-[#151515]/60 backdrop-blur-xl border border-[#2E2E3E]/50 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full sm:w-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-[#1E1E2E] text-blue-400 border border-[#2E2E3E]'
                      : 'text-gray-400 hover:text-white hover:bg-[#1A1A24]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="min-h-[400px]">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-[#1A1A24] animate-pulse rounded-xl" />
                ))}
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4">
                <div className="w-16 h-16 bg-[#1A1A24] rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">No campaigns found</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {search ? 'Try adjusting your search or filters.' : 'Get started by creating your first campaign.'}
                  </p>
                </div>
                {!search && (
                  <Link
                    href="/campaigns/new"
                    className="mt-4 px-4 py-2 bg-[#1E1E2E] border border-[#2E2E3E] rounded-lg text-sm font-medium hover:bg-[#2A2A3A] transition-colors"
                  >
                    Create First Campaign
                  </Link>
                )}
              </div>
            ) : (
              <CampaignTable
                campaigns={filteredCampaigns as any}
                onView={(id: string) => router.push(`/campaigns/${id}`)}
                onDelete={(id: string) => setDeleteModal({ isOpen: true, id })}
                onDuplicate={handleDuplicate}
              />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {deleteModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#151515] border border-[#2E2E3E] rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Delete Campaign</h3>
                    <p className="text-sm text-gray-400">This action cannot be undone.</p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteModal({ isOpen: false, id: null })}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, id: null })}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-[#1A1A24] border border-[#2E2E3E] hover:bg-[#252535] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteModal.id && handleDelete(deleteModal.id)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
