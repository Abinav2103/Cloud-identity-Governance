import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['Developer', 'Admin', 'Manager'], required: true },
  department: { type: String, default: 'Engineering' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  lastLogin: { type: String, default: 'Never' },
  mfaEnabled: { type: Boolean, default: true },
});

// Access Request Schema
const AccessRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  requesterId: { type: String, required: true },
  requesterName: { type: String, required: true },
  cloud: { type: String, enum: ['AWS', 'Azure', 'GCP'], required: true },
  resourceName: { type: String, required: true },
  isPrivileged: { type: Boolean, default: false },
  justification: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'denied', 'Active', 'Expired', 'Revoked'], default: 'pending' },
  requestedAt: { type: String, required: true },
  reviewedAt: { type: String },
  reviewedBy: { type: String },
  approvedAt: { type: String },
  expiresAt: { type: String },
  durationHours: { type: Number, default: 4 },
  durationMinutes: { type: Number, default: 240 },
  riskScore: { type: Number, default: 0 },
  riskReasons: { type: [String], default: [] },
});

// Privileged Account (PAM) Schema
const PrivilegedAccountSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  cloud: { type: String, enum: ['AWS', 'Azure', 'GCP'], required: true },
  resourceType: { type: String, required: true },
  vaultStatus: { type: String, enum: ['Checked-In', 'Checked-Out', 'Locked'], default: 'Checked-In' },
  riskLevel: { type: String, enum: ['Critical', 'High', 'Medium'], default: 'High' },
  lastRotated: { type: String, required: true },
  assignedTo: { type: String, default: 'Unassigned' },
});

// Audit Log Schema
const AuditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  actor: { type: String, required: true },
  actorRole: { type: String, required: true },
  action: { type: String, required: true },
  target: { type: String, required: true },
  timestamp: { type: String, required: true },
  status: { type: String, enum: ['SUCCESS', 'DENIED', 'PENDING'], default: 'SUCCESS' },
  ipAddress: { type: String, default: '127.0.0.1' },
  hash: { type: String },
  previousHash: { type: String },
});

// Access Review Schema
const AccessReviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  campaignName: { type: String, required: true },
  targetCloud: { type: String, required: true },
  reviewer: { type: String, required: true },
  deadline: { type: String, required: true },
  status: { type: String, enum: ['In Progress', 'Completed', 'Pending'], default: 'Pending' },
  reviewedCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 10 },
});

// Compliance Framework Schema
const ComplianceFrameworkSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  framework: { type: String, required: true },
  status: { type: String, enum: ['Compliant', 'At Risk', 'Needs Review'], default: 'Compliant' },
  score: { type: Number, default: 95 },
  lastAudit: { type: String, required: true },
  controlsPassed: { type: Number, default: 50 },
  totalControls: { type: Number, default: 55 },
});

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const AccessRequestModel = mongoose.models.AccessRequest || mongoose.model('AccessRequest', AccessRequestSchema);
export const PrivilegedAccountModel = mongoose.models.PrivilegedAccount || mongoose.model('PrivilegedAccount', PrivilegedAccountSchema);
export const AuditLogModel = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
export const AccessReviewModel = mongoose.models.AccessReview || mongoose.model('AccessReview', AccessReviewSchema);
export const ComplianceFrameworkModel = mongoose.models.ComplianceFramework || mongoose.model('ComplianceFramework', ComplianceFrameworkSchema);
