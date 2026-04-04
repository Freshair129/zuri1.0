'use client';

// Marketing — Campaign list page
// Full table of all campaigns across channels with filtering, sorting, and status management.

import { useState } from 'react';

const CHANNEL_FILTERS = ['All Channels', 'Meta', 'Google', 'LINE OA', 'TikTok', 'Email', 'SMS'];
const STATUS_FILTERS = ['All', 'Active', 'Paused', 'Completed', 'Draft'];

export default function CampaignsPage() {
  const [channel, setChannel] = useState('All Channels');
  const [status, setStatus] = useState('All');

  return (
    <div className="p-8 space-y-8 bg-surface min-h-[calc(100vh-64px)]">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="ornate-lead">
          <span className="font-label uppercase tracking-[0.2em] text-xs text-primary font-bold">Growth Intelligence</span>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline mt-1">Campaigns</h1>
          <p className="text-sm text-secondary font-body mt-0.5">All marketing campaigns across channels</p>
        </div>
        <div className="flex gap-3">
          {/* New campaign wizard button */}
          <button className="h-10 px-6 gold-gradient rounded-xl font-label text-xs uppercase font-bold tracking-widest text-[#0B2D5E] shadow-sm hover:shadow-floating transition-all">
            New Campaign
          </button>
        </div>
      </div>

      {/* Filters toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* search by campaign name */}
        <div className="flex-1 h-12 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center px-4 gap-3 focus-within:border-primary transition-colors hover:shadow-floating">
          <span className="material-symbols-outlined text-outline">search</span>
          <div className="h-4 w-40 bg-outline-variant/20 rounded" />
        </div>

        {/* Channel filter */}
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="h-12 px-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-[10px] font-label font-bold uppercase tracking-widest text-secondary focus:outline-none focus:border-primary cursor-pointer hover:bg-surface-container-low transition-colors"
        >
          {CHANNEL_FILTERS.map((c) => <option key={c}>{c}</option>)}
        </select>

        {/* Date range picker placeholder */}
        <div className="h-12 w-48 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center px-4" />

        {/* Export CSV button */}
        <button className="h-12 px-6 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-[10px] font-label font-bold uppercase tracking-widest text-secondary hover:bg-surface-container-low hover:text-primary transition-colors hover:shadow-sm">
          Export CSV
        </button>
      </div>

      {/* Status pills */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-full text-[10px] font-label font-bold uppercase tracking-widest border transition-colors ${
              status === s ? 'gold-gradient text-[#0B2D5E] border-primary shadow-sm' : 'bg-surface-container-lowest text-secondary border-outline-variant/30 hover:bg-surface-container-low'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Campaigns table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-outline-variant/15 bg-surface-container-low/50 text-[10px] font-label uppercase font-bold text-secondary tracking-widest">
          <div className="col-span-3">Campaign Name</div>
          <div className="col-span-1">Channel</div>
          <div className="col-span-2">Dates</div>
          <div className="col-span-1">Budget</div>
          <div className="col-span-1">Spend</div>
          <div className="col-span-1">ROAS</div>
          <div className="col-span-1">Conversions</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1" />
        </div>

        {/* map over fetched campaigns, render CampaignTableRow */}
        <div className="space-y-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-surface hover:bg-surface-container-low transition-colors items-center group cursor-pointer"
            >
              <div className="col-span-3 space-y-1.5 flex items-center gap-3">
                 <div className="h-10 w-10 flex-shrink-0 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-1">
                   <span className="material-symbols-outlined text-[1.2rem]">campaign</span>
                 </div>
                 <div>
                  <div className="h-4 w-40 bg-on-surface/10 rounded mb-1.5" />
                  <div className="h-3 w-28 bg-secondary/20 rounded" />
                 </div>
              </div>
              <div className="col-span-1">
                <div className="h-6 w-16 bg-[#0B2D5E]/5 rounded-full flex items-center justify-center text-[9px] font-label font-bold uppercase tracking-widest text-[#0B2D5E]">Meta</div>
              </div>
              <div className="col-span-2 space-y-1">
                <div className="h-4 w-20 bg-on-surface/5 rounded" />
                <div className="h-3.5 w-20 bg-secondary/10 rounded" />
              </div>
              <div className="col-span-1"><div className="h-4 w-16 bg-on-surface/5 rounded" /></div>
              <div className="col-span-1"><div className="h-4 w-14 bg-on-surface/5 rounded" /></div>
              <div className="col-span-1">
                {/* color-code ROAS — green if >2, red if <1 */}
                <div className={`h-5 w-12 flex items-center justify-center text-[10px] font-label font-bold rounded ${i % 3 === 0 ? 'bg-green-500/10 text-green-700' : 'bg-surface-container-high text-secondary'}`}>2.4</div>
              </div>
              <div className="col-span-1"><div className="h-4 w-12 bg-on-surface/5 rounded" /></div>
              <div className="col-span-1">
                <div className={`h-6 w-20 rounded-full flex items-center justify-center text-[9px] font-label uppercase tracking-widest font-bold ${
                  i % 4 === 0 ? 'bg-[#0B2D5E]/10 text-[#0B2D5E]' : i % 4 === 1 ? 'bg-green-500/10 text-green-700' : i % 4 === 2 ? 'bg-surface-container-highest text-secondary' : 'bg-error/10 text-error'
                }`}>Active</div>
              </div>
              <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                {/* 3-dot menu — edit, pause/resume, duplicate, delete */}
                <div className="h-8 w-8 bg-surface-container-highest rounded-lg flex items-center justify-center text-secondary hover:bg-primary/20 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[1.2rem]">more_vert</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <div className="h-4 w-40 bg-secondary/20 rounded" />
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center justify-center text-[10px] font-label font-bold uppercase tracking-widest text-secondary hover:bg-surface-container-low transition-colors cursor-pointer shadow-sm">Prev</div>
          <div className="h-10 w-24 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center justify-center text-[10px] font-label font-bold uppercase tracking-widest text-secondary hover:bg-surface-container-low transition-colors cursor-pointer shadow-sm">Next</div>
        </div>
      </div>
    </div>
  );
}
