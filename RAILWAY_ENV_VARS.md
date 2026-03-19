# Railway Environment Variables Setup

## 🚨 IMPORTANT: Set These in Railway Dashboard

### Backend Service Variables

Go to Railway → Your Project → Backend Service → Variables tab

Add these variables:

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
ML_SERVICE_URL=http://localhost:8000
OPENWEATHER_API_KEY=
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
OPENAQ_BASE_URL=https://api.openaq.org/v2
USE_MOCK_SERVICES=true
CORS_ORIGIN=http://localhost:3000
```

### Critical Notes:

1. **DATABASE_URL** - Must use Railway reference syntax: `${{Postgres.DATABASE_URL}}`
   - This automatically connects to your Railway PostgreSQL database
   - Make sure you have PostgreSQL added to your project first!

2. **ML_SERVICE_URL** - Set to `http://localhost:8000` for now
   - Update to actual ML service URL after deploying ML service to Railway

3. **USE_MOCK_SERVICES** - Set to `true` initially
   - This bypasses external API calls during testing
   - Set to `false` when you have valid API keys

4. **CORS_ORIGIN** - Set to `http://localhost:3000` initially
   - Update to your Vercel URL after deploying frontend (e.g., `https://qshield.vercel.app`)

5. **OPENWEATHER_API_KEY** - Can be empty for now if using mock services
   - Get free API key from: https://openweathermap.org/api

---

## 📋 Deployment Checklist

- [ ] **Step 1:** Add PostgreSQL database to Railway project
  - Click "+ New" → Database → PostgreSQL
  - Wait for provisioning to complete

- [ ] **Step 2:** Add all environment variables to Backend service
  - Copy variables from above
  - Paste into Railway Variables tab
  - Save

- [ ] **Step 3:** Wait for automatic redeploy
  - Railway will redeploy after saving variables
  - Check deployment logs for success

- [ ] **Step 4:** Run database migration
  - Option A: Use Railway terminal in PostgreSQL service
  - Option B: Connect locally with Railway CLI
  ```bash
  railway link
  railway run psql $DATABASE_URL -f backend/src/db/schema.sql
  ```

- [ ] **Step 5:** Test backend health endpoint
  - Visit: `https://your-backend.up.railway.app/health`
  - Should return: `{ "status": "ok", "timestamp": "..." }`

- [ ] **Step 6:** Deploy ML service (optional, later)
  - Create new service in Railway
  - Set root directory to `ml-service`
  - Update backend `ML_SERVICE_URL` variable

- [ ] **Step 7:** Deploy frontend to Vercel
  - Import repo to Vercel
  - Set root directory to `frontend`
  - Add env var: `NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app`
  - Update backend `CORS_ORIGIN` variable

---

## 🔍 Troubleshooting

### Error: ECONNREFUSED 127.0.0.1:5432
- **Cause:** `DATABASE_URL` not set or incorrect
- **Fix:** Ensure `DATABASE_URL=${{Postgres.DATABASE_URL}}` is set in Railway

### Error: relation "policies" does not exist
- **Cause:** Database schema not created
- **Fix:** Run migration script (see Step 4 above)

### Error: CORS blocked
- **Cause:** `CORS_ORIGIN` doesn't match frontend URL
- **Fix:** Update `CORS_ORIGIN` to match your Vercel deployment URL

### Backend deploys but crashes immediately
- **Cause:** Missing required environment variables
- **Fix:** Double-check all variables are set correctly

---

## 🎯 Quick Links

- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- OpenWeather API Keys: https://openweathermap.org/api
- OpenAQ API Docs: https://docs.openaq.org/

---

## 📝 Next Steps After Backend is Running

1. Deploy ML Service to Railway
2. Update `ML_SERVICE_URL` in backend variables
3. Deploy Frontend to Vercel
4. Update `CORS_ORIGIN` in backend variables
5. Test full application flow
6. Set `USE_MOCK_SERVICES=false` when you have real API keys
