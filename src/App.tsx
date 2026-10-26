/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { AccessRequests } from './pages/AccessRequests';
import { PrivilegedAccounts } from './pages/PrivilegedAccounts';
import { RolesPermissions } from './pages/RolesPermissions';
import { AccessReviews } from './pages/AccessReviews';
import { Compliance } from './pages/Compliance';
import { AuditLogs } from './pages/AuditLogs';
import { Authentication } from './pages/Authentication';
import { Settings } from './pages/Settings';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Application Routes */}
          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="access-requests" element={<AccessRequests />} />
            <Route path="privileged-accounts" element={<PrivilegedAccounts />} />
            <Route path="roles-permissions" element={<RolesPermissions />} />
            <Route path="access-reviews" element={<AccessReviews />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="authentication" element={<Authentication />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
