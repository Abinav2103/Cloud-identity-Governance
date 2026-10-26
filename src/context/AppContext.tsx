import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiClient } from '../services/apiClient';
import {
  Role,
  User,
  AccessRequest,
  PrivilegedAccount,
  RolePermissionItem,
  AccessReview,
  ComplianceFramework,
  AuditLogEntry,
  AuthSettings,
  SystemSettings,
  CloudProvider,
} from '../types';
import {
  initialUsers,
  initialAccessRequests,
  initialPrivilegedAccounts,
  initialRolesPermissions,
  initialAccessReviews,
  initialComplianceFrameworks,
  initialAuditLogs,
  initialAuthSettings,
  initialSystemSettings,
} from '../mock/initialData';
import { GENESIS_HASH, computeLogHash } from '../utils/crypto';
import { computeRiskScore } from '../utils/riskScoring';

interface AppContextType {
  // Current user & role state
  currentUser: User;
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  loginWithGoogle: (user: User) => void;
  logout: () => void;

  // DB Connection Info
  dbStatus: { connected: boolean; status: string; mode: string };
  refreshData: () => Promise<void>;

  // Single shared data stores
  users: User[];
  accessRequests: AccessRequest[];
  privilegedAccounts: PrivilegedAccount[];
  rolesPermissions: RolePermissionItem[];
  accessReviews: AccessReview[];
  complianceFrameworks: ComplianceFramework[];
  auditLogs: AuditLogEntry[];
  authSettings: AuthSettings;
  systemSettings: SystemSettings;

  // Mutations (with automated audit logging)
  createAccessRequest: (data: {
    cloud: CloudProvider;
    resourceName: string;
    isPrivileged: boolean;
    justification: string;
    durationHours?: number;
    durationMinutes?: number;
  }) => Promise<void>;
  approveAccessRequest: (id: string) => Promise<void>;
  denyAccessRequest: (id: string, reason?: string) => Promise<void>;
  revokeAccessRequest: (id: string) => Promise<void>;
  createUser: (data: {
    name: string;
    email: string;
    role: Role;
    department?: string;
    password?: string;
  }) => Promise<void>;
  updateUserStatus: (id: string, status: 'active' | 'suspended') => Promise<void>;
  createPrivilegedAccount: (data: {
    name: string;
    cloud: CloudProvider;
    resourceType: string;
    riskLevel: 'Critical' | 'High' | 'Medium';
    assignedTo?: string;
  }) => Promise<void>;
  rotatePrivilegedAccount: (id: string) => Promise<void>;
  createAccessReview: (data: {
    campaignName: string;
    targetCloud: string;
    reviewer: string;
    deadline: string;
    totalCount: number;
  }) => void;
  updateComplianceFramework: (id: string, newScore: number) => void;
  updateAuthSettings: (settings: Partial<AuthSettings>) => void;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to seed initial audit logs with valid hash chains if not present
async function initializeHashChain(logs: AuditLogEntry[]): Promise<AuditLogEntry[]> {
  if (!logs || !Array.isArray(logs)) return [];
  // chronological order is bottom to top (oldest first)
  const chronological = [...logs].reverse();
  let prevHash = GENESIS_HASH;
  const chained: AuditLogEntry[] = [];

  for (let i = 0; i < chronological.length; i++) {
    const log: any = chronological[i];
    const actor = log.actor || 'System Admin';
    const action = log.action || log.description || 'System Event';
    const target = log.target || (log.targetType ? `${log.targetType} :: ${log.targetId || 'Resource'}` : 'System');
    const timestamp = log.timestamp || (log.createdAt ? new Date(log.createdAt).toISOString().replace('T', ' ').slice(0, 19) : new Date().toISOString().replace('T', ' ').slice(0, 19));
    const id = String(log.id || log._id || `LOG-${1000 + i}`);
    const actorRole = log.actorRole || 'Admin';
    const ipAddress = log.ipAddress || '127.0.0.1';
    let status: 'SUCCESS' | 'DENIED' | 'PENDING' = 'SUCCESS';
    const rawStatus = String(log.status || 'SUCCESS').toUpperCase();
    if (rawStatus === 'SUCCESS' || rawStatus === 'DENIED' || rawStatus === 'PENDING') {
      status = rawStatus;
    }

    const safeEntry: AuditLogEntry = {
      ...log,
      id,
      actor,
      actorRole,
      action,
      target,
      timestamp,
      status,
      ipAddress,
    };

    if (safeEntry.hash && safeEntry.previousHash) {
      prevHash = safeEntry.hash;
      chained.push(safeEntry);
    } else {
      const hash = await computeLogHash({
        previousHash: prevHash,
        actor,
        action,
        target,
        timestamp,
      });
      chained.push({
        ...safeEntry,
        previousHash: prevHash,
        hash,
      });
      prevHash = hash;
    }
  }

  // Reverse back to newest first
  return chained.reverse();
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Master shared state
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(initialAccessRequests);
  const [privilegedAccounts, setPrivilegedAccounts] = useState<PrivilegedAccount[]>(initialPrivilegedAccounts);
  const [rolesPermissions, setRolesPermissions] = useState<RolePermissionItem[]>(initialRolesPermissions);
  const [accessReviews, setAccessReviews] = useState<AccessReview[]>(initialAccessReviews);
  const [complianceFrameworks, setComplianceFrameworks] = useState<ComplianceFramework[]>(initialComplianceFrameworks);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [authSettings, setAuthSettings] = useState<AuthSettings>(initialAuthSettings);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(initialSystemSettings);

  const [dbStatus, setDbStatus] = useState<{ connected: boolean; status: string; mode: string }>({
    connected: false,
    status: 'Checking backend database...',
    mode: 'Checking...',
  });

  // Authentication & Role session
  const [activeRole, setActiveRoleState] = useState<Role>('Developer');
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Initialize seed audit logs hash chain once on mount
  useEffect(() => {
    initializeHashChain(initialAuditLogs).then((chained) => {
      setAuditLogs(chained);
    });
  }, []);

  // Sync with Express/MongoDB API
  const refreshData = async () => {
    try {
      const [statusRes, usersRes, reqsRes, pamRes, logsRes] = await Promise.all([
        apiClient.getStatus().catch(() => null),
        apiClient.getUsers().catch(() => null),
        apiClient.getAccessRequests().catch(() => null),
        apiClient.getPrivilegedAccounts().catch(() => null),
        apiClient.getAuditLogs().catch(() => null),
      ]);

      if (statusRes) setDbStatus(statusRes);
      if (usersRes && Array.isArray(usersRes) && usersRes.length > 0) {
        setUsers(usersRes);
      }
      if (reqsRes && Array.isArray(reqsRes)) {
        setAccessRequests(reqsRes);
      }
      if (pamRes && Array.isArray(pamRes)) {
        setPrivilegedAccounts(pamRes);
      }
      if (logsRes && Array.isArray(logsRes) && logsRes.length > 0) {
        const chained = await initializeHashChain(logsRes);
        setAuditLogs(chained);
      }
    } catch {
      // In case server is starting, gracefully fallback
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Helper to record audit log with cryptographic SHA-256 tamper-evident hash chaining
  const recordAuditLog = async (
    action: string,
    target: string,
    status: 'SUCCESS' | 'DENIED' | 'PENDING',
    actorOverride?: { name: string; role: Role }
  ): Promise<AuditLogEntry> => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
      2,
      '0'
    )}:${String(now.getSeconds()).padStart(2, '0')}`;

    const actor = actorOverride ? actorOverride.name : currentUser.name;
    const actorRole = actorOverride ? actorOverride.role : currentUser.role;

    // Previous hash is the hash of the latest entry in auditLogs (or GENESIS_HASH)
    const latestLog = auditLogs[0];
    const previousHash = (latestLog && latestLog.hash) ? latestLog.hash : GENESIS_HASH;

    const hash = await computeLogHash({
      previousHash,
      actor,
      action,
      target,
      timestamp: formattedDate,
    });

    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      actor,
      actorRole,
      action,
      target,
      timestamp: formattedDate,
      status,
      ipAddress: '192.168.1.105',
      previousHash,
      hash,
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    try {
      await apiClient.createAuditLog(newLog);
    } catch {
      // Offline fallback
    }

    return newLog;
  };

  const setActiveRole = (newRole: Role) => {
    setActiveRoleState(newRole);
    const matchingUser = users.find((u) => u.role === newRole) || users[0];
    setCurrentUser(matchingUser);

    recordAuditLog(
      `Switched session context to role ${newRole}`,
      `Role :: ${newRole}`,
      'SUCCESS',
      { name: matchingUser.name, role: newRole }
    );
  };

  const login = (email: string, _password?: string): boolean => {
    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setCurrentUser(foundUser);
      setActiveRoleState(foundUser.role);
      setIsAuthenticated(true);
      recordAuditLog('User logged into console via SSO/MFA', `User :: ${foundUser.email}`, 'SUCCESS', {
        name: foundUser.name,
        role: foundUser.role,
      });
      return true;
    }
    const defaultUser = users[0];
    setCurrentUser(defaultUser);
    setActiveRoleState(defaultUser.role);
    setIsAuthenticated(true);
    recordAuditLog('User logged into console', `User :: ${defaultUser.email}`, 'SUCCESS', {
      name: defaultUser.name,
      role: defaultUser.role,
    });
    return true;
  };

  const loginWithGoogle = (user: User) => {
    setUsers((previousUsers) => {
      const exists = previousUsers.some((previousUser) => previousUser.id === user.id);
      return exists
        ? previousUsers.map((previousUser) => previousUser.id === user.id ? user : previousUser)
        : [...previousUsers, user];
    });
    setCurrentUser(user);
    setActiveRoleState(user.role);
    setIsAuthenticated(true);
    recordAuditLog('User signed in with Google', `User :: ${user.email}`, 'SUCCESS', {
      name: user.name,
      role: user.role,
    });
  };

  const logout = () => {
    recordAuditLog('User signed out of console', `Session :: ${currentUser.id}`, 'SUCCESS');
    setIsAuthenticated(false);
  };

  // CHANGE 3: Automated expiry timer check every 3 seconds
  const accessRequestsRef = useRef(accessRequests);
  accessRequestsRef.current = accessRequests;

  useEffect(() => {
    const interval = setInterval(() => {
      const nowMs = Date.now();
      const currentList = accessRequestsRef.current;

      currentList.forEach((req) => {
        if (req.status === 'Active' && req.expiresAt) {
          const expMs = new Date(req.expiresAt).getTime();
          if (nowMs >= expMs) {
            // Auto-revoke on expiry
            setAccessRequests((prev) =>
              prev.map((r) => (r.id === req.id ? { ...r, status: 'Expired' } : r))
            );

            apiClient.reviewAccessRequest(req.id, {
              status: 'Expired',
            }).catch(() => {});

            recordAuditLog(
              'Access auto-revoked on expiry',
              `${req.cloud} :: ${req.resourceName} (${req.requesterName})`,
              'DENIED',
              { name: 'System IAM Auto-Expiry Engine', role: 'Admin' }
            );
          }
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [auditLogs]);

  // 1. Create Access Request (Developer workflow) with Risk Score (Change 4) & Duration (Change 3)
  const createAccessRequest = async ({
    cloud,
    resourceName,
    isPrivileged,
    justification,
    durationHours = 4,
    durationMinutes,
  }: {
    cloud: CloudProvider;
    resourceName: string;
    isPrivileged: boolean;
    justification: string;
    durationHours?: number;
    durationMinutes?: number;
  }) => {
    const totalMinutes = durationMinutes !== undefined ? durationMinutes : durationHours * 60;
    const computedHours = totalMinutes / 60;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Check if requester has had a denied request before
    const hasDeniedHistory = accessRequests.some(
      (r) =>
        (r.requesterId === currentUser.id || r.requesterName === currentUser.name) &&
        r.status === 'denied'
    );

    // Compute automatic risk score
    const riskAnalysis = computeRiskScore({
      isPrivileged,
      resourceName,
      durationMinutes: totalMinutes,
      requestDate: now,
      hasDeniedHistory,
    });

    const newReqId = `REQ-${Math.floor(100 + Math.random() * 900)}`;

    const newRequest: AccessRequest = {
      id: newReqId,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      cloud,
      resourceName,
      isPrivileged,
      justification,
      status: 'pending',
      requestedAt: formattedDate,
      durationHours: computedHours,
      durationMinutes: totalMinutes,
      riskScore: riskAnalysis.score,
      riskReasons: riskAnalysis.reasons,
    };

    setAccessRequests((prev) => [newRequest, ...prev]);

    try {
      await apiClient.createAccessRequest(newRequest);
    } catch {
      // Local fallback
    }

    recordAuditLog(
      `Created access request for ${cloud} resource: ${resourceName}${isPrivileged ? ' (Privileged PAM)' : ''} [Risk: ${riskAnalysis.score} ${riskAnalysis.label}]`,
      `${cloud} :: ${resourceName}`,
      'PENDING'
    );
  };

  // 2. Approve Access Request (Admin workflow) -> Sets status to 'Active' with approvedAt and expiresAt
  const approveAccessRequest = async (id: string) => {
    const now = new Date();
    const approvedAt = now.toISOString();

    const targetReq = accessRequests.find((r) => r.id === id);
    const durationMinutes = targetReq?.durationMinutes || (targetReq?.durationHours ? targetReq.durationHours * 60 : 240);
    const expiresDate = new Date(now.getTime() + durationMinutes * 60 * 1000);
    const expiresAt = expiresDate.toISOString();

    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let reqTarget = id;
    setAccessRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          reqTarget = `${req.cloud} :: ${req.resourceName} (${req.requesterName})`;
          return {
            ...req,
            status: 'Active' as const,
            reviewedAt: formattedDate,
            reviewedBy: currentUser.name,
            approvedAt,
            expiresAt,
          };
        }
        return req;
      })
    );

    try {
      await apiClient.reviewAccessRequest(id, {
        status: 'Active',
        reviewedAt: formattedDate,
        reviewedBy: currentUser.name,
        approvedAt,
        expiresAt,
      });
    } catch {
      // Local fallback
    }

    recordAuditLog(`Approved access request ${id} (Active session started)`, reqTarget, 'SUCCESS');
  };

  // 3. Deny Access Request (Admin workflow)
  const denyAccessRequest = async (id: string, reason?: string) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let reqTarget = id;
    setAccessRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          reqTarget = `${req.cloud} :: ${req.resourceName} (${req.requesterName})`;
          return {
            ...req,
            status: 'denied' as const,
            reviewedAt: formattedDate,
            reviewedBy: currentUser.name,
          };
        }
        return req;
      })
    );

    try {
      await apiClient.reviewAccessRequest(id, {
        status: 'denied',
        reviewedAt: formattedDate,
        reviewedBy: currentUser.name,
      });
    } catch {
      // Local fallback
    }

    recordAuditLog(
      `Denied access request ${id}${reason ? `: ${reason}` : ''}`,
      reqTarget,
      'DENIED'
    );
  };

  // Revoke active session (Admin workflow)
  const revokeAccessRequest = async (id: string) => {
    let reqTarget = id;
    setAccessRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          reqTarget = `${req.cloud} :: ${req.resourceName} (${req.requesterName})`;
          return {
            ...req,
            status: 'Revoked' as const,
          };
        }
        return req;
      })
    );

    try {
      await apiClient.reviewAccessRequest(id, {
        status: 'Revoked',
      });
    } catch {
      // Local fallback
    }

    recordAuditLog(`Manually revoked active access session ${id}`, reqTarget, 'DENIED');
  };

  // 4. Create User (Manager creates Admin, Admin creates Developer)
  const createUser = async (data: {
    name: string;
    email: string;
    role: Role;
    department?: string;
    password?: string;
  }) => {
    const newUser: User = {
      id: `usr-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department || (data.role === 'Admin' ? 'Security Operations & IAM' : 'Cloud Platform Engineering'),
      status: 'active',
      lastLogin: 'Never',
      mfaEnabled: true,
      password: data.password,
    };

    setUsers((prev) => [...prev, newUser]);

    try {
      await apiClient.createUser(newUser);
    } catch {
      // Local fallback
    }

    recordAuditLog(`Created new identity user: ${data.name} (${data.role})`, `User :: ${data.email}`, 'SUCCESS');
  };

  // 5. Update User Status (Admin workflow)
  const updateUserStatus = async (id: string, status: 'active' | 'suspended') => {
    const targetUser = users.find((u) => u.id === id);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status } : u))
    );

    try {
      await apiClient.updateUserStatus(id, status);
    } catch {
      // Local fallback
    }

    if (targetUser) {
      recordAuditLog(
        `Updated account status to ${status.toUpperCase()} for ${targetUser.name}`,
        `User :: ${targetUser.email}`,
        'SUCCESS'
      );
    }
  };

  // 6. Create Privileged Account (Admin workflow)
  const createPrivilegedAccount = async (data: {
    name: string;
    cloud: CloudProvider;
    resourceType: string;
    riskLevel: 'Critical' | 'High' | 'Medium';
    assignedTo?: string;
  }) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;

    const newPAM: PrivilegedAccount = {
      id: `PAM-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name,
      cloud: data.cloud,
      resourceType: data.resourceType,
      vaultStatus: 'Checked-In',
      riskLevel: data.riskLevel,
      lastRotated: formattedDate,
      assignedTo: data.assignedTo || 'Unassigned',
    };

    setPrivilegedAccounts((prev) => [...prev, newPAM]);

    try {
      await apiClient.createPrivilegedAccount(newPAM);
    } catch {
      // Local fallback
    }

    recordAuditLog(
      `Enrolled privileged PAM asset: ${data.name} (${data.cloud})`,
      `${data.cloud} :: ${data.name}`,
      'SUCCESS'
    );
  };

  // 7. Rotate Privileged Credentials (Admin workflow)
  const rotatePrivilegedAccount = async (id: string) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;

    let pamName = id;
    setPrivilegedAccounts((prev) =>
      prev.map((pam) => {
        if (pam.id === id) {
          pamName = pam.name;
          return {
            ...pam,
            lastRotated: formattedDate,
            vaultStatus: 'Checked-In',
          };
        }
        return pam;
      })
    );

    try {
      await apiClient.rotatePrivilegedAccount(id, formattedDate);
    } catch {
      // Local fallback
    }

    recordAuditLog(`Forced rotation of credentials for ${pamName}`, `PAM Vault :: ${id}`, 'SUCCESS');
  };

  // 8. Create Access Review Campaign (Admin workflow)
  const createAccessReview = (data: {
    campaignName: string;
    targetCloud: string;
    reviewer: string;
    deadline: string;
    totalCount: number;
  }) => {
    const newRev: AccessReview = {
      id: `REV-${Math.floor(1000 + Math.random() * 9000)}`,
      campaignName: data.campaignName,
      targetCloud: data.targetCloud,
      reviewer: data.reviewer,
      deadline: data.deadline,
      status: 'Pending',
      reviewedCount: 0,
      totalCount: data.totalCount,
    };

    setAccessReviews((prev) => [newRev, ...prev]);
    recordAuditLog(`Initiated recertification review: ${data.campaignName}`, `Review :: ${newRev.id}`, 'SUCCESS');
  };

  // 9. Update Compliance Framework (Admin workflow)
  const updateComplianceFramework = (id: string, newScore: number) => {
    setComplianceFrameworks((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              score: newScore,
              status: newScore >= 90 ? 'Compliant' : newScore >= 75 ? 'Needs Review' : 'At Risk',
            }
          : c
      )
    );
    recordAuditLog(`Updated compliance metric for control ${id}`, `Framework :: ${id}`, 'SUCCESS');
  };

  // 10. Update Auth / System Settings (Admin workflow)
  const updateAuthSettings = (settings: Partial<AuthSettings>) => {
    setAuthSettings((prev) => ({ ...prev, ...settings }));
    recordAuditLog(`Updated corporate authentication & MFA policies`, 'Security Policy :: Auth', 'SUCCESS');
  };

  const updateSystemSettings = (settings: Partial<SystemSettings>) => {
    setSystemSettings((prev) => ({ ...prev, ...settings }));
    recordAuditLog(`Updated IAM automation and notification rules`, 'System Config :: Settings', 'SUCCESS');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeRole,
        setActiveRole,
        isAuthenticated,
        login,
        loginWithGoogle,
        logout,
        dbStatus,
        refreshData,
        users,
        accessRequests,
        privilegedAccounts,
        rolesPermissions,
        accessReviews,
        complianceFrameworks,
        auditLogs,
        authSettings,
        systemSettings,
        createAccessRequest,
        approveAccessRequest,
        denyAccessRequest,
        revokeAccessRequest,
        createUser,
        updateUserStatus,
        createPrivilegedAccount,
        rotatePrivilegedAccount,
        createAccessReview,
        updateComplianceFramework,
        updateAuthSettings,
        updateSystemSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
