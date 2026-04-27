# CM AI Solution — Next Level Continuous Monitoring

## Overview
A full-stack AI Continuous Monitoring (CM) solution with a React/TypeScript frontend and a FastAPI Python backend for BAM authentication.

## Architecture

### Frontend (port 5000)
- **Runtime**: Node.js 20, Vite dev server
- **Framework**: React 18 + TypeScript
- **Routing**: wouter
- **Data Fetching**: TanStack Query v5
- **UI**: shadcn/ui components + inline styles (design tokens below)
- **Auth**: sessionStorage-based session management (session_id from backend)

### Backend (port 8000)
- **Runtime**: Python 3.11
- **Framework**: FastAPI + uvicorn (with --reload)
- **Location**: `server/main.py`
- **Auth**: BAM Authentication via POST /api/v1/auth/login
- **Session Store**: In-memory (replace with Redis/DB in production)

## Design Tokens
- `--navy: #0b2a4a` — primary brand color
- `--border: #e6e9ef`
- `--muted: #5b6b7a`
- `--text: #122033`
- `--divider: #eef2f7`
- Font: Segoe UI, system-ui
- Border radius: 12px (cards), 8px (controls)

## Authentication Flow
1. User visits any protected route → redirected to `/login`
2. Login page calls `POST http://localhost:8000/api/v1/auth/login` with `{username, password}`
3. On success, session data stored in `sessionStorage` (session_id, full_name, role, email, etc.)
4. Session expiry checked client-side on each route render (8-hour sessions)
5. Sign Out calls `POST /api/v1/auth/logout` then clears sessionStorage

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /api/v1/auth/login | BAM login — returns session_id + user profile |
| POST | /api/v1/auth/logout | Invalidate session |
| GET | /api/v1/auth/session/{session_id} | Validate + fetch session |

## Demo Credentials
| Username | Password | Role |
|----------|----------|------|
| sarah.johnson | password123 | Portfolio Manager |
| david.lee | password123 | Portfolio Manager |
| john.smith | password123 | Business Monitoring Lead |
| admin | admin | Admin |

## Route Map
- `/login` — BAM login page (public)
- `/` — Define Monitoring Scope (Dashboard)
- `/domain-home` — Select Module (Document Insights or Audit Universe Mapping)
- `/step-1` — Document Upload
- `/step-3` — Validate
- `/step-4` — Analyze
- `/step-5` — Finalize
- `/step-6` — Summary
- `/review-validate` — Step 1: Review & Validate
- `/expand-search` — Step 2: Discover Additional Events
- `/insights-summary` — Step 3: Executive Summary
- `/document-analysis` — Document Analysis
- `/structured-data` — Structured Data

## Workflows
- **Start application**: `npx vite dev --port 5000 --host 0.0.0.0` (webview)
- **FastAPI Backend**: `cd server && uvicorn main:app --host 0.0.0.0 --port 8000 --reload` (console)

## Key Files
- `client/src/App.tsx` — Root app with auth guard and routing
- `client/src/pages/Login.tsx` — BAM login page
- `client/src/pages/Dashboard.tsx` — Monitoring scope selector
- `client/src/pages/DomainHome.tsx` — Module selection
- `client/src/pages/ReviewValidate.tsx` — Audit Universe Mapping Step 1
- `client/src/pages/ExpandSearch.tsx` — Step 2: Discover Events
- `client/src/pages/InsightsSummary.tsx` — Step 3: Executive Summary
- `client/src/components/Sidebar.tsx` — Navigation sidebar
- `server/main.py` — FastAPI backend with BAM auth endpoints
