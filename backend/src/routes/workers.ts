import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import { Worker, CreateWorkerDTO, WorkerRiskProfile } from '../models/worker';
import { Policy } from '../models/policy';
import { Claim } from '../models/claim';
import { getRiskScore } from '../services/mlService';
import { createError } from '../middleware/errorHandler';
import { TIER_CONFIG, PolicyTier } from '../models/policy';

const router = Router();

function hashAadhaar(aadhaar: string): string {
  return createHash('sha256').update(aadhaar.trim()).digest('hex');
}

function suggestTier(riskMultiplier: number): PolicyTier {
  if (riskMultiplier >= 1.2) return 'pro';
  if (riskMultiplier >= 1.05) return 'standard';
  return 'basic';
}

// POST /api/workers
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().isMobilePhone('any').withMessage('Valid phone is required'),
    // Aadhaar: exactly 12 numeric digits (no spaces/hyphens). Leading zeros are valid.
    // The value is SHA-256 hashed before storage and never returned in responses.
    body('aadhaar').trim().isLength({ min: 12, max: 12 }).isNumeric().withMessage('Aadhaar must be 12 numeric digits'),
    body('platform').isIn(['swiggy', 'zomato', 'blinkit', 'zepto', 'dunzo', 'other']).withMessage('Invalid platform'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('zone').trim().notEmpty().withMessage('Zone is required'),
    body('delivery_hours_per_day').isFloat({ min: 1, max: 16 }).withMessage('Delivery hours must be between 1 and 16'),
    body('tenure_weeks').isInt({ min: 0 }).withMessage('Tenure weeks must be non-negative'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(createError(errors.array()[0]?.msg ?? 'Validation error', 400));
      }

      const dto: CreateWorkerDTO = req.body as CreateWorkerDTO;
      const aadhaar_hash = hashAadhaar(dto.aadhaar);

      // Check for duplicate phone or aadhaar
      const existing = await query<Worker>(
        'SELECT id FROM workers WHERE phone = $1 OR aadhaar_hash = $2',
        [dto.phone, aadhaar_hash]
      );
      if (existing.rows.length > 0) {
        return next(createError('Worker with this phone or Aadhaar already registered', 409));
      }

      const id = uuidv4();
      await query(
        `INSERT INTO workers (id, name, phone, email, aadhaar_hash, platform, city, zone,
          delivery_hours_per_day, tenure_weeks)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          id, dto.name, dto.phone, dto.email ?? null, aadhaar_hash,
          dto.platform, dto.city, dto.zone,
          dto.delivery_hours_per_day, dto.tenure_weeks,
        ]
      );

      const workerResult = await query<Worker>('SELECT * FROM workers WHERE id = $1', [id]);
      const worker = workerResult.rows[0];

      // Build risk profile
      const riskResult = await getRiskScore({ worker, zone_type: 'normal' });
      const suggestedTier = suggestTier(riskResult.risk_multiplier);
      const tierCfg = TIER_CONFIG[suggestedTier];

      const riskProfile: WorkerRiskProfile = {
        risk_multiplier: riskResult.risk_multiplier,
        risk_factors: riskResult.risk_factors,
        suggested_tier: suggestedTier,
        estimated_weekly_premium: parseFloat(
          (tierCfg.base_premium * riskResult.risk_multiplier).toFixed(2)
        ),
      };

      return res.status(201).json({ success: true, data: { worker, risk_profile: riskProfile } });
    } catch (err) {
      return next(err);
    }
  }
);

// GET /api/workers/:id
router.get(
  '/:id',
  [param('id').trim().notEmpty().withMessage('Invalid worker ID')],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return next(createError('Invalid worker ID', 400));

      const result = await query<Worker>('SELECT * FROM workers WHERE id = $1', [req.params['id']]);
      if (result.rows.length === 0) return next(createError('Worker not found', 404));

      return res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      return next(err);
    }
  }
);

// GET /api/workers/:id/policies
router.get(
  '/:id/policies',
  [param('id').isUUID()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return next(createError('Invalid worker ID', 400));

      const workerCheck = await query('SELECT id FROM workers WHERE id = $1', [req.params['id']]);
      if (workerCheck.rows.length === 0) return next(createError('Worker not found', 404));

      const result = await query<Policy>(
        'SELECT * FROM policies WHERE worker_id = $1 ORDER BY created_at DESC',
        [req.params['id']]
      );

      return res.json({ success: true, data: result.rows });
    } catch (err) {
      return next(err);
    }
  }
);

// GET /api/workers/:id/claims
router.get(
  '/:id/claims',
  [param('id').isUUID()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return next(createError('Invalid worker ID', 400));

      const workerCheck = await query('SELECT id FROM workers WHERE id = $1', [req.params['id']]);
      if (workerCheck.rows.length === 0) return next(createError('Worker not found', 404));

      const result = await query<Claim>(
        'SELECT * FROM claims WHERE worker_id = $1 ORDER BY created_at DESC',
        [req.params['id']]
      );

      return res.json({ success: true, data: result.rows });
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
