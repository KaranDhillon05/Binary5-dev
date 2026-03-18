# Binary5
# 🚀 AI-Powered Parametric Insurance for Delivery Partners

## 📌 Problem Statement
Delivery partners in India (Zomato, Swiggy, Zepto, Amazon, etc.) frequently face **income loss due to external disruptions** such as weather, traffic, app failures, and operational issues.

Currently, there is **no structured financial protection system**, forcing them to bear the losses entirely.

This project builds an **AI-powered parametric insurance platform** that provides **instant, automated payouts** when such disruptions occur.

---

## 🎯 Objective
To design a **weekly subscription-based insurance system** that:
- Protects delivery partners from **income loss (NOT health/vehicle damage)**
- Uses **AI/ML for risk prediction & pricing**
- Enables **instant claim settlement via parametric triggers**
- Detects fraud using intelligent monitoring systems

---

## 🏗️ System Architecture

<p align="center">
  <img src="assets/architecture.jpeg" width="900"/>
</p>

---

## 🔄 Execution Flow

<p align="center">
  <img src="assets/sequence.jpeg" width="900"/>
</p>

---

## 💰 Business Model

<p align="center">
  <img src="assets/business.jpeg" width="800"/>
</p>

---

## 👤 Target Persona

### 👨‍🍳 Food Delivery Partner
- Works for platforms like Zomato/Swiggy
- Paid per delivery + incentives
- Income fluctuates daily

### ⚠️ Pain Points
- Earnings drop due to:
  - Heavy rain / heatwaves
  - Traffic congestion
  - App crashes / payment failures
  - Low order demand
  - Missed slots → loss of bonuses
- No compensation despite being active

---

## 🌍 Key Disruptions Covered

### 1. Environmental
- Heavy rain, floods, extreme heat, pollution
- Cannot operate → **0 deliveries**

### 2. Operational / Technical
- App crashes
- Payment gateway failures
- Restaurant shutdowns

### 3. Infrastructure
- Road closures / construction
- Traffic congestion

### 4. Platform-related
- Low order volume
- Slot unavailability
- Customer no-shows

### 5. Economic Factors
- Fuel price spikes → reduced profit margins

---

## 💡 Solution Overview

We propose a **Parametric Insurance System** where payouts are triggered automatically when predefined conditions are met.

### 🔁 Workflow
1. User onboarding (delivery partner profile)
2. Risk profiling using AI
3. Weekly premium calculation
4. Real-time monitoring of disruptions
5. Trigger-based automatic claim
6. Instant payout

---

## 💰 Weekly Premium Model

- Subscription-based (₹X/week)
- Premium depends on:
  - Location risk (weather, traffic)
  - Historical earnings
  - Active hours
  - Delivery density

### 📊 Example
| Scenario | Expected Deliveries | Actual | Payout |
|----------|-------------------|--------|--------|
| Normal hour | 5 | 2 | Compensation for 3 deliveries |

---

## ⚙️ Parametric Triggers

Triggers are **data-driven and automated**:

- 🌧️ Rainfall > threshold → payout
- 🚦 Traffic index > threshold → payout
- 📉 Orders/hour < baseline → payout
- ⚠️ App downtime detected → payout
- 🚧 Road closure detected → payout

---

## 🤖 AI/ML Integration

### 1. Risk Prediction Model
- Predict probability of disruptions using:
  - Weather data
  - Traffic data
  - Historical delivery patterns

### 2. Dynamic Premium Calculation
- Adjust weekly pricing based on:
  - Zone safety
  - Time-based risks
  - User reliability

### 3. Fraud Detection System

#### 🚨 Fraud Cases Covered:
- GPS Spoofing (fake location claims)
- False weather claims
- Fake inactivity
- Duplicate claims

#### 🧠 Techniques Used:
- Anomaly detection
- Location validation
- Behavioral analysis

---

## 💸 Payout Logic

### ❓ If deliveries drop due to traffic?
➡️ Pay based on **expected vs actual deliveries gap**

### ❓ If customer doesn't show up?
➡️ Partial payout (wasted time compensation)

### ❓ If restaurant shuts down?
➡️ Full payout for that delivery attempt

### ❓ If app crashes?
➡️ Compensation for downtime duration

---

## 🛠️ Tech Stack

## 🛠️ Tech Stack

### 🎨 Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next JS](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

### ⚙️ Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)

---

### 🤖 AI / ML
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/ScikitLearn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)

---

### 🌐 Data Sources
![Weather API](https://img.shields.io/badge/Weather-API-blue?style=for-the-badge&logo=cloudflare&logoColor=white)
![Traffic API](https://img.shields.io/badge/Traffic-Data-orange?style=for-the-badge&logo=googlemaps&logoColor=white)

---

### 🗄️ Database
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

---

### 💳 Payments
![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
---

## 📊 Key Features

- ✅ AI-based risk profiling
- ✅ Weekly subscription model
- ✅ Zero-touch claims (automatic)
- ✅ Instant payouts
- ✅ Fraud detection system
- ✅ Analytics dashboard

---

## 📈 Dashboard

### For Delivery Partner
- Earnings protected
- Active coverage
- Claims history

### For Admin
- Risk analytics
- Loss ratios
- Fraud alerts
- Predictive insights

---

## 🚀 Development Plan

### Phase 1
- Ideation
- Workflow design
- Basic UI

### Phase 2
- API integration
- Premium model
- Claim automation

### Phase 3
- Fraud detection
- Dashboard
- Optimization

---

## 🔮 Future Enhancements
- Integration with real delivery platforms
- Personalized insurance plans
- Reinforcement learning for pricing
- Real-time route optimization

---

## 🎥 Demo
- 2-minute strategy video (to be added)

---

## 👨‍💻 Team
- Harshit Harlalka  
- Ishan Goel
- Anushka Priyadarshi
- Karan Dhillon
- Shreya Samal
