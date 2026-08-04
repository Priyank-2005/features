"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Users, Mail, MailOpen, MousePointerClick, AlertCircle, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

export interface AnalyticsData {
  totalRecipients: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  totalBounced: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
  bounceRate: number;
}

interface AnalyticsDashboardProps {
  analytics?: Partial<AnalyticsData>;
  campaignId?: string;
}

const COLORS = {
  delivered: "#10b981", // emerald
  opened: "#3b82f6",    // blue
  clicked: "#8b5cf6",   // violet
  failed: "#ef4444",    // red
  bounced: "#f59e0b",   // amber
};

export function AnalyticsDashboard({ analytics = {}, campaignId }: AnalyticsDashboardProps) {
  const safeAnalytics = {
    totalRecipients: analytics.totalRecipients || 0,
    totalDelivered: analytics.totalDelivered || 0,
    totalOpened: analytics.totalOpened || 0,
    totalClicked: analytics.totalClicked || 0,
    totalFailed: analytics.totalFailed || 0,
    totalBounced: analytics.totalBounced || 0,
    deliveryRate: Number(analytics.deliveryRate || 0),
    openRate: Number(analytics.openRate || 0),
    clickRate: Number(analytics.clickRate || 0),
    clickToOpenRate: Number(analytics.clickToOpenRate || 0),
    bounceRate: Number(analytics.bounceRate || 0),
  };

  const chartData = [
    { name: "Opened", value: safeAnalytics.totalOpened, color: COLORS.opened },
    { name: "Delivered (Unopened)", value: Math.max(0, safeAnalytics.totalDelivered - safeAnalytics.totalOpened), color: COLORS.delivered },
    { name: "Bounced", value: safeAnalytics.totalBounced, color: COLORS.bounced },
    { name: "Failed", value: safeAnalytics.totalFailed, color: COLORS.failed },
  ].filter(item => item.value > 0);

  const stats = [
    { label: "Total Sent", value: safeAnalytics.totalRecipients, icon: Users, color: "text-gray-300" },
    { label: "Delivered", value: safeAnalytics.deliveryRate.toFixed(1) + "%", count: safeAnalytics.totalDelivered, icon: Mail, color: "text-emerald-400" },
    { label: "Open Rate", value: safeAnalytics.openRate.toFixed(1) + "%", count: safeAnalytics.totalOpened, icon: MailOpen, color: "text-blue-400" },
    { label: "Click Rate", value: safeAnalytics.clickRate.toFixed(1) + "%", count: safeAnalytics.totalClicked, icon: MousePointerClick, color: "text-violet-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={stat.label} 
              className="glass-card p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-gray-400">{stat.label}</span>
                <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-auto">
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                {stat.count !== undefined && (
                  <p className="text-xs text-gray-500">{stat.count.toLocaleString()} recipients</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-6 lg:col-span-1"
        >
          <h3 className="text-sm font-medium text-gray-300 mb-6 font-playfair">Delivery Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1E1E2E", borderColor: "rgba(46,46,62,0.5)", borderRadius: "8px", color: "#fff" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-6 lg:col-span-2 flex flex-col justify-center"
        >
          <h3 className="text-sm font-medium text-gray-300 mb-6 font-playfair">Advanced Metrics</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Click-to-Open Rate</span>
                <span className="text-white font-medium">{safeAnalytics.clickToOpenRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-[#151515] rounded-full h-2 overflow-hidden border border-[#2E2E3E]">
                <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${safeAnalytics.clickToOpenRate}%` }}></div>
              </div>
              <p className="text-[10px] text-gray-500">Percentage of openers who clicked a link</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Bounce Rate</span>
                <span className="text-amber-400 font-medium">{safeAnalytics.bounceRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-[#151515] rounded-full h-2 overflow-hidden border border-[#2E2E3E]">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min(100, safeAnalytics.bounceRate * 5)}%` }}></div>
              </div>
              <p className="text-[10px] text-gray-500">Percentage of emails that could not be delivered</p>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4">
             <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-4">
                <div className="p-2 bg-red-500/20 text-red-400 rounded-full">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Failed Deliveries</div>
                  <div className="text-lg font-bold text-white">{safeAnalytics.totalFailed}</div>
                </div>
             </div>
             
             <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-4">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-full">
                  <RefreshCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Bounced Emails</div>
                  <div className="text-lg font-bold text-white">{safeAnalytics.totalBounced}</div>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
