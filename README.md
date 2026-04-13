# NovaBank Net Banking

NovaBank started as an **ATM-style simulator** and has been **upgraded in-place** into a full **internet banking demo**: beneficiaries, fund transfers with receipts, richer transaction history, in-app notifications, profile and security settings, and a banking-grade dashboard — still powered by **React + Vite + Tailwind** on the frontend and **Node.js + Express + MySQL** on the backend.

Balances remain **ledger-derived** (credits minus debits). PINs and passwords are **bcrypt-hashed**. Sessions use **JWT** bearer tokens.

## Features

### Public

- Landing page for NovaBank Online
- **Login**: net banking (email + password) **or** card + PIN (backward compatible)
- **Signup** (3 steps): personal → profile → account + **ATM PIN + net banking password**

### Authenticated

- **Dashboard**: balance, masked card/account, customer ID, monthly credit/debit totals, 7-day chart (Recharts), quick actions, recent activity with receipt links for transfers
- **Accounts** overview
- **Transfer money**: saved beneficiary or one-time payee, confirmation step, success + receipt link
- **Beneficiaries**: add / list / remove, nickname, duplicate detection (server)
- **Transactions**: pagination, type & category filters, date range, search
- **Statement**: filters + **print / save as PDF** from the browser print dialog
- **Deposit / withdraw / fast cash**: demo money movement with remarks and inline confirmation
- **Balance** enquiry
- **Cards & account details**: masked card, IFSC, branch, customer ID
- **Profile**: edit contact and KYC-style profile fields
- **Security**: change PIN, change password, session notes
- **Notifications** dropdown (alerts for transfers, deposits, withdrawals, PIN/password changes, beneficiaries)

## Repository layout

```
ATM-Simulator/
├── client/                 # Vite + React SPA
│   ├── src/
│   │   ├── components/   # Navbar, Sidebar, Topbar (alerts), tables, forms…
│   │   ├── context/      # Auth + toast
│   │   ├── hooks/        # Re-exports (useAuth, useToast)
│   │   ├── layouts/      # Auth + dashboard shell
│   │   ├── pages/        # Route screens (dashboard, transfer, statement…)
│   │   ├── routes/       # React Router map
│   │   ├── services/     # Axios client
│   │   └── utils/
│   └── ...
├── server/
│   ├── db/
│   │   ├── schema.sql              # Full schema (fresh install)
│   │   └── migration_v2_netbanking.sql  # Upgrade legacy ATM-only DB (run once)
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── scripts/seed.js
│       └── index.js
├── README.md
└── .env.example
```

## Prerequisites

- **Node.js 20+**
- **MySQL 8.x** (or compatible MariaDB)

## 1. Database setup

### New database

```bash
mysql -u root -p < server/db/schema.sql
```

### Upgrading an older NovaBank ATM database

Run the migration **once** (adjust if some columns already exist):

```bash
mysql -u root -p novabank_atm < server/db/migration_v2_netbanking.sql
```

Copy `server/.env.example` → `server/.env` and set `DB_PASSWORD`, `JWT_SECRET`, etc.

### Optional demo user

```bash
cd server
npm install
npm run seed
```

**Demo credentials (printed by seed):**

- **Net banking:** `demo@novabank.test` / `Demo1234`
- **Card login:** card `4532015112830366` / PIN `1234`

## 2. Backend

```bash
cd server
npm install
npm run dev
```

API: `http://localhost:5000` — health: `GET /api/health`

## 3. Frontend

```bash
cd client
npm install
npm run dev
```

SPA: `http://localhost:5173` — Vite **proxies `/api`** to the backend (`client/vite.config.js`).

### Optional direct API URL

Set `VITE_API_URL` in `client/.env` if the browser must call the API without the dev proxy.

## Main routes (SPA)

| Path | Description |
| --- | --- |
| `/` | Landing |
| `/login`, `/signup` | Auth |
| `/dashboard` | Home dashboard |
| `/accounts`, `/cards` | Account details |
| `/transfer`, `/beneficiaries` | Transfers & payees |
| `/transactions`, `/statement` | History & printable statement |
| `/deposit`, `/withdraw`, `/fast-cash`, `/balance` | Money movement |
| `/profile`, `/security`, `/change-pin` | Profile & credentials |
| `/transfers/:id/receipt` | Transfer receipt |

Legacy `/app` URLs redirect to `/dashboard`.

## API overview (selected)

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/auth/signup/step1` … `step3` | Step 3 requires `password` |
| POST | `/api/auth/login` | `{ email, password }` **or** `{ cardNumber, pin }` |
| GET | `/api/auth/me` | Dashboard payload + `monthlyCredits` / `monthlyDebits` / `unreadNotifications` |
| GET/PATCH | `/api/account/profile` | Profile read/update |
| GET | `/api/account/details` | Cards / account metadata |
| POST | `/api/account/change-pin`, `/api/account/change-password` | Security |
| GET | `/api/transactions/history` | `page`, `limit`, `type`, `category`, `from`, `to`, `q` |
| GET/POST/DELETE | `/api/beneficiaries` | Payee management |
| POST | `/api/transfers` | Fund transfer (atomic) |
| GET | `/api/transfers/history`, `/api/transfers/:id` | Transfer list + receipt data |
| GET/PATCH | `/api/notifications` | Alerts + mark read |

## Security notes (interview talking points)

- Parameterized SQL (`mysql2`), centralized errors, `express-validator`, rate limiting on login
- bcrypt for PIN and password; JWT for API auth
- Transfer and balance updates use **transactions** and `SELECT … FOR UPDATE` on the sender account
- Internal transfers (payee account exists in the same DB) credit the receiver and notify both users

## Production build

```bash
cd client && npm run build
```

Serve `client/dist` and set `VITE_API_URL` at build time for the deployed API.

## License

MIT — educational / portfolio use.
