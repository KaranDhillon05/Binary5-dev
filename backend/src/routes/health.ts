import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import pool from '../config/db';

const healthRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

const router = Router();

// GET /health
router.get('/', healthRateLimit, async (_req: Request, res: Response) => {
  let dbStatus = 'ok';
  let dbLatencyMs = 0;

  try {
    const start = Date.now();
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    dbLatencyMs = Date.now() - start;
  } catch {
    dbStatus = 'unreachable';
  }

  const status = dbStatus === 'ok' ? 200 : 503;

  return res.status(status).json({
    success: dbStatus === 'ok',
    data: {
      status: dbStatus === 'ok' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: dbStatus, latency_ms: dbLatencyMs },
        api: { status: 'ok' },
      },
      version: '1.0.0',
    },
  });
});

export default router;
