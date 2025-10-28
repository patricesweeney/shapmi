# ShapMI

Monorepo skeleton for Shapley decomposition of mutual information.

Stack:
- Frontend: React + Vite + Tailwind, Geist font, minimal shadcn-like styling
- Backend: FastAPI (Python), placeholder MI Shapley endpoint
- DB: Supabase (not yet wired)
- Deploy: Vercel (frontend as static build, backend as Python serverless)

## Structure

```
frontend/         # Vite React app
api/index.py      # FastAPI app for Vercel serverless (ASGI app = app)
backend/app/      # Local FastAPI mirror (optional for local dev)
backend/requirements.txt
vercel.json       # Vercel routing/build config
```

## Local Frontend

```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Local Backend (optional)

```
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

Update the frontend fetch URLs to http://localhost:8000 if you run this path.

## API

- POST /api/columns: multipart with file => { columns: string[] }
- POST /api/mi/shapley: multipart with file, target => { target, total_mi, contributions }

Both endpoints are placeholder implementations.

## Deploy (Vercel)

```
vercel
```

Vercel uses `frontend` static build and `api/index.py` for functions.

