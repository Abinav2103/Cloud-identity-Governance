import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Users,
  FileCode,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RolesPermissions: React.FC = () => {
  const { activeRole, rolesPermissions } = useApp();
  const isAdmin = activeRole === 'Admin';

  const [roles, setRoles] = useState(rolesPermissions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newScope, setNewScope] = useState('Multi-Cloud');
  const [newDescription, setNewDescription] = useState('');
  const [error, setError] = useState('');

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      setError('Please provide a role title.');
      return;
    }
    const newEntry = {
      id: `ROLE-0${roles.length + 1}`,
      name: newRoleName.trim(),
      scope: newScope,
      description: newDescription.trim() || 'Custom entitlement definition',
      assignedUsersCount: 1,
      policiesCount: 4,
    };
    setRoles([...roles, newEntry]);
    setNewRoleName('');
    setNewDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Roles & Permissions
            </h2>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isAdmin
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isAdmin ? 'Admin Full Access' : 'View-Only Catalog'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Declarative role catalog mapping IAM privileges, cloud scopes, and fine-grained entitlement policies.
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
            Create Role Policy
          </button>
        )}
      </div>

      {/* Role Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((r) => (
          <div
            key={r.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-semibold text-slate-500">
                  {r.id}
                </span>
                <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {r.scope}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1.5">{r.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{r.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-700">{r.assignedUsersCount} users</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-700">{r.policiesCount} policies</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADMIN MODAL: Create Role */}
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Define Role Policy</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRole} className="mt-4 space-y-4">
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Data Warehouse ReadOnly Role"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scope</label>
                <input
                  type="text"
                  value={newScope}
                  onChange={(e) => setNewScope(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Scope details and boundaries of this role..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
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
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
