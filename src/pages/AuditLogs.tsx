import React, { useState } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Download,
  Link as LinkIcon,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GENESIS_HASH, computeLogHash } from '../utils/crypto';

export const AuditLogs: React.FC = () => {
  const { activeRole, currentUser, auditLogs } = useApp();

  const isDev = activeRole === 'Developer';
  const isAdmin = activeRole === 'Admin';
  const isManager = activeRole === 'Manager';

  // Role scoping:
  // Developer: sees ONLY logs where actor === currentUser.name
  // Admin & Manager: see all log entries from all users
  const scopedLogs = isDev
    ? auditLogs.filter((log) => log.actor === currentUser.name)
    : auditLogs;

  const [statusFilter, setStatusFilter] = useState<'all' | 'SUCCESS' | 'DENIED' | 'PENDING'>('all');
  const [search, setSearch] = useState('');

  // CHANGE 5: Tamper-evident chain verification state
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean;
    message: string;
    verifiedCount?: number;
    failedEventId?: string;
  } | null>(null);

  const filteredLogs = scopedLogs.filter((log) => {
    if (!log) return false;
    const logStatus = (log.status || 'SUCCESS').toUpperCase();
    const matchesStatus = statusFilter === 'all' || logStatus === statusFilter;
    const searchLower = (search || '').trim().toLowerCase();
    if (!searchLower) return matchesStatus;

    const actor = (log.actor || '').toLowerCase();
    const action = (log.action || '').toLowerCase();
    const target = (log.target || '').toLowerCase();
    const hash = (log.hash || '').toLowerCase();
    const ipAddress = (log.ipAddress || '').toLowerCase();

    const matchesSearch =
      actor.includes(searchLower) ||
      action.includes(searchLower) ||
      target.includes(searchLower) ||
      hash.includes(searchLower) ||
      ipAddress.includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  // CHANGE 5: Verify Integrity algorithm
  const handleVerifyIntegrity = async () => {
    setVerifying(true);
    setVerifyResult(null);

    try {
      // Recompute the whole chain from genesis (chronological: oldest to newest)
      const chronological = [...auditLogs].reverse();
      let expectedPrevHash = GENESIS_HASH;
      let count = 0;

      for (let i = 0; i < chronological.length; i++) {
        const entry = chronological[i];
        if (!entry) continue;
        const entryId = entry.id || `EVENT-${i}`;
        const entryPrev = entry.previousHash || GENESIS_HASH;

        // Check 1: previousHash must match expected
        if (entryPrev !== expectedPrevHash) {
          setVerifyResult({
            success: false,
            message: `Hash link mismatch at event ${entryId}. Expected previous hash ${expectedPrevHash.slice(0, 8)}... but found ${entryPrev.slice(0, 8)}...`,
            failedEventId: entryId,
          });
          setVerifying(false);
          return;
        }

        // Check 2: computed SHA-256 must match entry.hash
        const computed = await computeLogHash({
          previousHash: expectedPrevHash,
          actor: entry.actor || 'System Admin',
          action: entry.action || 'System Event',
          target: entry.target || 'System',
          timestamp: entry.timestamp || '',
        });

        if (entry.hash && entry.hash !== computed) {
          setVerifyResult({
            success: false,
            message: `Tamper detected at event ${entryId}! Stored hash differs from cryptographic recomputation.`,
            failedEventId: entryId,
          });
          setVerifying(false);
          return;
        }

        expectedPrevHash = computed;
        count++;
      }

      setVerifyResult({
        success: true,
        message: `Chain intact: ${count} entries verified. Cryptographic SHA-256 hashes match from genesis.`,
        verifiedCount: count,
      });
    } catch (err: any) {
      setVerifyResult({
        success: false,
        message: `Verification error: ${err.message}`,
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Audit Logs & Activity Trail
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
              {isDev ? 'Personal Activity Logs' : 'Organization-Wide Cryptographic Ledger'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isDev
              ? 'Append-only ledger of your authentication, request creations, and elevation operations.'
              : 'Tamper-evident, hash-chained ledger storing SHA-256 cryptographic hashes for every administrative and security event.'}
          </p>
        </div>

        {/* Action Buttons: Export & Verify Integrity (Admin/Manager only) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* CHANGE 5: "Verify Integrity" button visible to Admin and Manager only */}
          {(isAdmin || isManager) && (
            <button
              onClick={handleVerifyIntegrity}
              disabled={verifying}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <ShieldCheck className={`w-3.5 h-3.5 text-emerald-600 ${verifying ? 'animate-spin' : ''}`} />
              {verifying ? 'Verifying Chain...' : 'Verify Integrity'}
            </button>
          )}

          <button
            onClick={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', `sentrygate_audit_log_${Date.now()}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Audit Trail (JSON)
          </button>
        </div>
      </div>

      {/* CHANGE 5: Verification Banner Message */}
      {verifyResult && (isAdmin || isManager) && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 animate-in fade-in duration-200 ${
            verifyResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {verifyResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <div>
              <div className="font-bold text-xs">
                {verifyResult.success ? 'Audit Chain Verification Succeeded' : 'Verification Failure Detected'}
              </div>
              <div className="text-xs mt-0.5">{verifyResult.message}</div>
            </div>
          </div>
          <button
            onClick={() => setVerifyResult(null)}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {(['all', 'SUCCESS', 'DENIED', 'PENDING'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={
              isDev
                ? 'Search your actions or targets...'
                : 'Search by actor, action, target, SHA-256 hash...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-72"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No audit logs found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">SHA-256 Chain</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLogs.map((log, index) => {
                  const hashSnippet = log.hash ? log.hash.slice(0, 8) : 'e8b19a02';
                  const logId = log.id || `LOG-${index}`;
                  const logStatus = (log.status || 'SUCCESS').toUpperCase();

                  return (
                    <tr key={logId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-500">
                        {logId}
                      </td>

                      {/* CHANGE 5: Short hash fragment (first 8 characters) with chain-link icon */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono font-semibold"
                          title={`SHA-256 Hash: ${log.hash || 'genesis'}\nPrevious Hash: ${log.previousHash || GENESIS_HASH}`}
                        >
                          <LinkIcon className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{hashSnippet}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap tabular-nums">
                        {log.timestamp || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{log.actor || 'System Admin'}</div>
                        <div className="text-[10px] text-slate-400">{log.actorRole || 'Admin'}</div>
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        <span className="font-medium text-slate-800 leading-snug block">
                          {log.action || 'Administrative Event'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {log.target || 'System'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                            logStatus === 'SUCCESS'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : logStatus === 'DENIED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {logStatus === 'SUCCESS' && <CheckCircle2 className="w-3 h-3" />}
                          {logStatus === 'DENIED' && <XCircle className="w-3 h-3" />}
                          {logStatus === 'PENDING' && <Clock className="w-3 h-3" />}
                          {logStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
