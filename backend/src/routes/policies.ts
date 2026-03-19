import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import { Policy, PolicyTier, TIER_CONFIG, CreatePolicyDTO } from '../models/policy';
import { Worker } from '../models/worker';
import { createError } from '../middleware/errorHandler';
import { getRiskScore } from '../services/mlService';

const router = Router();

async function computeAdjustedPremium(worker: Worker, tier: PolicyTier): Promise<{
  adjusted_premium: number;
  risk_multiplier: number;
  risk_factors: string[];
}> {
  const riskResult = await getRiskScore({ worker, zone_type: 'normal' });
  const basePremium = TIER_CONFIG[tier].base_premium;
  const adjusted = parseFloat((basePremium * riskResult.risk_multiplier).toFixed(2));

  return {
    adjusted_premium: adjusted,
    risk_multiplier: riskResult.risk_multiplier,
    risk_factors: riskResult.risk_factors,
  };
}

// POST /api/policies
router.post(
  '/',
  [
    body('worker_id').isUUID().withMessage('Valid worker_id is required'),
    body('tier').isIn(['basic', 'standard', 'pro']).withMessage('Tier must be basic, standard, or pro'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return next(createError(errors.array()[0]?.msg ?? 'Validation error', 400));

      const dto: CreatePolicyDTO = req.body as CreatePolicyDTO;

      const workerResult = await query<Worker>('SELECT * FROM workers WHERE id = $1', [dto.worker_id]);
      if (workerResult.rows.length === 0) return next(createError('Worker not found', 404));
      const worker = workerResult.rows[0];

      // Check if worker already has an active policy
      const activePolicy = await query<Policy>(
        "SELECT id FROM policies WHERE worker_id = $1 AND status = 'active'",
        [dto.worker_id]
      );
      if (activePolicy.rows.length > 0) {
        return next(createError('Worker already has an active policy. Renew or cancel it first.', 409));
      }

      const tierCfg = TIER_CONFIG[dto.tier];
      const { adjusted_premium, risk_multiplier, risk_factors } = await computeAdjustedPremium(worker, dto.tier);

      const now = new Date();
      const coverageStart = new Date(now);
      const coverageEnd = new Date(now);
      coverageEnd.setDate(coverageEnd.getDate() + 7);

      const id = uuidv4();
      await query(
        `INSERT INTO policies (id, worker_id, tier, base_premium, adjusted_premium,
          max_weekly_payout, coverage_start, coverage_end, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'active')`,
        [
          id, dto.worker_id, dto.tier, tierCfg.base_premium, adjusted_premium,
          tierCfg.max_weekly_payout,
          coverageStart.toISOString().split('T')[0],
          coverageEnd.toISOString().split('T')[0],
        ]
      );

      const policyResult = await query<Policy>('SELECT * FROM policies WHERE id = $1', [id]);

      return res.status(201).json({
        success: true,
        data: {
          policy: policyResult.rows[0],
          risk_multiplier,
          risk_factors,
        },
      });
    } catch (err) {
      return next(err);
    }
  }
);

// GET /api/policies/:id
router.get(
  '/:id',
  [param('id').isUUID()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return next(createError('Invalid policy ID', 400));

      const result = await query<Policy>(
        `SELECT p.*, w.name as worker_name, w.zone, w.city
         FROM policies p JOIN workers w ON p.worker_id = w.id
         WHERE p.id = $1`,
        [req.params['id']]
      );
      if (result.rows.length === 0) return next(createError('Policy not found', 404));

      return res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      return next(err);
    }
  }
);

// POST /api/policies/:id/renew
router.post(
  '/:id/renew',
  [param('id').isUUID()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return next(createError('Invalid policy ID', 400));

      const policyResult = await query<Policy>(
        'SELECT * FROM policies WHERE id = $1',
        [req.params['id']]
      );
      if (policyResult.rows.length === 0) return next(createError('Policy not found', 404));

      const policy = policyResult.rows[0];
      if (policy.status === 'cancelled') {
        return next(createError('Cannot renew a cancelled policy', 400));
      }

      const workerResult = await query<Worker>('SELECT * FROM workers WHERE id = $1', [policy.worker_id]);
      if (workerResult.rows.length === 0) return next(createError('Worker not found', 404));
      const worker = workerResult.rows[0];

      // Check zero-claim discount: worker with 0 claims in last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const claimCount = await query<{ count: string }>(
        "SELECT COUNT(*) as count FROM claims WHERE worker_id = $1 AND created_at > $2 AND status NOT IN ('rejected')",
        [worker.id, threeMonthsAgo.toISOString()]
      );
      const hasZeroClaims = parseInt(claimCount.rows[0]?.count ?? '0', 10) === 0;

      const { adjusted_premium, risk_multiplier, risk_factors } = await computeAdjustedPremium(worker, policy.tier);
      let finalPremium = adjusted_premium;
      const factors = [...risk_factors];

      if (hasZeroClaims) {
        finalPremium = parseFloat((finalPremium * 0.95).toFixed(2));
        factors.push('No claims (3+ months) loyalty discount (-5%)');
      }

      // Mark old policy as expired, create new one
      await query("UPDATE policies SET status = 'expired' WHERE id = $1", [policy.id]);

      const now = new Date();
      const coverageEnd = new Date(now);
      coverageEnd.setDate(coverageEnd.getDate() + 7);
      const newId = uuidv4();

      await query(
        `INSERT INTO policies (id, worker_id, tier, base_premium, adjusted_premium,
          max_weekly_payout, coverage_start, coverage_end, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'active')`,
        [
          newId, worker.id, policy.tier, policy.base_premium, finalPremium,
          policy.max_weekly_payout,
          now.toISOString().split('T')[0],
          coverageEnd.toISOString().split('T')[0],
        ]
      );

      const newPolicy = await query<Policy>('SELECT * FROM policies WHERE id = $1', [newId]);

      return res.status(201).json({
        success: true,
        data: {
          policy: newPolicy.rows[0],
          risk_multiplier,
          risk_factors: factors,
        },
      });
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
