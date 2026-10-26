import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  KeyRound,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Activity,
  FileCheck2,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';

// Helper for countdown formatting in dashboard
function formatSessionCountdown(expiresAt?: string): string {
  if (!expiresAt) return 'Active';
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return 'Expired';
  const totalSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hours > 0) return `${hours}h ${mins}m left`;
  if (mins > 0) return `${mins}m ${secs}s left`;
  return `${secs}s left`;
}

export const Dashboard: React.FC = () => {
  const { activeRole, currentUser, accessRequests, privilegedAccounts, auditLogs, complianceFrameworks } = useApp();

  const isDev = activeRole === 'Developer';

  // Live timer tick to re-render countdowns every 1s
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Role-scoped data calculations
  // Developer only sees their own requests; Admin & Manager see org-wide
  const displayedRequests = isDev
    ? accessRequests.filter((r) => r.requesterName === currentUser.name || r.requesterId === currentUser.id)
    : accessRequests;

  const activeSessions = displayedRequests.filter((r) => r.status === 'Active');
  const pendingRequests = displayedRequests.filter((r) => r.status === 'pending');
  const approvedRequests = displayedRequests.filter((r) => r.status === 'approved' || r.status === 'Active');
  const deniedRequests = displayedRequests.filter((r) => r.status === 'denied');

  const displayedLogs = isDev
    ? auditLogs.filter((l) => l.actor === currentUser.name).slice(0, 5)
    : auditLogs.slice(0, 5);

  // Cloud distribution data
  const cloudCounts = {
    AWS: displayedRequests.filter((r) => r.cloud === 'AWS').length,
    Azure: displayedRequests.filter((r) => r.cloud === 'Azure').length,
    GCP: displayedRequests.filter((r) => r.cloud === 'GCP').length,
  };

  const chartData = [
    { name: 'AWS', count: cloudCounts.AWS, fill: '#F59E0B' },
    { name: 'Azure', count: cloudCounts.Azure, fill: '#0284C7' },
    { name: 'GCP', count: cloudCounts.GCP, fill: '#2563EB' },
  ];

  const pieData = [
    { name: 'Approved', value: approvedRequests.length, color: '#10B981' },
    { name: 'Pending', value: pendingRequests.length, color: '#F59E0B' },
    { name: 'Denied', value: deniedRequests.length, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Scope Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isDev
                  ? 'bg-blue-100 text-blue-700'
                  : activeRole === 'Admin'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {activeRole} View
            </span>
            <span className="text-xs text-slate-500">
              {isDev ? 'Personal Developer Portal' : 'Enterprise Governance Console'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Welcome back, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isDev
              ? 'Monitoring your just-in-time cloud access grants, privilege elevations, and activity logs.'
              : 'Real-time multi-cloud identity governance, PAM vault health, and organization-wide approval queues.'}
          </p>
        </div>

        {isDev && (
          <Link
            to="/access-requests"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
          >
            <KeyRound className="w-4 h-4" />
            Create Access Request
          </Link>
        )}
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isDev ? 'My Requests' : 'Total Requests'}
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {displayedRequests.length}
            </span>
            <span className="text-xs text-slate-500">
              {isDev ? 'submitted' : 'across all users'}
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isDev ? 'Pending Approvals' : 'Approval Queue'}
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {pendingRequests.length}
            </span>
            <span className="text-xs text-amber-600 font-medium">
              {pendingRequests.length > 0 ? 'Requires attention' : 'Queue clear'}
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isDev ? 'Active Grants' : 'PAM Vault Assets'}
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {isDev ? approvedRequests.length : privilegedAccounts.length}
            </span>
            <span className="text-xs text-slate-500">
              {isDev ? 'active sessions' : 'managed credentials'}
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isDev ? 'Audit Events' : 'Avg Compliance'}
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              {isDev ? <Activity className="w-4 h-4" /> : <FileCheck2 className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {isDev
                ? auditLogs.filter((l) => l.actor === currentUser.name).length
                : `${Math.round(
                    complianceFrameworks.reduce((acc, c) => acc + c.score, 0) /
                      complianceFrameworks.length
                  )}%`}
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              {isDev ? 'logged actions' : 'SOC2 / ISO verified'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Cloud Breakdown */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isDev ? 'My Access by Cloud Provider' : 'Organization Cloud Requests'}
              </h3>
              <p className="text-xs text-slate-500">
                Breakdown of requested workloads across AWS, Azure, and GCP
              </p>
            </div>
            <div className="text-xs text-slate-400 font-medium">Live Telemetry</div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Ratio */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isDev ? 'My Request Statuses' : 'Global Request Statuses'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Ratio of approved, pending, and denied</p>
            <div className="h-44 w-full flex items-center justify-center">
              {displayedRequests.length === 0 ? (
                <div className="text-xs text-slate-400">No requests to display</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E2E8F0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
            <div>
              <span className="block text-[11px] text-slate-500">Approved</span>
              <span className="font-bold text-emerald-600 font-mono tabular-nums">
                {approvedRequests.length}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-500">Pending</span>
              <span className="font-bold text-amber-600 font-mono tabular-nums">
                {pendingRequests.length}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-500">Denied</span>
              <span className="font-bold text-rose-600 font-mono tabular-nums">
                {deniedRequests.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CHANGE 3: "Active Access Sessions" panel listing who currently holds what, with time remaining */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Active Access Sessions
              </h3>
              <p className="text-xs text-slate-500">
                Live Just-In-Time cloud access grants with real-time countdown to auto-expiry
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            {activeSessions.length} Active
          </span>
        </div>

        {activeSessions.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
            No active Just-In-Time access sessions at the moment. Approved requests with time remaining will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900 truncate">
                    {session.resourceName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      session.cloud === 'AWS'
                        ? 'bg-amber-100 text-amber-800'
                        : session.cloud === 'Azure'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {session.cloud}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  <span>Held by: </span>
                  <strong className="text-slate-800">{session.requesterName}</strong>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-xs">
                  <span className="text-[11px] text-slate-500">Time remaining:</span>
                  <span className="font-mono font-bold text-emerald-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600 animate-pulse" />
                    {formatSessionCountdown(session.expiresAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Split Section: Recent Requests & Recent Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isDev ? 'My Recent Requests' : 'Recent Access Requests'}
              </h3>
              <p className="text-xs text-slate-500">
                {isDev ? 'Requests submitted under your identity' : 'Latest submissions from engineering team'}
              </p>
            </div>
            <Link
              to="/access-requests"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {displayedRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No requests found</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {displayedRequests.slice(0, 4).map((req) => (
                <div key={req.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 font-semibold">{req.id}</span>
                      <span className="font-semibold text-slate-900 truncate">
                        {req.resourceName}
                      </span>
                      {req.isPrivileged && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-medium">
                          Privileged
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {req.cloud} · {req.requesterName} · {req.durationHours}h JIT window
                    </div>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                        req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit Trail */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isDev ? 'My Recent Audit Activity' : 'Organization Audit Trail'}
              </h3>
              <p className="text-xs text-slate-500">
                {isDev ? 'Immutable security log of your operations' : 'Real-time administrative & access events'}
              </p>
            </div>
            <Link
              to="/audit-logs"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View Logs <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {displayedLogs.map((log, index) => {
              const logStatus = (log.status || 'SUCCESS').toUpperCase();
              return (
                <div key={log.id || `log-${index}`} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800 leading-tight">
                      {log.action || 'System Action'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{log.actor || 'System'} ({log.actorRole || 'Admin'})</span>
                      <span>·</span>
                      <span className="font-mono">{log.timestamp || 'N/A'}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      logStatus === 'SUCCESS'
                        ? 'bg-emerald-50 text-emerald-700'
                        : logStatus === 'DENIED'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {logStatus}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
