# Continuous Monitoring (CM) AI Solution - UI Prototype

## Overview
Enterprise-grade Continuous Monitoring tool UI prototype built with React/TypeScript frontend and Express backend with PostgreSQL persistence. Features a 6-step wizard workflow plus a 3-step Review phase for analyzing unstructured documents and structured data (ORAC risk events, issues, Navigator changes).

## Architecture
- **Frontend**: React + TypeScript, Vite, TailwindCSS, shadcn/ui, wouter routing
- **Backend**: Express 5, Drizzle ORM, PostgreSQL via `@neondatabase/serverless`
- **Design System**: Enterprise/government aesthetic — `#1e3a6a` navy primary, `#78b376` green accents, `#fff8cc` yellow active sidebar

## Route Map
`/` → `/step-1` → `/step-2` → `/step-3` → `/step-4` → `/step-5` → `/step-6` → `/review-validate` → `/expand-search` → `/insights-summary`

## Key Files
- `shared/schema.ts` — Drizzle schema (sessions, documents, extractionResults, insights, reviewItems)
- `server/db.ts` — DB connection
- `server/storage.ts` — DatabaseStorage CRUD implementation
- `server/routes.ts` — REST API routes (all `/api` prefixed)
- `client/src/lib/api.ts` — Frontend API client (session management, documents, review items)
- `client/src/pages/` — All page components for wizard and review steps

## API Endpoints
- `POST /api/sessions` — Create session
- `PATCH /api/sessions/:id` — Update session (domain, step)
- `POST/GET /api/sessions/:sessionId/documents` — Document CRUD
- `DELETE /api/documents/:id` — Remove document
- `POST/GET /api/sessions/:sessionId/review-items` — Review items (filtered by tab + phase)
- `PATCH /api/review-items/:id` — Accept/delete review item
- `POST /api/sessions/:sessionId/seed-review-items` — Seed demo data

## Session Management
- Session ID stored in `sessionStorage` under `cm_session_id`
- Domain selection stored in `sessionStorage` under `selectedDomain` and persisted to DB
- Review items auto-seeded on first visit to Review & Validate page

## Frontend-Backend Integration
Dashboard, Step1 (domain), Step2 (documents), ReviewValidate, and ExpandSearch pages are connected to the real API. Step3-Step6 and InsightsSummary still use local/mock data.
