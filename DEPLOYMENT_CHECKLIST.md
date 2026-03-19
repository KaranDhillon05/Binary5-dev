# 🚀 Q-Shield Deployment Checklist

## 🔴 CRITICAL: Recent Fixes Need Deployment

**Date:** March 19, 2026

### Backend Fixes (Must Deploy to Railway)
- ✅ Worker route accepts string IDs (not just UUIDs)
  - File: `backend/src/routes/workers.ts` line 98
- ✅ New policies query endpoint added
  - File: `backend/src/routes/policies.ts` lines 91-113
  - Endpoint: `GET /api/policies?workerId=xxx`

### Frontend Fixes (Must Deploy to Vercel)
- ✅ Dashboard defensive null checks added
  - File: `frontend/app/dashboard/page.tsx`
- ✅ PWA icons created (192x192, 512x512)
  - Files: `frontend/public/icon-192.png`, `frontend/public/icon-512.png`

### Current Production Issues (Will Resolve After Deployment)
1. Icon 404 errors → Will resolve after frontend deployment
2. Worker API 400 errors → Will resolve after backend deployment  
3. Policies 404 errors → Will resolve after backend deployment
4. TypeError in dashboard → Will resolve after frontend deployment

### Quick Deploy Commands
```bash
# Backend
cd backend && git add src/routes/ && git commit -m "Fix: Worker ID validation and policies endpoint" && git push

# Frontend
cd frontend && git add app/ public/icon-*.png && git commit -m "Fix: Add icons and dashboard null checks" && git push
```

---

## Pre-Deployment

- [ ] All code committed to GitHub
- [ ] Backend builds successfully (`cd backend && npm run build`)
- [ ] Frontend builds successfully (`cd frontend && npm run build`)
- [ ] ML service requirements up to date
- [ ] Environment variables documented

## Railway Setup (Backend + ML + Database)

### 1. Backend Service
- [ ] Create Railway project
- [ ] Connect GitHub repository
- [ ] Set root directory to `backend`
- [ ] Add environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3001`
  - [ ] `DATABASE_URL=${{Postgres.DATABASE_URL}}`
  - [ ] `ML_SERVICE_URL=` (update after ML deploy)
  - [ ] `OPENWEATHER_API_KEY=`
  - [ ] `USE_MOCK_SERVICES=false`
  - [ ] `CORS_ORIGIN=` (update after Vercel deploy)
- [ ] Verify build command: `npm install && npm run build`
- [ ] Verify start command: `npm start`
- [ ] Deploy and get URL: `https://__________.railway.app`

### 2. PostgreSQL Database
- [ ] Add PostgreSQL to Railway project
- [ ] Verify `DATABASE_URL` auto-linked to backend
- [ ] Run schema migration (via Railway console):
  ```bash
  psql $DATABASE_URL -c "$(cat backend/src/db/schema.sql)"
  ```
- [ ] Verify tables created

### 3. ML Service
- [ ] Add new service to Railway project
- [ ] Set root directory to `ml-service`
- [ ] Add environment variables:
  - [ ] `PORT=8000`
  - [ ] `PYTHON_VERSION=3.11`
- [ ] Verify start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Deploy and get URL: `https://__________.railway.app`
- [ ] Update backend's `ML_SERVICE_URL` with this URL
- [ ] Redeploy backend

## Vercel Setup (Frontend)

- [ ] Go to vercel.com and import project
- [ ] Set root directory to `frontend`
- [ ] Framework preset: Next.js
- [ ] Add environment variable:
  - [ ] `NEXT_PUBLIC_API_URL=` (your Railway backend URL)
- [ ] Deploy
- [ ] Get deployment URL: `https://__________.vercel.app`
- [ ] Update Railway backend `CORS_ORIGIN` with Vercel URL
- [ ] Redeploy backend

## Post-Deployment Testing

- [ ] Backend health: `curl https://your-backend.railway.app/health`
- [ ] ML health: `curl https://your-ml-service.railway.app/api/health`
- [ ] Frontend loads in browser
- [ ] Database connection works (check Railway logs)
- [ ] CORS no errors in browser console
- [ ] Test worker registration flow
- [ ] Test policy creation
- [ ] Test claim submission

## Optional Enhancements

- [ ] Set up custom domain on Vercel
- [ ] Enable Railway metrics/monitoring
- [ ] Add error tracking (Sentry)
- [ ] Set up database backups
- [ ] Configure Railway autoscaling
- [ ] Set up staging environment

## Rollback Plan

If something breaks:
1. Vercel: Click "Redeploy" on previous deployment
2. Railway: Rollback to previous deployment in Railway dashboard
3. Database: Restore from Railway backup

---

## 📝 Deployed URLs

Once deployed, record your URLs here:

- **Frontend**: https://__________________.vercel.app
- **Backend**: https://__________________.railway.app
- **ML Service**: https://__________________.railway.app
- **Database**: Internal Railway URL

---

## 🔑 API Keys Needed

Before deploying, get these API keys:

1. **OpenWeather API**: https://openweathermap.org/api
   - Sign up for free tier
   - Get API key
   - Add to Railway backend env

2. **OpenAQ API**: No key needed (public API)

3. **(Optional) Mapbox**: For enhanced maps
   - https://www.mapbox.com
   - Free tier: 50k requests/month

---

**Ready to deploy? Follow the DEPLOYMENT.md guide step by step!** 🎯
