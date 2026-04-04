'use client';

// Settings — Account & workspace settings page
// Sections: General, Workspace, Team & Roles, Billing, Integrations, Notifications, Danger Zone

import { useState } from 'react';

const SECTIONS = [
  { key: 'general', label: 'General' },
  { key: 'workspace', label: 'Workspace' },
  { key: 'team', label: 'Team & Roles' },
  { key: 'billing', label: 'Billing' },
  { key: 'integrations', label: 'Integrations' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'danger', label: 'Danger Zone' },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-surface min-h-[calc(100vh-64px)]">

      {/* Page header */}
      <div className="ornate-lead mb-8">
        <span className="font-label uppercase tracking-[0.2em] text-xs text-primary font-bold">Platform Configuration</span>
        <h1 className="text-3xl font-extrabold text-on-surface font-headline mt-1">Settings</h1>
        <p className="text-sm text-secondary font-body mt-0.5">Manage your account and workspace preferences</p>
      </div>

      <div className="flex gap-8">

        {/* Sidebar nav */}
        <aside className="w-56 flex-shrink-0">
          <nav className="space-y-2 sticky top-8">
            {SECTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-label uppercase tracking-widest font-bold transition-all ${
                  activeSection === key
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                    : 'text-secondary hover:bg-surface-container-low border border-transparent'
                } ${key === 'danger' ? 'text-error hover:bg-error/10 border-transparent mt-6' : ''} ${activeSection === 'danger' && key === 'danger' ? '!bg-error/10 !text-error !border-error/20' : ''}`}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content area */}
        <div className="flex-1 min-w-0 pb-16">

          {/* GENERAL */}
          {activeSection === 'general' && (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-8 space-y-8 fade-in">
              <h2 className="text-base font-label uppercase font-bold tracking-widest text-on-surface">General</h2>

              {/* profile photo upload */}
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-surface-container flex items-center justify-center text-secondary border border-outline-variant/15">
                  <span className="material-symbols-outlined text-[2rem]">account_circle</span>
                </div>
                <div className="space-y-3">
                  <button className="h-10 px-4 bg-surface-container-high rounded-lg border border-outline-variant/30 text-xs font-label uppercase font-bold tracking-widest text-secondary hover:bg-surface-container transition-colors shadow-sm">
                    Upload Photo
                  </button>
                  <p className="text-[10px] font-label uppercase tracking-widest font-bold text-secondary opacity-70">JPG, PNG up to 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {['First Name', 'Last Name', 'Email Address', 'Phone Number'].map((f) => (
                  <div key={f}>
                    <label className="block text-[10px] font-label uppercase font-bold tracking-widest text-secondary mb-2">{f}</label>
                    <div className="h-12 bg-surface-container border border-outline-variant/30 rounded-xl px-4 flex items-center text-secondary" />
                  </div>
                ))}
              </div>

              {/* Language & timezone selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {['Language', 'Timezone'].map((f) => (
                  <div key={f}>
                    <label className="block text-[10px] font-label uppercase font-bold tracking-widest text-secondary mb-2">{f}</label>
                    <div className="h-12 bg-surface-container border border-outline-variant/30 rounded-xl px-4 flex items-center justify-between text-secondary cursor-pointer hover:border-primary/50 transition-colors">
                      <span className="text-sm font-body">Select...</span>
                      <span className="material-symbols-outlined text-[1.2rem]">expand_more</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Change password section */}
              <div className="pt-8 border-t border-outline-variant/15 space-y-6">
                <h3 className="text-sm font-label uppercase font-bold tracking-widest text-on-surface">Change Password</h3>
                {['Current Password', 'New Password', 'Confirm New Password'].map((f) => (
                  <div key={f}>
                    <label className="block text-[10px] font-label uppercase font-bold tracking-widest text-secondary mb-2">{f}</label>
                    <div className="h-12 bg-surface-container border border-outline-variant/30 rounded-xl px-4 flex items-center" />
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button className="h-10 px-8 gold-gradient rounded-xl font-label text-xs uppercase font-bold tracking-widest text-[#0B2D5E] shadow-sm hover:shadow-floating transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* WORKSPACE */}
          {activeSection === 'workspace' && (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-8 space-y-8 fade-in">
              <h2 className="text-base font-label uppercase font-bold tracking-widest text-on-surface">Workspace</h2>

              {/* School logo */}
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-2xl bg-surface-container border border-outline-variant/15 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[2rem]">business</span>
                </div>
                <div className="space-y-3">
                  <button className="h-10 px-4 bg-surface-container-high rounded-lg border border-outline-variant/30 text-xs font-label uppercase font-bold tracking-widest text-secondary hover:bg-surface-container transition-colors shadow-sm">
                    Upload Logo
                  </button>
                  <p className="text-[10px] font-label uppercase tracking-widest font-bold text-secondary opacity-70">Shown on invoices & certificates</p>
                </div>
              </div>

              <div className="space-y-6">
                {['School Name', 'Slug / URL', 'Tax ID', 'Business Address', 'Phone', 'Website'].map((f) => (
                  <div key={f}>
                    <label className="block text-[10px] font-label uppercase font-bold tracking-widest text-secondary mb-2">{f}</label>
                    <div className="h-12 bg-surface-container border border-outline-variant/30 rounded-xl" />
                  </div>
                ))}
              </div>

              {/* currency & date format preferences */}
              <div className="grid grid-cols-2 gap-6 pt-4">
                {['Currency', 'Date Format'].map((f) => (
                  <div key={f}>
                    <label className="block text-[10px] font-label uppercase font-bold tracking-widest text-secondary mb-2">{f}</label>
                    <div className="h-12 bg-surface-container border border-outline-variant/30 rounded-xl px-4 flex items-center justify-between text-secondary cursor-pointer hover:border-primary/50 transition-colors">
                       <span className="text-sm font-body">Select...</span>
                       <span className="material-symbols-outlined text-[1.2rem]">expand_more</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button className="h-10 px-8 gold-gradient rounded-xl font-label text-xs uppercase font-bold tracking-widest text-[#0B2D5E] shadow-sm hover:shadow-floating transition-all">
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* TEAM & ROLES */}
          {activeSection === 'team' && (
            <div className="space-y-8 fade-in">
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-base font-label uppercase font-bold tracking-widest text-on-surface">Team Members</h2>
                  <button className="h-10 px-6 gold-gradient rounded-xl font-label text-xs uppercase font-bold tracking-widest text-[#0B2D5E] shadow-sm hover:shadow-floating transition-all">
                    Invite Member
                  </button>
                </div>
                
                <div className="space-y-0">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-4 border-b border-surface hover:bg-surface-container-low transition-colors px-2 rounded-lg -mx-2">
                      <div className="h-10 w-10 rounded-full bg-surface-container flex items-center justify-center text-secondary flex-shrink-0">
                        <span className="material-symbols-outlined text-[1.2rem]">person</span>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 w-40 bg-on-surface/10 rounded" />
                        <div className="h-3 w-48 bg-secondary/20 rounded" />
                      </div>
                      {/* Role dropdown */}
                      <div className="h-10 px-4 bg-surface-container-highest border border-outline-variant/30 rounded-xl flex items-center justify-between min-w-[140px] text-secondary text-xs font-label uppercase tracking-widest font-bold cursor-pointer hover:border-primary/40 transition-colors">
                        Admin <span className="material-symbols-outlined text-[1.2rem]">expand_more</span>
                      </div>
                      {/* Remove */}
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center text-secondary hover:bg-error/10 hover:text-error transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[1.2rem]">delete</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role definitions and permission matrix */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-8">
                <h2 className="text-base font-label uppercase font-bold tracking-widest text-on-surface mb-6">Roles & Permissions</h2>
                <div className="h-48 bg-surface-container-low rounded-xl flex flex-col items-center justify-center text-secondary border border-outline-variant/15 border-dashed">
                  <span className="material-symbols-outlined text-[2rem] mb-2 opacity-50">admin_panel_settings</span>
                  <p className="text-[10px] font-label uppercase tracking-widest font-bold">Permission matrix table placeholder</p>
                  <p className="text-sm font-body mt-1 opacity-70">Owner / Admin / Staff / Viewer</p>
                </div>
              </div>
            </div>
          )}

          {/* BILLING */}
          {activeSection === 'billing' && (
            <div className="space-y-8 fade-in">
              {/* Current plan */}
              <div className="relative overflow-hidden rounded-2xl p-8 border border-primary/20 bg-surface-container-lowest shadow-floating">
                <div className="absolute top-0 left-0 w-full h-1 gold-gradient"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-[10px] font-label uppercase font-bold tracking-widest text-primary mb-2">Current Plan</p>
                    <h2 className="text-3xl font-extrabold text-on-surface font-headline mb-2">Enterprise Sovereign</h2>
                    <p className="text-sm text-secondary font-body">All premium modules, unlimited team members.</p>
                  </div>
                  <button className="h-10 px-6 bg-surface-container-low rounded-xl font-label text-[10px] uppercase font-bold tracking-widest text-secondary hover:text-primary hover:border hover:border-primary/30 transition-all">
                    Manage Plan
                  </button>
                </div>
              </div>

              {/* Billing history table */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-8">
                <h2 className="text-base font-label uppercase font-bold tracking-widest text-on-surface mb-6">Billing History</h2>
                <div className="space-y-0">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-6 py-4 border-b border-surface">
                      <div className="h-10 w-10 bg-surface-container-low rounded-xl flex items-center justify-center text-secondary flex-shrink-0">
                        <span className="material-symbols-outlined text-[1.2rem]">receipt_long</span>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 w-40 bg-on-surface/10 rounded" />
                        <div className="h-3 w-32 bg-secondary/20 rounded" />
                      </div>
                      <div className="h-6 w-24 bg-surface-container-low rounded-full flex items-center justify-center text-[10px] font-label uppercase tracking-widest font-bold text-secondary">
                        Paid
                      </div>
                      <div className="h-8 w-24 bg-surface-container rounded flex items-center justify-center text-primary font-bold" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment method management */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-8">
                <h2 className="text-base font-label uppercase font-bold tracking-widest text-on-surface mb-6">Payment Methods</h2>
                <div className="h-20 border-2 border-dashed border-outline-variant/30 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer rounded-xl flex items-center justify-center gap-2 text-secondary font-label text-xs uppercase tracking-widest font-bold">
                  <span className="material-symbols-outlined">add_card</span>
                  Add payment method
                </div>
              </div>
            </div>
          )}

          {/* INTEGRATIONS */}
          {activeSection === 'integrations' && (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-8 space-y-6 fade-in">
              <h2 className="text-base font-label uppercase font-bold tracking-widest text-on-surface mb-6">Integrations</h2>
              {/* Connect Meta Ads, Google Ads, LINE OA, Stripe, Zapier, etc. */}
              {[
                { name: 'Meta Ads', desc: 'Sync campaigns and ad spend', connected: true },
                { name: 'Google Ads', desc: 'Import conversion data', connected: false },
                { name: 'LINE Official Account', desc: 'Send messages to students', connected: true },
                { name: 'Stripe', desc: 'Process online payments', connected: false },
                { name: 'Zapier', desc: 'Automate workflows', connected: false },
                { name: 'Google Workspace', desc: 'SSO and Drive integration', connected: false },
              ].map(({ name, desc, connected }) => (
                <div key={name} className="flex items-center gap-6 py-4 border-b border-surface">
                  <div className="h-12 w-12 bg-surface-container flex items-center justify-center text-secondary rounded-xl border border-outline-variant/15 flex-shrink-0">
                    <span className="material-symbols-outlined text-[1.5rem]">extension</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-label uppercase font-bold tracking-widest text-on-surface">{name}</p>
                    <p className="text-xs text-secondary font-body mt-1">{desc}</p>
                  </div>
                  <button className={`h-10 px-6 rounded-xl font-label text-[10px] uppercase font-bold tracking-widest shadow-sm transition-all ${
                    connected
                      ? 'bg-surface-container-lowest text-error border border-error/30 hover:bg-error/10'
                      : 'gold-gradient text-[#0B2D5E] hover:shadow-floating'
                  }`}>
                    {connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-8 space-y-6 fade-in">
              <h2 className="text-base font-label uppercase font-bold tracking-widest text-on-surface mb-6">Notification Preferences</h2>
              {/* Per-channel toggles (Email, SMS, In-app) for each event type */}
              {[
                'New student enrollment',
                'Payment received',
                'Payment overdue',
                'Low stock alert',
                'PO delivery due',
                'New campaign report',
                'Task assigned to me',
                'System alerts',
              ].map((event) => (
                <div key={event} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-surface gap-4 sm:gap-0">
                  <span className="text-sm font-label uppercase font-bold tracking-widest text-secondary">{event}</span>
                  <div className="flex items-center gap-6">
                    {/* toggle switches for Email / SMS / In-app */}
                    {['Email', 'SMS', 'In-app'].map((ch) => (
                      <div key={ch} className="flex items-center gap-2 cursor-pointer group">
                        <div className="h-5 w-9 bg-primary/20 rounded-full relative transition-colors group-hover:bg-primary/30">
                          <div className="h-3.5 w-3.5 bg-primary rounded-full absolute top-[3px] right-[3px]" />
                        </div>
                        <span className="text-[10px] font-label uppercase font-bold tracking-widest text-secondary">{ch}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-6">
                <button className="h-10 px-8 gold-gradient rounded-xl font-label text-xs uppercase font-bold tracking-widest text-[#0B2D5E] shadow-sm hover:shadow-floating transition-all">
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* DANGER ZONE */}
          {activeSection === 'danger' && (
            <div className="bg-surface-container-lowest rounded-2xl border border-error/30 shadow-sm p-8 space-y-8 fade-in">
              <div>
                <h2 className="text-base font-label uppercase font-bold tracking-widest text-error">Danger Zone</h2>
                <p className="text-sm text-secondary font-body mt-1">
                  Actions here are irreversible. Please proceed with caution.
                </p>
              </div>

              {/* Export all data */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border border-outline-variant/20 rounded-xl bg-surface-container-lowest gap-4">
                <div>
                  <p className="text-sm font-label uppercase font-bold tracking-widest text-on-surface">Export all workspace data</p>
                  <p className="text-xs text-secondary font-body mt-1">Download a full backup of your school&apos;s data</p>
                </div>
                <button className="h-10 px-6 bg-surface-container border border-outline-variant/30 rounded-xl font-label text-[10px] uppercase font-bold tracking-widest text-secondary hover:bg-surface-container-low transition-colors whitespace-nowrap">
                  Request Export
                </button>
              </div>

              {/* Delete workspace */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border border-error/30 rounded-xl bg-error/5 gap-4">
                <div>
                  <p className="text-sm font-label uppercase font-bold tracking-widest text-error">Delete workspace</p>
                  <p className="text-xs text-error/70 font-body mt-1">
                    Permanently delete this workspace and all data. This cannot be undone.
                  </p>
                </div>
                <button className="h-10 px-8 bg-error hover:bg-error/90 text-white font-label text-[10px] uppercase font-bold tracking-widest rounded-xl transition-colors shadow-sm whitespace-nowrap">
                  Delete
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
