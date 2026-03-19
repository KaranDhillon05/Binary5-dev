export type TriggerType = 'weather' | 'zone_closure' | 'pollution';
export type ClaimStatus =
  | 'pending'
  | 'auto_approved'
  | 'fast_verify'
  | 'manual_review'
  | 'approved'
  | 'rejected';

export interface WeatherTriggerDetails {
  condition: 'red_alert' | 'heavy_rain' | 'moderate_rain' | 'light_rain';
  rainfall_mm?: number;
  alert_level?: string;
  description?: string;
  temperature?: number;
  city?: string;
  zone?: string;
}

export interface ZoneClosureTriggerDetails {
  reason: 'flood' | 'protest' | 'accident' | 'government_order' | 'other';
  zone: string;
  description?: string;
  authority?: string;
}

export interface PollutionTriggerDetails {
  aqi: number;
  category: 'hazardous' | 'very_unhealthy';
  heat_composite?: boolean;
  temperature?: number;
  pollutants?: Record<string, number>;
  city?: string;
  zone?: string;
}

export type TriggerDetails =
  | WeatherTriggerDetails
  | ZoneClosureTriggerDetails
  | PollutionTriggerDetails;

export interface Claim {
  id: string;
  policy_id: string;
  worker_id: string;
  trigger_type: TriggerType;
  trigger_details: TriggerDetails;
  gps_lat: number | null;
  gps_lng: number | null;
  fraud_score: number | null;
  status: ClaimStatus;
  payout_amount: number | null;
  created_at: Date;
  resolved_at: Date | null;
}

export interface CreateClaimDTO {
  policy_id: string;
  worker_id: string;
  trigger_type: TriggerType;
  trigger_details: TriggerDetails;
  gps_lat?: number;
  gps_lng?: number;
}

export interface ClaimFilter {
  zone?: string;
  status?: ClaimStatus;
  from_date?: string;
  to_date?: string;
  worker_id?: string;
  limit?: number;
  offset?: number;
}
