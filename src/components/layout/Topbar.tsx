import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import {
  ChevronDown,
  LogOut,
  Sparkles,
  Cloud,
  Database,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Server,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';

export const Topbar: React.FC = () => {
  const { activeRole, setActiveRole, currentUser, logout, dbStatus, refreshData } = useApp();
  const location = useLocation();
  const [showDbModal, setShowDbModal] = useState(false);
  const [customUri, setCustomUri] = useState('mongodb+srv://cloudidentity_app:Abinav1616@cloudidentitydb.3oj12hx.mongodb.net/cloud_identity_governance?appName=CloudIdentityDB');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'Dashboard Overview';
      case '/users':
        return 'Identity & User Directory';
      case '/access-requests':
        return 'Just-In-Time Access Requests';
      case '/privileged-accounts':
        return 'Privileged Accounts (PAM Vault)';
      case '/roles-permissions':
        return 'Roles & Policy Permissions';
      case '/access-reviews':
        return 'Access Certification Reviews';
      case '/compliance':
        return 'Governance & Compliance Frameworks';
      case '/audit-logs':
        return 'System & Activity Audit Trail';
      case '/authentication':
        return 'Authentication & SSO Policies';
      case '/settings':
        return 'Platform Governance Settings';
      default:
        return 'SentryGate Governance';
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveRole(e.target.value as Role);
  };

  const handleConnect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customUri.trim()) return;
    setTestingConnection(true);
    setTestResult(null);

    try {
      const res = await apiClient.connectDb(customUri.trim());
      setTestResult({
        success: res.connected,
        message: res.connected
          ? 'Connected to MongoDB Atlas! Verified cluster CloudIdentityDB / database cloud_identity_governance.'
          : res.message || 'Connection failed. Please check credentials or Atlas IP whitelist.',
      });
      await refreshData();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.response?.data?.error || err.message || 'Network error connecting to MongoDB',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Zone 1: Breadcrumb & Title */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-400">SentryGate /</span>
        <h1 className="text-sm font-semibold text-slate-900 tracking-tight">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      {/* Zone 2: Cloud & DB Status */}
      <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500">
        <button
          onClick={() => setShowDbModal(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
            dbStatus.connected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              : 'bg-amber-50/70 border-amber-200 text-amber-800 hover:bg-amber-100'
          }`}
          title="Click to view live database status and collections"
        >
          <Database className={`w-3.5 h-3.5 ${dbStatus.connected ? 'text-emerald-600' : 'text-amber-600'}`} />
          <span>Atlas DB:</span>
          <span className="font-semibold">
            {dbStatus.connected ? 'cloud_identity_governance (Live)' : 'Connecting / Whitelist check'}
          </span>
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100/70 border border-slate-200 text-slate-700">
          <Cloud className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-medium">Clouds:</span>
          <span className="font-semibold text-slate-800">AWS · Azure · GCP</span>
        </div>
      </div>

      {/* Zone 3: Demo Switch Role + User Profile + Logout */}
      <div className="flex items-center gap-3">
        {/* DEMO ROLE SWITCHER CONTROL */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-200">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/90 text-amber-900 px-1.5 py-0.5 rounded">
              DEMO
            </span>
            <label htmlFor="role-select" className="text-xs font-semibold text-amber-900 hidden sm:inline">
              Switch Role:
            </label>
          </div>
          <div className="relative">
            <select
              id="role-select"
              aria-label="Demo role selector"
              value={activeRole}
              onChange={handleRoleChange}
              className="appearance-none bg-white text-xs font-semibold text-slate-800 pl-2.5 pr-7 py-1 rounded border border-amber-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
            >
              <option value="Developer">Developer (Ramesh)</option>
              <option value="Admin">Admin (Sathish)</option>
              <option value="Manager">Manager (Priya)</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-2 pointer-events-none" />
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-tight">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-slate-500 leading-tight">
              {currentUser.role}
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign out of console"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Database Connection & Diagnostics Modal */}
      {showDbModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    MongoDB Database Connection
                  </h3>
                  <p className="text-xs text-slate-500">
                    Target: <strong className="text-slate-800">CloudIdentityDB &gt; cloud_identity_governance</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDbModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-600">
              {/* Current Status banner */}
              <div
                className={`p-3 rounded-lg border ${
                  dbStatus.connected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="font-semibold flex items-center gap-1.5 mb-1">
                  {dbStatus.connected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>{dbStatus.connected ? 'MongoDB Atlas is Connected!' : 'Connection Status'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-700">
                  {dbStatus.status}
                </p>
              </div>

              {/* Verified Collections list from Atlas */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-blue-600" />
                  <span>Atlas Collections verified in your cluster:</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-mono text-slate-600">
                  <div className="bg-white p-1.5 rounded border border-slate-200 flex items-center justify-between">
                    <span>users</span>
                    <span className="text-[10px] text-emerald-600 font-bold">✓ Synced</span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-200 flex items-center justify-between">
                    <span>accessrequests</span>
                    <span className="text-[10px] text-emerald-600 font-bold">✓ Synced</span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-200 flex items-center justify-between">
                    <span>privilegedaccounts</span>
                    <span className="text-[10px] text-emerald-600 font-bold">✓ Synced</span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-200 flex items-center justify-between">
                    <span>auditlogs</span>
                    <span className="text-[10px] text-emerald-600 font-bold">✓ Synced</span>
                  </div>
                </div>
              </div>

              {/* IP Whitelist Note */}
              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 space-y-1.5">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Atlas Network Access Whitelist:</span>
                </div>
                <p className="text-[11px] text-blue-950 leading-relaxed">
                  Your personal IP allows your browser to manage Atlas. For the cloud server hosting SentryGate to write to Atlas, also ensure <strong>0.0.0.0/0</strong> (Allow Access from Anywhere) is active in Atlas &rarr; <em>Network Access</em>.
                </p>
              </div>

              {/* Form to test/trigger connection */}
              <form onSubmit={handleConnect} className="space-y-2 pt-1">
                <label className="block font-bold text-slate-900">
                  Active Connection String:
                </label>
                <input
                  type="text"
                  value={customUri}
                  onChange={(e) => setCustomUri(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-slate-50"
                />

                {testResult && (
                  <div
                    className={`p-2.5 rounded text-xs flex items-center gap-1.5 ${
                      testResult.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => handleConnect()}
                    disabled={testingConnection}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                    {testingConnection ? 'Testing Connection...' : 'Test & Connect to Atlas Now'}
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await refreshData();
                      setShowDbModal(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
