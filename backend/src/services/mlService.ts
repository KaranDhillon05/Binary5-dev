import axios from 'axios';
import { env } from '../config/env';
import { Worker } from '../models/worker';
import { Claim } from '../models/claim';

export interface RiskScoreInput {
  worker: Worker;
  zone_type?: 'flood_prone' | 'flood_safe' | 'normal';
  predicted_high_disruption?: boolean;
}

export interface RiskScoreOutput {
  risk_multiplier: number;
  risk_factors: string[];
}

export interface FraudScoreInput {
  claim: Partial<Claim>;
  worker: Worker;
  recent_claims_count: number;
  days_since_last_claim: number | null;
  similar_zone_claims_today: number;
}

export interface FraudScoreOutput {
  fraud_score: number;
  reasoning: string[];
}

function isMonsoonSeason(): boolean {
  const month = new Date().getMonth() + 1;
  return month >= 6 && month <= 9;
}

export function calculateRiskMultiplierLocally(input: RiskScoreInput): RiskScoreOutput {
  let multiplier = 1.0;
  const factors: string[] = [];

  if (isMonsoonSeason()) {
    multiplier += 0.15;
    factors.push('Monsoon season (+15%)');
  }

  if (input.zone_type === 'flood_prone') {
    multiplier += 0.10;
    factors.push('Flood-prone zone (+10%)');
  } else if (input.zone_type === 'flood_safe') {
    multiplier -= 0.08;
    factors.push('Flood-safe zone (-8%)');
  }

  if (input.worker.tenure_weeks < 4) {
    multiplier += 0.05;
    factors.push('New worker (<4 weeks) (+5%)');
  }

  if (input.predicted_high_disruption) {
    multiplier += 0.12;
    factors.push('Predicted high-disruption week (+12%)');
  }

  return {
    risk_multiplier: parseFloat(Math.max(0.5, multiplier).toFixed(4)),
    risk_factors: factors,
  };
}

export function calculateFraudScoreLocally(input: FraudScoreInput): FraudScoreOutput {
  let score = 0.1;
  const reasoning: string[] = [];

  if (input.recent_claims_count > 3) {
    score += 0.25;
    reasoning.push(`High recent claim frequency: ${input.recent_claims_count} in last 30 days`);
  } else if (input.recent_claims_count > 1) {
    score += 0.1;
    reasoning.push(`Multiple recent claims: ${input.recent_claims_count}`);
  }

  if (input.days_since_last_claim !== null && input.days_since_last_claim < 2) {
    score += 0.2;
    reasoning.push('Claim submitted very soon after previous claim');
  }

  if (input.similar_zone_claims_today > 10) {
    score -= 0.15;
    reasoning.push(`Mass event likely — ${input.similar_zone_claims_today} zone claims today`);
  }

  if (input.worker.tenure_weeks < 2) {
    score += 0.15;
    reasoning.push('Very new worker (< 2 weeks)');
  }

  if (!input.claim.gps_lat || !input.claim.gps_lng) {
    score += 0.1;
    reasoning.push('No GPS coordinates provided');
  }

  return {
    fraud_score: parseFloat(Math.min(1.0, Math.max(0, score)).toFixed(4)),
    reasoning,
  };
}

export async function getRiskScore(input: RiskScoreInput): Promise<RiskScoreOutput> {
  try {
    const response = await axios.post<RiskScoreOutput>(
      `${env.ML_SERVICE_URL}/score/risk`,
      { worker: input.worker, zone_type: input.zone_type, predicted_high_disruption: input.predicted_high_disruption },
      { timeout: 3000 }
    );
    return response.data;
  } catch {
    console.warn('[MLService] Risk score endpoint unavailable, using local calculation');
    return calculateRiskMultiplierLocally(input);
  }
}

export async function getFraudScore(input: FraudScoreInput): Promise<FraudScoreOutput> {
  try {
    const response = await axios.post<FraudScoreOutput>(
      `${env.ML_SERVICE_URL}/score/fraud`,
      input,
      { timeout: 3000 }
    );
    return response.data;
  } catch {
    console.warn('[MLService] Fraud score endpoint unavailable, using local calculation');
    return calculateFraudScoreLocally(input);
  }
}
