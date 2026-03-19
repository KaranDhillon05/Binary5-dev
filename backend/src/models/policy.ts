export type PolicyTier = 'basic' | 'standard' | 'pro';
export type PolicyStatus = 'active' | 'expired' | 'cancelled';

export interface TierConfig {
  base_premium: number;
  max_weekly_payout: number;
  label: string;
}

export const TIER_CONFIG: Record<PolicyTier, TierConfig> = {
  basic: {
    base_premium: 35,
    max_weekly_payout: 500,
    label: 'Basic Shield',
  },
  standard: {
    base_premium: 65,
    max_weekly_payout: 1000,
    label: 'Standard Shield',
  },
  pro: {
    base_premium: 99,
    max_weekly_payout: 1800,
    label: 'Pro Shield',
  },
};

export interface Policy {
  id: string;
  worker_id: string;
  tier: PolicyTier;
  base_premium: number;
  adjusted_premium: number;
  max_weekly_payout: number;
  coverage_start: Date;
  coverage_end: Date;
  status: PolicyStatus;
  created_at: Date;
}

export interface CreatePolicyDTO {
  worker_id: string;
  tier: PolicyTier;
}
