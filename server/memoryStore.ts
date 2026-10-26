import {
  initialUsers,
  initialAccessRequests,
  initialPrivilegedAccounts,
  initialAccessReviews,
  initialComplianceFrameworks,
  initialAuditLogs,
} from './initialData';
import {
  User,
  AccessRequest,
  PrivilegedAccount,
  AccessReview,
  ComplianceFramework,
  AuditLogEntry,
} from './types';

export interface MemoryStore {
  users: User[];
  accessRequests: AccessRequest[];
  privilegedAccounts: PrivilegedAccount[];
  accessReviews: AccessReview[];
  complianceFrameworks: ComplianceFramework[];
  auditLogs: AuditLogEntry[];
}

export const memoryStore: MemoryStore = {
  users: [...initialUsers],
  accessRequests: [...initialAccessRequests],
  privilegedAccounts: [...initialPrivilegedAccounts],
  accessReviews: [...initialAccessReviews],
  complianceFrameworks: [...initialComplianceFrameworks],
  auditLogs: [...initialAuditLogs],
};
