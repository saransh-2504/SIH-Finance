# GramUdyam Advisor

**AI-Powered Hyper-Local Business Intelligence & Financial Decision Platform**

Helps rural entrepreneurs answer: What should I start here, is it viable in my local market, how should I structure it financially, and can I safely afford the financing?

---

## Problem

Many rural and semi-urban first-time entrepreneurs have access to government-supported concessional loans but lack the information required to start a viable business. They select businesses based on word-of-mouth, don't know whether a market is saturated, and don't understand how much capital they require.

## Solution

A deterministic financial engine + hyper-local market analysis + AI advisor that gives evidence-based answers — not just scheme routing.

Core questions answered:
1. Can I start this business here?
2. What business is best for my location and capital?
3. How much money do I actually need?
4. Which financing scheme applies?
5. Can my business realistically support repayment?

---

## Architecture

```
Frontend (Next.js, Vercel)  ←→  Backend (FastAPI, Render)  ←→  PostgreSQL
                                        ↑
                                   OpenAI (optional)
```

### Frontend
- Next.js 16 · React 19 · TypeScript · Tailwind CSS v4
- shadcn/ui components · Recharts · Lucide React
- Real JWT auth with backend · Context-based state management
- Fully responsive (desktop + tablet + mobile)

### Backend
- FastAPI · SQLAlchemy · PostgreSQL
- JWT auth with bcrypt password hashing
- All financial calculations are deterministic (no LLM)
- OpenAI optional for AI advisor (graceful fallback if key missing)

---

## Financial Engine (Deterministic)

```
Project Cost   = Available Capital / 0.10
Loan Amount    = Project Cost × 0.90 (subject to scheme caps)
```

**Scheme routing:**
| Project Cost | Scheme | Rate | Tenure | Moratorium | Max Loan |
|---|---|---|---|---|---|
| ≤ Rs. 1.40L | Micro Finance | 6.5% | 3 years | 3 months | Rs. 1.25L |
| Rs. 1.40L–Rs. 50L | Term Loan | 8% | 7 years | 6 months | Rs. 45L |
| > Rs. 50L | Unsupported | — | — | — | — |

---

## Quick Start

### Prerequisites
- Node.js v18+
- Python 3.11+
- PostgreSQL (local or managed — see Docker section)

### 1. Clone and install frontend
```bash
git clone https://github.com/saransh-2504/SIH-Finance.git
cd SIH-Finance
npm install
cp .env.example .env
# Set NEXT_PUBLIC_API_URL to your backend URL
```

### 2. Set up backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env
# Fill DATABASE_URL, AUTH_SECRET, LLM_API_KEY (optional)
```

### 3. Start PostgreSQL (Docker)
```bash
docker-compose up -d postgres
```

### 4. Run backend
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```
Tables are created automatically on startup.

### 5. Run frontend
```bash
npm run dev
```
Open http://localhost:3000

---

## Environment Variables

### Frontend (`.env`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rural_business_advisor
AUTH_SECRET=replace-with-a-long-random-secret
LLM_API_KEY=sk-replace-with-openai-key    # optional
LLM_MODEL=gpt-4o-mini
ALLOWED_ORIGINS=["http://localhost:3000"]
```

---

## Deployment

### Frontend → Vercel
1. Push repo to GitHub
2. Import project on vercel.com
3. Set env var `NEXT_PUBLIC_API_URL` to your Render backend URL
4. Deploy

### Backend → Render
1. Create a new Web Service on render.com
2. Root directory: `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables: `DATABASE_URL`, `AUTH_SECRET`, `LLM_API_KEY`, `ALLOWED_ORIGINS`

### Database → Neon / Supabase / Render Postgres
- Use any managed PostgreSQL provider
- Set `DATABASE_URL` in backend env vars
- Tables are created automatically on first startup (SQLAlchemy `create_all`)

---

## API Endpoints

Backend auto-docs at `/docs` and `/redoc`.

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
PATCH /api/auth/me
POST /api/auth/change-password
DELETE /api/auth/me

POST /api/assessments
GET  /api/assessments
GET  /api/assessments/{id}
DELETE /api/assessments/{id}

POST /api/finance/calculate
POST /api/finance/business-model
GET  /api/finance/schemes

GET  /api/opportunities

POST /api/ai/chat

GET  /api/reports/{id}

GET  /health
```

---

## Security

- Passwords hashed with bcrypt
- JWT tokens (7-day expiry by default)
- All protected endpoints require `Authorization: Bearer <token>`
- Ownership checks — users can only access their own assessments
- No API keys exposed in frontend code
- Input validation on both frontend and backend (Pydantic)
- CORS restricted to configured origins

---

## AI Fallback

The AI advisor works with or without an OpenAI key:
- **With key**: Calls `gpt-4o-mini` with assessment context
- **Without key**: Rule-based responses using assessment data

Financial calculations are **always deterministic** — the AI never performs or overrides financial math.

---

## Disclaimer

This platform is for decision support only and does not replace official financial or government-agency approval. All financial figures are indicative estimates based on available regional data. No guarantee of loan approval, profit or business success is made or implied.
