export type Role = 'Developer' | 'Admin' | 'Manager';

export type CloudProvider = 'AWS' | 'Azure' | 'GCP';

export type RequestStatus = 'pending' | 'approved' | 'denied' | 'Active' | 'Expired' | 'Revoked';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  status: 'active' | 'suspended';
  lastLogin: string;
  mfaEnabled: boolean;
  password?: string;
}

export interface AccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  cloud: CloudProvider;
  resourceName: string;
  isPrivileged: boolean;
  justification: string;
  status: RequestStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  durationHours: number;
  durationMinutes?: number;
  approvedAt?: string;
  expiresAt?: string;
  riskScore?: number;
  riskReasons?: string[];
}

export interface PrivilegedAccount {
  id: string;
  name: string;
  cloud: CloudProvider;
  resourceType: string;
  vaultStatus: 'Checked-In' | 'Checked-Out' | 'Locked';
  riskLevel: 'Critical' | 'High' | 'Medium';
  lastRotated: string;
  assignedTo?: string;
}

export interface RolePermissionItem {
  id: string;
  name: string;
  scope: string;
  description: string;
  assignedUsersCount: number;
  policiesCount: number;
}

export interface AccessReview {
  id: string;
  campaignName: string;
  targetCloud: string;
  reviewer: string;
  deadline: string;
  status: 'In Progress' | 'Completed' | 'Pending';
  reviewedCount: number;
  totalCount: number;
}

export interface ComplianceFramework {
  id: string;
  framework: 'SOC2 Type II' | 'ISO 27001' | 'CIS Benchmark' | 'HIPAA Security';
  status: 'Compliant' | 'At Risk' | 'Needs Review';
  score: number;
  lastAudit: string;
  controlsPassed: number;
  totalControls: number;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  actorRole: Role;
  action: string;
  target: string;
  timestamp: string;
  status: 'SUCCESS' | 'DENIED' | 'PENDING';
  ipAddress: string;
  hash?: string;
  previousHash?: string;
}

export interface AuthSettings {
  mfaPolicy: 'Enforced' | 'Optional';
  sessionTimeoutMinutes: number;
  passwordRotationDays: number;
  ssoProvider: string;
}

export interface SystemSettings {
  autoRevokeHours: number;
  slackNotifications: boolean;
  emailAlerts: boolean;
  approvalWorkflow: 'Single-tier' | 'Multi-tier';
}
