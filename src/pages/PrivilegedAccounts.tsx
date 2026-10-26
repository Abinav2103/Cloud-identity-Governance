import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  RefreshCw,
  Key,
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  X,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CloudProvider } from '../types';

export const PrivilegedAccounts: React.FC = () => {
  const {
    activeRole,
    privilegedAccounts,
    createPrivilegedAccount,
    rotatePrivilegedAccount,
  } = useApp();

  const isAdmin = activeRole === 'Admin';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [cloud, setCloud] = useState<CloudProvider>('AWS');
  const [resourceType, setResourceType] = useState('IAM Root/Admin Role');
  const [riskLevel, setRiskLevel] = useState<'Critical' | 'High' | 'Medium'>('Critical');
  const [assignedTo, setAssignedTo] = useState('Sathish Babu');
  const [error, setError] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an asset account name.');
      return;
    }

    createPrivilegedAccount({
      name: name.trim(),
      cloud,
      resourceType,
      riskLevel,
      assignedTo,
    });

    setName('');
    setError('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Privileged Accounts (PAM Vault)
            </h2>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isAdmin
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isAdmin ? 'Admin Full Access' : 'View-Only Directory'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Vaulted high-privilege credentials, breakglass accounts, and automated key rotation policies.
          </p>
        </div>

        {/* Action Button: ADMIN ONLY */}
        {isAdmin && (
          <button
            onClick={() => {
              setError('');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Enroll Privileged Asset
          </button>
        )}
      </div>

      {/* PAM Vault Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {privilegedAccounts.map((pam) => (
          <div
            key={pam.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    pam.cloud === 'AWS'
                      ? 'bg-amber-100 text-amber-800'
                      : pam.cloud === 'Azure'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {pam.cloud}
                </span>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    pam.riskLevel === 'Critical'
                      ? 'bg-rose-100 text-rose-700'
                      : pam.riskLevel === 'High'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {pam.riskLevel} Risk
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 font-mono break-all mb-1">
                {pam.name}
              </h3>
              <p className="text-xs text-slate-500 mb-4">{pam.resourceType}</p>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Vault Status:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    {pam.vaultStatus === 'Checked-In' ? (
                      <Lock className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Unlock className="w-3 h-3 text-amber-600" />
                    )}
                    {pam.vaultStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Rotated:</span>
                  <span className="font-mono text-slate-600">{pam.lastRotated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Designated Owner:</span>
                  <span className="font-medium text-slate-800">{pam.assignedTo}</span>
                </div>
              </div>
            </div>

            {/* ADMIN ONLY ROTATE ACTION */}
            {isAdmin && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => rotatePrivilegedAccount(pam.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Rotate Vault Secrets
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ADMIN MODAL: Enroll Privileged Asset */}
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Enroll Privileged PAM Account
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account / Role Identifier *
                </label>
                <input
                  type="text"
                  placeholder="e.g. aws-prod-k8s-cluster-root, az-subscription-admin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cloud Platform
                </label>
                <select
                  value={cloud}
                  onChange={(e) => setCloud(e.target.value as CloudProvider)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AWS">AWS</option>
                  <option value="Azure">Azure</option>
                  <option value="GCP">GCP</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resource Type
                </label>
                <input
                  type="text"
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Risk Classification
                  </label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Custodian
                  </label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors"
                >
                  Enroll Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
