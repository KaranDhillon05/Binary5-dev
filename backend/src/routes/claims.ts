import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query as queryValidator, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import { Claim, CreateClaimDTO, ClaimFilter, TriggerDetails, WeatherTriggerDetails, ZoneClosureTriggerDetails, PollutionTriggerDetails } from '../models/claim';
import { Policy } from '../models/policy';
import { Worker } from '../models/worker';
import { Payout } from '../models/payout';
import { createError } from '../middleware/errorHandler';
import { getFraudScore } from '../services/mlService';
import { processPayment } from '../services/paymentService';

const router = Router();

function computePayoutAmount(policy: Policy, details: TriggerDetails, triggerType: string): number {
  const dailyCoverage = policy.max_weekly_payout / 6;

  if (triggerType === 'weather') {
    const wd = details as WeatherTriggerDetails;
    switch (wd.condition) {
      case 'red_alert':  return parseFloat((dailyCoverage * 1.0).toFixed(2));
      case 'heavy_rain': return parseFloat((dailyCoverage * 0.85).toFixed(2));
      case 'moderate_rain': return parseFloat((dailyCoverage * 0.65).toFixed(2));
      case 'light_rain': return parseFloat((dailyCoverage * 0.50).toFixed(2));
      default:           return parseFloat((dailyCoverage * 0.50).toFixed(2));
    }
  }

  if (triggerType === 'zone_closure') {
    return parseFloat((dailyCoverage * 0.80).toFixed(2));
  }

  if (triggerType === 'pollution') {
    const pd = details as PollutionTriggerDetails;
    if (pd.heat_composite) return parseFloat((dailyCoverage * 0.70).toFixed(2));
    if (pd.aqi > 300)       return parseFloat((dailyCoverage * 0.50).toFixed(2));
    return parseFloat((dailyCoverage * 0.40).toFixed(2));
  }

  return parseFloat((dailyCoverage * 0.50).toFixed(2));
}

export async function processClaimFraudAndPayout(claimId: string): Promise<void> {
  const claimResult = await query<Claim>('SELECT * FROM claims WHERE id = $1', [claimId]);
  if (claimResult.rows.length === 0) return;
  const claim = claimResult.rows[0];

  const workerResult = await query<Worker>('SELECT * FROM workers WHERE id = $1', [claim.worker_id]);
  if (workerResult.rows.length === 0) return;
  const worker = workerResult.rows[0];

  const policyResult = await query<Policy>('SELECT * FROM policies WHERE id = $1', [claim.policy_id]);
  if (policyResult.rows.length === 0) return;
  const policy = policyResult.rows[0];

  // Gather signals for fraud scoring
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentClaimsResult = await query<{ count: string }>(
    "SELECT COUNT(*) as count FROM claims WHERE worker_id = $1 AND created_at > $2 AND status != 'rejected'",
    [claim.worker_id, thirtyDaysAgo.toISOString()]
  );
  const recentClaimsCount = parseInt(recentClaimsResult.rows[0]?.count ?? '0', 10);

  const lastClaimResult = await query<{ created_at: Date }>(
    "SELECT created_at FROM claims WHERE worker_id = $1 AND id != $2 ORDER BY created_at DESC LIMIT 1",
    [claim.worker_id, claimId]
  );
  let daysSinceLastClaim: number | null = null;
  if (lastClaimResult.rows.length > 0) {
    const lastDate = new Date(lastClaimResult.rows[0].created_at);
    daysSinceLastClaim = Math.floor((Date.now() - lastDate.getTime()) / 86400000);
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const zoneClaimsResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM claims c
     JOIN workers w ON c.worker_id = w.id
     WHERE w.zone = (SELECT zone FROM workers WHERE id = $1)
     AND c.created_at > $2`,
    [claim.worker_id, todayStart.toISOString()]
  );
  const similarZoneClaimsToday = parseInt(zoneClaimsResult.rows[0]?.count ?? '0', 10);

  const fraudResult = await getFraudScore({
    claim,
    worker,
    recent_claims_count: recentClaimsCount,
    days_since_last_claim: daysSinceLastClaim,
    similar_zone_claims_today: similarZoneClaimsToday,
  });

  const fraudScore = fraudResult.fraud_score;
  let newStatus: Claim['status'];
  let payoutAmount: number | null = null;

  if (fraudScore < 0.3) {
    newStatus = 'auto_approved';
    payoutAmount = computePayoutAmount(policy, claim.trigger_details, claim.trigger_type);
  } else if (fraudScore <= 0.7) {
    newStatus = 'fast_verify';
  } else {
    newStatus = 'manual_review';
  }

  await query(
    `UPDATE claims SET fraud_score = $1, status = $2, payout_amount = $3,
     resolved_at = CASE WHEN $2 = 'auto_approved' THEN NOW() ELSE NULL END
     WHERE id = $4`,
    [fraudScore, newStatus, payoutAmount, claimId]
  );

  // Auto-create payout for auto-approved claims
  if (newStatus === 'auto_approved' && payoutAmount !== null) {
    const paymentResult = await processPayment({
      amount: payoutAmount,
      worker_id: claim.worker_id,
      claim_id: claimId,
      method: 'upi',
    });

    const payoutId = uuidv4();
    await query(
      `INSERT INTO payouts (id, claim_id, worker_id, amount, method, status, transaction_ref, completed_at)
       VALUES ($1,$2,$3,$4,'upi',$5,$6,$7)`,
      [
        payoutId, claimId, claim.worker_id, payoutAmount,
        paymentResult.success ? 'completed' : 'failed',
        paymentResult.transaction_ref ?? null,
        paymentResult.success ? new Date().toISOString() : null,
      ]
    );
  }
}

// POST /api/claims
router.post(
  '/',
  [
    body('policy_id').isUUID().withMessage('Valid policy_id is required'),
    body('worker_id').isUUID().withMessage('Valid worker_id is required'),
    body('trigger_type').isIn(['weather', 'zone_closure', 'pollution']).withMessage('Invalid trigger type'),
    body('trigger_details').isObject().withMessage('trigger_details must be an object'),
    body('gps_lat').optional().isFloat({ min: -90, max: 90 }),
    body('gps_lng').optional().isFloat({ min: -180, max: 180 }),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return next(createError(errors.array()[0]?.msg ?? 'Validation error', 400));

      const dto: CreateClaimDTO = req.body as CreateClaimDTO;

      const policyResult = await query<Policy>(
        "SELECT * FROM policies WHERE id = $1 AND worker_id = $2 AND status = 'active'",
        [dto.policy_id, dto.worker_id]
      );
      if (policyResult.rows.length === 0) {
        return next(createError('No active policy found for this worker', 404));
      }

      const policy = policyResult.rows[0];
      const now = new Date();
      const coverageEnd = new Date(policy.coverage_end);
      if (now > coverageEnd) {
        return next(createError('Policy coverage has expired', 400));
      }

      const id = uuidv4();
      await query(
        `INSERT INTO claims (id, policy_id, worker_id, trigger_type, trigger_details, gps_lat, gps_lng, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')`,
        [
          id, dto.policy_id, dto.worker_id, dto.trigger_type,
          JSON.stringify(dto.trigger_details),
          dto.gps_lat ?? null, dto.gps_lng ?? null,
        ]
      );

      // Process fraud scoring asynchronously (fire and forget with error logging)
      processClaimFraudAndPayout(id).catch((err) => {
        console.error('[Claims] Fraud/payout processing error:', err);
      });

      const claimResult = await query<Claim>('SELECT * FROM claims WHERE id = $1', [id]);

      return res.status(201).json({ success: true, data: claimResult.rows[0] });
    } catch (err) {
      return next(err);
    }
  }
);

// GET /api/claims
router.get(
  '/',
  [
    queryValidator('zone').optional().isString(),
    queryValidator('status').optional().isIn(['pending','auto_approved','fast_verify','manual_review','approved','rejected']),
    queryValidator('from_date').optional().isISO8601(),
    queryValidator('to_date').optional().isISO8601(),
    queryValidator('worker_id').optional().isUUID(),
    queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
    queryValidator('offset').optional().isInt({ min: 0 }),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: ClaimFilter = {
        zone:      req.query['zone'] as string | undefined,
        status:    req.query['status'] as ClaimFilter['status'],
        from_date: req.query['from_date'] as string | undefined,
        to_date:   req.query['to_date'] as string | undefined,
        worker_id: req.query['worker_id'] as string | undefined,
        limit:     req.query['limit']  ? parseInt(req.query['limit'] as string, 10)  : 50,
        offset:    req.query['offset'] ? parseInt(req.query['offset'] as string, 10) : 0,
      };

      try {
        const conditions: string[] = [];
        const params: unknown[] = [];
        let paramIdx = 1;

        if (filter.zone) {
          conditions.push(`w.zone = $${paramIdx++}`);
          params.push(filter.zone);
        }
        if (filter.status) {
          conditions.push(`c.status = $${paramIdx++}`);
          params.push(filter.status);
        }
        if (filter.from_date) {
          conditions.push(`c.created_at >= $${paramIdx++}`);
          params.push(filter.from_date);
        }
        if (filter.to_date) {
          conditions.push(`c.created_at <= $${paramIdx++}`);
          params.push(filter.to_date);
        }
        if (filter.worker_id) {
          conditions.push(`c.worker_id = $${paramIdx++}`);
          params.push(filter.worker_id);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        params.push(filter.limit, filter.offset);

        const sql = `
          SELECT c.*, w.name as worker_name, w.zone, w.city
          FROM claims c
          JOIN workers w ON c.worker_id = w.id
          ${whereClause}
          ORDER BY c.created_at DESC
          LIMIT $${paramIdx++} OFFSET $${paramIdx}
        `;

        const result = await query<Claim>(sql, params);
        return res.json({ success: true, data: result.rows, total: result.rowCount });
      } catch (dbErr) {
        // If database error, return empty array as fallback
        console.error('[claims GET /] DB error:', dbErr);
        return res.json({ success: true, data: [], total: 0 });
      }
    } catch (err) {
      return next(err);
    }
  }
);

// GET /api/claims/:id
router.get(
  '/:id',
  [param('id').isUUID()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return next(createError('Invalid claim ID', 400));

      const result = await query<Claim>(
        `SELECT c.*, w.name as worker_name, w.zone, w.city, w.platform,
                p.tier, p.max_weekly_payout
         FROM claims c
         JOIN workers w ON c.worker_id = w.id
         JOIN policies p ON c.policy_id = p.id
         WHERE c.id = $1`,
        [req.params['id']]
      );
      if (result.rows.length === 0) return next(createError('Claim not found', 404));

      return res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      return next(err);
    }
  }
);

// POST /api/claims/:id/verify-otp
router.post(
  '/:id/verify-otp',
  [
    param('id').isUUID(),
    body('otp').isLength({ min: 4, max: 8 }).withMessage('OTP must be 4-8 digits'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return next(createError(errors.array()[0]?.msg ?? 'Validation error', 400));

      const claimResult = await query<Claim>('SELECT * FROM claims WHERE id = $1', [req.params['id']]);
      if (claimResult.rows.length === 0) return next(createError('Claim not found', 404));

      const claim = claimResult.rows[0];
      if (claim.status !== 'fast_verify') {
        return next(createError(`Claim is in '${claim.status}' status — OTP verification not applicable`, 400));
      }

      // MOCK IMPLEMENTATION: In production, validate OTP against a time-limited value
      // stored (e.g. in Redis) when the fast_verify status was set. The OTP would be
      // sent via SMS to the worker's registered phone number.
      // Current mock: accepts any numeric string of 4+ digits.
      const otp = String(req.body.otp);
      const isValid = otp.length >= 4 && /^\d+$/.test(otp);

      if (!isValid) {
        return next(createError('Invalid OTP format', 400));
      }

      const policyResult = await query<Policy>('SELECT * FROM policies WHERE id = $1', [claim.policy_id]);
      const policy = policyResult.rows[0];
      const payoutAmount = computePayoutAmount(policy, claim.trigger_details, claim.trigger_type);

      await query(
        "UPDATE claims SET status = 'approved', payout_amount = $1, resolved_at = NOW() WHERE id = $2",
        [payoutAmount, claim.id]
      );

      const paymentResult = await processPayment({
        amount: payoutAmount,
        worker_id: claim.worker_id,
        claim_id: claim.id,
        method: 'upi',
      });

      const payoutId = uuidv4();
      await query(
        `INSERT INTO payouts (id, claim_id, worker_id, amount, method, status, transaction_ref, completed_at)
         VALUES ($1,$2,$3,$4,'upi',$5,$6,$7)`,
        [
          payoutId, claim.id, claim.worker_id, payoutAmount,
          paymentResult.success ? 'completed' : 'failed',
          paymentResult.transaction_ref ?? null,
          paymentResult.success ? new Date().toISOString() : null,
        ]
      );

      const updatedClaim = await query<Claim>('SELECT * FROM claims WHERE id = $1', [claim.id]);
      const payoutRow = await query<Payout>('SELECT * FROM payouts WHERE id = $1', [payoutId]);

      return res.json({
        success: true,
        data: {
          claim: updatedClaim.rows[0],
          payout: payoutRow.rows[0],
        },
      });
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
