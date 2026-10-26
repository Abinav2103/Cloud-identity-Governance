import axios from 'axios';
import {
  User,
  AccessRequest,
  PrivilegedAccount,
  AuditLogEntry,
  Role,
} from '../types';

export const apiClient = {
  signInWithGoogle: async (credential: string): Promise<User> => {
    const res = await axios.post('/api/auth/google', { credential });
    return res.data;
  },

  // DB Status
  getStatus: async () => {
    const res = await axios.get('/api/status');
    return res.data;
  },

  connectDb: async (connectionString: string) => {
    const res = await axios.post('/api/connect-db', { connectionString });
    return res.data;
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    const res = await axios.get('/api/users');
    return res.data;
  },

  createUser: async (user: User): Promise<User> => {
    const res = await axios.post('/api/users', user);
    return res.data;
  },

  updateUserStatus: async (id: string, status: 'active' | 'suspended') => {
    const res = await axios.patch(`/api/users/${id}/status`, { status });
    return res.data;
  },

  // Access Requests
  getAccessRequests: async (): Promise<AccessRequest[]> => {
    const res = await axios.get('/api/access-requests');
    return res.data;
  },

  createAccessRequest: async (req: AccessRequest): Promise<AccessRequest> => {
    const res = await axios.post('/api/access-requests', req);
    return res.data;
  },

  reviewAccessRequest: async (
    id: string,
    payload: {
      status: 'approved' | 'denied' | 'Active' | 'Expired' | 'Revoked';
      reviewedBy?: string;
      reviewedAt?: string;
      approvedAt?: string;
      expiresAt?: string;
    }
  ) => {
    const res = await axios.patch(`/api/access-requests/${id}/review`, payload);
    return res.data;
  },

  // Privileged Accounts (PAM)
  getPrivilegedAccounts: async (): Promise<PrivilegedAccount[]> => {
    const res = await axios.get('/api/privileged-accounts');
    return res.data;
  },

  createPrivilegedAccount: async (pam: PrivilegedAccount): Promise<PrivilegedAccount> => {
    const res = await axios.post('/api/privileged-accounts', pam);
    return res.data;
  },

  rotatePrivilegedAccount: async (id: string, lastRotated: string) => {
    const res = await axios.post(`/api/privileged-accounts/${id}/rotate`, { lastRotated });
    return res.data;
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    const res = await axios.get('/api/audit-logs');
    return res.data;
  },

  createAuditLog: async (log: AuditLogEntry): Promise<AuditLogEntry> => {
    const res = await axios.post('/api/audit-logs', log);
    return res.data;
  },
};
