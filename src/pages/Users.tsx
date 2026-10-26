import React, { useState } from 'react';
import {
  Users as UsersIcon,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  Search,
  Lock,
  X,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';

export const Users: React.FC = () => {
  const { activeRole, users, createUser, updateUserStatus } = useApp();
  const isAdmin = activeRole === 'Admin';
  const isManager = activeRole === 'Manager';

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Create User modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState<'Admin' | 'Developer'>('Developer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Cloud Platform Engineering');
  const [error, setError] = useState('');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenCreateModal = (targetRole: 'Admin' | 'Developer') => {
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setModalRole(targetRole);
    setDepartment(targetRole === 'Admin' ? 'Security Operations & IAM' : 'Cloud Platform Engineering');
    setIsModalOpen(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide user full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid corporate email.');
      return;
    }
    if (modalRole === 'Admin' && !password.trim()) {
      setError('Please provide an initial password for the Admin account.');
      return;
    }

    createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: modalRole,
      department: department.trim(),
      password: password.trim() || undefined,
    });

    setName('');
    setEmail('');
    setPassword('');
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
              User & Identity Directory
            </h2>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isAdmin
                  ? 'bg-purple-100 text-purple-700'
                  : isManager
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isAdmin ? 'Admin Management Mode' : isManager ? 'Manager Governance Mode' : 'View-Only Directory'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Enterprise identities synchronized from Corporate IdP / Okta with role entitlements and MFA enforcement.
          </p>
        </div>

        {/* Action Button: MANAGER gets 'Create Admin', ADMIN gets 'Create New User' (Developer only) */}
        {isManager && (
          <button
            onClick={() => handleOpenCreateModal('Admin')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Create Admin
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => handleOpenCreateModal('Developer')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Create New User
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search users by name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="Developer">Developer</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Entitled Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">MFA State</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4">Status</th>
                {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs flex items-center justify-center border border-blue-200">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        user.role === 'Admin'
                          ? 'bg-purple-100 text-purple-700'
                          : user.role === 'Manager'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{user.department}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      FIDO2 Enforced
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {user.lastLogin}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                        user.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {user.status === 'active' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {user.status}
                    </span>
                  </td>

                  {/* ADMIN ACTION: Edit / Deactivate user */}
                  {isAdmin && (
                    <td className="py-3 px-4 text-right">
                      {user.status === 'active' ? (
                        <button
                          onClick={() => updateUserStatus(user.id, 'suspended')}
                          className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                          title="Suspend account access"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => updateUserStatus(user.id, 'active')}
                          className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                          title="Reactivate account access"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Create User (Manager creates Admin with password; Admin creates Developer only) */}
      {(isAdmin || isManager) && isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${modalRole === 'Admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {modalRole === 'Admin' ? 'Create New Admin Account' : 'Create New Developer'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {modalRole === 'Admin'
                      ? 'Manager Provisioning: Grants full administrative IAM authority'
                      : 'Admin Provisioning: Grants standard developer JIT access request role'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder={modalRole === 'Admin' ? 'e.g. Vikram Malhotra' : 'e.g. Anand Sharma'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  placeholder={modalRole === 'Admin' ? 'e.g. vikram.malhotra@sentrygate.io' : 'e.g. anand.sharma@sentrygate.io'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Password field - required for Manager creating Admin */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password {modalRole === 'Admin' ? '*' : '(Optional)'}
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {modalRole === 'Admin'
                    ? 'Required: The new Admin can sign in immediately using this password and email.'
                    : 'Initial password for SSO / local login.'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Role (Enforced by Policy)
                </label>
                <div className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800 flex items-center justify-between">
                  <span>{modalRole}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-mono">
                    {modalRole === 'Admin' ? 'Manager write authority' : 'Admin restricted to Developer'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors cursor-pointer ${
                    modalRole === 'Admin' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {modalRole === 'Admin' ? 'Create Admin User' : 'Create Developer User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
