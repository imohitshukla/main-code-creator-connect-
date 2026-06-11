# CreatorConnect — Influencer Marketing Platform

A modular monorepo housing the CreatorConnect platform, organized as clean microservices with separation of concerns.

## Repository Structure

```
/
├── apps/
│   ├── frontend/           ← React + Vite frontend (TypeScript)
│   └── backend-core/       ← Hono.js Node.js API server
│       ├── controllers/    ← Business logic (auth, deals, creators, AI matching...)
│       ├── routes/         ← API route definitions
│       ├── services/       ← analyticsEngine, engagementService, emailService
│       ├── middleware/     ← Auth, rate-limiting, upload middleware
│       ├── helpers/        ← Utility functions (dealLogger etc.)
│       ├── db/             ← Database layer
│       │   ├── config/     ← PostgreSQL connection (database.js)
│       │   ├── models/     ← Sequelize model definitions
│       │   └── migrations/ ← Idempotent schema migrations
│       ├── scripts/        ← DB admin and debug scripts
│       └── server.js       ← Server entry point
│
├── services/
│   └── pulse-engine/       ← Isolated Data Science Microservice
│       ├── analytical-models/  ← pulse_analyzer.py (Python — XGBoost, BERT, VADER, DVI)
│       ├── ml-models/          ← Trained models + training scripts
│       ├── scrapers/           ← Data ingestion (creatorDataService.js + Apify hooks)
│       ├── api/
│       │   └── pulseController.js  ← Hono handler — orchestrates all 3 layers
│       └── requirements.txt    ← Python dependencies
│
├── _archive/               ← Stale root-level files preserved for reference
├── package.json            ← npm workspaces monorepo root
├── README.md
└── .gitignore
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL database

### Install Dependencies

```bash
# Frontend
cd apps/frontend && npm install

# Backend
cd apps/backend-core && npm install

# Pulse Engine Python
cd services/pulse-engine && pip install -r requirements.txt
```

### Environment Setup

Copy and fill in your secrets:
```bash
cp apps/backend-core/.env.example apps/backend-core/.env
cp apps/frontend/.env apps/frontend/.env.local  # set VITE_API_URL
```

### Development

```bash
# Run frontend only
npm run dev:frontend

# Run backend only
npm run dev:backend

# Run both simultaneously
npm run dev
```

## Services

| Service | Port | Tech Stack |
|---|---|---|
| `apps/frontend` | 5173 | React 18 + Vite + TypeScript + TailwindCSS |
| `apps/backend-core` | 5000 | Hono.js + Node.js + PostgreSQL |
| `services/pulse-engine` | (spawned) | Python 3 + XGBoost + BERT + GPT-4o |

## Architecture

The Pulse Engine runs as an isolated process spawned by `backend-core` on demand — no separate port needed. The `backend-core` passes creator data to `pulse_analyzer.py` via stdin/stdout (JSON protocol), enabling clean language-agnostic decoupling.

See [`services/pulse-engine/README.md`](services/pulse-engine/README.md) for the full Pulse Engine documentation.
