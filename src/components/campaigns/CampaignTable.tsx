"use client";

import React, { useState } from "react";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import { Eye, Copy, Trash2, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

type Campaign = {
  id: string;
  name: string;
  subject: string;
  status: any;
  totalRecipients?: number;
  totalDelivered?: number;
  totalOpened?: number;
  createdAt: string;
};

interface CampaignTableProps {
  campaigns: Campaign[];
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onView: (id: string) => void;
}

export function CampaignTable({ campaigns, onDelete, onDuplicate, onView }: CampaignTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(campaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCampaigns = campaigns.slice(startIndex, startIndex + itemsPerPage);

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-panel text-center">
        <div className="w-16 h-16 rounded-full bg-[#1E1E2E] flex items-center justify-center mb-4 border border-[#2E2E3E]/50">
          <MoreHorizontal className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2 font-playfair">No campaigns yet</h3>
        <p className="text-gray-400 text-sm max-w-sm">Create your first campaign to start reaching your audience and tracking performance.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs uppercase bg-[#1E1E2E]/40 text-gray-400 border-b border-[#2E2E3E]/50">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Name</th>
                <th scope="col" className="px-6 py-4 font-medium">Status</th>
                <th scope="col" className="px-6 py-4 font-medium">Recipients</th>
                <th scope="col" className="px-6 py-4 font-medium">Delivered</th>
                <th scope="col" className="px-6 py-4 font-medium">Open Rate</th>
                <th scope="col" className="px-6 py-4 font-medium">Created</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCampaigns.map((campaign, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={campaign.id} 
                  className="border-b border-[#2E2E3E]/50 hover:bg-[#1E1E2E]/40 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{campaign.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{campaign.subject}</div>
                  </td>
                  <td className="px-6 py-4">
                    <CampaignStatusBadge status={campaign.status} />
                  </td>
                  <td className="px-6 py-4">{(campaign.totalRecipients || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">{(campaign.totalDelivered || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" 
                          style={{ width: `${Math.min(100, ((campaign.totalOpened || 0) / Math.max(1, campaign.totalDelivered || 1)) * 100)}%` }} 
                        />
                      </div>
                      <span className="text-xs">{(((campaign.totalOpened || 0) / Math.max(1, campaign.totalDelivered || 1)) * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onView(campaign.id)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDuplicate(campaign.id)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(campaign.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#2E2E3E]/50 bg-[#1E1E2E]/20">
            <div className="text-sm text-gray-400">
              Showing <span className="font-medium text-white">{startIndex + 1}</span> to <span className="font-medium text-white">{Math.min(startIndex + itemsPerPage, campaigns.length)}</span> of <span className="font-medium text-white">{campaigns.length}</span> campaigns
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-md text-sm transition-colors ${currentPage === i + 1 ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
