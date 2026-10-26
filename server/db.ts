import mongoose from 'mongoose';
import { config } from './config';
import { seedMongoIfEmpty } from './seed';

export interface DatabaseState {
  isConnected: boolean;
  isConnecting: boolean;
  statusMessage: string;
  currentUri: string;
}

export const dbState: DatabaseState = {
  isConnected: false,
  isConnecting: false,
  statusMessage: 'Ready (In-Memory fallback active)',
  currentUri: config.mongodbUri,
};

/**
 * Initializes the MongoDB connection using the provided MONGODB_URI.
 * Configured with SSL/TLS options and robust error/warning handling.
 */
export async function connectDB(customUri?: string): Promise<{ success: boolean; message: string; error?: string }> {
  const uri = customUri || config.mongodbUri;

  if (!uri || uri === 'YOUR_MONGODB_CONNECTION_STRING' || uri.includes('YOUR_')) {
    dbState.isConnected = false;
    dbState.statusMessage = 'No valid MONGODB_URI configured. Running on resilient in-memory store.';
    return { success: false, message: dbState.statusMessage };
  }

  dbState.isConnecting = true;
  dbState.currentUri = uri;
  dbState.statusMessage = 'Connecting to MongoDB Atlas...';

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }

    // Connect with TLS/SSL settings compatible with Node 22 / OpenSSL and Atlas
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      tls: true,
      retryWrites: true,
      w: 'majority',
    });

    dbState.isConnected = true;
    dbState.isConnecting = false;
    dbState.statusMessage = 'Connected to MongoDB Database: cloud_identity_governance';
    console.log('[MongoDB] Successfully connected to MongoDB Atlas (cloud_identity_governance)!');

    // Initialize database collections & sync seed data if empty
    await seedMongoIfEmpty();

    return { success: true, message: 'Connected to MongoDB Atlas successfully!' };
  } catch (err: any) {
    dbState.isConnected = false;
    dbState.isConnecting = false;

    const errMsg = err.message || '';
    const isSslIssue =
      errMsg.includes('tlsv1 alert') ||
      errMsg.includes('SSL routines') ||
      errMsg.includes('alert number 80') ||
      errMsg.includes('ssl3_read_bytes');

    const isWhitelistIssue =
      err.name === 'MongooseServerSelectionError' ||
      errMsg.includes('whitelist') ||
      errMsg.includes('Could not connect to any servers');

    if (isSslIssue) {
      dbState.statusMessage =
        'MongoDB Atlas TLS Handshake: Ensure cluster is active and Network Access has 0.0.0.0/0 enabled. App is running seamlessly on internal data store.';
    } else if (isWhitelistIssue) {
      dbState.statusMessage =
        'MongoDB Atlas Network Access: please ensure 0.0.0.0/0 is confirmed in Atlas Network Access. App is running seamlessly on internal data store.';
    } else {
      dbState.statusMessage = `Database notice: ${errMsg}. Local in-memory state active.`;
    }

    console.warn(`[MongoDB Warning] ${dbState.statusMessage}`);
    return { success: false, message: dbState.statusMessage, error: errMsg };
  }
}

// Event listeners for connection monitoring
mongoose.connection.on('connected', () => {
  dbState.isConnected = true;
  dbState.statusMessage = 'Connected to MongoDB Database: cloud_identity_governance';
});

mongoose.connection.on('error', (err: any) => {
  const errMsg = err?.message || String(err);
  dbState.isConnected = false;
  dbState.statusMessage = `MongoDB notice: ${errMsg}`;
  // Avoid loud uncaught exception spam
  console.warn('[MongoDB Connection Notice]', errMsg);
});

mongoose.connection.on('disconnected', () => {
  dbState.isConnected = false;
  if (!dbState.statusMessage.includes('TLS') && !dbState.statusMessage.includes('Network Access')) {
    dbState.statusMessage = 'Disconnected from MongoDB Atlas (In-Memory fallback active)';
  }
});

export default connectDB;
