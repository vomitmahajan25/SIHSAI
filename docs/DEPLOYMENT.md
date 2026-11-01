# GramVikas AI — Production Deployment Guide

Deploying GramVikas AI to Vercel (Frontend), Render (Backend), and Supabase (PostgreSQL Database & Storage).

---

## 1. Database Provisioning (Supabase / Managed PostgreSQL)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings > Database > Connection String (URI)** and copy the PostgreSQL URI:
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
3. Set `DATABASE_URL` in your backend environment.

---

## 2. Backend Deployment (Render / Railway / AWS App Runner)

### Render Setup
1. Create a **New Web Service** connected to your repository.
2. Configure settings:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add Environment Variables:
   - `DATABASE_URL`: `postgresql://...` (your Supabase PostgreSQL URI)
   - `JWT_SECRET`: Generate a secure 64-char key (`openssl rand -hex 32`)
   - `GEMINI_API_KEY`: Your Google AI Studio API Key (optional; deterministic fallback will engage if omitted)
   - `APP_ENV`: `production`
   - `FRONTEND_ORIGIN`: `https://gramvikas-ai.vercel.app`
   - `ALLOWED_ORIGINS`: `["https://gramvikas-ai.vercel.app"]`
4. Deploy service and verify the `/health` endpoint:
   ```bash
   curl https://gramvikas-api.onrender.com/health
   ```

---

## 3. Frontend Deployment (Vercel)

1. Import your repository into [vercel.com](https://vercel.com).
2. Configure project settings:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `frontend`
3. Configure Environment Variables:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://gramvikas-api.onrender.com/api/v1`
4. Click **Deploy**.
5. Once deployed, verify:
   - Authentication flow (Register -> Onboarding -> Overview)
   - Khata Book transactions CRUD
   - AI Advisor chat response
   - PDF exports
