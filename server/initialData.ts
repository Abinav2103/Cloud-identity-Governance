import {
  User,
  AccessRequest,
  PrivilegedAccount,
  AccessReview,
  ComplianceFramework,
  AuditLogEntry,
} from './types';

export const initialUsers: User[] = [
  {
    id: 'usr-101',
    name: 'Ramesh Kumar',
    email: 'ramesh.kumar@sentrygate.io',
    role: 'Developer',
    department: 'Cloud Platform Engineering',
    status: 'active',
    lastLogin: '2026-09-28 09:15',
    mfaEnabled: true,
  },
  {
    id: 'usr-102',
    name: 'Sathish Babu',
    email: 'sathish.babu@sentrygate.io',
    role: 'Admin',
    department: 'Security Operations & IAM',
    status: 'active',
    lastLogin: '2026-09-28 08:30',
    mfaEnabled: true,
  },
  {
    id: 'usr-103',
    name: 'Priya Lakshmi',
    email: 'priya.lakshmi@sentrygate.io',
    role: 'Manager',
    department: 'Infrastructure Delivery',
    status: 'active',
    lastLogin: '2026-09-27 17:45',
    mfaEnabled: true,
  },
  {
    id: 'usr-104',
    name: 'Kavitha Raj',
    email: 'kavitha.raj@sentrygate.io',
    role: 'Developer',
    department: 'Data Platforms',
    status: 'active',
    lastLogin: '2026-09-28 10:02',
    mfaEnabled: true,
  },
];

export const initialAccessRequests: AccessRequest[] = [
  {
    id: 'REQ-101',
    requesterId: 'usr-101',
    requesterName: 'Ramesh Kumar',
    cloud: 'AWS',
    resourceName: 'prod-eks-cluster-admin',
    isPrivileged: true,
    justification: 'Deploy hotfix patch v3.2.1 to payment gateway pods in us-east-1',
    status: 'pending',
    requestedAt: '2026-09-28 09:30',
    durationHours: 4,
    durationMinutes: 240,
    riskScore: 65,
    riskReasons: ['Privileged account (+40)', 'Production resource (+25)'],
  },
  {
    id: 'REQ-102',
    requesterId: 'usr-104',
    requesterName: 'Kavitha Raj',
    cloud: 'GCP',
    resourceName: 'gcp-bigquery-prod-analytics',
    isPrivileged: false,
    justification: 'Quarterly financial data aggregation schema verification',
    status: 'approved',
    requestedAt: '2026-09-27 14:10',
    reviewedAt: '2026-09-27 14:25',
    reviewedBy: 'Sathish Babu',
    durationHours: 8,
    durationMinutes: 480,
    riskScore: 55,
    riskReasons: ['Production resource (+25)', 'Extended duration 8h (+30)'],
  },
];

export const initialPrivilegedAccounts: PrivilegedAccount[] = [
  {
    id: 'PAM-001',
    name: 'aws-prod-admin-breakglass',
    cloud: 'AWS',
    resourceType: 'IAM Superuser Role',
    vaultStatus: 'Checked-In',
    riskLevel: 'Critical',
    lastRotated: '2026-09-20',
    assignedTo: 'Sathish Babu',
  },
  {
    id: 'PAM-002',
    name: 'azure-global-security-admin',
    cloud: 'Azure',
    resourceType: 'Entra ID Global Admin',
    vaultStatus: 'Checked-In',
    riskLevel: 'Critical',
    lastRotated: '2026-09-18',
    assignedTo: 'Sathish Babu',
  },
];

export const initialAccessReviews: AccessReview[] = [
  {
    id: 'REV-2026-Q3',
    campaignName: 'AWS Production IAM Privilege Recertification',
    targetCloud: 'Amazon Web Services',
    reviewer: 'Sathish Babu',
    deadline: '2026-10-15',
    status: 'In Progress',
    reviewedCount: 18,
    totalCount: 24,
  },
];

export const initialComplianceFrameworks: ComplianceFramework[] = [
  {
    id: 'COMP-01',
    framework: 'SOC2 Type II',
    status: 'Compliant',
    score: 98,
    lastAudit: '2026-08-15',
    controlsPassed: 64,
    totalControls: 65,
  },
  {
    id: 'COMP-02',
    framework: 'ISO 27001',
    status: 'Compliant',
    score: 95,
    lastAudit: '2026-07-20',
    controlsPassed: 114,
    totalControls: 120,
  },
];

export const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'LOG-501',
    actor: 'Ramesh Kumar',
    actorRole: 'Developer',
    action: 'Requested JIT access to prod-eks-cluster-admin',
    target: 'AWS :: prod-eks-cluster-admin',
    timestamp: '2026-09-28 09:30:12',
    status: 'PENDING',
    ipAddress: '192.168.1.14',
  },
  {
    id: 'LOG-502',
    actor: 'Sathish Babu',
    actorRole: 'Admin',
    action: 'Approved access request REQ-102 for Kavitha Raj',
    target: 'GCP :: gcp-bigquery-prod-analytics',
    timestamp: '2026-09-27 14:25:00',
    status: 'SUCCESS',
    ipAddress: '10.0.4.88',
  },
];
