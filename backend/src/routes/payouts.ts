import { Router, Request, Response, NextFunction } from 'express';
import { param, query as queryValidator, validationResult } from 'express-validator';
import { query } from '../config/db';
import { Payout, PayoutFilter } from '../models/payout';
import { createError } from '../middleware/errorHandler';

const router = Router();

// GET /api/payouts
router.get(
  '/',
  [
    queryValidator('worker_id').optional().isUUID(),
    queryValidator('status').optional().isIn(['pending', 'completed', 'failed']),
    queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
    queryValidator('offset').optional().isInt({ min: 0 }),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: PayoutFilter = {
        worker_id: req.query['worker_id'] as string | undefined,
        status:    req.query['status'] as PayoutFilter['status'],
        limit:     req.query['limit']  ? parseInt(req.query['limit'] as string, 10)  : 50,
        offset:    req.query['offset'] ? parseInt(req.query['offset'] as string, 10) : 0,
      };

      const conditions: string[] = [];
      const params: unknown[] = [];
      let paramIdx = 1;

      if (filter.worker_id) {
        conditions.push(`p.worker_id = $${paramIdx++}`);
        params.push(filter.worker_id);
      }
      if (filter.status) {
        conditions.push(`p.status = $${paramIdx++}`);
        params.push(filter.status);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      params.push(filter.limit, filter.offset);

      const sql = `
        SELECT p.*, w.name as worker_name, w.zone, c.trigger_type
        FROM payouts p
        JOIN workers w ON p.worker_id = w.id
        JOIN claims c ON p.claim_id = c.id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT $${paramIdx++} OFFSET $${paramIdx}
      `;

      const result = await query<Payout>(sql, params);
      return res.json({ success: true, data: result.rows, total: result.rowCount });
    } catch (err) {
      return next(err);
    }
  }
);

// GET /api/payouts/:id
router.get(
  '/:id',
  [param('id').isUUID()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return next(createError('Invalid payout ID', 400));

      const result = await query<Payout>(
        `SELECT p.*, w.name as worker_name, w.phone, w.zone, w.city,
                c.trigger_type, c.payout_amount as claim_payout_amount
         FROM payouts p
         JOIN workers w ON p.worker_id = w.id
         JOIN claims c ON p.claim_id = c.id
         WHERE p.id = $1`,
        [req.params['id']]
      );
      if (result.rows.length === 0) return next(createError('Payout not found', 404));

      return res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
