import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Shield,
  HelpCircle,
  AlertTriangle,
  StopCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CloudProvider } from '../types';

// Helper for countdown formatting
function formatCountdown(expiresAt?: string): { text: string; isExpired: boolean } {
  if (!expiresAt) return { text: '--', isExpired: false };
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return { text: 'Expired', isExpired: true };

  const totalSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  if (hours > 0) {
    return { text: `${hours}h ${mins}m left`, isExpired: false };
  }
  if (mins > 0) {
    return { text: `${mins}m ${secs}s left`, isExpired: false };
  }
  return { text: `${secs}s left`, isExpired: false };
}

export const AccessRequests: React.FC = () => {
  const {
    activeRole,
    currentUser,
    accessRequests,
    createAccessRequest,
    approveAccessRequest,
    denyAccessRequest,
    revokeAccessRequest,
  } = useApp();

  const isDev = activeRole === 'Developer';
  const isAdmin = activeRole === 'Admin';
  const isManager = activeRole === 'Manager';

  // Live timer tick to re-render countdowns every 1s
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Role data filtering:
  // Developer: only their own requests
  // Admin & Manager: all requests across organization
  const roleScopedRequests = isDev
    ? accessRequests.filter(
        (r) => r.requesterName === currentUser.name || r.requesterId === currentUser.id
      )
    : accessRequests;

  // Filter tabs & search state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'Active' | 'approved' | 'denied' | 'Expired' | 'Revoked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cloudFilter, setCloudFilter] = useState<string>('all');

  // Modal state for Developer creation form
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cloud, setCloud] = useState<CloudProvider>('AWS');
  const [resourceName, setResourceName] = useState('');
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [justification, setJustification] = useState('');
  // Duration option in minutes (30m, 1h, 2h, 4h, 8h)
  const [durationMinutes, setDurationMinutes] = useState<number>(240); // default 4 hours
  const [formError, setFormError] = useState('');

  // Expanded row state for risk score breakdown
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  // Modal state for Admin Deny reason
  const [denialTargetId, setDenialTargetId] = useState<string | null>(null);
  const [denialReason, setDenialReason] = useState('');

  // Filter logic
  const filteredRequests = roleScopedRequests.filter((req) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'approved'
        ? req.status === 'approved' || req.status === 'Active'
        : req.status === statusFilter;

    const matchesCloud = cloudFilter === 'all' || req.cloud === cloudFilter;
    const matchesSearch =
      req.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.justification.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCloud && matchesSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceName.trim()) {
      setFormError('Please enter a target resource name.');
      return;
    }
    if (!justification.trim() || justification.trim().length < 10) {
      setFormError('Please provide a meaningful business justification (at least 10 characters).');
      return;
    }

    createAccessRequest({
      cloud,
      resourceName: resourceName.trim(),
      isPrivileged,
      justification: justification.trim(),
      durationMinutes,
      durationHours: durationMinutes / 60,
    });

    // Reset and close
    setResourceName('');
    setIsPrivileged(false);
    setJustification('');
    setDurationMinutes(240);
    setFormError('');
    setIsCreateModalOpen(false);
  };

  const handleConfirmDenial = () => {
    if (denialTargetId) {
      denyAccessRequest(denialTargetId, denialReason.trim() || 'Access denied by security admin');
      setDenialTargetId(null);
      setDenialReason('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Access Requests
            </h2>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isDev
                  ? 'bg-blue-100 text-blue-700'
                  : isAdmin
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {isDev ? 'My Submissions' : 'All Org Requests'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isDev
              ? 'Request Just-In-Time (JIT) access to cloud workloads with automated risk scoring and auto-expiry countdowns.'
              : isAdmin
              ? 'Review Just-In-Time access requests with risk scoring analysis, active countdown monitoring, and revocation authority.'
              : 'Read-only audit view of all pending, active, and expired organization access requests.'}
          </p>
        </div>

        {/* Action Button: Developer ONLY */}
        {isDev && (
          <button
            onClick={() => {
              setFormError('');
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Access Request
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status segmented control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {(['all', 'pending', 'Active', 'Expired', 'Revoked', 'denied'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
              {status === 'pending' && roleScopedRequests.filter((r) => r.status === 'pending').length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] rounded-full font-mono">
                  {roleScopedRequests.filter((r) => r.status === 'pending').length}
                </span>
              )}
              {status === 'Active' && roleScopedRequests.filter((r) => r.status === 'Active').length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-mono">
                  {roleScopedRequests.filter((r) => r.status === 'Active').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Cloud filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search resource or requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-64"
            />
          </div>

          <select
            value={cloudFilter}
            onChange={(e) => setCloudFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Clouds</option>
            <option value="AWS">AWS</option>
            <option value="Azure">Azure</option>
            <option value="GCP">GCP</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="py-16 text-center">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-700">No requests found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {isDev
                ? 'You currently have no access requests matching the selected filters. Click "Create Access Request" to request cloud permissions.'
                : 'No access requests matching current filters in the organization pool.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Cloud & Resource</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Justification</th>
                  <th className="py-3 px-4">Duration & Session</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">
                    {isAdmin ? 'Actions' : 'Details'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRequests.map((req) => {
                  const score = req.riskScore ?? (req.isPrivileged ? 65 : 25);
                  const riskLabel = score <= 34 ? 'Low' : score <= 64 ? 'Medium' : 'High';
                  const countdown = formatCountdown(req.expiresAt);
                  const isExpanded = expandedRequestId === req.id;

                  return (
                    <React.Fragment key={req.id}>
                      <tr className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-600">
                          {req.id}
                          <span className="block text-[10px] text-slate-400 font-sans">
                            {req.requestedAt.split(' ')[0]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                req.cloud === 'AWS'
                                  ? 'bg-amber-100 text-amber-800'
                                  : req.cloud === 'Azure'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {req.cloud}
                            </span>
                            <span className="font-semibold text-slate-900 truncate max-w-xs block">
                              {req.resourceName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{req.requesterName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{req.requesterId}</div>
                        </td>

                        {/* CHANGE 4: Risk Score Badge & Breakdown */}
                        <td className="py-3 px-4">
                          <div className="relative group inline-block">
                            <button
                              type="button"
                              onClick={() => setExpandedRequestId(isExpanded ? null : req.id)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer border ${
                                riskLabel === 'Low'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : riskLabel === 'Medium'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                              title={
                                !isDev && req.riskReasons && req.riskReasons.length > 0
                                  ? req.riskReasons.join(', ')
                                  : undefined
                              }
                            >
                              <ShieldAlert className="w-3 h-3 shrink-0" />
                              {/* Developer sees their own request's label only; Admin & Manager see score + label */}
                              {isDev ? (
                                <span>{riskLabel} Risk</span>
                              ) : (
                                <span>
                                  {score}/100 {riskLabel}
                                </span>
                              )}
                            </button>

                            {/* Tooltip on hover for Admin and Manager */}
                            {!isDev && req.riskReasons && req.riskReasons.length > 0 && (
                              <div className="hidden group-hover:block absolute z-20 left-0 top-full mt-1 w-56 p-2 bg-slate-900 text-white text-[11px] rounded shadow-lg">
                                <div className="font-semibold mb-1 text-slate-200">Risk Breakdown:</div>
                                <ul className="space-y-0.5 list-disc pl-3 text-slate-300">
                                  {req.riskReasons.map((r, i) => (
                                    <li key={i}>{r}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-slate-600 truncate" title={req.justification}>
                            {req.justification}
                          </p>
                        </td>

                        {/* CHANGE 3: Live Countdown & Duration display */}
                        <td className="py-3 px-4">
                          <div className="font-mono text-slate-700 tabular-nums">
                            {req.durationMinutes
                              ? req.durationMinutes < 60
                                ? `${req.durationMinutes}m`
                                : `${req.durationMinutes / 60}h`
                              : `${req.durationHours}h`}{' '}
                            JIT
                          </div>
                          {req.status === 'Active' && req.expiresAt && (
                            <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5 font-mono">
                              <Clock className="w-3 h-3 text-emerald-600 animate-pulse shrink-0" />
                              <span>{countdown.text}</span>
                            </div>
                          )}
                          {req.status === 'Expired' && (
                            <div className="text-[10px] text-slate-400 mt-0.5">Session expired</div>
                          )}
                          {req.status === 'Revoked' && (
                            <div className="text-[10px] text-rose-500 mt-0.5">Manually revoked</div>
                          )}
                        </td>

                        {/* CHANGE 3: Status Colors */}
                        {/* Pending = amber, Active = green, Expired = grey, Revoked = red, Denied = red */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium capitalize ${
                              req.status === 'Active' || req.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold'
                                : req.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold'
                                : req.status === 'Expired'
                                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold'
                            }`}
                          >
                            {(req.status === 'Active' || req.status === 'approved') && (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            )}
                            {req.status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                            {req.status === 'Expired' && <Clock className="w-3 h-3 text-slate-400" />}
                            {(req.status === 'Revoked' || req.status === 'denied') && (
                              <XCircle className="w-3 h-3 text-rose-600" />
                            )}
                            {req.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {/* ADMIN: Approve & Deny on pending requests */}
                          {isAdmin && req.status === 'pending' && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => approveAccessRequest(req.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
                                title="Approve access request and start countdown"
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setDenialTargetId(req.id);
                                  setDenialReason('');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium text-xs transition-colors cursor-pointer"
                                title="Deny access request"
                              >
                                <X className="w-3 h-3" />
                                Deny
                              </button>
                            </div>
                          )}

                          {/* CHANGE 3: Admin sees "Revoke now" button on every Active session */}
                          {isAdmin && req.status === 'Active' && (
                            <button
                              onClick={() => revokeAccessRequest(req.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
                              title="Immediately revoke this active access grant"
                            >
                              <StopCircle className="w-3 h-3" />
                              Revoke now
                            </button>
                          )}

                          {/* Non-admin read-only details */}
                          {(!isAdmin || (req.status !== 'pending' && req.status !== 'Active')) && (
                            <div className="text-[11px] text-slate-400">
                              {req.reviewedBy ? (
                                <span>
                                  Reviewed by <strong className="text-slate-600">{req.reviewedBy}</strong>
                                </span>
                              ) : (
                                <span>{req.status === 'Active' ? 'Active session' : 'Awaiting review'}</span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* Expanded row for risk breakdown on click (Admin & Manager) */}
                      {!isDev && isExpanded && req.riskReasons && req.riskReasons.length > 0 && (
                        <tr className="bg-slate-50/90 text-xs">
                          <td colSpan={8} className="px-6 py-3 border-t border-b border-slate-200">
                            <div className="flex items-start gap-4">
                              <div className="font-semibold text-slate-800 flex items-center gap-1.5 shrink-0">
                                <ShieldAlert className="w-4 h-4 text-amber-600" />
                                <span>Risk Assessment Breakdown:</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {req.riskReasons.map((reason, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium text-[11px]"
                                  >
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DEVELOPER MODAL: Create Access Request Form */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Create Just-In-Time Access Request
                  </h3>
                  <p className="text-xs text-slate-500">
                    Requester: <strong className="text-slate-700">{currentUser.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Cloud Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Cloud Provider *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['AWS', 'Azure', 'GCP'] as CloudProvider[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCloud(c)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                        cloud === c
                          ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resource Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resource / Role Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. prod-payments-cluster-admin, az-security-vault, gcp-bigquery-read"
                  value={resourceName}
                  onChange={(e) => setResourceName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <div className="flex gap-1.5 mt-1.5 text-[11px] text-slate-400">
                  <span>Suggestions:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setResourceName('prod-eks-cluster-admin');
                      setIsPrivileged(true);
                    }}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    prod-eks-admin
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setResourceName('gcp-cloudsql-prod-replica');
                      setIsPrivileged(false);
                    }}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    cloudsql-replica
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setResourceName('az-keyvault-prod-master');
                      setIsPrivileged(true);
                    }}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    az-keyvault
                  </button>
                </div>
              </div>

              {/* Privileged Account Toggle */}
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="privileged-check"
                  checked={isPrivileged}
                  onChange={(e) => setIsPrivileged(e.target.checked)}
                  className="mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="privileged-check" className="text-xs cursor-pointer">
                  <span className="font-bold text-amber-900 block">
                    Privileged Account / High-Risk PAM Access (+40 Risk)
                  </span>
                  <span className="text-amber-800 text-[11px] block mt-0.5">
                    Check this if you are requesting root/admin elevation, credential check-out, or access to sensitive production data.
                  </span>
                </label>
              </div>

              {/* CHANGE 3: Required Duration Field (30 minutes, 1 hour, 2 hours, 4 hours, 8 hours) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duration * (JIT Expiry Window)
                </label>
                <select
                  required
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours (+10 Risk)</option>
                  <option value={240}>4 hours (+20 Risk)</option>
                  <option value={480}>8 hours (+30 Risk)</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Once approved by Admin, this session will automatically expire and revoke after this duration.
                </span>
              </div>

              {/* Justification */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Justification *
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide incident/ticket number and technical necessity for this elevation..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Footer CTA */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN DENIAL REASON MODAL */}
      {denialTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Deny Access Request ({denialTargetId})
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Please enter an optional reason for denying this request. The decision will be recorded in the audit log.
            </p>
            <input
              type="text"
              placeholder="e.g. Unjustified production privilege; please test in staging first"
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDenialTargetId(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDenial}
                className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs cursor-pointer"
              >
                Confirm Denial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
