import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  ClipboardCheck,
  FileCheck2,
  ScrollText,
  Lock,
  Settings,
  Shield,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeRole, currentUser } = useApp();

  // All 10 sidebar modules visible to ALL THREE roles (Developer, Admin, Manager)
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Users', path: '/users', icon: Users },
    { label: 'Access Requests', path: '/access-requests', icon: KeyRound },
    { label: 'Privileged Accounts', path: '/privileged-accounts', icon: ShieldAlert },
    { label: 'Roles & Permissions', path: '/roles-permissions', icon: ShieldCheck },
    { label: 'Access Reviews', path: '/access-reviews', icon: ClipboardCheck },
    { label: 'Compliance', path: '/compliance', icon: FileCheck2 },
    { label: 'Audit Logs', path: '/audit-logs', icon: ScrollText },
    { label: 'Authentication', path: '/authentication', icon: Lock },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-200">
        <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <span className="text-base font-bold text-slate-900 tracking-tight leading-tight block">
            SentryGate
          </span>
          <span className="text-[11px] font-medium text-slate-500 block leading-tight">
            Cloud IAM & PAM
          </span>
        </div>
      </div>

      {/* Navigation List - 10 Modules */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Role & Context Info Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/60">
        <div className="px-2 py-1.5 rounded-md bg-white border border-slate-200 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Active Identity</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                activeRole === 'Admin'
                  ? 'bg-purple-100 text-purple-700'
                  : activeRole === 'Manager'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {activeRole}
            </span>
          </div>
          <div className="font-semibold text-slate-800 truncate">{currentUser.name}</div>
          <div className="text-[11px] text-slate-500 truncate">{currentUser.department}</div>
        </div>
      </div>
    </aside>
  );
};
