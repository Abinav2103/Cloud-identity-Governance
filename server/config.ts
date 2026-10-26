import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  mongodbUri:
    process.env.MONGODB_URI ||
    'mongodb+srv://cloudidentity_app:Abinav1616@cloudidentitydb.3oj12hx.mongodb.net/cloud_identity_governance?appName=CloudIdentityDB',
  env: process.env.NODE_ENV || 'development',
};
