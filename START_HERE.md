# 🚀 Q-Shield Deployment - Complete Guide

**Status**: ✅ 67% Complete | Backend + ML Service Live | Frontend Ready

---

## 📌 Quick Links

| Service | URL | Status |
|---------|-----|--------|
| **Backend API** | https://binary5-dev-production.up.railway.app | ✅ LIVE |
| **ML Service** | https://pleasing-contentment-production-de6d.up.railway.app | ✅ LIVE |
| **ML Service Docs** | https://pleasing-contentment-production-de6d.up.railway.app/docs | ✅ AVAILABLE |
| **GitHub Repo** | https://github.com/KaranDhillon05/Binary5-dev | ✅ PUSHED |
| **Frontend** | Not deployed yet | 🔄 READY |

---

## 🎯 What's Done

### ✅ Phase 1: Backend + Database
- Node.js/Express backend deployed to Railway
- PostgreSQL database with 4 tables created
- Health endpoints working
- Trigger monitor running (5-minute polling)
- All environment variables configured

### ✅ Phase 2: ML Service
- FastAPI ML service deployed to Railway
- Python 3.11 with scikit-learn models
- Risk scoring model trained (R² = 0.9756)
- Fraud detection and ring detection ready
- Integrated with backend API

### 🔄 Phase 3: Frontend (Next Step)
- Next.js 15 + React 19 ready
- Dependencies fixed
- Ready for Vercel deployment

---

## 🚀 Deploy Frontend (15 Minutes)

### Method 1: Vercel Dashboard (Easiest)
1. Go to https://vercel.com
2. Click "Add New Project"
3. Select "Import Git Repository"
4. Search for `KaranDhillon05/Binary5-dev`
5. Configure:
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Environment Variables**:
     - `NEXT_PUBLIC_API_URL` = `https://binary5-dev-production.up.railway.app`
6. Click "Deploy"
7. Wait 2-5 minutes for deployment ✨

### Method 2: Vercel CLI
```bash
cd frontend
npx vercel --prod
```

### After Deployment: Update Backend CORS
```bash
cd backend
railway link --service Binary5-dev
railway variables --set CORS_ORIGIN=https://your-vercel-url.vercel.app
# Backend will automatically redeploy
```

---

## 🧪 Quick Testing

### Backend Health
```bash
curl https://binary5-dev-production.up.railway.app/health
```
Expected: `{"success": true, "data": {"status": "healthy", ...}}`

### ML Service Health
```bash
curl https://pleasing-contentment-production-de6d.up.railway.app/health
```
Expected: `{"status": "ok", "models": {"risk_model": "trained", ...}}`

### Risk Scoring
```bash
curl -X POST https://pleasing-contentment-production-de6d.up.railway.app/score/risk \
  -H "Content-Type: application/json" \
  -d '{
    "zone": "Andheri West",
    "city": "Mumbai",
    "delivery_hours_per_day": 8,
    "tenure_weeks": 4,
    "platform": "swiggy",
    "month": 3
  }'
```
Expected: `{"risk_multiplier": 1.0052, "breakdown": {...}, "recommended_tier": "standard"}`

---

## 📚 Documentation Files

Start with these in order:

1. **DEPLOYMENT_OVERVIEW.md** ← Start here! (5 min read)
   - High-level architecture overview
   - Status of each component
   - Integration diagram

2. **DEPLOYMENT_CHECKLIST_FINAL.md** ← Action items
   - Step-by-step deployment checklist
   - Security checklist
   - Testing checklist

3. **DEPLOYMENT_STATUS.md** ← Progress tracker
   - Detailed progress on each phase
   - Environment variables reference
   - Troubleshooting guide

4. **DEPLOYMENT_SUCCESS.md** ← Backend details
   - Backend deployment specifics
   - API endpoints
   - Performance metrics

5. **ML_SERVICE_DEPLOYMENT.md** ← ML service details
   - ML service deployment specifics
   - Model information
   - Testing endpoints

6. **RAILWAY_ENV_VARS.md** ← Environment reference
   - All environment variables
   - How to set them
   - What each one does

7. **DEPLOYMENT.md** ← Original guide
   - Complete deployment walkthrough
   - Cost estimates
   - Common issues

---

## 🔧 Railway Commands

```bash
# Link to Railway
railway link

# View service status
railway status

# Check environment variables
railway variables

# Set environment variable
railway variables --set KEY=value

# View logs (last 50 lines)
railway logs --lines 50

# Deploy manually
railway up

# Get public domain
railway domain

# Connect to database
railway connect Postgres
```

---

## 📊 System Architecture

```
┌─────────────────┐
│   Frontend      │  Next.js + React 19 (Vercel) 🔄
│   (React)       │
└────────┬────────┘
         │ NEXT_PUBLIC_API_URL
         ▼
┌─────────────────┐
│   Backend       │  Express + TypeScript (Railway) ✅
│   (API)         │
└────────┬────────┘
    ┌────┴────┬────────────┐
    │         │            │
    ▼         ▼            ▼
┌────────┐┌────────────┐┌─────────┐
│  ML    ││ PostgreSQL ││ Trigger │
│Service ││ Database   ││Monitor  │
│(FastAPI)│ (Railway)  ││(5 min)  │
└────────┘└────────────┘└─────────┘
  (Py)       (SQL)       (Node)
   ✅         ✅          ✅
```

---

## 💡 Key Points

### Backend ✅
- **URL**: https://binary5-dev-production.up.railway.app
- **Tech**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Railway)
- **Status**: Live and healthy

### ML Service ✅
- **URL**: https://pleasing-contentment-production-de6d.up.railway.app
- **Tech**: Python + FastAPI
- **Models**: Risk scoring, fraud detection, ring detection
- **Status**: Live and healthy

### Frontend 🔄
- **Framework**: Next.js 15 + React 19
- **Platform**: Vercel (not deployed yet)
- **Status**: Ready to deploy

---

## 🎯 Next 15 Minutes

1. **Deploy to Vercel** (5 min)
   - Go to vercel.com
   - Import repository
   - Add environment variable
   - Click Deploy

2. **Update Backend CORS** (1 min)
   - Get Vercel URL
   - Update CORS_ORIGIN variable
   - Wait for auto-redeploy

3. **Test Full Stack** (5 min)
   - Test frontend loads
   - Test API calls
   - Test risk scoring

4. **Done!** ✨

---

## 💰 Cost Estimate

| Service | Cost | Notes |
|---------|------|-------|
| Railway Backend | $5-7/mo | 500 hours/month included |
| Railway ML Service | $3-5/mo | Included in Railway plan |
| Railway Database | FREE | Included with backend |
| Vercel Frontend | FREE | Up to 100GB bandwidth |
| **Total** | **$8-12/mo** | Very affordable! |

---

## 🔐 Security Status

- ✅ HTTPS enabled everywhere
- ✅ Database credentials protected
- ✅ Aadhaar numbers hashed (SHA-256)
- ✅ Environment secrets in Railway vault
- ✅ CORS configured (will update after frontend deploy)
- ✅ Trust proxy configured (rate limiting enabled)

---

## 📋 Environment Variables

### Backend (Railway) ✅
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
ML_SERVICE_URL=https://pleasing-contentment-production-de6d.up.railway.app
OPENWEATHER_API_KEY=                    # Optional
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
OPENAQ_BASE_URL=https://api.openaq.org/v2
USE_MOCK_SERVICES=true                   # Using mock APIs for now
CORS_ORIGIN=http://localhost:3000        # Will update after Vercel deploy
```

### Frontend (Vercel) ⏳
```bash
NEXT_PUBLIC_API_URL=https://binary5-dev-production.up.railway.app
```

---

## 🆘 Troubleshooting

### Backend not starting?
```bash
cd backend
railway link --service Binary5-dev
railway logs --lines 50  # Check for errors
```

### ML Service not responding?
```bash
cd ml-service
railway link
railway logs --lines 50  # Check model training
```

### Frontend can't call backend?
Make sure CORS_ORIGIN in backend matches your Vercel URL exactly!

### Database connection errors?
```bash
cd backend
railway variables | grep DATABASE_URL
# Should show: postgresql://postgres:***@postgres.railway.internal:5432/railway
```

---

## 📞 Support

- **Railway Dashboard**: https://railway.com/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub**: https://github.com/KaranDhillon05/Binary5-dev
- **Railway Docs**: https://docs.railway.app/
- **Vercel Docs**: https://vercel.com/docs

---

## 🎉 You're Almost There!

**Current Status**: 67% Complete ✅
**Time Remaining**: 15 minutes ⏱️
**Next Action**: Deploy to Vercel 🚀

Just deploy the frontend and you're done! All the hard work is finished.

---

## ✨ Final Checklist

- [ ] Go to Vercel
- [ ] Import Binary5-dev repo
- [ ] Set root to `frontend`
- [ ] Add environment variable
- [ ] Deploy
- [ ] Copy Vercel URL
- [ ] Update backend CORS_ORIGIN
- [ ] Test full application

**Done! 🎊**

---

*Last Updated: March 19, 2026*
*Deployment Platform: Railway + Vercel*
*Status: 67% Complete ✅*
