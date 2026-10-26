import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes';

export function createExpressApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Mount API endpoints under /api
  app.use('/api', apiRouter);

  return app;
}
