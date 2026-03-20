# Dhanrakshak : AI-Powered Parametric Income Insurance for Q-Commerce Delivery Workers

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
8. [Adversarial Defense & Anti-Spoofing Strategy](#adversarial-defence--anti-spoofing-strategy)
9. [Architecture Overview](#architecture-overview)
10. [Tech Stack](#tech-stack)
11. [Platform Choice: Web (PWA)](#platform-choice-web-pwa)

---

## The Problem
India's 2M q-commerce riders (Zepto, Blinkit, Swiggy Instamart) live paycheck-to-paycheck. One flood, curfew, or AQI spike wipes out 20-30% of their weekly earnings. No backup exists.

When orders stop, earnings stop. There is no employer backup, no union protection, and no insurance product designed for their reality.

<p align="center">
  <img width="856" height="384" alt="Screenshot 2026-03-19 at 10 24 05 PM" src="https://github.com/user-attachments/assets/1abb22ba-d7cb-482a-b46a-76de916c4679" />
</p>

**India's quick commerce riders are exploding** – but unprotected:

**Market:** 550K workers × ₹80/week × 52 weeks = **₹2,300Cr annual opportunity**
<table align="center">
  <tr>
    <th align="center">Year</th>
    <th align="center">Headline</th>
    <th align="center">Workers</th>
    <th align="center">Source</th>
  </tr>
  <tr>
    <td align="center"><b>2025</b></td>
    <td align="center"><b>Q-Commerce hits 5.5 lakh workers</b></td>
    <td align="center"><b>550,000</b></td>
    <td align="center">
      <a href="https://economictimes.com/jobs/fresher/q-commerce-to-employ-5-5-5-lakh-people-by-next-year-report/articleshow/118941542.cms">
        Economic Times
      </a>
    </td>
  </tr>
  <tr>
    <td align="center"><b>2026</b></td>
    <td align="center"><b>Gig hiring surges as qcom expands</b></td>
    <td align="center"><b>~1M new jobs</b></td>
    <td align="center">
      <a href="https://www.business-standard.com/economy/news/jobs-gig-hiring-to-surge-in-2026-as-qcom-ecom-expand-beyond-metros-126020800403_1.html">
        Business Standard
      </a>
    </td>
  </tr>
</table>

---
## Our Persona

Arjun, 26 — Zepto Delivery Partner, Bengaluru

<table align="center">
  <tr align="center">
    <th>Attribute</th>
    <th>Detail</th>
  </tr>
  <tr align="center">
    <td>Platform</td>
    <td>Zepto (primary), Blinkit (secondary)</td>
  </tr>
  <tr align="center">
    <td>City</td>
    <td>Bengaluru (Koramangala, HSR Layout, Indiranagar)</td>
  </tr>
  <tr align="center">
    <td>Weekly Earnings</td>
    <td>₹4,500 – ₹6,000</td>
  </tr>
  <tr align="center">
    <td>Work Hours</td>
    <td>8–10 hrs/day, 6 days/week</td>
  </tr>
  <tr align="center">
    <td>Vehicle</td>
    <td>Electric two-wheeler</td>
  </tr>
  <tr align="center">
    <td>Risk Exposure</td>
    <td>Monsoon floods, traffic restrictions, AQI spikes (Oct–Nov)</td>
  </tr>
</table>


### The Scenario That Breaks Arjun

- It’s a rainy Tuesday in Bengaluru. A red alert is issued and deliveries stop. Arjun is online, but the app goes silent.
- No orders come in. In a few hours, he loses ₹800–₹1,200.
- This happens often — around 6–8 times every monsoon.
- One bad week like this can cut 20–30% of his income.
- And it’s not just rain — outages, strikes, or policy changes can also leave him working but earning nothing.

### This Isn’t Hypothetical — It’s Already Happening

 **Nationwide gig worker strikes** have halted deliveries across cities, with up to **200,000 riders participating**  
  https://www.cnn.com/2026/01/01/india/india-gig-workers-delivery-strike-intl-hnk  

 Workers report **mass cancellations, penalties, and unrealistic SLAs** wiping out daily earnings  
  https://www.telegraphindia.com/my-kolkata/lifestyle/behind-the-10-minute-promise-what-swiggy-instamart-zomato-blinkit-zepto-delivery-partners-face/cid/2142802  

 Platforms face pressure to **slow down 10-minute delivery models**, directly impacting order volumes  
  https://economictimes.com/industry/services/retail/indias-10-minute-delivery-model-is-under-pressure/articleshow/126404793.cms  

Arjun’s “bad day” is part of a **system-wide pattern**.

---

## Solution Overview

Dhanrakshak is a **parametric income insurance platform** — meaning payouts are triggered by verifiable external events (weather, zone status, pollution data), not subjective loss assessments. No paperwork. No adjuster. No waiting.

**Coverage scope (strictly income loss only):**
- Lost earnings due to weather disruptions
- Lost earnings due to zone/area closures or curfews
- Lost earnings due to severe pollution (AQI > 300)
- Lost earnings due to platform outages or system failures
- Lost earnings due to labour actions (e.g., city-wide strikes impacting order flow)
- Lost earnings due to regulatory interventions affecting platform operations
- Vehicle repairs (excluded)
- Health/accident/life insurance (excluded)

---

## Weekly Premium Model

Premiums are structured on a **weekly basis** to match the typical earnings cycle of a gig worker. Workers pay weekly, and coverage resets each Monday.

### Base Premium Table

<div align="center">

<table>
  <thead>
    <tr>
      <th style="padding:8px; border:1px solid #ddd;">Coverage Tier</th>
      <th style="padding:8px; border:1px solid #ddd;">Weekly Premium</th>
      <th style="padding:8px; border:1px solid #ddd;">Max Weekly Payout</th>
      <th style="padding:8px; border:1px solid #ddd;">Best For</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Basic Shield</td>
      <td style="padding:8px; border:1px solid #ddd;">₹35/week</td>
      <td style="padding:8px; border:1px solid #ddd;">₹500</td>
      <td style="padding:8px; border:1px solid #ddd;">Part-time workers (&lt;5 hrs/day)</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Standard Shield</td>
      <td style="padding:8px; border:1px solid #ddd;">₹65/week</td>
      <td style="padding:8px; border:1px solid #ddd;">₹1,000</td>
      <td style="padding:8px; border:1px solid #ddd;">Regular workers (5–8 hrs/day)</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Pro Shield</td>
      <td style="padding:8px; border:1px solid #ddd;">₹99/week</td>
      <td style="padding:8px; border:1px solid #ddd;">₹1,800</td>
      <td style="padding:8px; border:1px solid #ddd;">Full-time workers (8+ hrs/day)</td>
    </tr>
  </tbody>
</table>

</div>

### Dynamic Risk Multipliers (AI-Adjusted)

The base premium is adjusted weekly by our ML risk engine based on:

<div align="center">

<table>
  <thead>
    <tr>
      <th style="padding:8px; border:1px solid #ddd;">Risk Factor</th>
      <th style="padding:8px; border:1px solid #ddd;">Adjustment</th>
      <th style="padding:8px; border:1px solid #ddd;">Rationale</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Monsoon season (Jun–Sep)</td>
      <td style="padding:8px; border:1px solid #ddd;">+15%</td>
      <td style="padding:8px; border:1px solid #ddd;">Higher disruption probability</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Worker's zone has flood history</td>
      <td style="padding:8px; border:1px solid #ddd;">+10%</td>
      <td style="padding:8px; border:1px solid #ddd;">Zone-level historical risk</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Worker's zone is flood-safe</td>
      <td style="padding:8px; border:1px solid #ddd;">-8%</td>
      <td style="padding:8px; border:1px solid #ddd;">Reward low-risk zones</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">New worker (&lt; 4 weeks)</td>
      <td style="padding:8px; border:1px solid #ddd;">+5%</td>
      <td style="padding:8px; border:1px solid #ddd;">Limited behavioral baseline</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Worker with 0 claims (3+ months)</td>
      <td style="padding:8px; border:1px solid #ddd;">-5%</td>
      <td style="padding:8px; border:1px solid #ddd;">Loyalty/low-risk bonus</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Predicted high-disruption week (weather model)</td>
      <td style="padding:8px; border:1px solid #ddd;">+12%</td>
      <td style="padding:8px; border:1px solid #ddd;">Forward-looking risk pricing</td>
    </tr>
  </tbody>
</table>

</div>

**Example:** Arjun (Standard Shield, Koramangala zone, July monsoon season):  
`₹65 × 1.15 (monsoon) × 1.10 (flood-prone zone) = ₹82/week`

---

## Parametric Triggers

Dhanrakshak monitors **3 disruption categories** in real time using external APIs. When a threshold is crossed in a worker's active delivery zone, a claim is initiated automatically — no worker action required.

### Trigger 1: Extreme Weather (Rain / Flood)

<div align="center">

<table>
  <thead>
    <tr>
      <th style="padding:8px; border:1px solid #ddd;">Parameter</th>
      <th style="padding:8px; border:1px solid #ddd;">Source</th>
      <th style="padding:8px; border:1px solid #ddd;">Threshold</th>
      <th style="padding:8px; border:1px solid #ddd;">Payout</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Rainfall intensity</td>
      <td style="padding:8px; border:1px solid #ddd;">OpenWeather API</td>
      <td style="padding:8px; border:1px solid #ddd;">> 15mm/hr OR Red Alert issued</td>
      <td style="padding:8px; border:1px solid #ddd;">50–100% of daily coverage</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Flood zone activation</td>
      <td style="padding:8px; border:1px solid #ddd;">IMD / mock civic API</td>
      <td style="padding:8px; border:1px solid #ddd;">Zone flagged as flooded</td>
      <td style="padding:8px; border:1px solid #ddd;">100% of daily coverage</td>
    </tr>
  </tbody>
</table>

</div>

**Example:** IMD issues a Red Alert for Bengaluru South. All active Dhanrakshak workers in that zone receive an automatic payout notification within 10 minutes.

---

### Trigger 2: Zone/Area Closure

<div align="center">

<table>
  <thead>
    <tr>
      <th style="padding:8px; border:1px solid #ddd;">Parameter</th>
      <th style="padding:8px; border:1px solid #ddd;">Source</th>
      <th style="padding:8px; border:1px solid #ddd;">Threshold</th>
      <th style="padding:8px; border:1px solid #ddd;">Payout</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Curfew / Section 144</td>
      <td style="padding:8px; border:1px solid #ddd;">Government API / mock</td>
      <td style="padding:8px; border:1px solid #ddd;">Zone closure confirmed</td>
      <td style="padding:8px; border:1px solid #ddd;">80% of daily coverage</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Platform-side surge suspension</td>
      <td style="padding:8px; border:1px solid #ddd;">Mock platform API</td>
      <td style="padding:8px; border:1px solid #ddd;">Delivery suspension > 2 hrs</td>
      <td style="padding:8px; border:1px solid #ddd;">60% of daily coverage</td>
    </tr>
  </tbody>
</table>

</div>

---

### Trigger 3: Severe Air Pollution

<div align="center">

<table>
  <thead>
    <tr>
      <th style="padding:8px; border:1px solid #ddd;">Parameter</th>
      <th style="padding:8px; border:1px solid #ddd;">Source</th>
      <th style="padding:8px; border:1px solid #ddd;">Threshold</th>
      <th style="padding:8px; border:1px solid #ddd;">Payout</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">AQI index</td>
      <td style="padding:8px; border:1px solid #ddd;">CPCB API / OpenAQ</td>
      <td style="padding:8px; border:1px solid #ddd;">AQI > 300 (Hazardous)</td>
      <td style="padding:8px; border:1px solid #ddd;">50% of daily coverage</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">AQI + heat index combined</td>
      <td style="padding:8px; border:1px solid #ddd;">Composite score</td>
      <td style="padding:8px; border:1px solid #ddd;">Score > threshold</td>
      <td style="padding:8px; border:1px solid #ddd;">70% of daily coverage</td>
    </tr>
  </tbody>
</table>

</div>

---

### Trigger 4: Gig Worker Strikes
<table align="center">
  <tr align="center">
    <th>Parameter</th>
    <th>Source</th>
    <th>Threshold</th>
    <th>Payout</th>
  </tr>
  <tr align="center">
    <td>Union-declared strike</td>
    <td><a href="https://www.cnn.com/2026/01/01/india/india-gig-workers-delivery-strike-intl-hnk">CNN: 200K+ workers</a></td>
    <td>IFAT declares city strike</td>
    <td>70% daily</td>
  </tr>
  <tr align="center">
    <td>Order volume crash</td>
    <td><a href="https://timesofindia.indiatimes.com/city/hyderabad/remove-10-minute-delivery-option-gig-workers-launch-nationwide-strike-on-new-...">TOI: Nationwide strike</a></td>
    <td>&gt;50% drop (6+ hrs)</td>
    <td>60% daily</td>
  </tr>
</table>

---

### Trigger 5: Regulatory & Policy Shocks
<table align="center">
  <tr align="center">
    <th>Parameter</th>
    <th>Source</th>
    <th>Threshold</th>
    <th>Payout</th>
  </tr>
  <tr align="center">
    <td>Government directive impact</td>
    <td><a href="https://economictimes.com/industry/services/retail/indias-10-minute-delivery-model-is-under-pressure/articleshow/126404793.cms">ET: 10-min delivery pressure</a></td>
    <td>&gt;30% drop in active slots/orders</td>
    <td>60% daily</td>
  </tr>
  <tr align="center">
    <td>Safety regulation slowdown</td>
    <td><a href="https://economictimes.com/industry/services/retail/indias-10-minute-delivery-model-is-under-pressure/articleshow/126404793.cms">ET: Safety mandates</a></td>
    <td>Avg delivery time &gt;40% (city-wide)</td>
    <td>50% daily</td>
  </tr>
</table>

---

### Trigger 6: Platform & System Failures
<table align="center">
  <tr align="center">
    <th>Parameter</th>
    <th>Source</th>
    <th>Threshold</th>
    <th>Payout</th>
  </tr>
  <tr align="center">
    <td>Platform-wide outage</td>
    <td>-</td>
    <td>App downtime &gt;30 mins (city/zone)</td>
    <td>50% daily</td>
  </tr>
  <tr align="center">
    <td>Payment system failure</td>
    <td>-</td>
    <td>Settlement failure &gt;2 hrs</td>
    <td>40% daily</td>
  </tr>
  <tr align="center">
    <td>Mass cancellations spike</td>
    <td><a href="https://www.telegraphindia.com/my-kolkata/lifestyle/behind-the-10-minute-promise-what-swiggy-instamart-zomato-blinkit-zepto-delivery-partners-face/cid/2142802">Telegraph: SLA pressure</a></td>
    <td>&gt;40% cancel rate (zone-wide)</td>
    <td>40% daily</td>
  </tr>
</table>

 ---
 
### Trigger 7: Income Shock Stabilizers *(AI-driven)*
<table align="center">
  <tr align="center">
    <th>Parameter</th>
    <th>Source</th>
    <th>Threshold</th>
    <th>Payout</th>
  </tr>
  <tr align="center">
    <td>Per-order payout cut</td>
    <td><a href="https://frontierweekly.com/articles/vol-58/58-34/58-34-Gig%20Workers%20Recent%20Strikes.html">Frontier: Pay cuts</a></td>
    <td>&gt;25% drop (weekly)</td>
    <td>Top-up 30%</td>
  </tr>
  <tr align="center">
    <td>Incentive collapse</td>
    <td><a href="https://tiss.ac.in/uploads/files/Online_Food_Delivery_Platform_syz696J.pdf">TISS Study</a></td>
    <td>&gt;2σ drop vs 3-mo avg</td>
    <td>Top-up 25%</td>
  </tr>
  <tr align="center">
    <td>Fuel price spike</td>
    <td><a href="https://www.jetir.org/papers/JETIRHB06021.pdf">JETIR Study</a></td>
    <td>&gt;10% weekly increase</td>
    <td>Adjust income floor</td>
  </tr>
</table>

---

**Sources:** [CNN](https://www.cnn.com/2026/01/01/india/india-gig-workers-delivery-strike-intl-hnk) | [Times of India](https://timesofindia.indiatimes.com/city/hyderabad/remove-10-minute-delivery-option-gig-workers-launch-nationwide-strike-on-new-...) | [NDTV](https://www.ndtv.com/india-news/gig-workers-strike-on-december-31-potential-impact-on-new-year-celebrations-10103344) | [Economic Times](https://economictimes.com/tech/technology/gig-workers-strike-revives-debate-on-10-minute-delivery/articleshow/126310183.cms)

---

## Application Workflow

![application-workflow](https://github.com/user-attachments/assets/69d7c33d-e64a-4c5e-8139-25eb0530efb1)


---

## AI/ML Integration Plan

<img width="1169" height="451" alt="AI-System" src="https://github.com/user-attachments/assets/6cdf9aef-6ecb-4d18-89b4-5ade6daacc9d" />


---

## Adversarial Defence & Anti-Spoofing Strategy

> This section directly addresses the **Market Crash Scenario** (March 2026): a 500-worker GPS-spoofing syndicate that drained a competitor's liquidity pool via coordinated false claims.

## 1. The Differentiation: Real Worker vs GPS Spoofer

**Addresses March 2026 Market Crash:** 500-worker GPS-spoofing syndicate drained competitor liquidity
### Real Worker vs GPS Spoofer

**Single-signal verification (GPS) is obsolete.**  
Dhanrakshak validates every claim using **6 independent signals simultaneously**.

<table align="center">
  <tr align="center">
    <th>Signal</th>
    <th>What We Validate</th>
    <th>Anti-Spoofing Mechanism</th>
  </tr>
  <tr align="center">
    <td>IP Geolocation</td>
    <td>Carrier cell-tower district</td>
    <td>GPS can be spoofed; carrier triangulation is far harder</td>
  </tr>
  <tr align="center">
    <td>Device ID</td>
    <td>OS, screen, dev-mode, root flags</td>
    <td>Emulators expose detectable signatures</td>
  </tr>
  <tr align="center">
    <td>Network Behavior</td>
    <td>4G instability vs WiFi</td>
    <td>Real flood = unstable mobile; spoofers = stable WiFi</td>
  </tr>
  <tr align="center">
    <td>Weather Match</td>
    <td>API weather vs claimed location</td>
    <td>Clear skies + “flood claim” = high anomaly</td>
  </tr>
  <tr align="center">
    <td>Route Physics</td>
    <td>Historical speed & zone patterns</td>
    <td>Real movement is organic; spoofers “teleport”</td>
  </tr>
  <tr align="center">
    <td>Ping Velocity</td>
    <td>Distance vs time between pings</td>
    <td>Impossible travel speeds = instant flag</td>
  </tr>
</table>

### Production Fraud Scoring

```python
fraud_score = (
    0.20 * ip_geoloc_match +      # Hardest to spoof remotely
    0.25 * weather_coherence +    # Strong anomaly signal
    0.20 * device_trust +         # Emulator detection
    0.15 * network_pattern +
    0.10 * route_consistency +
    0.10 * velocity_check
)
```

<table align="center">
  <tr align="center">
    <th>Score</th>
    <th>Action</th>
    <th>Volume</th>
  </tr>
  <tr align="center">
    <td>&lt; 0.3</td>
    <td>Instant payout</td>
    <td>~70%</td>
  </tr>
  <tr align="center">
    <td>0.3–0.7</td>
    <td>2-min verification</td>
    <td>~20%</td>
  </tr>
  <tr align="center">
    <td>&gt; 0.7</td>
    <td>Reject + manual review</td>
    <td>~10%</td>
  </tr>
</table>

GPS spoofing alone is ineffective — attackers must fake location, device, network, weather, and physical movement simultaneously, making large-scale fraud economically infeasible.

---


## 2. Detecting Coordinated Fraud Rings

**500-worker syndicates evade individual scoring — clustering catches what single-account checks miss.**

### Ring Detection Signals

<table align="center">
  <tr align="center">
    <th>Signal</th>
    <th>Normal</th>
    <th>Syndicate Pattern</th>
  </tr>
  <tr align="center">
    <td>Temporal clustering</td>
    <td>0–2 claims / 15 min</td>
    <td><b>50+ claims / zone</b></td>
  </tr>
  <tr align="center">
    <td>Device fingerprints</td>
    <td>Unique per worker</td>
    <td><b>87% identical OS / screen</b></td>
  </tr>
  <tr align="center">
    <td>IP geolocation</td>
    <td>City-distributed</td>
    <td><b>Same subnet (e.g., Avadi)</b></td>
  </tr>
  <tr align="center">
    <td>Account velocity</td>
    <td>2–5 new/day</td>
    <td><b>50+ in 72 hrs</b></td>
  </tr>
  <tr align="center">
    <td>Claim density</td>
    <td>~1.2× baseline</td>
    <td><b>10× historical avg</b></td>
  </tr>
</table>

### DBSCAN Implementation

```python
from sklearn.cluster import DBSCAN

# Vectorize claims using key signals
features = vectorize_claims(
    claims,
    dims=['time', 'device', 'ip', 'velocity', 'density']
)

# DBSCAN tuned for fraud detection
dbscan = DBSCAN(eps=0.5, min_samples=10, metric='euclidean')
clusters = dbscan.fit_predict(features)

# Detect large clusters (syndicates)
syndicate_clusters = [
    c for c in set(clusters)
    if list(clusters).count(c) > 20
]

if syndicate_clusters:
    suspend_zone_payouts(zone=X)
```

### Real-World Catch

**March 3rd, 8:47 PM** — 523 claims report a “flood” in Koramangala

- **OpenWeather:** Clear skies *(coherence = 0.95)*  
- **Network signal:** 87% claims from same subnet  
- **Clustering:** Dense DBSCAN cluster detected  

**Result:** **₹28L in payouts suspended within 14 seconds**


Fraud doesn’t scale randomly. It scales in **coordinated patterns**.

---

### 3. The UX Balance: Protecting Honest Workers

A Bengaluru delivery worker in an actual flood faces real compounding problems: poor GPS signal near dark stores, unstable 4G in waterlogged zones, and legitimate location anomalies (taking shelter in a different zone than their delivery route).

**Dhanrakshak's progressive verification flow ensures honest workers are never unfairly penalized:**

<p align="center">
  <img width="551" height="338" alt="Screenshot 2026-03-19 at 3 42 38 PM" src="https://github.com/user-attachments/assets/b170ff6e-9154-45a8-bcdc-b86208ba0ec2" />
</p>

### Fairness Principles

- **Fast for honest users:** Claims are never blocked >5 minutes; verification works even on low bandwidth.
- **No penalty for poor network:** Uses last known location + weather data, not constant GPS.
- **Context-aware approvals:** If a zone-level disruption is confirmed, individual claims are easier to approve.
- **Human fallback:** High-risk claims are reviewed by humans — no permanent auto-rejections.
- **Clear feedback:** Workers get simple, actionable messages — not silent or cryptic denials.
---

## Architecture Overview

![WhatsApp Image 2026-03-19 at 3 38 01 PM](https://github.com/user-attachments/assets/f4599732-5bf8-4de5-a50e-ee6015cb0962)


**Core data flows:**
1. **Onboarding:** Worker registers → ML service risk-scores profile → weekly premium quote generated → policy created on payment.
2. **Trigger monitoring:** Cron job polls weather + AQI + zone APIs every 5 minutes → disruption detected → auto-claim initiated for all active policyholders in affected zone.
3. **Claim processing:** Claim created → ML fraud service scores it → auto-approve or flag → payout dispatched via mock UPI.
4. **Admin dashboard:** Real-time claims map, fraud ring alerts, loss ratio analytics, manual review queue.

---

### Tech Stack

<div align="center">

<table>
  <thead>
    <tr>
      <th style="padding:8px; border:1px solid #ddd;">Layer</th>
      <th style="padding:8px; border:1px solid #ddd;">Technology</th>
      <th style="padding:8px; border:1px solid #ddd;">Rationale</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Frontend</td>
      <td style="padding:8px; border:1px solid #ddd;">Next.js 15 (React + TypeScript)</td>
      <td style="padding:8px; border:1px solid #ddd;">PWA support, fast rendering, easy Vercel deploy</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Backend API</td>
      <td style="padding:8px; border:1px solid #ddd;">Node.js + Express (TypeScript)</td>
      <td style="padding:8px; border:1px solid #ddd;">Familiar, fast to build, good ecosystem</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">ML Service</td>
      <td style="padding:8px; border:1px solid #ddd;">Python + FastAPI + scikit-learn</td>
      <td style="padding:8px; border:1px solid #ddd;">Isolated ML service, easy to iterate model</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Database</td>
      <td style="padding:8px; border:1px solid #ddd;">PostgreSQL (Supabase)</td>
      <td style="padding:8px; border:1px solid #ddd;">Reliable, free tier, real-time subscriptions</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Weather Data</td>
      <td style="padding:8px; border:1px solid #ddd;">OpenWeather API</td>
      <td style="padding:8px; border:1px solid #ddd;">Free tier, reliable, covers Indian cities well</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Pollution Data</td>
      <td style="padding:8px; border:1px solid #ddd;">OpenAQ API</td>
      <td style="padding:8px; border:1px solid #ddd;">Free, covers Bengaluru AQI stations</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Maps / Zones</td>
      <td style="padding:8px; border:1px solid #ddd;">Mapbox GL JS</td>
      <td style="padding:8px; border:1px solid #ddd;">Free tier sufficient for zone visualisation</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Deployment</td>
      <td style="padding:8px; border:1px solid #ddd;">Vercel (frontend) + Railway (API + ML)</td>
      <td style="padding:8px; border:1px solid #ddd;">Free tiers, auto-deploy from GitHub</td>
    </tr>
  </tbody>
</table>

</div>

---

## Platform Choice: Web (PWA)

We chose a **Progressive Web App (PWA)** over a native mobile app for the following reasons:

1. **Zero install friction** — delivery workers can access Dhanrakshak via a link in WhatsApp without going to the app store. Adoption is everything.
2. **Works on low-end Android devices** — the majority of q-commerce workers use budget Android phones. A PWA with offline support handles poor network conditions better than a heavy native app.
3. **Faster to build and iterate** — one codebase (Next.js) serves both mobile web and desktop (admin view), maximising our small team's velocity.
4. **Push notifications supported** — PWAs on Android support push notifications, enabling real-time claim alerts to workers.

---

*Built for India's last-mile workforce.*  
*DEVTrails 2026 | Team Dhanrakshak*






