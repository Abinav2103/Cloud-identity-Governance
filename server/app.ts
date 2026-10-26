import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes';
import { connectDB } from './db';
import { config } from './config';

export function createExpressApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Auto-connect to MongoDB before processing API requests (essential for Vercel serverless)
  app.use(async (req, res, next) => {
    try {
      if (config.mongodbUri) {
        await connectDB(config.mongodbUri);
      }
    } catch (err: any) {
      console.warn('[DB Middleware] Auto-connect notice:', err?.message || err);
    }
    next();
  });

  // Mount API endpoints under both /api and root / to support direct and rewritten paths
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  return app;
}
