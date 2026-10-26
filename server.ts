import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createExpressApp } from './server/app';
import { connectDB } from './server/db';
import { config } from './server/config';

async function bootstrap() {
  // 1. Initialize MongoDB connection using the MONGODB_URI
  console.log('[App Init] Initializing MongoDB connection...');
  await connectDB(config.mongodbUri).catch((err) => {
    console.error('[App Init] MongoDB initialization caught error:', err.message);
  });

  // 2. Initialize Express Server application with API routes
  const app = createExpressApp();

  // 3. Mount Vite middleware in development or static dist in production
  if (config.env !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  // 4. Start listening on configured port
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[Express App] Successfully initialized and listening on http://0.0.0.0:${config.port}`);
  });
}

bootstrap();
