# MockMate Deployment Guide

Complete step-by-step guide to deploy MockMate to production.

## Architecture Overview

- **Frontend**: Next.js → Vercel
- **Backend**: FastAPI + WebSocket → Railway
- **Database**: PostgreSQL → Supabase (already configured)
- **Redis**: Session management → Upstash Redis
- **Storage**: Resume/Audio files → Supabase Storage

---

## Prerequisites

- [ ] GitHub account (for connecting to deployment platforms)
- [ ] Railway account (https://railway.app)
- [ ] Vercel account (https://vercel.com)
- [ ] Upstash account (https://upstash.com)

---

## Step 1: Setup Redis (Required)

### Option A: Upstash Redis (Recommended)

1. Go to https://console.upstash.com
2. Click "Create Database"
3. Choose:
   - Name: `mockmate-sessions`
   - Region: Choose closest to your users
   - Type: Regional (free tier)
4. Click "Create"
5. Copy the **Redis URL** (format: `redis://default:xxx@xxx.upstash.io:6379`)
6. Save this URL - you'll need it for Railway

### Option B: Railway Redis

If deploying backend to Railway, you can add Redis there:
1. In Railway project, click "New Service"
2. Select "Redis"
3. Railway will auto-generate `REDIS_URL` env var

---

## Step 2: Deploy Backend to Railway

### 2.1 Initial Setup

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select your `mockmate` repository
6. Railway will detect the Python app automatically

### 2.2 Configure Root Directory

1. In Railway project settings, click your service
2. Go to "Settings" tab
3. Set **Root Directory**: `backend`
4. Click "Save"

### 2.3 Add Environment Variables

Go to "Variables" tab and add:

```bash
ENVIRONMENT=production
DEBUG=false

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.jtfjikxtydhlgiolfjft.supabase.co:5432/postgres
REDIS_URL=redis://default:YOUR_PASSWORD@YOUR_REGION.upstash.io:6379

# Clerk Authentication (production keys from clerk.com)
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx

JWT_SECRET_KEY=YOUR_SECURE_JWT_SECRET
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

GEMINI_API_KEY=YOUR_KEY
GROQ_API_KEY=YOUR_KEY
ELEVENLABS_API_KEY=YOUR_KEY

SUPABASE_URL=https://jtfjikxtydhlgiolfjft.supabase.co
SUPABASE_KEY=YOUR_KEY
SUPABASE_SERVICE_KEY=YOUR_KEY

ALLOWED_ORIGINS=https://your-frontend.vercel.app

MAX_UPLOAD_SIZE=10485760
ALLOWED_EXTENSIONS=pdf
MAX_AUDIO_DURATION=300
AUDIO_FORMAT=wav
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000
```

**IMPORTANT**:
- Copy values from your `.env` file
- For `REDIS_URL`, use the Upstash URL from Step 1
- For `ALLOWED_ORIGINS`, use your Vercel frontend URL (you'll get this in Step 3)
- For Clerk keys, get production keys from clerk.com (switch to Production instance)

### 2.4 Deploy

1. Click "Deploy"
2. Railway will build and deploy your backend
3. Once deployed, go to "Settings" → "Domains"
4. Click "Generate Domain"
5. Copy the domain (e.g., `mockmate-backend.railway.app`)
6. Save this URL - you'll need it for frontend

### 2.5 Verify Backend

Visit: `https://your-backend.railway.app/health`

Should return:
```json
{
  "status": "healthy",
  "environment": "production",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Initial Setup

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 3.2 Configure Project

1. Set **Root Directory**: `frontend`
2. Framework Preset: Next.js (auto-detected)
3. Build Command: `npm run build` (default)
4. Output Directory: `.next` (default)

### 3.3 Add Environment Variables

Click "Environment Variables" and add:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
NEXT_PUBLIC_ENVIRONMENT=production

# Clerk Authentication (get production keys from clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

Replace `your-backend.railway.app` with your actual Railway domain from Step 2.

**Getting Clerk Production Keys:**
1. Go to https://clerk.com and log in
2. Switch from "Development" to "Production" instance (top left)
3. Go to "API Keys"
4. Copy your production keys (pk_live_... and sk_live_...)

### 3.4 Deploy

1. Click "Deploy"
2. Vercel will build and deploy
3. Once deployed, copy your Vercel URL (e.g., `mockmate.vercel.app`)

---

## Step 4: Update Backend CORS

Now that you have your frontend URL, update backend:

1. Go back to Railway project
2. Go to "Variables" tab
3. Update `ALLOWED_ORIGINS`:
   ```bash
   ALLOWED_ORIGINS=https://mockmate.vercel.app,https://www.mockmate.vercel.app
   ```
4. Backend will auto-redeploy

---

## Step 5: Test Everything

### 5.1 Test Landing Page
- Visit your Vercel URL
- Check glassmorphism effects load correctly
- Check navigation works

### 5.2 Test Authentication
1. Click "Sign Up"
2. Create account
3. Login
4. **Refresh the page** - you should stay logged in ✅
5. Navigate to dashboard

### 5.3 Test Full Interview Flow
1. Upload resume
2. Paste job description
3. Create interview
4. Start live interview
5. Answer with voice
6. Get feedback

### 5.4 Check Health Endpoints
- Backend: `https://your-backend.railway.app/health`
- Should show all services healthy

---

## Monitoring & Debugging

### Railway Logs
```bash
# View live logs
Railway Dashboard → Your Service → Deployments → View Logs
```

### Vercel Logs
```bash
# View function logs
Vercel Dashboard → Your Project → Deployments → View Function Logs
```

### Common Issues

**Issue**: "Network Error" when calling API
- Check `ALLOWED_ORIGINS` in Railway includes your Vercel domain
- Check `NEXT_PUBLIC_API_URL` in Vercel matches Railway domain

**Issue**: WebSocket won't connect
- Ensure `NEXT_PUBLIC_WS_URL` uses `wss://` (not `ws://`)
- Check Railway domain is correct

**Issue**: Redis errors
- Check `REDIS_URL` format is correct
- Verify Upstash database is active
- App will work with in-memory fallback (check health endpoint)

**Issue**: Logged out on refresh
- This is fixed in latest code
- Make sure frontend deployed latest version with `_hasHydrated` check

---

## Custom Domain (Optional)

### Frontend (Vercel)
1. Go to Vercel Project → Settings → Domains
2. Add your domain (e.g., `mockmate.com`)
3. Update DNS records as instructed
4. Update Railway `ALLOWED_ORIGINS` with new domain

### Backend (Railway)
1. Go to Railway Project → Settings → Domains
2. Add custom domain
3. Update Vercel env vars with new backend URL

---

## Environment Variables Reference

### Backend (Railway)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `ENVIRONMENT` | Yes | Environment name | `production` |
| `DEBUG` | Yes | Debug mode | `false` |
| `DATABASE_URL` | Yes | PostgreSQL connection | `postgresql://...` |
| `REDIS_URL` | Yes | Redis connection | `redis://...` |
| `JWT_SECRET_KEY` | Yes | JWT signing key | `long-random-string` |
| `GEMINI_API_KEY` | Yes | Google Gemini API | `AIza...` |
| `GROQ_API_KEY` | Yes | Groq API for STT | `gsk_...` |
| `ELEVENLABS_API_KEY` | Yes | ElevenLabs TTS | `sk_...` |
| `SUPABASE_URL` | Yes | Supabase project URL | `https://...` |
| `SUPABASE_KEY` | Yes | Supabase anon key | `eyJ...` |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service key | `eyJ...` |
| `ALLOWED_ORIGINS` | Yes | CORS allowed origins | `https://app.com` |

### Frontend (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL | `https://api.railway.app` |
| `NEXT_PUBLIC_WS_URL` | Yes | WebSocket URL | `wss://api.railway.app` |
| `NEXT_PUBLIC_ENVIRONMENT` | Yes | Environment name | `production` |

---

## Rollback Procedure

### Frontend (Vercel)
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Backend (Railway)
1. Go to Deployments tab
2. Find previous working deployment
3. Click "Redeploy"

---

## Cost Estimate

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| Railway | $5 credit/month | $5-20/month |
| Vercel | 100GB bandwidth | $20/month |
| Upstash Redis | 10K requests/day | $0.20 per 100K |
| Supabase | 500MB DB, 1GB files | $25/month |

**Total**: Free tier should handle initial traffic. Paid tier starts ~$25-50/month.

---

## Next Steps After Deployment

1. Set up monitoring (Railway + Vercel dashboards)
2. Configure custom domain
3. Set up error tracking (Sentry)
4. Enable analytics
5. Test with real users
6. Monitor costs and scale as needed

---

## Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Upstash Docs: https://docs.upstash.com

For issues specific to MockMate code, check application logs in Railway/Vercel dashboards.
