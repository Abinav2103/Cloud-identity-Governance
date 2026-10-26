import {
  initialUsers,
  initialAccessRequests,
  initialPrivilegedAccounts,
  initialAccessReviews,
  initialComplianceFrameworks,
  initialAuditLogs,
} from './initialData';
import {
  UserModel,
  AccessRequestModel,
  PrivilegedAccountModel,
  AccessReviewModel,
  ComplianceFrameworkModel,
  AuditLogModel,
} from './models';

export async function seedMongoIfEmpty() {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('Database empty: Seeding initial Indian persona records...');
      await UserModel.insertMany(initialUsers);
      await AccessRequestModel.insertMany(initialAccessRequests);
      await PrivilegedAccountModel.insertMany(initialPrivilegedAccounts);
      await AccessReviewModel.insertMany(initialAccessReviews);
      await ComplianceFrameworkModel.insertMany(initialComplianceFrameworks);
      await AuditLogModel.insertMany(initialAuditLogs);
      console.log('Seeding completed successfully!');
    }
  } catch (err) {
    console.error('Seed verification error:', err);
  }
}
