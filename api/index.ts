import { createExpressApp } from '../server/app';
import { connectDB } from '../server/db';
import { config } from '../server/config';

const app = createExpressApp();

let isConnected = false;

app.use(async (req, res, next) => {
  if (!isConnected && config.mongodbUri) {
    try {
      await connectDB(config.mongodbUri);
      isConnected = true;
    } catch (err: any) {
      console.warn('[Vercel Serverless] MongoDB auto-connect fallback:', err?.message || err);
    }
  }
  next();
});

export default app;
