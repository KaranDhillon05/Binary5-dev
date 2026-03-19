# Q-Shield Deployment Guide

## 🚀 Deployment Architecture

- **Frontend (Next.js)** → Vercel
- **Backend (Node.js/Express)** → Railway
- **ML Service (Python/FastAPI)** → Railway
- **Database (PostgreSQL)** → Railway

---

## 📦 Part 1: Deploy Backend + Database to Railway

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Deploy Backend

1. **Create New Project** on Railway
2. Click **"Deploy from GitHub repo"**
3. Select `Binary5` repository
4. Railway will detect your `backend` folder

### Step 3: Configure Backend Service

Add these **Environment Variables** in Railway dashboard:

```bash
NODE_ENV=production
PORT=3001

# Railway will auto-provision PostgreSQL
DATABASE_URL=${{Postgres.DATABASE_URL}}

# ML Service (we'll deploy this next)
ML_SERVICE_URL=https://your-ml-service.up.railway.app

# External APIs
OPENWEATHER_API_KEY=your_actual_api_key_here
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
OPENAQ_BASE_URL=https://api.openaq.org/v2

# For production, use real services
USE_MOCK_SERVICES=false

# Frontend URL (update after deploying to Vercel)
CORS_ORIGIN=https://your-qshield-app.vercel.app
```

### Step 4: Add PostgreSQL Database

1. In Railway project, click **"+ New"**
2. Select **"Database" → "PostgreSQL"**
3. Railway will auto-create `DATABASE_URL` variable
4. The backend will automatically use it via `${{Postgres.DATABASE_URL}}`

### Step 5: Configure Build Settings

Railway should auto-detect, but verify:
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build` (if you have a build script)
- **Start Command**: `npm start` or `node dist/index.js`

### Step 6: Run Database Migration

After deployment, open Railway's terminal and run:
```bash
psql $DATABASE_URL -f src/db/schema.sql
```

Or use Railway's built-in PostgreSQL client.

---

## 🤖 Part 2: Deploy ML Service to Railway

### Step 1: Create New Service

1. In same Railway project, click **"+ New"**
2. Click **"GitHub Repo"** → Select `Binary5`
3. Set **Root Directory**: `ml-service`

### Step 2: Configure ML Service

Add these **Environment Variables**:

```bash
PORT=8000
PYTHON_VERSION=3.11
```

Railway will auto-detect Python and use `requirements.txt`.

### Step 3: Verify Start Command

Railway should use: `uvicorn main:app --host 0.0.0.0 --port $PORT`

If not, set it manually in Railway settings.

### Step 4: Get ML Service URL

After deployment, copy the public URL (e.g., `https://ml-service-production-xxxx.up.railway.app`)

Go back to **Backend service** → Update `ML_SERVICE_URL` environment variable with this URL.

---

## 🎨 Part 3: Deploy Frontend to Vercel

### Step 1: Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### Step 2: Deploy via GitHub (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your `Binary5` repository
4. Vercel will auto-detect Next.js

### Step 3: Configure Build Settings

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 4: Add Environment Variables

In Vercel dashboard, add:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
```

Replace with your actual Railway backend URL.

### Step 5: Deploy

Click **"Deploy"** and Vercel will build and deploy your frontend.

### Step 6: Update CORS

After deployment:
1. Copy your Vercel URL (e.g., `https://qshield.vercel.app`)
2. Go to Railway → Backend service
3. Update `CORS_ORIGIN` environment variable
4. Redeploy backend

---

## ✅ Verification Checklist

After all services are deployed:

- [ ] Backend health check: `https://your-backend.railway.app/health`
- [ ] ML service health: `https://your-ml-service.railway.app/api/health`
- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] Database connected (check Railway logs)
- [ ] CORS configured correctly
- [ ] API calls work from frontend to backend

---

## 🔧 Quick Deploy Commands

### Deploy Frontend to Vercel (CLI method)
```bash
cd frontend
vercel --prod
```

### Check Railway Logs
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# View logs
railway logs
```

---

## 💰 Cost Estimate

- **Vercel**: Free tier (100GB bandwidth/month)
- **Railway**: $5/month (500 hours, then $0.000231/min)
- **PostgreSQL on Railway**: Included in base plan
- **Total**: ~$5-10/month

---

## 🐛 Common Issues

### Issue: Backend can't connect to database
**Solution**: Ensure `DATABASE_URL` uses Railway's Postgres reference: `${{Postgres.DATABASE_URL}}`

### Issue: Frontend can't reach backend (CORS error)
**Solution**: 
1. Check `CORS_ORIGIN` in backend matches your Vercel URL exactly
2. Make sure `NEXT_PUBLIC_API_URL` in frontend is correct
3. Redeploy both services

### Issue: ML service not responding
**Solution**: 
1. Check Railway logs for Python errors
2. Verify `requirements.txt` has all dependencies
3. Ensure FastAPI is binding to `0.0.0.0:$PORT`

### Issue: Database migrations not applied
**Solution**: Use Railway's PostgreSQL client or CLI to run:
```bash
railway run psql $DATABASE_URL < backend/src/db/schema.sql
```

---

## 🎯 Next Steps After Deployment

1. **Get Real API Keys**
   - OpenWeather API: https://openweathermap.org/api
   - Update `OPENWEATHER_API_KEY` in Railway

2. **Set up Custom Domain** (Optional)
   - Add custom domain in Vercel
   - Update `CORS_ORIGIN` accordingly

3. **Enable Monitoring**
   - Use Railway's built-in logs
   - Consider adding Sentry for error tracking

4. **Set up CI/CD**
   - Both Vercel and Railway auto-deploy on git push
   - Configure branch deployments if needed

---

**Ready to deploy? Start with Railway backend, then ML service, then Vercel frontend!** 🚀
