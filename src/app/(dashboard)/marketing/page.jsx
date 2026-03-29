'use client';

// Marketing — Overview dashboard
// Top-level marketing dashboard: spend summary, ROAS, channel breakdown,
// active campaigns overview. Uses Recharts for charts.

import { useState } from 'react';
// TODO: import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DATE_RANGES = ['7d', '30d', '90d', 'Custom'];

export default function MarketingPage() {
  const [dateRange, setDateRange] = useState('30d');

  return (
    <div className="p-6 space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track spend, ROAS, and campaign performance</p>
        </div>
        <div className="flex gap-2">
          {/* Date range selector */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
            {DATE_RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  dateRange === r ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {/* TODO: Export report button */}
          <div className="h-9 w-28 bg-white border border-gray-200 rounded-lg" />
        </div>
      </div>

      {/* TODO: KPI cards — Total Spend, Total Revenue, ROAS, CPA, CTR, Impressions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Spend', color: 'bg-red-50' },
          { label: 'Revenue', color: 'bg-green-50' },
          { label: 'ROAS', color: 'bg-blue-50' },
          { label: 'CPA', color: 'bg-purple-50' },
          { label: 'CTR', color: 'bg-yellow-50' },
          { label: 'Impressions', color: 'bg-orange-50' },
        ].map(({ label, color }) => (
          <div key={label} className={`${color} rounded-xl border border-gray-100 p-4 shadow-sm`}>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <div className="h-7 w-20 bg-white/70 rounded mt-2 animate-pulse" />
            {/* TODO: delta vs previous period */}
            <div className="h-3 w-14 bg-white/50 rounded mt-1" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Spend vs Revenue line chart (Recharts) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Spend vs Revenue</h3>
            {/* TODO: channel filter */}
            <div className="h-7 w-24 bg-gray-100 rounded-lg" />
          </div>
          {/* TODO: <ResponsiveContainer width="100%" height={220}>
                <LineChart data={spendData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="spend" stroke="#f97316" />
                  <Line dataKey="revenue" stroke="#22c55e" />
                </LineChart>
              </ResponsiveContainer> */}
          <div className="h-52 bg-gray-50 rounded-lg flex items-end gap-1 px-2 pb-2">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col gap-0.5 items-center">
                <div className="w-full bg-green-200 rounded-t" style={{ height: `${20 + Math.sin(i) * 15}%` }} />
                <div className="w-full bg-orange-300 rounded-t" style={{ height: `${10 + Math.cos(i) * 10}%` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Channel breakdown pie / donut (Recharts) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Spend by Channel</h3>
          {/* TODO: <PieChart> donut chart */}
          <div className="h-36 w-36 bg-gray-100 rounded-full mx-auto border-8 border-white shadow-inner" />
          {/* Legend */}
          <div className="mt-4 space-y-2">
            {[
              { label: 'Meta Ads', color: 'bg-blue-400' },
              { label: 'Google Ads', color: 'bg-orange-400' },
              { label: 'LINE OA', color: 'bg-green-400' },
              { label: 'TikTok', color: 'bg-pink-400' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
                  <span className="text-gray-600 text-xs">{label}</span>
                </div>
                <div className="h-3.5 w-12 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active campaigns summary table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Active Campaigns</h3>
          <a href="/marketing/campaigns" className="text-xs text-orange-500 hover:underline">View all</a>
        </div>
        {/* TODO: render CampaignRow components */}
        <div className="space-y-0">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
            <div className="col-span-4">Campaign</div>
            <div className="col-span-2">Channel</div>
            <div className="col-span-2">Spend</div>
            <div className="col-span-2">ROAS</div>
            <div className="col-span-2">Status</div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-3 py-3 border-b border-gray-50 hover:bg-gray-50 items-center">
              <div className="col-span-4">
                <div className="h-4 w-36 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-100 rounded mt-1" />
              </div>
              <div className="col-span-2"><div className="h-5 w-16 bg-blue-50 rounded-full" /></div>
              <div className="col-span-2"><div className="h-4 w-16 bg-gray-100 rounded" /></div>
              <div className="col-span-2">
                <div className="flex items-center gap-1">
                  <div className="h-4 w-10 bg-gray-100 rounded" />
                  <div className={`h-3 w-3 ${i % 2 === 0 ? 'text-green-500' : 'text-red-400'} bg-gray-100 rounded-sm`} />
                </div>
              </div>
              <div className="col-span-2"><div className="h-5 w-14 bg-green-100 rounded-full" /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
