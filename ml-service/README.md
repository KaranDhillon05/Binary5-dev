# Q-Shield ML Service

A Python FastAPI microservice providing ML-powered risk scoring, fraud detection, and ring detection for the Q-Shield parametric income insurance platform.

---

## Overview

The Q-Shield ML Service exposes three groups of endpoints:

| Group | Endpoint | Purpose |
|-------|----------|---------|
| Scoring | `POST /score/risk` | GBT-based worker risk multiplier (0.8–1.3) |
| Scoring | `POST /score/fraud` | Weighted multi-signal fraud scoring (0–1) |
| Ring Detection | `POST /rings/detect` | DBSCAN-based claim ring detection |
| Ring Detection | `GET /rings/status` | Active ring alerts |
| Health | `GET /health` | Service liveness check |

---

## Quick Start

```bash
cd ml-service

# Install dependencies
pip install -r requirements.txt

# Copy and edit environment variables
cp .env.example .env

# Start the service (models auto-train on first run)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The service will automatically generate synthetic training data and train the GBT risk model on first startup if no saved models are found.

---

## Folder Structure

```
ml-service/
  main.py                  # FastAPI app entry point
  requirements.txt
  .env.example
  app/
    config.py              # Settings via pydantic-settings
    models/
      risk_model.py        # GradientBoostingRegressor risk scoring
      fraud_model.py       # Weighted multi-signal fraud scoring
      ring_detector.py     # DBSCAN ring detection
    routes/
      health.py            # GET /health
      scoring.py           # POST /score/risk, /score/fraud
      rings.py             # POST /rings/detect, GET /rings/status
    schemas/
      risk.py              # WorkerRiskInput / RiskScoreOutput
      fraud.py             # ClaimFraudInput / FraudScoreOutput
      rings.py             # RingDetectionInput / RingDetectionOutput
    data/
      synthetic_data.py    # Synthetic training data generator
      training.py          # Model training script
```

---

## API Reference

### POST /score/risk

Scores a worker's risk profile and returns a multiplier used to adjust their insurance premium.

**Request body:**
```json
{
  "zone": "Koramangala",
  "city": "Bengaluru",
  "tenure_weeks": 12,
  "delivery_hours_per_day": 8,
  "platform": "zepto",
  "month": 7,
  "season": "monsoon"
}
```

**Response:**
```json
{
  "risk_multiplier": 1.18,
  "breakdown": {
    "base": 1.0,
    "monsoon_adjustment": 0.15,
    "zone_adjustment": 0.1,
    "tenure_adjustment": 0.0,
    "platform_adjustment": 0.1,
    "model": "gbt"
  },
  "recommended_tier": "standard"
}
```

**Recommended tier mapping:**
- `≤ 0.95` → `"low_risk"`
- `0.95–1.10` → `"standard"`
- `> 1.10` → `"high_risk"`

---

### POST /score/fraud

Scores an insurance claim across six fraud signals and returns a decision.

**Request body:**
```json
{
  "claim_id": "CLM-001",
  "worker_id": "W-123",
  "zone": "HSR Layout",
  "gps_lat": 12.9116,
  "gps_lng": 77.6389,
  "ip_address": "103.21.58.10",
  "device_fingerprint": {
    "os": "Android",
    "dev_mode": false,
    "rooted": false,
    "screen_resolution": "1080x2340",
    "carrier": "Jio"
  },
  "network_type": "mobile_data",
  "weather_data": {
    "condition": "heavy_rain",
    "reported_by_worker": "heavy_rain"
  },
  "claim_type": "weather_disruption",
  "claimed_amount": 350.0,
  "trip_history": [
    {"lat": 12.91, "lng": 77.63, "timestamp": "2024-01-15T10:00:00"},
    {"lat": 12.92, "lng": 77.64, "timestamp": "2024-01-15T10:05:00"}
  ],
  "timestamp": "2024-01-15T10:10:00"
}
```

**Response:**
```json
{
  "fraud_score": 0.12,
  "decision": "auto_approve",
  "signal_breakdown": {
    "ip_mismatch_score": 0.0,
    "device_anomaly_score": 0.0,
    "network_pattern_score": 0.1,
    "weather_coherence_score": 0.0,
    "trip_history_score": 0.1,
    "velocity_score": 0.0
  }
}
```

**Decision thresholds:**
- `fraud_score < 0.3` → `"auto_approve"`
- `0.3 ≤ fraud_score ≤ 0.7` → `"fast_verify"`
- `fraud_score > 0.7` → `"manual_review"`

---

### POST /rings/detect

Runs DBSCAN clustering on a batch of claims to detect coordinated fraud rings.

**Request body:**
```json
{
  "claims": [
    {
      "claim_id": "CLM-001",
      "worker_id": "W-001",
      "zone": "Koramangala",
      "timestamp": "2024-01-15T10:00:00",
      "fraud_score": 0.65,
      "device_fingerprint": {"os": "Android", "carrier": "Jio", "screen_resolution": "1080x2340"},
      "ip_address": "103.21.58.10",
      "gps_lat": 12.935,
      "gps_lng": 77.624
    }
  ]
}
```

**Response:**
```json
{
  "is_ring": true,
  "cluster_count": 2,
  "suspicious_claims": ["CLM-001", "CLM-003"],
  "recommendation": "Escalate cluster of 2 claims to fraud investigation team. Avg fraud score: 0.72."
}
```

---

### GET /rings/status

Returns all currently active ring alerts in memory.

---

### GET /health

Returns service health and model status.

```json
{
  "status": "ok",
  "models": {
    "risk_model": "trained",
    "fraud_model": "ready",
    "ring_detector": "ready"
  },
  "version": "1.0.0"
}
```

---

## Risk Model Logic

### GBT Features

| Feature | Description |
|---------|-------------|
| `zone_risk_score` | Encoded zone-level historical risk (0.5–1.5) |
| `weather_disruption_frequency` | Zone-level historical disruption rate |
| `delivery_hours_per_day` | Daily working hours |
| `tenure_weeks` | Worker tenure in weeks |
| `season_score` | 1.3 for monsoon (Jun–Sep), 1.0 otherwise |
| `platform_score` | 1.1 for zepto/blinkit, 1.0 for others |
| `month` | Calendar month (1–12) |

### Fallback Rule-Based Logic (when model not trained)

| Condition | Adjustment |
|-----------|-----------|
| Base | 1.0 |
| Monsoon (Jun–Sep) | +0.15 |
| Flood-prone zone | +0.10 |
| Flood-safe zone | −0.08 |
| New worker (< 4 weeks) | +0.05 |
| 0 claims last 3 months | −0.05 |
| Predicted high-disruption | +0.12 |
| **Clamp** | [0.8, 1.3] |

---

## Fraud Signal Weights

```
fraud_score = (
  0.20 × ip_mismatch_score +
  0.20 × device_anomaly_score +
  0.15 × network_pattern_score +
  0.25 × weather_coherence_score +
  0.10 × trip_history_score +
  0.10 × velocity_score
)
```

---

## Ring Detection Signals

- **Temporal clustering**: 50+ claims in 15-min window in same zone
- **Shared device fingerprint**: same OS + screen resolution + carrier
- **IP subnet overlap**: multiple claims from same /24 subnet
- **Onboarding spike**: 50+ new accounts in same locality in 72 hours
- **Claim velocity**: 10× zone baseline

DBSCAN parameters (`eps=0.5`, `min_samples=3`) are tunable via `.env`.
