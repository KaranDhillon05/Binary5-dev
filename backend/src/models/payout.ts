export type PayoutStatus = 'pending' | 'completed' | 'failed';
export type PayoutMethod = 'upi' | 'bank_transfer';

export interface Payout {
  id: string;
  claim_id: string;
  worker_id: string;
  amount: number;
  method: PayoutMethod;
  status: PayoutStatus;
  transaction_ref: string | null;
  created_at: Date;
  completed_at: Date | null;
}

export interface CreatePayoutDTO {
  claim_id: string;
  worker_id: string;
  amount: number;
  method?: PayoutMethod;
}

export interface PayoutFilter {
  worker_id?: string;
  status?: PayoutStatus;
  limit?: number;
  offset?: number;
}
