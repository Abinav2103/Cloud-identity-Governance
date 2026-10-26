import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Clock,
  Shield,
  Check,
  Cpu,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Settings: React.FC = () => {
  const { activeRole, systemSettings, updateSystemSettings } = useApp();
  const isAdmin = activeRole === 'Admin';

  const [autoRevokeHours, setAutoRevokeHours] = useState(systemSettings.autoRevokeHours);
  const [slackNotifications, setSlackNotifications] = useState(systemSettings.slackNotifications);
  const [emailAlerts, setEmailAlerts] = useState(systemSettings.emailAlerts);
  const [approvalWorkflow, setApprovalWorkflow] = useState(systemSettings.approvalWorkflow);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    updateSystemSettings({
      autoRevokeHours: Number(autoRevokeHours),
      slackNotifications,
      emailAlerts,
      approvalWorkflow,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Platform Governance Settings
            </h2>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isAdmin
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isAdmin ? 'Admin Full Access' : 'View-Only Settings'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Configure system-wide Just-In-Time access limits, auto-revocation schedules, and security alerts.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Governance settings successfully saved.</span>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* JIT Revocation */}
          <div className="space-y-3 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Automatic Just-In-Time Revocation Limit
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              When temporary privileged access is approved, access will automatically expire and tear down credentials after this duration.
            </p>
            <div className="max-w-xs">
              <select
                disabled={!isAdmin}
                value={autoRevokeHours}
                onChange={(e) => setAutoRevokeHours(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 Hour (Strict least-privilege)</option>
                <option value={2}>2 Hours</option>
                <option value={4}>4 Hours (Recommended baseline)</option>
                <option value={8}>8 Hours (End of shift)</option>
                <option value={24}>24 Hours (Maximum allowable)</option>
              </select>
            </div>
          </div>

          {/* Workflow Strategy */}
          <div className="space-y-3 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Approval Workflow Architecture</h3>
            </div>
            <p className="text-xs text-slate-500">
              Select whether requests require single security admin sign-off or two-party multi-tier consensus.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <label
                className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer text-xs ${
                  approvalWorkflow === 'Single-tier'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-semibold'
                    : 'border-slate-200 text-slate-700'
                } ${!isAdmin ? 'pointer-events-none' : ''}`}
              >
                <input
                  type="radio"
                  name="workflow"
                  disabled={!isAdmin}
                  checked={approvalWorkflow === 'Single-tier'}
                  onChange={() => setApprovalWorkflow('Single-tier')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="block font-bold">Single-Tier</span>
                  <span className="text-[11px] text-slate-500 font-normal">One Security Admin review</span>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer text-xs ${
                  approvalWorkflow === 'Multi-tier'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-semibold'
                    : 'border-slate-200 text-slate-700'
                } ${!isAdmin ? 'pointer-events-none' : ''}`}
              >
                <input
                  type="radio"
                  name="workflow"
                  disabled={!isAdmin}
                  checked={approvalWorkflow === 'Multi-tier'}
                  onChange={() => setApprovalWorkflow('Multi-tier')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="block font-bold">Multi-Tier</span>
                  <span className="text-[11px] text-slate-500 font-normal">Manager + Admin approval</span>
                </div>
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-3 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Automated Security Alerts</h3>
            </div>
            <p className="text-xs text-slate-500">
              Notify security teams instantly when privileged breakglass access is requested or granted.
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={slackNotifications}
                  onChange={(e) => setSlackNotifications(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Deliver webhook alerts to Slack #sec-ops channel</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Send high-priority email alerts to IAM Custodians</span>
              </label>
            </div>
          </div>

          {/* Action button: ADMIN ONLY */}
          {isAdmin ? (
            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors"
              >
                Save Governance Settings
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              Platform governance settings are read-only for Developer and Manager roles.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
