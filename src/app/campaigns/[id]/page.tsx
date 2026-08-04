"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, XCircle, Copy, Trash2, Send, Activity, Users, MousePointerClick, MailOpen } from 'lucide-react';
import Link from 'next/link';

import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { AnalyticsDashboard } from "@/components/campaigns/AnalyticsDashboard";
import { CampaignTimeline } from "@/components/campaigns/CampaignTimeline";
import { TestEmailModal } from "@/components/campaigns/TestEmailModal";
import { ConfirmationModal } from "@/components/campaigns/ConfirmationModal";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [campaign, setCampaign] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; action: string | null }>({ isOpen: false, action: null });

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/v1/campaigns/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data.campaign);
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCampaign();
  }, [id]);

  const handleAction = async () => {
    if (!confirmModal.action) return;
    try {
      if (confirmModal.action === 'delete') {
        await fetch(`/api/v1/campaigns/${id}`, { method: 'DELETE' });
        router.push('/campaigns');
        return;
      }
      if (confirmModal.action === 'duplicate') {
        await fetch(`/api/v1/campaigns/${id}/duplicate`, { method: 'POST' });
        router.push('/campaigns');
        return;
      }
      if (confirmModal.action === 'pause') {
        await fetch(`/api/v1/campaigns/${id}/pause`, { method: 'POST' });
        fetchCampaign();
      }
      if (confirmModal.action === 'cancel') {
        await fetch(`/api/v1/campaigns/${id}/cancel`, { method: 'POST' });
        fetchCampaign();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmModal({ isOpen: false, action: null });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#050505] p-8 text-white flex items-center justify-center">Loading...</div>;
  }

  if (!campaign) {
    return <div className="min-h-screen bg-[#050505] p-8 text-white flex items-center justify-center">Campaign not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <Link href="/campaigns" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 mb-4 w-max">
              <ArrowLeft className="w-4 h-4" /> Back to Campaigns
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{campaign.name}</h1>
              <CampaignStatusBadge status={campaign.status} />
            </div>
            <p className="text-gray-400 mt-2">{campaign.subject}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setTestModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A24] border border-[#2E2E3E] rounded-lg text-sm hover:bg-[#252535] transition-colors"
            >
              <Send className="w-4 h-4 text-blue-400" />
              Test Email
            </button>
            {campaign.status === 'Scheduled' && (
              <button
                onClick={() => setConfirmModal({ isOpen: true, action: 'pause' })}
                className="flex items-center gap-2 px-4 py-2 bg-[#1A1A24] border border-[#2E2E3E] rounded-lg text-sm hover:bg-[#252535] transition-colors"
              >
                <Pause className="w-4 h-4 text-yellow-400" />
                Pause
              </button>
            )}
            {(campaign.status === 'Scheduled' || campaign.status === 'Sending') && (
              <button
                onClick={() => setConfirmModal({ isOpen: true, action: 'cancel' })}
                className="flex items-center gap-2 px-4 py-2 bg-[#1A1A24] border border-[#2E2E3E] rounded-lg text-sm hover:bg-[#252535] transition-colors"
              >
                <XCircle className="w-4 h-4 text-red-400" />
                Cancel
              </button>
            )}
            <button
              onClick={() => setConfirmModal({ isOpen: true, action: 'duplicate' })}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A24] border border-[#2E2E3E] rounded-lg text-sm hover:bg-[#252535] transition-colors"
            >
              <Copy className="w-4 h-4 text-gray-400" />
              Duplicate
            </button>
            <button
              onClick={() => setConfirmModal({ isOpen: true, action: 'delete' })}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Analytics & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#151515]/60 backdrop-blur-xl border border-[#2E2E3E]/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="text-gray-400 text-sm">Recipients</h3>
            </div>
            <p className="text-3xl font-bold">{analytics?.totalRecipients || 0}</p>
          </div>
          <div className="bg-[#151515]/60 backdrop-blur-xl border border-[#2E2E3E]/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-green-400" />
              <h3 className="text-gray-400 text-sm">Delivered</h3>
            </div>
            <p className="text-3xl font-bold">{analytics?.totalDelivered || 0}</p>
          </div>
          <div className="bg-[#151515]/60 backdrop-blur-xl border border-[#2E2E3E]/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <MailOpen className="w-5 h-5 text-purple-400" />
              <h3 className="text-gray-400 text-sm">Open Rate</h3>
            </div>
            <p className="text-3xl font-bold">{analytics?.openRate || 0}%</p>
          </div>
          <div className="bg-[#151515]/60 backdrop-blur-xl border border-[#2E2E3E]/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <MousePointerClick className="w-5 h-5 text-indigo-400" />
              <h3 className="text-gray-400 text-sm">Click Rate</h3>
            </div>
            <p className="text-3xl font-bold">{analytics?.clickRate || 0}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#151515]/60 backdrop-blur-xl border border-[#2E2E3E]/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Performance</h2>
              <AnalyticsDashboard analytics={analytics} campaignId={id} />
            </div>

            <div className="bg-[#151515]/60 backdrop-blur-xl border border-[#2E2E3E]/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Recipients</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="bg-[#1A1A24] text-white">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Opened At</th>
                      <th className="px-4 py-3 rounded-r-lg font-medium">Clicked At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2E2E3E]">
                    {campaign.recipients?.map((rec: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#1A1A24]/50 transition-colors">
                        <td className="px-4 py-3 text-white">{rec.email}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-[#2E2E3E] rounded-md text-xs">{rec.status}</span>
                        </td>
                        <td className="px-4 py-3">{rec.openedAt || '-'}</td>
                        <td className="px-4 py-3">{rec.clickedAt || '-'}</td>
                      </tr>
                    ))}
                    {(!campaign.recipients || campaign.recipients.length === 0) && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No recipients data available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-[#151515]/60 backdrop-blur-xl border border-[#2E2E3E]/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Timeline</h2>
              <CampaignTimeline activities={campaign.activities || []} />
            </div>
          </div>
        </div>

      </div>

      <TestEmailModal 
        isOpen={testModalOpen} 
        onClose={() => setTestModalOpen(false)} 
        campaignId={id} 
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null })}
        onConfirm={handleAction}
        title={`${confirmModal.action === 'delete' ? 'Delete' : confirmModal.action === 'duplicate' ? 'Duplicate' : confirmModal.action === 'pause' ? 'Pause' : 'Cancel'} Campaign`}
        message={`Are you sure you want to ${confirmModal.action} this campaign?`}
        
      />

    </div>
  );
}
