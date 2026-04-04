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
    <div className="p-8 space-y-8 bg-surface min-h-[calc(100vh-64px)]">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="ornate-lead">
          <span className="font-label uppercase tracking-[0.2em] text-xs text-primary font-bold">Growth Intelligence</span>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline mt-1">Marketing Hub</h1>
          <p className="text-sm text-secondary font-body mt-0.5">Track spend, ROAS, and campaign performance</p>
        </div>
        <div className="flex gap-3">
          {/* Date range selector */}
          <div className="flex border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-lowest shadow-sm h-10">
            {DATE_RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-4 py-2 font-label text-[10px] uppercase font-bold tracking-widest transition-colors ${
                  dateRange === r ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-surface-container-low'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {/* Export report button */}
          <button className="h-10 px-6 bg-surface-container-lowest text-secondary rounded-xl font-label text-xs uppercase font-bold tracking-widest border border-outline-variant/30 hover:bg-surface-container-low transition-all shadow-sm">
            Export Report
          </button>
        </div>
      </div>

      {/* KPI cards — Total Spend, Total Revenue, ROAS, CPA, CTR, Impressions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[
          { label: 'Total Spend', color: 'bg-error/5 border-error/20 text-error' },
          { label: 'Revenue', color: 'bg-green-500/5 border-green-500/20 text-green-700' },
          { label: 'ROAS', color: 'bg-[#0B2D5E]/5 border-[#0B2D5E]/10 text-[#0B2D5E]' },
          { label: 'CPA', color: 'bg-surface-container-lowest border-outline-variant/15 text-primary' },
          { label: 'CTR', color: 'bg-primary/5 border-primary/20 text-primary' },
          { label: 'Impressions', color: 'bg-surface-container-lowest border-outline-variant/15 text-on-surface' },
        ].map(({ label, color }) => (
          <div key={label} className={`${color} rounded-2xl border p-6 shadow-sm hover:shadow-floating transition-shadow`}>
            <p className="text-[10px] uppercase font-label font-bold tracking-widest opacity-70 mb-3">{label}</p>
            <div className="h-8 w-20 bg-surface/50 rounded animate-pulse" />
            {/* delta vs previous period */}
            <div className="h-3 w-14 bg-surface/30 rounded mt-2" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Spend vs Revenue line chart (Recharts) */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-label uppercase font-bold tracking-widest text-secondary">Spend vs Revenue</h3>
            {/* channel filter */}
            <div className="h-8 w-24 bg-surface-container-low rounded-lg" />
          </div>
          {/* TODO: Recharts placeholder */}
          <div className="h-64 bg-surface-container-low/30 rounded-xl flex items-end gap-2 px-4 pb-4">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                <div className="w-full bg-green-500/40 rounded-t" style={{ height: `${20 + Math.sin(i) * 15}%` }} />
                <div className="w-full bg-error/40 rounded-t" style={{ height: `${10 + Math.cos(i) * 10}%` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Channel breakdown pie / donut (Recharts) */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-6">
          <h3 className="text-sm font-label uppercase font-bold tracking-widest text-secondary mb-6">Spend by Channel</h3>
          <div className="h-40 w-40 bg-surface-container-low rounded-full mx-auto border-[12px] border-surface shadow-inner" />
          {/* Legend */}
          <div className="mt-6 space-y-3">
            {[
              { label: 'Meta Ads', color: 'bg-[#1877F2]' },
              { label: 'Google Ads', color: 'bg-primary' },
              { label: 'LINE OA', color: 'bg-[#00B900]' },
              { label: 'TikTok', color: 'bg-[#000000] dark:bg-white' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
                  <span className="text-secondary font-body text-xs">{label}</span>
                </div>
                <div className="h-4 w-12 bg-surface-container-low rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active campaigns summary table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-label uppercase font-bold tracking-widest text-secondary">Active Campaigns</h3>
          <a href="/marketing/campaigns" className="text-[10px] font-label uppercase font-bold tracking-widest text-primary hover:underline">View all</a>
        </div>
        <div className="space-y-0">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-[10px] font-label font-bold text-secondary uppercase tracking-widest border-b border-outline-variant/15 bg-surface-container-low/50">
            <div className="col-span-4">Campaign</div>
            <div className="col-span-2">Channel</div>
            <div className="col-span-2">Spend</div>
            <div className="col-span-2">ROAS</div>
            <div className="col-span-2">Status</div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-surface hover:bg-surface-container-low transition-colors items-center group cursor-pointer">
              <div className="col-span-4 flex items-center gap-3">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-1"><span className="material-symbols-outlined text-[1rem]">campaign</span></div>
                <div>
                  <div className="h-4 w-36 bg-on-surface/10 rounded" />
                  <div className="h-3 w-24 bg-secondary/20 rounded mt-1.5" />
                </div>
              </div>
              <div className="col-span-2"><div className="h-5 w-16 bg-[#0B2D5E]/10 rounded-full" /></div>
              <div className="col-span-2"><div className="h-4 w-16 bg-on-surface/5 rounded" /></div>
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-10 bg-on-surface/5 rounded" />
                  <div className={`h-3 w-3 rounded-sm ${i % 2 === 0 ? 'bg-green-500/20 text-green-700' : 'bg-error/20 text-error'} flex items-center justify-center`}><span className="material-symbols-outlined text-[10px]">{i % 2 === 0 ? 'arrow_upward' : 'arrow_downward'}</span></div>
                </div>
              </div>
              <div className="col-span-2"><div className="h-5 w-16 bg-green-500/10 text-green-700 rounded-full flex items-center justify-center text-[9px] font-label uppercase font-bold tracking-widest">Active</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
