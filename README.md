# VEYTRIX - Engineering Intelligence

VEYTRIX is a React and TypeScript vehicle-engineering interface with a small Flask API for explicitly labeled concept calculations.

## Repository layout

- `frontend/` - React, Vite, Three.js, page layouts and browser-local project workflows.
- `backend/` - Flask app and versioned engineering API endpoints.
- `database/` and `supabase/` - reserved for the later database and authentication phase.
- `docs/` - architecture, API, engineering, simulation, database and deployment notes.

## Run locally

Install and start the frontend from `frontend/`:

```sh
cd frontend
npm ci
npm run dev
```

Start the API in a separate terminal:

```sh
cd backend
python -m venv .venv
# Activate the virtual environment, then:
pip install -r requirements.txt
python run.py
```

Set `VITE_API_BASE_URL` in `frontend/.env` to the local API root from `frontend/.env.example`. The backend uses `FRONTEND_ORIGIN` from `backend/.env.example`.

## Deploy

The React + Vite frontend deploys to GitHub Pages from pushes to `main` using `.github/workflows/deploy.yml`. Production builds use `/Veytrix/` and output to `frontend/dist/`. Setup and separate Flask API hosting requirements are in [docs/deployment/README.md](docs/deployment/README.md).

## Current scope

The frontend contains ten individual platform pages. Projects, reports and simulation history persist in this browser's local storage. The Engineering Assistant is a rule-based local preview, not a connected AI model. The simulation progress display runs in the browser; it is not a durable background queue.

The Flask API currently exposes `GET /api/health`, `POST /api/v1/engineering/aerodynamics` and `POST /api/v1/engineering/energy-range`. Frontend and backend calculations are concept estimates, not validated vehicle engineering results. Their equations, units, assumptions, calculation version and limitations are documented in `docs/engineering/README.md` and the calculation modules.

Supabase, secure authentication and roles, database persistence and row-level policies, durable background jobs, administration and external CFD/FEA solvers are not implemented. No credentials are committed.
