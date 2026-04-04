'use client';

// Settings — Account & workspace settings page
// Sections: General, Workspace, Team & Roles, Billing, Integrations, Notifications, Danger Zone

import { useState, useEffect } from 'react';
import { useTenant } from '@/context/TenantContext';

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
  const { tenant, updateConfig } = useTenant();

  // Workspace form state — synced from TenantContext
  const [wsForm,    setWsForm]    = useState({ brandColor: '#6366f1', currency: 'THB', vatRate: 7, timezone: 'Asia/Bangkok' });
  const [wsSaving,  setWsSaving]  = useState(false);
  const [wsSuccess, setWsSuccess] = useState(false);
  const [wsError,   setWsError]   = useState(null);

  // Sync form when tenant data loads
  useEffect(() => {
    if (tenant) {
      setWsForm({
        brandColor: tenant.brandColor ?? '#6366f1',
        currency:   tenant.currency   ?? 'THB',
        vatRate:    tenant.vatRate     ?? 7,
        timezone:   tenant.timezone   ?? 'Asia/Bangkok',
      });
    }
  }, [tenant]);

  const handleWsSave = async (e) => {
    e.preventDefault();
    setWsSaving(true);
    setWsSuccess(false);
    setWsError(null);
    const { ok, error } = await updateConfig(wsForm);
    setWsSaving(false);
    if (ok) {
      setWsSuccess(true);
      setTimeout(() => setWsSuccess(false), 3000);
    } else {
      setWsError(error ?? 'Save failed');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and workspace preferences</p>
      </div>

      <div className="flex gap-6">

        {/* Sidebar nav */}
        <aside className="w-48 flex-shrink-0">
          <nav className="space-y-1 sticky top-6">
            {SECTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === key
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-100'
                } ${key === 'danger' ? 'text-red-500 hover:bg-red-50 mt-4' : ''}`}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content area */}
        <div className="flex-1 space-y-6 min-w-0">

          {/* GENERAL */}
          {activeSection === 'general' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-base font-semibold text-gray-800">General</h2>

              {/* TODO: profile photo upload */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-orange-100" />
                <div className="space-y-1.5">
                  <div className="h-8 w-28 bg-gray-100 rounded-lg" />
                  <p className="text-xs text-gray-400">JPG, PNG up to 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['First Name', 'Last Name', 'Email Address', 'Phone Number'].map((f) => (
                  <div key={f}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f}</label>
                    <div className="h-10 bg-gray-50 border border-gray-200 rounded-lg" />
                  </div>
                ))}
              </div>

              {/* TODO: Language & timezone selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Language', 'Timezone'].map((f) => (
                  <div key={f}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f}</label>
                    <div className="h-10 bg-gray-50 border border-gray-200 rounded-lg" />
                  </div>
                ))}
              </div>

              {/* TODO: Change password section */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Change Password</h3>
                {['Current Password', 'New Password', 'Confirm New Password'].map((f) => (
                  <div key={f}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f}</label>
                    <div className="h-10 bg-gray-50 border border-gray-200 rounded-lg" />
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <div className="h-9 w-28 bg-orange-500 rounded-lg" />
              </div>
            </div>
          )}

          {/* WORKSPACE */}
          {activeSection === 'workspace' && (
            <form onSubmit={handleWsSave} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-800">Workspace</h2>
                {tenant && (
                  <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                    {tenant.slug} · {tenant.plan}
                  </span>
                )}
              </div>

              {/* School name (read-only — contact support to change) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อโรงเรียน / Workspace</label>
                <input
                  type="text"
                  readOnly
                  value={tenant?.name ?? '—'}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">ต้องการเปลี่ยนชื่อ? ติดต่อ support</p>
              </div>

              {/* Brand Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={wsForm.brandColor}
                    onChange={(e) => setWsForm((p) => ({ ...p, brandColor: e.target.value }))}
                    className="h-10 w-14 border border-gray-200 rounded-lg cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={wsForm.brandColor}
                    onChange={(e) => setWsForm((p) => ({ ...p, brandColor: e.target.value }))}
                    placeholder="#6366f1"
                    className="flex-1 h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Currency + VAT Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={wsForm.currency}
                    onChange={(e) => setWsForm((p) => ({ ...p, currency: e.target.value }))}
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="THB">THB — บาทไทย</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="SGD">SGD — Singapore Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VAT Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={wsForm.vatRate}
                    onChange={(e) => setWsForm((p) => ({ ...p, vatRate: parseFloat(e.target.value) }))}
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  value={wsForm.timezone}
                  onChange={(e) => setWsForm((p) => ({ ...p, timezone: e.target.value }))}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
                  <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              {/* Feedback */}
              {wsError   && <p className="text-sm text-red-500">{wsError}</p>}
              {wsSuccess && <p className="text-sm text-green-600">บันทึกสำเร็จ ✓</p>}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={wsSaving}
                  className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  {wsSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* TEAM & ROLES */}
          {activeSection === 'team' && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-800">Team Members</h2>
                  {/* TODO: Invite member button */}
                  <div className="h-8 w-28 bg-orange-500 rounded-lg" />
                </div>
                {/* TODO: member list with role picker and remove button */}
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50">
                    <div className="h-9 w-9 rounded-full bg-orange-100 flex-shrink-0" />
                    <div className="flex-1 space-y-0.5">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-40 bg-gray-100 rounded" />
                    </div>
                    {/* Role dropdown */}
                    <div className="h-8 w-28 bg-gray-100 rounded-lg" />
                    {/* Remove */}
                    <div className="h-7 w-7 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>

              {/* TODO: Role definitions and permission matrix */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Roles & Permissions</h2>
                <div className="h-40 bg-gray-50 rounded-xl flex items-center justify-center text-sm text-gray-400">
                  TODO: Permission matrix table (Owner / Admin / Staff / Viewer)
                </div>
              </div>
            </div>
          )}

          {/* BILLING */}
          {activeSection === 'billing' && (
            <div className="space-y-5">
              {/* Current plan */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-5 text-white">
                <p className="text-xs font-semibold opacity-80">Current Plan</p>
                <div className="h-7 w-20 bg-white/20 rounded mt-1 animate-pulse" />
                <div className="h-4 w-48 bg-white/20 rounded mt-2" />
                {/* TODO: Upgrade button */}
                <div className="h-9 w-28 bg-white/20 rounded-lg mt-4" />
              </div>

              {/* TODO: Billing history table */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Billing History</h2>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50">
                    <div className="h-8 w-8 bg-gray-100 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-0.5">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-24 bg-gray-100 rounded" />
                    </div>
                    <div className="h-4 w-16 bg-gray-100 rounded" />
                    <div className="h-6 w-20 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>

              {/* TODO: Payment method management */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Payment Methods</h2>
                <div className="h-14 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-sm text-gray-400">
                  + Add payment method
                </div>
              </div>
            </div>
          )}

          {/* INTEGRATIONS */}
          {activeSection === 'integrations' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-semibold text-gray-800">Integrations</h2>
              {/* TODO: Connect Meta Ads, Google Ads, LINE OA, Stripe, Zapier, etc. */}
              {[
                { name: 'Meta Ads', desc: 'Sync campaigns and ad spend', connected: true },
                { name: 'Google Ads', desc: 'Import conversion data', connected: false },
                { name: 'LINE Official Account', desc: 'Send messages to students', connected: true },
                { name: 'Stripe', desc: 'Process online payments', connected: false },
                { name: 'Zapier', desc: 'Automate workflows', connected: false },
                { name: 'Google Workspace', desc: 'SSO and Drive integration', connected: false },
              ].map(({ name, desc, connected }) => (
                <div key={name} className="flex items-center gap-4 py-3 border-b border-gray-50">
                  <div className="h-10 w-10 bg-gray-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{name}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <button className={`h-8 px-4 rounded-lg text-xs font-semibold ${
                    connected
                      ? 'bg-red-50 text-red-500 hover:bg-red-100'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  } transition-colors`}>
                    {connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-base font-semibold text-gray-800">Notification Preferences</h2>
              {/* TODO: Per-channel toggles (Email, SMS, In-app) for each event type */}
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
                <div key={event} className="flex items-center justify-between py-3 border-b border-gray-50">
                  <span className="text-sm text-gray-700">{event}</span>
                  <div className="flex items-center gap-4">
                    {/* TODO: toggle switches for Email / SMS / In-app */}
                    {['Email', 'SMS', 'In-app'].map((ch) => (
                      <div key={ch} className="flex items-center gap-1.5">
                        <div className="h-4 w-8 bg-orange-200 rounded-full" />
                        <span className="text-xs text-gray-400">{ch}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <div className="h-9 w-28 bg-orange-500 rounded-lg" />
              </div>
            </div>
          )}

          {/* DANGER ZONE */}
          {activeSection === 'danger' && (
            <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6 space-y-5">
              <h2 className="text-base font-semibold text-red-600">Danger Zone</h2>
              <p className="text-sm text-gray-500">
                Actions here are irreversible. Please proceed with caution.
              </p>

              {/* TODO: Export all data */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-800">Export all workspace data</p>
                  <p className="text-xs text-gray-400 mt-0.5">Download a full backup of your school&apos;s data</p>
                </div>
                <div className="h-9 w-24 bg-gray-100 rounded-lg" />
              </div>

              {/* TODO: Delete workspace */}
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-xl bg-red-50">
                <div>
                  <p className="text-sm font-medium text-red-700">Delete workspace</p>
                  <p className="text-xs text-red-400 mt-0.5">
                    Permanently delete this workspace and all data. This cannot be undone.
                  </p>
       