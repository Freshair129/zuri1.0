'use client';

// CRM — Customer detail page
// Shows full profile, enrollment history, payment records, notes, and activity timeline.

import { useState } from 'react';

const TABS = ['Overview', 'Enrollments', 'Payments', 'Notes', 'Activity'];

export default function CustomerDetailPage({ params }) {
  const [activeTab, setActiveTab] = useState('Overview');
  // TODO: const { data: customer } = useSWR(`/api/crm/${params.id}`)

  return (
    <div className="p-6 space-y-6">

      {/* Back navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <a href="/crm" className="hover:text-orange-500 transition-colors">Customers</a>
        <span>/</span>
        {/* TODO: render customer name */}
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Profile header card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full bg-orange-100 flex-shrink-0" />

          <div className="flex-1 space-y-1.5">
            {/* TODO: customer name */}
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            {/* TODO: email + phone */}
            <div className="h-4 w-64 bg-gray-100 rounded" />
            <div className="flex items-center gap-3 mt-2">
              {/* TODO: status badge */}
              <div className="h-5 w-16 bg-green-100 rounded-full" />
              {/* TODO: tags */}
              <div className="h-5 w-20 bg-blue-50 rounded-full" />
              <div className="h-5 w-24 bg-purple-50 rounded-full" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-shrink-0">
            {/* TODO: Send email / WhatsApp, Edit, Archive */}
            <div className="h-9 w-28 bg-gray-100 rounded-lg" />
            <div className="h-9 w-9 bg-gray-100 rounded-lg" />
            <div className="h-9 w-9 bg-gray-100 rounded-lg" />
          </div>
        </div>

        {/* TODO: quick stats row — lifetime spend, courses enrolled, last active */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-5 pt-5 border-t border-gray-100">
          {['Lifetime Spend', 'Courses Enrolled', 'Completed', 'Last Active', 'Source'].map((label) => (
            <div key={label}>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <div className="h-5 w-16 bg-gray-100 rounded mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content panels */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">

        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TODO: Personal info form (read / edit mode) */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Personal Information</h3>
              {['Full Name', 'Email', 'Phone', 'Date of Birth', 'Address'].map((f) => (
                <div key={f}>
                  <p className="text-xs text-gray-400 mb-1">{f}</p>
                  <div className="h-9 bg-gray-50 border border-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
            {/* TODO: Emergency contact + custom fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Additional Details</h3>
              {['Referral Source', 'Dietary Restrictions', 'Notes', 'Tags'].map((f) => (
                <div key={f}>
                  <p className="text-xs text-gray-400 mb-1">{f}</p>
                  <div className="h-9 bg-gray-50 border border-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Enrollments' && (
          // TODO: List of past and current course enrollments with status + attendance %
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100">
                <div className="h-10 w-10 bg-orange-50 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                  <div className="h-3 w-32 bg-gray-100 rounded" />
                </div>
                <div className="h-5 w-20 bg-blue-50 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Payments' && (
          // TODO: Payment history table with invoice links
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50">
                <div className="h-4 w-24 bg-gray-100 rounded" />
                <div className="h-4 w-40 bg-gray-200 rounded flex-1" />
                <div className="h-4 w-16 bg-gray-100 rounded" />
                <div className="h-5 w-16 bg-green-50 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Notes' && (
          // TODO: Rich-text notes with timestamp + author, pinnable
          <div className="space-y-4">
            <div className="h-24 bg-gray-50 border border-gray-200 rounded-lg" />
            <div className="h-9 w-24 bg-orange-500 rounded-lg" />
          </div>
        )}

        {activeTab === 'Activity' && (
          // TODO: Timeline of emails sent, logins, course completions, support tickets
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex-shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
