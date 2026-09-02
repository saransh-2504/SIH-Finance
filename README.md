# GramUdyam Advisor

AI-assisted hyper-local business intelligence and deterministic financial advisory for rural micro-entrepreneurs, built as an SIH internal hackathon prototype for the MoSJE problem statement.

## Solution

The app helps an entrepreneur answer:

- Can I start this business here?
- What business best fits my location and capital?
- How much money do I need?
- Which scheme appears applicable?
- Can the business reasonably support repayment?

AI is positioned as an advisor, not the primary interface. Financial calculations, scheme routing, EMI and repayment schedules are deterministic and rule-based.

## Current Prototype

- Next.js implementation using the existing repository stack.
- Responsive landing page, dashboard, guided assessment, comparison, finance planner, schemes, advisor and reports routes.
- Demo Mode for Hoskote Dairy, Rural Tailoring and Food Processing scenarios.
- Clearly labeled Demo Data for local market, competitor and pricing indicators.
- Deterministic finance service in `src/lib/financial.ts`.
- FastAPI backend skeleton in `backend/` for production API expansion.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Lucide React
- Backend skeleton: FastAPI, Pydantic, SQLAlchemy
- Database target: PostgreSQL with PostGIS
- AI/RAG target: LangChain, ChromaDB, embeddings, LLM API

## Run Locally

```bash
bun install
bun run dev --port 4000
```

The sandbox normally already runs the dev server on port 4000.

## Environment Variables

Copy `.env.example` to `.env` and fill real values outside version control.

- `DATABASE_URL` PostgreSQL connection string
- `AUTH_SECRET` server-side auth signing secret
- `LLM_API_KEY` server-only LLM provider key
- `MAP_API_KEY` optional map provider key
- `NEXT_PUBLIC_APP_URL` deployed app origin

## Financial Engine

Rules implemented:

- `Project Cost = Available Margin / 0.10`
- `Loan Amount = Project Cost * 0.90`
- Micro Finance: project cost up to Rs. 1.40 lakh, max loan Rs. 1.25 lakh, 6.5%, 3 years, 3-month moratorium
- Term Loan: above Rs. 1.40 lakh and up to Rs. 50 lakh, max loan Rs. 45 lakh, 8%, 7 years, 6-month moratorium
- Above Rs. 50 lakh: unsupported; user is asked to consult the financing authority

Boundary conditions are captured in `tests/financial.test.ts`.

## API Endpoints

Next.js prototype endpoints:

- `POST /api/finance/calculate`
- `GET /api/schemes`
- `POST /api/ai/chat`
- `GET /api/reports/{id}`

FastAPI production skeleton exposes `/health` and is structured for `/api/auth`, `/api/assessments`, `/api/market`, `/api/finance`, `/api/schemes`, `/api/ai` and `/api/reports`.

## Database Plan

Production tables should include users, locations, businesses, business assessments, competitors, schemes, financial plans, reports and conversations. PostGIS spatial indexes should be used for radius and competitor density queries.

## AI/RAG Plan

Pipeline:

```text
User Question -> Intent Detection -> Retrieve Knowledge -> Retrieve Assessment Data -> LLM -> Grounded Response
```

The AI must never invent scheme rules, local statistics, loan approval, profit or market demand. It should cite official scheme documents where available and fall back safely when retrieval fails.

## Security Notes

- Do not expose `LLM_API_KEY`, `DATABASE_URL` or `AUTH_SECRET` in frontend code.
- Use secure password hashing or managed authentication in production.
- Add authorization checks to every protected backend request.
- Validate all financial inputs server-side.
- Use secure cookies, CSRF protection where applicable, CORS restrictions and rate limiting.

## Limitations

- Auth is a prototype flow in the current UI; production should use managed auth or JWT with hashed passwords.
- Market map and local data use labeled Demo Data until real OpenStreetMap, census and verified business datasets are integrated.
- PDF export is represented by a downloadable text feasibility snapshot.

## Disclaimer

This assessment is for decision support and does not replace official financial or government-agency approval.
