# OREN Backend

Production-ready, hardened Node.js backend for OREN lead collection.
Built with Express, Supabase, and Resend.

## Features
- **Strict Input Validation** (Zod)
- **Database Safety** (Supabase atomic writes)
- **Secure Emailing** (Resend with error handling)
- **Security Hardened** (Helmet, Rate Limiting, CORS)
- **Production Ready** (Env validation, clean logs)

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in:
   - `SUPABASE_URL` & `SUPABASE_SERVICE_KEY`
   - `RESEND_API_KEY`

3. **Run Locally**
   ```bash
   npm run dev
   ```

## Deployment API Check

- **Health Check**: `GET /health` -> 200 OK
- **Lead Submission**: `POST /api/lead`
  - Body: `{ "email": "...", "clinic_name": "...", "clinic_type": "...", "website": "..." }`

## Deployment on Render

This backend is ready for Render.

1. **Connect GitHub Repo**.
2. **Settings**:
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
3. **Environment Variables**:
   - Add all variables from `.env.example`.
   - Set `NODE_ENV` to `production`.

## Security Notes
- Rate limiting is active (100 req/15min).
- CORS is restricted in production (set `ALLOWED_ORIGIN`).
