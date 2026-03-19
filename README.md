# Q-Shield: AI-Powered Parametric Income Insurance for Q-Commerce Delivery Workers

> **Guidewire DEVTrails 2026 | Phase 1 Submission**  
> Protecting the last-mile workforce — one week at a time.

---

## Table of Contents

1. [The Problem](#the-problem)
2. [Our Persona](#our-persona)
3. [Solution Overview](#solution-overview)
4. [Weekly Premium Model](#weekly-premium-model)
5. [Parametric Triggers](#parametric-triggers)
6. [Application Workflow](#application-workflow)
7. [AI/ML Integration Plan](#aiml-integration-plan)
8. [Adversarial Defense & Anti-Spoofing Strategy](#adversarial-defense--anti-spoofing-strategy)
9. [Architecture Overview](#architecture-overview)
10. [Tech Stack](#tech-stack)
11. [Platform Choice: Web (PWA)](#platform-choice-web-pwa)

---

## The Problem

India's q-commerce delivery workers (Zepto, Blinkit, Swiggy Instamart) operate on razor-thin margins with zero safety net. A single disruption — a flash flood in Koramangala, a sudden zone curfew, or a severe AQI spike — can wipe out **20–30% of their weekly income** overnight.

When orders stop, earnings stop. There is no employer backup, no union protection, and no insurance product designed for their reality.

**Q-Shield changes that.**

---

## Our Persona

### Arjun, 26 — Zepto Delivery Partner, Bengaluru

| Attribute | Detail |
|-----------|--------|
| Platform | Zepto (primary), Blinkit (secondary) |
| City | Bengaluru (operates across Koramangala, HSR Layout, Indiranagar) |
| Weekly Earnings | ₹4,500 – ₹6,000 |
| Work Hours | 8–10 hrs/day, 6 days/week |
| Vehicle | Electric two-wheeler |
| Risk Exposure | Bengaluru monsoon floods, traffic lockdowns, AQI spikes (Oct–Nov) |

**The scenario that breaks Arjun:**
It's a Tuesday evening in July. Heavy rain triggers a red alert in 3 zones. Orders are suspended by the platform. Arjun loses ₹800–₹1,200 that day — with no recourse. This happens 6–8 times per monsoon season. Q-Shield pays out automatically, within minutes, with no claim form required.

---

## Solution Overview

Q-Shield is a **parametric income insurance platform** — meaning payouts are triggered by verifiable external events (weather, zone status, pollution data), not subjective loss assessments. No paperwork. No adjuster. No waiting.

**Coverage scope (strictly income loss only):**
- Lost earnings due to weather disruptions
- Lost earnings due to zone/area closures or curfews
- Lost earnings due to severe pollution (AQI > 300)
- Vehicle repairs (excluded)
- Health/accident/life insurance (excluded)

---

## Weekly Premium Model

Premiums are structured on a **weekly basis** to match the typical earnings cycle of a gig worker. Workers pay weekly, and coverage resets each Monday.

### Base Premium Table

| Coverage Tier | Weekly Premium | Max Weekly Payout | Best For |
|--------------|---------------|-------------------|----------|
| Basic Shield | ₹35/week | ₹500 | Part-time workers (<5 hrs/day) |
| Standard Shield | ₹65/week | ₹1,000 | Regular workers (5–8 hrs/day) |
| Pro Shield | ₹99/week | ₹1,800 | Full-time workers (8+ hrs/day) |

### Dynamic Risk Multipliers (AI-Adjusted)

The base premium is adjusted weekly by our ML risk engine based on:

| Risk Factor | Adjustment | Rationale |
|-------------|-----------|-----------|
| Monsoon season (Jun–Sep) | +15% | Higher disruption probability |
| Worker's zone has flood history | +10% | Zone-level historical risk |
| Worker's zone is flood-safe | -8% | Reward low-risk zones |
| New worker (< 4 weeks) | +5% | Limited behavioral baseline |
| Worker with 0 claims (3+ months) | -5% | Loyalty/low-risk bonus |
| Predicted high-disruption week (weather model) | +12% | Forward-looking risk pricing |

**Example:** Arjun (Standard Shield, Koramangala zone, July monsoon season):
`₹65 × 1.15 (monsoon) × 1.10 (flood-prone zone) = ₹82/week`

---

## Parametric Triggers

Q-Shield monitors **3 disruption categories** in real time using external APIs. When a threshold is crossed in a worker's active delivery zone, a claim is initiated automatically — no worker action required.

### Trigger 1: Extreme Weather (Rain / Flood)

| Parameter | Source | Threshold | Payout |
|-----------|--------|-----------|--------|
| Rainfall intensity | OpenWeather API | > 15mm/hr OR Red Alert issued | 50–100% of daily coverage |
| Flood zone activation | IMD / mock civic API | Zone flagged as flooded | 100% of daily coverage |

**Example:** IMD issues a Red Alert for Bengaluru South. All active Q-Shield workers in that zone receive an automatic payout notification within 10 minutes.

### Trigger 2: Zone/Area Closure

| Parameter | Source | Threshold | Payout |
|-----------|--------|-----------|--------|
| Curfew / Section 144 | Government API / mock | Zone closure confirmed | 80% of daily coverage |
| Platform-side surge suspension | Mock platform API | Delivery suspension > 2 hrs | 60% of daily coverage |

### Trigger 3: Severe Air Pollution

| Parameter | Source | Threshold | Payout |
|-----------|--------|-----------|--------|
| AQI index | CPCB API / OpenAQ | AQI > 300 (Hazardous) | 50% of daily coverage |
| AQI + heat index combined | Composite score | Score > threshold | 70% of daily coverage |

---

## Application Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  ONBOARDING (5 min)                                         │
│  Worker registers → uploads platform ID + Aadhaar           │
│  ML engine builds risk profile → generates weekly quote     │
│  Worker selects tier → pays via UPI/wallet                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  ACTIVE COVERAGE                                            │
│  System monitors OpenWeather + AQI + Zone APIs 24/7         │
│  Worker app shows: active coverage, zone risk level,        │
│  current weather alerts                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  DISRUPTION DETECTED                                        │
│  Parametric trigger fires → claim auto-initiated            │
│  ML fraud engine scores claim (<10 seconds)                 │
│  Score < 0.3 → Auto-approve + instant payout               │
│  Score 0.3–0.7 → Fast verification (OTP + GPS retry)        │
│  Score > 0.7 → Manual review queue                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  PAYOUT                                                     │
│  UPI / wallet transfer within 15 minutes of approval        │
│  Worker notified via push + SMS                             │
│  Claim logged to history for future risk modeling           │
└─────────────────────────────────────────────────────────────┘
```

---

## AI/ML Integration Plan

### 1. Risk Scoring (Premium Calculation)

**Model:** Gradient Boosted Tree (scikit-learn / XGBoost)  
**Input features:**
- Worker's delivery zone (encoded)
- Historical weather disruption frequency per zone
- Worker's delivery hours and tenure
- Season / month
- Platform type (q-commerce vs food vs e-commerce)

**Output:** Risk multiplier (0.8x – 1.3x) applied to base premium  
**Training data:** Synthetic data (Phase 1) → real claims data (Phase 2+)

### 2. Fraud Detection (Claim Scoring)

**Model:** Weighted multi-signal scoring + DBSCAN cluster detection  
**Input signals:**
- GPS coordinates vs weather API zone match
- Device fingerprint (emulator detection)
- Network stability pattern
- Behavioral velocity (movement speed checks)
- Temporal + spatial claim clustering

**Output:** Fraud score (0–1) → auto-approve / flag / reject  
**See full detail:** [Adversarial Defense section below](#adversarial-defense--anti-spoofing-strategy)

### 3. Predictive Weather Risk (Phase 2)

**Model:** Time-series regression on historical IMD data  
**Purpose:** Forward-looking premium adjustment (predicting risky weeks)

---

## Adversarial Defense & Anti-Spoofing Strategy

> This section directly addresses the **Market Crash Scenario** (March 2026): a 500-worker GPS-spoofing syndicate that drained a competitor's liquidity pool via coordinated false claims.

### 1. The Differentiation: Real Worker vs GPS Spoofer

**Simple GPS verification is obsolete.** Q-Shield uses a **multi-signal verification stack** that cross-validates every claim against 6 independent signals simultaneously, making GPS spoofing alone completely ineffective.

| Signal | What We Check | Why It's Hard to Fake |
|--------|--------------|----------------------|
| **Coarse IP Location** | City/district from IP + carrier data | GPS can be faked; carrier cell-tower location cannot easily be spoofed remotely |
| **Device Fingerprint** | OS version, screen resolution, dev mode status, rooted device flag | Spoofers typically use emulators or developer tools with detectable signatures |
| **Network Stability Pattern** | WiFi vs mobile data, signal drop frequency | Real workers in a flood zone show unstable-but-consistent mobile data; a home spoofer shows stable WiFi |
| **Weather Coherence** | API-reported weather at claimed location vs worker's claim | If the worker claims "heavy rain, zone A" but OpenWeather shows clear skies at that GPS coordinate — instant red flag |
| **Trip History Consistency** | Historical delivery routes, average speed, zone frequency | Real workers have organic, consistent routes; GPS spoofers show unnatural teleportation or perfect grid patterns |
| **Behavioral Velocity** | Time-delta between location pings vs physically possible travel speed | Claiming to be in two zones within an impossible timeframe is an automatic flag |

**Scoring logic:**

Each signal produces a risk score between 0 and 1. The total fraud score is a **weighted average** of all six signals:

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

| Fraud Score | Decision | % of Claims (estimated) |
|-------------|----------|------------------------|
| < 0.3 | Auto-approve + instant payout | ~70% |
| 0.3 – 0.7 | Fast verification required | ~20% |
| > 0.7 | Reject / manual review | ~10% |

---

### 2. The Data: Detecting Coordinated Fraud Rings

The 500-worker syndicate scenario is not isolated fraud — it is **coordinated collusion**. Individual fraud scores may look borderline acceptable. Ring detection catches what individual scoring misses.

**Data points analyzed beyond GPS:**

- **Temporal clustering:** Multiple workers claiming disruption in the same zone within a 15-minute window. Normal baseline: 0–2 claims. Syndicate pattern: 50+ claims simultaneously.
- **Shared device fingerprint buckets:** Same OS version + screen size + carrier combination across many accounts signals coordinated device provisioning.
- **IP range overlap:** Multiple claims originating from the same subnet or ISP block in a residential area while claiming to be across the city.
- **Onboarding spike detection:** 50+ new accounts registered in the same locality within 72 hours is flagged as a potential ring pre-staging.
- **Claim velocity per zone:** Each zone has a historical baseline of claims per disruption event. Statistical outliers (e.g., 10× baseline) trigger ring-level review.

**Implementation — DBSCAN Cluster Detection:**

```python
# Pseudocode: Ring detection logic
claims_window = get_claims(zone=X, time_bucket=T)  # 15-min window

if len(claims_window) > CLUSTER_THRESHOLD:          # e.g., 10+ claims
    avg_fraud_score = mean([c.fraud_score for c in claims_window])
    shared_device_ratio = count_shared_fingerprints(claims_window)
    
    if avg_fraud_score > 0.4 OR shared_device_ratio > 0.3:
        flag_as_ring(claims_window)
        suspend_payouts(zone=X, duration="pending_review")
        alert_admin_dashboard()
```

**Real scenario:** 500 workers claiming "flood in Koramangala" at 8:47 PM while OpenWeather API shows clear skies → weather coherence score spikes to 0.95 for all claims → ring flag triggers immediately → entire batch suspended within seconds.

---

### 3. The UX Balance: Protecting Honest Workers

A Bengaluru delivery worker in an actual flood faces real compounding problems: poor GPS signal near dark stores, unstable 4G in waterlogged zones, and legitimate location anomalies (taking shelter in a different zone than their delivery route).

**Q-Shield's progressive verification flow ensures honest workers are never unfairly penalized:**

```
Claim submitted
│
├── Fraud Score < 0.3
│   └── Auto-approve → payout in <15 min
│       (No action required from worker)
│
├── Fraud Score 0.3 – 0.7
│   └── Fast Verification (max 5 minutes total)
│       ├── Push notification: "Confirm you're safe — tap to verify"
│       ├── One-tap OTP confirmation
│       └── Optional: retry GPS ping + accelerometer (proves stationary)
│           └── On pass → approve
│           └── On fail → escalate to manual
│
└── Fraud Score > 0.7
    └── Manual Review Queue
        ├── Admin dashboard surfaces the claim with all signal breakdown
        ├── Optional LLM analyst summarizes anomalies
        └── Human reviewer approves / rejects within 2 hours
```

**Key fairness principles baked into the system:**

1. **Never block an honest claim longer than 5 minutes** — the fast verification path is designed to be completable on a 2G connection with one hand while sheltering from rain.
2. **Network drops are not penalised** — we use "last known good location" + weather API correlation as the primary truth source, not real-time GPS lock.
3. **Zone-level context awareness** — if a disruption trigger (Red Alert) has already fired for that zone, the bar for individual claim approval is lowered, since the event is already independently verified.
4. **Human escalation is always available** — no worker is permanently rejected by an algorithm alone. Every fraud score > 0.7 goes to a human reviewer.
5. **Transparent feedback** — if a claim is flagged, the worker sees a plain-language explanation ("We're verifying your location — tap here to confirm") rather than a cryptic denial.

---

## Architecture Overview

```
┌─────────────────┐       ┌──────────────────────────────┐
│   Worker App    │──────▶│     Next.js Frontend (PWA)   │
│ (Mobile / Web)  │       │  Worker Portal + Admin View  │
└─────────────────┘       └──────────────┬───────────────┘
                                         │
                          ┌──────────────▼───────────────┐
                          │    Node.js / Express API     │
                          │  - Policy management          │
                          │  - Claim processing           │
                          │  - Trigger monitoring         │
                          │  - External API calls         │
                          └──────┬───────────┬────────────┘
                                 │           │
               ┌─────────────────▼──┐   ┌───▼────────────────┐
               │  PostgreSQL DB     │   │  Python ML Service │
               │  - Worker profiles │   │  (FastAPI)         │
               │  - Policies        │   │  - Risk scoring    │
               │  - Claims          │   │  - Fraud detection │
               │  - Payouts         │   │  - Ring detection  │
               └────────────────────┘   └────────────────────┘
                                                │
                          ┌─────────────────────▼────────────┐
                          │        External Data Sources     │
                          │  - OpenWeather API               │
                          │  - OpenAQ (pollution data)       │
                          │  - Mapbox (zone mapping)         │
                          │  - Mock Platform API             │
                          │  - Mock Payment Gateway (UPI)    │
                          └──────────────────────────────────┘
```

**Core data flows:**
1. **Onboarding:** Worker registers → ML service risk-scores profile → weekly premium quote generated → policy created on payment.
2. **Trigger monitoring:** Cron job polls weather + AQI + zone APIs every 5 minutes → disruption detected → auto-claim initiated for all active policyholders in affected zone.
3. **Claim processing:** Claim created → ML fraud service scores it → auto-approve or flag → payout dispatched via mock UPI.
4. **Admin dashboard:** Real-time claims map, fraud ring alerts, loss ratio analytics, manual review queue.

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 15 (React + TypeScript) | PWA support, fast rendering, easy Vercel deploy |
| Backend API | Node.js + Express (TypeScript) | Familiar, fast to build, good ecosystem |
| ML Service | Python + FastAPI + scikit-learn | Isolated ML service, easy to iterate model |
| Database | PostgreSQL (Supabase) | Reliable, free tier, real-time subscriptions |
| Weather Data | OpenWeather API | Free tier, reliable, covers Indian cities well |
| Pollution Data | OpenAQ API | Free, covers Bengaluru AQI stations |
| Maps / Zones | Mapbox GL JS | Free tier sufficient for zone visualisation |
| Deployment | Vercel (frontend) + Railway (API + ML) | Free tiers, auto-deploy from GitHub |

---

## Development Plan

### Phase 1 (Current — March 20): Ideation & Foundation
- [x] Persona definition and use case research
- [x] Architecture design
- [x] Weekly premium model defined
- [x] Parametric triggers defined
- [x] Anti-spoofing strategy designed
- [ ] GitHub repo + this README
- [ ] Minimal prototype (Next.js landing + 2 API endpoints)
- [ ] 2-minute strategy video

### Phase 2 (March 21 – April 4): Automation & Protection
- Worker onboarding flow (full UI)
- Policy creation + weekly premium payment (mock UPI)
- Dynamic premium calculation (ML model integrated)
- 3–5 automated parametric triggers (live API calls)
- Claims management UI
- Basic fraud scoring endpoint live

### Phase 3 (April 5 – 17): Scale & Optimise
- Advanced fraud detection (DBSCAN ring detection live)
- Instant payout simulation (Razorpay test mode)
- Worker dashboard (earnings protected, active coverage)
- Admin/insurer dashboard (loss ratios, predictive analytics)
- Full demo video (simulated rainstorm → auto claim → payout)
- Final pitch deck

---

## Platform Choice: Web (PWA)

We chose a **Progressive Web App (PWA)** over a native mobile app for the following reasons:

1. **Zero install friction** — delivery workers can access Q-Shield via a link in WhatsApp without going to the app store. Adoption is everything.
2. **Works on low-end Android devices** — the majority of q-commerce workers use budget Android phones. A PWA with offline support handles poor network conditions better than a heavy native app.
3. **Faster to build and iterate** — one codebase (Next.js) serves both mobile web and desktop (admin view), maximising our small team's velocity.
4. **Push notifications supported** — PWAs on Android support push notifications, enabling real-time claim alerts to workers.

---

*Built for India's last-mile workforce.*  
*DEVTrails 2026 | Team Q-Shield*
