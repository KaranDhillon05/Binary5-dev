import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/db';
import { getWeatherForCity } from '../services/weatherService';
import { getAQIForCity } from '../services/aqiService';
import { createError } from '../middleware/errorHandler';
import { triggerMonitorState } from '../jobs/triggerMonitor';

const router = Router();

interface ZoneCheckResult {
  zone: string;
  city: string;
  weather: {
    condition: string;
    rainfall_mm: number;
    alert_level: string | null;
    triggered: boolean;
  };
  aqi: {
    value: number;
    category: string;
    heat_composite: boolean;
    triggered: boolean;
  };
  claims_created: number;
  timestamp: Date;
}

// POST /api/triggers/check
router.post(
  '/check',
  [
    body('zone').trim().notEmpty().withMessage('Zone is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return next(createError(errors.array()[0]?.msg ?? 'Validation error', 400));

      const { zone, city } = req.body as { zone: string; city: string };

      const [weather, aqi] = await Promise.all([
        getWeatherForCity(city, zone),
        getAQIForCity(city, zone),
      ]);

      const weatherTriggered =
        weather.condition === 'red_alert' ||
        weather.condition === 'heavy_rain' ||
        (weather.condition === 'moderate_rain' && weather.rainfall_mm > 10);

      const aqiTriggered = aqi.aqi > 300;

      let claimsCreated = 0;

      if (weatherTriggered || aqiTriggered) {
        // Find all workers in this zone with active policies
        const workersResult = await query<{ worker_id: string; policy_id: string }>(
          `SELECT w.id as worker_id, p.id as policy_id
           FROM workers w
           JOIN policies p ON p.worker_id = w.id
           WHERE w.zone = $1 AND p.status = 'active'
             AND p.coverage_end >= CURRENT_DATE`,
          [zone]
        );

        const { processClaimFraudAndPayout } = await import('./claims');

        for (const row of workersResult.rows) {
          if (weatherTriggered) {
            const { v4: uuidv4 } = await import('uuid');
            const claimId = uuidv4();
            await query(
              `INSERT INTO claims (id, policy_id, worker_id, trigger_type, trigger_details, status)
               VALUES ($1,$2,$3,'weather',$4,'pending')`,
              [
                claimId, row.policy_id, row.worker_id,
                JSON.stringify({
                  condition: weather.condition,
                  rainfall_mm: weather.rainfall_mm,
                  alert_level: weather.alert_level,
                  description: weather.description,
                  city,
                  zone,
                }),
              ]
            );
            processClaimFraudAndPayout(claimId).catch((err: Error) =>
              console.error('[Trigger] Claim processing error:', err)
            );
            claimsCreated++;
          }

          if (aqiTriggered) {
            const { v4: uuidv4 } = await import('uuid');
            const claimId = uuidv4();
            await query(
              `INSERT INTO claims (id, policy_id, worker_id, trigger_type, trigger_details, status)
               VALUES ($1,$2,$3,'pollution',$4,'pending')`,
              [
                claimId, row.policy_id, row.worker_id,
                JSON.stringify({
                  aqi: aqi.aqi,
                  category: aqi.category,
                  heat_composite: aqi.heat_composite,
                  temperature: aqi.temperature,
                  city,
                  zone,
                }),
              ]
            );
            processClaimFraudAndPayout(claimId).catch((err: Error) =>
              console.error('[Trigger] Claim processing error:', err)
            );
            claimsCreated++;
          }
        }
      }

      const result: ZoneCheckResult = {
        zone,
        city,
        weather: {
          condition: weather.condition,
          rainfall_mm: weather.rainfall_mm,
          alert_level: weather.alert_level,
          triggered: weatherTriggered,
        },
        aqi: {
          value: aqi.aqi,
          category: aqi.category,
          heat_composite: aqi.heat_composite,
          triggered: aqiTriggered,
        },
        claims_created: claimsCreated,
        timestamp: new Date(),
      };

      return res.json({ success: true, data: result });
    } catch (err) {
      return next(err);
    }
  }
);

// GET /api/triggers/status
router.get('/status', (_req: Request, res: Response) => {
  const state = triggerMonitorState.getStatus();
  return res.json({ success: true, data: state });
});

export default router;
