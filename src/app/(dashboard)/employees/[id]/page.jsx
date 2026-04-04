'use client';

// Employees — Employee detail page
// Full profile: personal info, role/contract, assigned courses, attendance, and documents.

import { useState } from 'react';

const TABS = ['Profile', 'Schedule', 'Courses', 'Documents', 'Activity'];

export default function EmployeeDetailPage({ params }) {
  const [activeTab, setActiveTab] = useState('Profile');
  // TODO: const { data: employee } = useSWR(`/api/employees/${params.id}`)

  return (
    <div className="p-8 space-y-8 bg-surface min-h-[calc(100vh-64px)]">

      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-[10px] font-label font-bold uppercase tracking-widest text-secondary">
        <a href="/employees" className="hover:text-primary transition-colors flex items-center gap-1">
           <span className="material-symbols-outlined text-[14px]">group</span>
           Staff Directory
        </a>
        <span className="opacity-50">/</span>
        <div className="h-4 w-32 bg-secondary/20 rounded animate-pulse" />
      </div>

      {/* Profile header */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-[#D4AF37]"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 relative z-10">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex-shrink-0 flex items-center justify-center text-secondary shadow-sm">
             <span className="material-symbols-outlined text-[2.5rem]">person</span>
          </div>

          <div className="flex-1 space-y-3">
            {/* Name */}
            <div className="h-8 w-64 bg-on-surface/10 rounded animate-pulse" />
            {/* Role + department */}
            <div className="flex items-center gap-3">
              <div className="h-6 px-3 bg-primary/10 rounded-full flex items-center justify-center text-[9px] font-label font-bold uppercase tracking-widest text-primary border border-primary/20">Academic</div>
              <div className="h-6 px-3 bg-surface-container rounded-full flex items-center justify-center text-[9px] font-label font-bold uppercase tracking-widest text-secondary border border-outline-variant/30">Senior Instructor</div>
            </div>
            {/* Contact info */}
            <div className="flex flex-wrap gap-6 pt-1">
              <div className="h-4 w-40 bg-secondary/10 rounded" />
              <div className="h-4 w-32 bg-secondary/10 rounded" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-shrink-0 mt-4 sm:mt-0">
            <button className="h-10 px-6 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-[10px] font-label font-bold uppercase tracking-widest text-secondary hover:bg-surface-container-low transition-colors shadow-sm">
              Edit Profile
            </button>
            <button className="h-10 w-10 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center justify-center text-secondary hover:bg-surface-container-low transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[1.2rem]">more_vert</span>
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 pt-8 border-t border-outline-variant/15">
          {[
            { label: 'Start Date', icon: 'event' },
            { label: 'Employment Type', icon: 'work' },
            { label: 'Courses Teaching', icon: 'school' },
            { label: 'Attendance Rate', icon: 'fact_check' }
          ].map(({ label, icon }) => (
            <div key={label} className="flex gap-3">
               <div className="h-8 w-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary flex-shrink-0">
                  <span className="material-symbols-outlined text-[1rem]">{icon}</span>
               </div>
               <div>
                  <p className="text-[9px] font-label font-bold uppercase tracking-widest text-secondary mb-1.5">{label}</p>
                  <div className="h-5 w-20 bg-on-surface/5 rounded" />
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 border-b border-outline-variant/15 overflow-x-auto no-scrollbar pb-px">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-[10px] font-label font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-on-surface hover:border-outline-variant/30'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-8 fade-in min-h-[400px]">

        {activeTab === 'Profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Personal info */}
            <div className="space-y-6">
              <h3 className="text-sm font-label uppercase font-bold tracking-widest text-on-surface flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-[1.2rem]">badge</span>
                Personal Information
              </h3>
              <div className="space-y-5">
                {['Full Name', 'Email', 'Phone', 'Date of Birth', 'National ID / Passport', 'Address'].map((f) => (
                  <div key={f}>
                    <p className="text-[10px] font-label font-bold uppercase tracking-widest text-secondary mb-2">{f}</p>
                    <div className="h-12 bg-surface-container border border-outline-variant/30 rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
            {/* Employment details */}
            <div className="space-y-6">
              <h3 className="text-sm font-label uppercase font-bold tracking-widest text-on-surface flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-[1.2rem]">work_history</span>
                Employment Details
              </h3>
              <div className="space-y-5">
                {['Employee ID', 'Department', 'Role / Title', 'Employment Type', 'Start Date', 'Salary / Rate'].map((f) => (
                  <div key={f}>
                    <p className="text-[10px] font-label font-bold uppercase tracking-widest text-secondary mb-2">{f}</p>
                    <div className="h-12 bg-surface-container border border-outline-variant/30 rounded-xl" />
                  </div>
                ))}
              </div>
              {/* Save changes button */}
              <div className="pt-4 flex justify-end">
                <div className="h-10 w-36 gold-gradient rounded-xl shadow-sm" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Schedule' && (
          // Weekly schedule / shift assignments
          <div className="space-y-6">
            <h3 className="text-sm font-label uppercase font-bold tracking-widest text-on-surface flex items-center gap-2 mb-6">
               <span className="material-symbols-outlined text-primary text-[1.2rem]">calendar_month</span>
               Weekly Schedule
            </h3>
            <div className="grid grid-cols-7 gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="text-center bg-surface-container-low rounded-xl border border-outline-variant/15 p-3">
                  <p className="text-[10px] font-label font-bold uppercase tracking-widest text-secondary mb-3 pb-2 border-b border-outline-variant/15">{d}</p>
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className={`h-12 rounded-lg p-2 flex items-center justify-center border shadow-sm ${i === 0 ? 'bg-primary/5 border-primary/20' : 'bg-surface-container border-outline-variant/30'}`}>
                        <div className={`h-2.5 w-full rounded-full ${i === 0 ? 'bg-primary/40' : 'bg-secondary/20'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Courses' && (
          // List of courses the employee is assigned to as instructor or assistant
          <div className="space-y-6">
            <h3 className="text-sm font-label uppercase font-bold tracking-widest text-on-surface flex items-center gap-2 mb-6">
               <span className="material-symbols-outlined text-primary text-[1.2rem]">menu_book</span>
               Assigned Courses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant/15 bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group">
                  <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                     <span className="material-symbols-outlined">library_books</span>
                  </div>
                  <div className="flex-1 space-y-1.5 pt-1">
                    <div className="h-4 w-48 bg-on-surface/10 rounded" />
                    <div className="h-3 w-32 bg-secondary/20 rounded" />
                  </div>
                  <div className="h-6 px-3 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-[9px] font-label font-bold uppercase tracking-widest text-green-700">Active</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Documents' && (
          // Upload and manage employment documents (contract, ID, certificates)
          <div className="space-y-6">
            <h3 className="text-sm font-label uppercase font-bold tracking-widest text-on-surface flex items-center gap-2 mb-6">
               <span className="material-symbols-outlined text-primary text-[1.2rem]">folder_open</span>
               Employment Documents
            </h3>
            <div className="h-32 border-2 border-dashed border-outline-variant/30 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer rounded-2xl flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="h-10 w-10 bg-surface-container rounded-full mx-auto flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">upload_file</span>
                </div>
                <p className="text-[10px] font-label font-bold uppercase tracking-widest text-secondary">Drop files here or click to upload</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant/15 hover:bg-surface-container-low transition-colors group">
                  <div className="h-10 w-10 bg-[#0B2D5E]/10 rounded-lg flex items-center justify-center text-[#0B2D5E] flex-shrink-0">
                     <span className="material-symbols-outlined">description</span>
                  </div>
                  <div className="flex-1 space-y-1.5 pt-1">
                    <div className="h-4 w-40 bg-on-surface/10 rounded" />
                    <div className="h-3 w-24 bg-secondary/20 rounded" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="h-8 w-8 bg-surface-container rounded-lg flex items-center justify-center text-secondary hover:text-primary transition-colors">
                       <span className="material-symbols-outlined text-[1rem]">download</span>
                    </button>
                    <button className="h-8 w-8 bg-surface-container rounded-lg flex items-center justify-center text-secondary hover:text-error transition-colors">
                       <span className="material-symbols-outlined text-[1rem]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Activity' && (
          // Audit log — logins, schedule changes, course assignments
          <div className="space-y-8 max-w-2xl">
            <h3 className="text-sm font-label uppercase font-bold tracking-widest text-on-surface flex items-center gap-2 mb-8">
               <span className="material-symbols-outlined text-primary text-[1.2rem]">history</span>
               Activity Timeline
            </h3>
            <div className="space-y-0 pl-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-6 relative">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-surface-container-lowest border-2 border-primary/20 flex items-center justify-center text-primary z-10 shrink-0">
                       <span className="material-symbols-outlined text-[1rem]">fiber_manual_record</span>
                    </div>
                    {i < 5 && <div className="absolute top-10 bottom-[-1.5rem] left-5 w-px bg-outline-variant/30 -ml-px" />}
                  </div>
                  <div className="pb-8 space-y-1.5 flex-1 pt-2">
                    <div className="h-4 w-3/4 bg-on-surface/10 rounded" />
                    <div className="h-3 w-32 bg-secondary/20 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
