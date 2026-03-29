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
    <div className="p-6 space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-0.5">All marketing campaigns across channels</p>
        </div>
        <div className="flex gap-2">
          {/* TODO: New campaign wizard button */}
          <div className="h-9 w-36 bg-orange-500 rounded-lg" />
        </div>
      </div>

      {/* Filters toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* TODO: search by campaign name */}
        <div className="flex-1 h-10 bg-white border border-gray-200 rounded-lg flex items-center px-3 gap-2">
          <div className="h-4 w-4 bg-gray-300 rounded-sm flex-shrink-0" />
          <div className="h-4 w-40 bg-gray-100 rounded" />
        </div>

        {/* Channel filter */}
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-400"
        >
          {CHANNEL_FILTERS.map((c) => <option key={c}>{c}</option>)}
        </select>

        {/* Date range picker placeholder */}
        <div className="h-10 w-48 bg-white border border-gray-200 rounded-lg" />

        {/* TODO: Export CSV button */}
        <div className="h-10 w-24 bg-white border border-gray-200 rounded-lg" />
      </div>

      {/* Status pills */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              status === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Campaigns table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
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

        {/* TODO: map over fetched campaigns, render CampaignTableRow */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-3 px-4 py-3.5 border-b border-gray-50 hover:bg-orange-50/30 transition-colors items-center"
          >
            <div className="col-span-3 space-y-1">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-28 bg-gray-100 rounded" />
            </div>
            <div className="col-span-1">
              <div className="h-5 w-14 bg-blue-50 rounded-full" />
            </div>
            <div className="col-span-2 space-y-0.5">
              <div className="h-3.5 w-20 bg-gray-100 rounded" />
              <div className="h-3.5 w-20 bg-gray-100 rounded" />
            </div>
            <div className="col-span-1"><div className="h-4 w-16 bg-gray-100 rounded" /></div>
            <div className="col-span-1"><div className="h-4 w-14 bg-gray-100 rounded" /></div>
            <div className="col-span-1">
              {/* TODO: color-code ROAS — green if >2, red if <1 */}
              <div className={`h-4 w-10 ${i % 3 === 0 ? 'bg-green-100' : 'bg-gray-100'} rounded`} />
            </div>
            <div className="col-span-1"><div className="h-4 w-12 bg-gray-100 rounded" /></div>
            <div className="col-span-1">
              <div className={`h-5 w-16 rounded-full ${
                i % 4 === 0 ? 'bg-yellow-100' : i % 4 === 1 ? 'bg-green-100' : i % 4 === 2 ? 'bg-gray-100' : 'bg-red-50'
              }`} />
            </div>
            <div className="col-span-1 flex justify-end">
              {/* TODO: 3-dot menu — edit, pause/resume, duplicate, delete */}
              <div className="h-6 w-6 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-40 bg-gray-100 rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-100 rounded-lg" />
          <div className="h-8 w-20 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
