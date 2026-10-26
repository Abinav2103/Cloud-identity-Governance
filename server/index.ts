import { createExpressApp } from './app';
import { connectDB } from './db';
import { config } from './config';

async function startServer() {
  // Connect to MongoDB Atlas
  console.log('[Backend] Connecting to MongoDB Atlas...');
  await connectDB(config.mongodbUri).catch((err) => {
    console.warn('[Backend] DB init notice:', err.message);
  });

  const app = createExpressApp();
  const port = process.env.PORT || config.port || 5000;

  app.listen(port, () => {
    console.log(`[Backend API] SentryGate server listening on http://localhost:${port}`);
    console.log(`[Backend API] Health & status available at http://localhost:${port}/api/status`);
  });
}

// Only start listener if executed directly (e.g., node / tsx index.ts in standalone backend)
if (process.argv[1]?.includes('server/index.ts') || process.argv[1]?.includes('backend/index.ts')) {
  startServer();
}

export { startServer };
