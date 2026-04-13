# NovaBank ATM Simulator

Modern full-stack rewrite of a legacy desktop ATM experience: **React + Vite + Tailwind** on the frontend and **Node.js + Express + MySQL** on the backend. Balances are **ledger-derived** (credits minus debits), PINs are **bcrypt-hashed**, and sessions use **JWT** bearer tokens.

## Features

- **3-step signup** (personal → profile → account + PIN) with server-side draft sessions
- **Login** with card number + PIN
- **Dashboard** with masked card, balance, quick actions, chart, recent activity
- **Deposit / withdraw / fast cash** with validation and insufficient-funds handling
- **Balance enquiry** and **mini statement** with filters + CSV export
- **PIN change** with current-PIN verification
- **Logout** and protected SPA routes

## Repository layout

```
ATM-Simulator/
├── client/                 # Vite + React SPA
│   ├── src/
│   │   ├── components/     # Reusable UI (navbar, table, forms, etc.)
│   │   ├── context/        # Auth + toast providers
│   │   ├── hooks/          # useAuth, useToast (thin re-exports)
│   │   ├── layouts/        # Auth + dashboard shells
│   │   ├── pages/          # Route-level screens
│   │   ├── routes/         # React Router map
│   │   ├── services/       # Axios API client
│   │   └── utils/          # Formatting helpers
│   └── ...
├── server/                 # Express API
│   ├── db/schema.sql       # MySQL DDL
│   └── src/
│       ├── config/         # Pool configuration
│       ├── controllers/    # HTTP handlers
│       ├── middleware/     # JWT auth, errors, rate limits
│       ├── routes/         # Express routers + validators
│       ├── services/       # Business logic
│       ├── scripts/seed.js # Optional demo data
│       └── index.js
├── README.md
└── .gitignore
```

## Prerequisites

- **Node.js 20+** (LTS recommended)
- **MySQL 8.x** (or compatible MariaDB)

## 1. Database setup

Create schema and tables:

```bash
mysql -u root -p < server/db/schema.sql
```

Create `server/.env` (copy from `server/.env.example`) and set `DB_PASSWORD`, `JWT_SECRET`, etc.

### Optional demo user

From `server/` after `.env` is configured:

```bash
cd server
npm install
npm run seed
```

Demo credentials (printed by seed):

- **Card number:** `4532015112830366`
- **PIN:** `1234`

## 2. Backend

```bash
cd server
npm install
copy .env.example .env   # Windows — use cp on macOS/Linux
# edit .env with your DB credentials + strong JWT secret
npm run dev
```

API listens on `http://localhost:5000` by default (`PORT` in `.env`).

Health check: `GET http://localhost:5000/api/health`

### Backend troubleshooting

- **`npm run dev` returns to the prompt with no “listening” line** — Run `npm run dev:plain` once; you should see either the usual listen message or a clear error (for example **Port 5000 is already in use**). Free that port or set a different `PORT` in `server/.env`.
- **`node --watch` issues** — Use `npm run dev:plain` for a normal long-running server (no file watching).

## 3. Frontend

```bash
cd client
npm install
npm run dev
```

SPA runs at `http://localhost:5173` and **proxies `/api`** to the backend (see `client/vite.config.js`).

### Direct API URL (optional)

If you need the browser to call the API without the dev proxy (e.g. unusual hosting), set `VITE_API_URL` in `client/.env` and restart Vite.

## API overview

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/auth/signup/step1` | Personal details → `signupToken` |
| POST | `/api/auth/signup/step2` | Profile merge |
| POST | `/api/auth/signup/step3` | Creates user + account + welcome credit |
| POST | `/api/auth/login` | Card + PIN → JWT (rate limited) |
| GET | `/api/auth/me` | Bearer JWT |
| GET | `/api/account/summary` | Protected |
| GET | `/api/account/balance` | Protected |
| POST | `/api/account/change-pin` | Protected |
| POST | `/api/transactions/deposit` | Protected |
| POST | `/api/transactions/withdraw` | Protected |
| POST | `/api/transactions/fast-cash` | Protected (`500/1000/2000/5000`) |
| GET | `/api/transactions/history` | Query `limit`, `type` |

## Security notes (interview talking points)

- **Parameterized queries** via `mysql2`
- **PIN hashing** with bcrypt, **JWT** auth, **CORS** allow-list via `CORS_ORIGIN`
- **express-validator** on inputs, **express-rate-limit** on login (+ general API limiter scaffold)
- **Signup drafts** live in memory (MVP) — document trade-off; swap for Redis in production
- **Sanitized** transaction descriptions on the server

## Production build

```bash
cd client && npm run build
```

Serve `client/dist` via any static host and point it at your deployed API (`VITE_API_URL` at build time).

## License

MIT — educational / portfolio use.
