# Continuous Monitoring (CM) AI Solution - UI Prototype

## Overview
Frontend-only React/TypeScript prototype for a Continuous Monitoring tool. Features a 6-step wizard workflow plus a 3-step Review phase for analyzing unstructured documents and structured data (ORAC risk events, issues, Navigator changes).

## Architecture
- **Frontend only**: React + TypeScript, Vite, TailwindCSS, shadcn/ui, wouter routing
- **No backend**: All data is local/mock — no database, no server, no API calls
- **Design System**: Enterprise/government aesthetic — `#1e3a6a` navy primary, `#78b376` green accents, `#fff8cc` yellow active sidebar

## Running Locally
```
npm install
npm run dev
```

## Route Map
`/` → `/step-1` → `/step-2` → `/step-3` → `/step-4` → `/step-5` → `/step-6` → `/review-validate` → `/expand-search` → `/insights-summary`

## Key Files
- `client/src/App.tsx` — Main app with routing and layout
- `client/src/components/Sidebar.tsx` — Sidebar navigation
- `client/src/pages/` — All page components for wizard and review steps
- `vite.config.ts` — Vite configuration
- `client/index.html` — HTML entry point

## State Management
- Domain selection stored in `sessionStorage` under key `selectedDomain`
- All other data (documents, review items, insights) uses React local state with mock data
