-- Q-Shield PostgreSQL Schema
-- Run this file to initialize the database

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Workers table
CREATE TABLE IF NOT EXISTS workers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(255) NOT NULL,
  phone            VARCHAR(20)  NOT NULL UNIQUE,
  email            VARCHAR(255),
  aadhaar_hash     VARCHAR(64)  NOT NULL UNIQUE,
  platform         VARCHAR(50)  NOT NULL,
  city             VARCHAR(100) NOT NULL,
  zone             VARCHAR(100) NOT NULL,
  delivery_hours_per_day DECIMAL(4,1) NOT NULL DEFAULT 8,
  tenure_weeks     INTEGER      NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Policies table
CREATE TABLE IF NOT EXISTS policies (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id        UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  tier             VARCHAR(20) NOT NULL CHECK (tier IN ('basic', 'standard', 'pro')),
  base_premium     DECIMAL(10,2) NOT NULL,
  adjusted_premium DECIMAL(10,2) NOT NULL,
  max_weekly_payout DECIMAL(10,2) NOT NULL,
  coverage_start   DATE NOT NULL,
  coverage_end     DATE NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Claims table
CREATE TABLE IF NOT EXISTS claims (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id        UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  worker_id        UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  trigger_type     VARCHAR(20) NOT NULL
                   CHECK (trigger_type IN ('weather', 'zone_closure', 'pollution')),
  trigger_details  JSONB NOT NULL DEFAULT '{}',
  gps_lat          DECIMAL(10,7),
  gps_lng          DECIMAL(10,7),
  fraud_score      DECIMAL(5,4),
  status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'auto_approved', 'fast_verify',
                                     'manual_review', 'approved', 'rejected')),
  payout_amount    DECIMAL(10,2),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at      TIMESTAMPTZ
);

-- Payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id         UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  worker_id        UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  amount           DECIMAL(10,2) NOT NULL,
  method           VARCHAR(20)   NOT NULL DEFAULT 'upi',
  status           VARCHAR(20)   NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_ref  VARCHAR(255),
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_policies_worker_id     ON policies(worker_id);
CREATE INDEX IF NOT EXISTS idx_policies_status        ON policies(status);
CREATE INDEX IF NOT EXISTS idx_claims_policy_id       ON claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_claims_worker_id       ON claims(worker_id);
CREATE INDEX IF NOT EXISTS idx_claims_status          ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_trigger_type    ON claims(trigger_type);
CREATE INDEX IF NOT EXISTS idx_claims_created_at      ON claims(created_at);
CREATE INDEX IF NOT EXISTS idx_payouts_claim_id       ON payouts(claim_id);
CREATE INDEX IF NOT EXISTS idx_payouts_worker_id      ON payouts(worker_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status         ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_workers_zone           ON workers(zone);
CREATE INDEX IF NOT EXISTS idx_workers_city           ON workers(city);
