'use client';

// Marketing — Daily Strategy Brief (DSB)
// AI-generated daily marketing brief showing yesterday's performance,
// recommended actions, budget pacing, and alerts. Filterable by date.

import { useState } from 'react';

export default function DailyBriefPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  return (
    <div className="p-8 space-y-8 bg-surface min-h-[calc(100vh-64px)]">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="ornate-lead">
          <span className="font-label uppercase tracking-[0.2em] text-xs text-primary font-bold">Growth Intelligence</span>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline mt-1">Daily Strategy Brief</h1>
          <p className="text-sm text-secondary font-body mt-0.5">AI-generated daily marketing performance summary</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Date filter */}
          {/* Replace with a DatePicker component (react-day-picker / shadcn/ui) */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[1.2rem]">calendar_today</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-xs font-label uppercase font-bold tracking-widest text-secondary focus:outline-none focus:border-primary cursor-pointer hover:bg-surface-container-low transition-colors"
            />
          </div>
          {/* Send brief via email button */}
          <button className="h-10 px-6 gold-gradient rounded-xl font-label text-xs uppercase font-bold tracking-widest text-[#0B2D5E] shadow-sm hover:shadow-floating transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[1.2rem]">send</span>
            Send Brief
          </button>
        </div>
      </div>

      {/* Brief meta info bar */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          {/* AI generated indicator */}
          <div className="h-10 w-10 bg-surface-container-lowest rounded-xl flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-[1.5rem]">auto_awesome</span>
          </div>
          <div className="space-y-1.5">
            <div className="h-4 w-60 bg-primary/20 rounded" />
            <div className="h-3 w-40 bg-secondary/20 rounded" />
          </div>
        </div>
        {/* regenerate brief button */}
        <button className="h-10 px-4 bg-surface-container-lowest border border-primary/20 rounded-xl text-[10px] font-label font-bold uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[1rem]">refresh</span>
          Regenerate
        </button>
      </div>

      {/* Executive summary block (AI narrative text) */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full gold-gradient"></div>
        <h2 className="text-sm font-label uppercase font-bold tracking-widest text-on-surface mb-6">Executive Summary</h2>
        <div className="space-y-3">
          <div className="h-4 w-full bg-on-surface/10 rounded" />
          <div className="h-4 w-5/6 bg-on-surface/10 rounded" />
          <div className="h-4 w-4/5 bg-on-surface/10 rounded" />
          <div className="h-4 w-2/3 bg-on-surface/10 rounded" />
        </div>
      </div>

      {/* KPI snapshot grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Spend (Yesterday)', trend: 'up', color: 'text-error bg-error/10 border-error/20' },
          { label: 'Revenue Generated', trend: 'up', color: 'text-green-700 bg-green-500/10 border-green-500/20' },
          { label: 'ROAS', trend: 'down', color: 'text-error bg-error/10 border-error/20' },
          { label: 'New Leads', trend: 'up', color: 'text-green-700 bg-green-500/10 border-green-500/20' },
        ].map(({ label, trend, color }) => (
          <div key={label} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-6 hover:shadow-floating transition-shadow">
            <p className="text-[10px] uppercase font-label font-bold tracking-widest text-secondary mb-3">{label}</p>
            <div className="h-8 w-24 bg-surface-container-low rounded animate-pulse" />
            <div className="flex items-center gap-2 mt-3">
               <div className={`h-6 px-2 rounded-full flex items-center gap-1 border ${color}`}>
                 <span className="material-symbols-outlined text-[12px]">{trend === 'up' ? 'trending_up' : 'trending_down'}</span>
                 <div className="h-3 w-8 bg-current opacity-30 rounded" />
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Channel performance breakdown table */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-8">
          <h2 className="text-sm font-label uppercase font-bold tracking-widest text-on-surface mb-6">Channel Performance</h2>
          <div className="space-y-0">
            <div className="grid grid-cols-5 gap-3 text-[10px] font-label font-bold text-secondary uppercase tracking-widest pb-4 border-b border-outline-variant/15">
              <div className="col-span-2">Channel</div>
              <div>Spend</div>
              <div>Revenue</div>
              <div>ROAS</div>
            </div>
            {['Meta Ads', 'Google Ads', 'LINE OA', 'TikTok', 'Email'].map((ch) => (
              <div key={ch} className="grid grid-cols-5 gap-3 py-4 border-b border-surface items-center group cursor-pointer hover:bg-surface-container-low transition-colors -mx-4 px-4 rounded-xl">
                <div className="col-span-2 flex items-center gap-3">
                  <div className="h-6 w-6 rounded-lg bg-surface-container flex items-center justify-center text-[#0B2D5E] border border-outline-variant/15">
                    <span className="material-symbols-outlined text-[14px]">public</span>
                  </div>
                  <span className="text-xs font-body font-medium text-secondary">{ch}</span>
                </div>
                <div className="h-4 w-16 bg-on-surface/5 rounded" />
                <div className="h-4 w-16 bg-on-surface/5 rounded" />
                <div className="h-5 w-12 bg-surface-container-high rounded flex items-center justify-center text-[10px] font-label font-bold text-secondary" />
              </div>
            ))}
          </div>
        </div>

        {/* Recommended actions list (AI-generated) */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-8">
          <h2 className="text-sm font-label uppercase font-bold tracking-widest text-on-surface mb-6">Recommended Actions</h2>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-outline-variant/15 hover:shadow-sm transition-all group cursor-pointer bg-surface/50">
                {/* Priority badge */}
                <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center text-[1.2rem] border ${
                  i === 0 ? 'bg-error/10 text-error border-error/20' : i === 1 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-container-highest text-secondary border-outline-variant/30'
                }`}>
                  <span className="material-symbols-outlined">{i === 0 ? 'warning' : i === 1 ? 'lightbulb' : 'info'}</span>
                </div>
                <div className="flex-1 space-y-1.5 pt-1">
                  <div className="h-4 w-full bg-on-surface/10 rounded" />
                  <div className="h-3 w-4/5 bg-secondary/10 rounded" />
                </div>
                {/* Mark done / Dismiss button */}
                <div className="h-8 w-8 bg-surface-container rounded-lg flex items-center justify-center text-secondary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary">
                  <span className="material-symbols-outlined text-[1.2rem]">check</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget pacing section — daily spend vs daily target per campaign */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-8">
        <h2 className="text-sm font-label uppercase font-bold tracking-widest text-on-surface mb-6">Budget Pacing</h2>
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="w-48 flex-shrink-0 flex items-center gap-3">
                 <div className="h-8 w-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[1rem]">campaign</span>
                 </div>
                 <div className="h-4 w-32 bg-on-surface/10 rounded" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-[9px] font-label font-bold uppercase tracking-widest text-secondary">
                  <div className="h-3 w-16 bg-secondary/20 rounded" />
                  <div className="h-3 w-16 bg-secondary/20 rounded" />
                </div>
                <div className="h-2.5 bg-surface-container-low rounded-full overflow-hidden">
                  <div
                    className={`${i % 2 === 0 ? 'gold-gradient' : 'bg-primary'} h-full rounded-full`}
                    style={{ width: `${25 + i * 18}%` }}
                  />
                </div>
              </div>
              {/* pacing % */}
              <div className="w-16 flex-shrink-0 flex justify-end">
                <div className="h-6 w-12 bg-surface-container rounded flex items-center justify-center text-[10px] font-label font-bold text-secondary" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts section — anomaly detection, budget warnings, low CTR flags */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-8">
        <h2 className="text-sm font-label uppercase font-bold tracking-widest text-on-surface mb-6">System Alerts</h2>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm ${
                i === 0 ? 'border-error/20 bg-error/5' : 'border-primary/20 bg-primary/5'
              }`}
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${i === 0 ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                 <span className="material-symbols-outlined text-[1.2rem]">{i === 0 ? 'error' : 'warning'}</span>
              </div>
              <div className="h-4 w-96 bg-on-surface/10 rounded" />
              <button className={`ml-auto h-8 px-4 rounded-lg text-[9px] font-label font-bold uppercase tracking-widest transition-colors ${
                 i === 0 ? 'bg-surface-container-lowest text-error border border-error/30 hover:bg-error/10' : 'bg-surface-container-lowest text-primary border border-primary/30 hover:bg-primary/10'
              }`}>
                 Resolve
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
