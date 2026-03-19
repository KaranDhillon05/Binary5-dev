export type Platform = 'swiggy' | 'zomato' | 'blinkit' | 'zepto' | 'dunzo' | 'other';

export interface Worker {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  aadhaar_hash: string;
  platform: Platform;
  city: string;
  zone: string;
  delivery_hours_per_day: number;
  tenure_weeks: number;
  created_at: Date;
}

export interface CreateWorkerDTO {
  name: string;
  phone: string;
  email?: string;
  aadhaar: string;
  platform: Platform;
  city: string;
  zone: string;
  delivery_hours_per_day: number;
  tenure_weeks: number;
}

export interface WorkerRiskProfile {
  risk_multiplier: number;
  risk_factors: string[];
  suggested_tier: 'basic' | 'standard' | 'pro';
  estimated_weekly_premium: number;
}
