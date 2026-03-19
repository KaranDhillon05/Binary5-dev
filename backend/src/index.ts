import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { env } from './config/env';
import { testConnection } from './config/db';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { startTriggerMonitor } from './jobs/triggerMonitor';

import workersRouter  from './routes/workers';
import policiesRouter from './routes/policies';
import claimsRouter   from './routes/claims';
import payoutsRouter  from './routes/payouts';
import triggersRouter from './routes/triggers';
import healthRouter   from './routes/health';

const app = express();

app.use(cors({
  origin: env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use('/api/workers',   workersRouter);
app.use('/api/policies',  policiesRouter);
app.use('/api/claims',    claimsRouter);
app.use('/api/payouts',   payoutsRouter);
app.use('/api/triggers',  triggersRouter);
app.use('/health',        healthRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

async function bootstrap(): Promise<void> {
  try {
    await testConnection();
    startTriggerMonitor();

    app.listen(env.PORT, () => {
      console.log(`[Server] Q-Shield API running on port ${env.PORT} (${env.NODE_ENV})`);
      console.log(`[Server] Mock services: ${env.USE_MOCK_SERVICES}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('[Server] Unhandled bootstrap error:', err);
  process.exit(1);
});

export default app;
