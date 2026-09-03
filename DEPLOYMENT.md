# Deployment Guide

## Overview

```
GitHub repo
   ├── Frontend → Vercel (auto-deploy on push)
   └── Backend  → Render (auto-deploy on push)
                     └── Database → Neon.tech (free PostgreSQL)
```

---

## Step 1 — Create the Database on Neon.tech (FREE)

1. Go to **https://neon.tech** → Sign up (GitHub login works)
2. Click **"New Project"**
3. Name it: `gramudyam-advisor`
4. Region: **Asia Pacific (Singapore)** — closest to India
5. Click **Create project**
6. You'll see a connection string like:
   ```
   postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
7. **Copy this connection string** — you need it for both Render and local dev

---

## Step 2 — Deploy Backend on Render (FREE)

1. Go to **https://render.com** → Sign up (GitHub login works)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub → Select **SIH-Finance** repo
4. Fill in:
   - **Name**: `gramudyam-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free

5. Click **"Add Environment Variable"** — add ALL of these:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | your Neon connection string from Step 1 |
   | `AUTH_SECRET` | any long random string (e.g. `gramudyam-secret-2026-xK9mP3nQ7`) |
   | `LLM_API_KEY` | your OpenAI API key (or leave empty for rule-based fallback) |
   | `LLM_MODEL` | `gpt-4o-mini` |
   | `ALLOWED_ORIGINS` | `["https://your-app.vercel.app"]` — fill after Vercel deploy |
   | `PYTHON_VERSION` | `3.11.0` |

6. Click **"Create Web Service"**
7. Wait ~3 minutes for first deploy
8. Copy your Render URL: `https://gramudyam-api.onrender.com`

---

## Step 3 — Deploy Frontend on Vercel (FREE)

1. Go to **https://vercel.com** → Sign up (GitHub login works)
2. Click **"New Project"** → Import **SIH-Finance** repo
3. Framework: **Next.js** (auto-detected)
4. Root directory: leave as `/` (the repo root)
5. Click **"Environment Variables"** → Add:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://gramudyam-api.onrender.com` |

6. Click **"Deploy"**
7. Wait ~2 minutes
8. Copy your Vercel URL: `https://sih-finance-xxx.vercel.app`

---

## Step 4 — Update CORS on Render

1. Go back to Render → Your service → Environment
2. Update `ALLOWED_ORIGINS`:
   ```
   ["https://sih-finance-xxx.vercel.app"]
   ```
   Replace with your actual Vercel URL
3. Render will redeploy automatically

---

## Step 5 — Test the full flow

1. Open your Vercel URL
2. Click **Get started** → Register with any email
3. Create a new assessment
4. Check the Render logs if anything fails

---

## Local Development

### Run frontend locally (connects to deployed backend)
```bash
# In repo root
npm run dev
# Opens at http://localhost:3000
```

### Run backend locally (needs local or Neon postgres)
```bash
cd backend
venv\Scripts\activate          # Windows
# OR: source venv/bin/activate  # Mac/Linux

# Copy env file and fill DATABASE_URL
copy .env.example .env

# Start server
uvicorn app.main:app --reload --port 8000
# Opens at http://localhost:8000/docs
```

### Point frontend to local backend
Edit `.env` in repo root:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Environment Variables Reference

### Frontend (`.env` or Vercel)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend URL (e.g. Render URL in production) |

### Backend (`backend/.env` or Render)
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string from Neon |
| `AUTH_SECRET` | ✅ | Secret for signing JWT tokens |
| `LLM_API_KEY` | Optional | OpenAI API key — app works without it |
| `LLM_MODEL` | Optional | Default: `gpt-4o-mini` |
| `ALLOWED_ORIGINS` | ✅ | JSON array of allowed frontend URLs |

---

## Free Tier Limits

| Service | Free Limit | Notes |
|---------|------------|-------|
| Neon | 512 MB storage, 1 project | More than enough |
| Render | 750 hrs/month, spins down after 15min inactivity | First request after sleep takes ~30s |
| Vercel | Unlimited deploys, 100GB bandwidth | No limits for this project |

### Fix Render cold starts
The free Render tier sleeps after 15 min of inactivity. 
To keep it awake during demo, use **UptimeRobot** (free):
1. Go to **https://uptimerobot.com** → Sign up
2. Add monitor: HTTP → `https://gramudyam-api.onrender.com/health`
3. Set interval: 14 minutes
4. This pings the backend every 14 min to prevent sleeping

---

## Verify Backend is Live

Open: `https://gramudyam-api.onrender.com/health`

Should return:
```json
{"status": "ok", "version": "1.0.0"}
```

API docs: `https://gramudyam-api.onrender.com/docs`

---

## Common Issues

### "CORS error" in browser
- Check `ALLOWED_ORIGINS` on Render matches your exact Vercel URL
- Include `https://` and no trailing slash

### "Database connection failed" on Render
- Make sure `DATABASE_URL` is the full Neon connection string with `?sslmode=require` at the end

### "401 Unauthorized" on API calls
- Token expired — log out and log back in
- Check `AUTH_SECRET` is set on Render

### Render deploy fails
- Check build logs on Render dashboard
- Common fix: make sure `Root Directory` is set to `backend`

### Frontend shows demo data only
- Check `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Re-deploy on Vercel after adding env var

---

## OpenAI Setup (Optional — for AI Advisor)

1. Go to **https://platform.openai.com** → Sign up
2. Go to API Keys → Create new key
3. Add it as `LLM_API_KEY` on Render
4. The app works WITHOUT a key — it uses rule-based responses
5. With a key it calls `gpt-4o-mini` which costs ~$0.01 per 100 messages

---

## Quick Deploy Checklist

- [ ] Created Neon database and copied connection string
- [ ] Deployed backend on Render with all env vars
- [ ] Backend health check returns `{"status": "ok"}`
- [ ] Deployed frontend on Vercel with `NEXT_PUBLIC_API_URL`
- [ ] Updated `ALLOWED_ORIGINS` on Render with Vercel URL
- [ ] Tested registration and login
- [ ] Created a test assessment end-to-end
- [ ] (Optional) Set up UptimeRobot to prevent Render cold starts
