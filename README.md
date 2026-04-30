# Aegis Health AI

**NHS-aligned digital triage** — structured symptom questionnaires and a **deterministic, rule-based** decision engine (not generative “AI” diagnosis). Patients are guided to self-care, pharmacy, GP, urgent care, or emergency (999) with auditable logic.

---

## For the client

### What the platform does

1. **Pathway & questions** — The patient chooses a supported condition pathway, then answers guided questions (phone or desktop).
2. **Safety first** — **Red-flag rules run first** inside the triage engine. Danger signs route to urgent or emergency care; that logic is not overridden by pharmacy convenience.
3. **Care navigation** — Clear next steps: self-care, pharmacy (where eligible), GP, urgent care, or **999** when appropriate.
4. **Summary** — Structured output suitable for handoff to a pharmacist or GP record (subject to your deployment model).

### Why it matters

- Supports **Pharmacy First**–style navigation where clinically appropriate  
- Reduces unsafe self-triage by making **rules explicit and testable**  
- **Auditable** decisions for governance (see compliance section below)

### Conditions (phase 1 pathways)

| Pathway code | Condition (patient-facing) |
|--------------|----------------------------|
| `uti` | Urinary tract infection (aligned pathway) |
| `sore_throat` | Sore throat |
| `sinusitis` | Sinusitis |
| `otitis_media` | Ear infection (acute otitis media) |
| `insect_bites` | Infected insect bite |
| `impetigo` | Impetigo |
| `shingles` | Shingles |

---

## For developers

### Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (React, TypeScript), Tailwind CSS, **lucide-react** icons |
| Backend | Node.js 18+, Express.js |
| Decision data | JSON pathway definitions under `backend/data/pathways/` |
| Database | PostgreSQL (`database/schema.sql`, `database/seed.sql`, ordered `database/migrations/*.sql`) — `cd backend && npm run migrate` when `DATABASE_URL` is set; demo APIs may still use in-memory consultation store until wired |
| Target infra | Azure / Cloudways (project choice) |

**Authentication:** Admin and CRM routes are **open in demo**; production should use JWT (or equivalent) and RBAC — see `backend/routes/admin.js` comments.

### Repository layout (current)

```
NHS Triage/
├── README.md
│
├── frontend/                       ← Next.js app (port 3000)
│   ├── pages/
│   │   ├── index.tsx               ← Landing, consent, pathway pick
│   │   ├── consultation.tsx        ← Questionnaire (pathway-specific + defaults)
│   │   ├── result.tsx              ← Outcome & summary
│   │   ├── admin_crm/              ← CRM + admin settings (`settings`, `profile`, cases, …)
│   │   ├── pharmacist/dashboard.tsx
│   ├── components/CRMLayout.tsx
│   ├── lib/                        ← triageOutcomeIcons, channelIcons, …
│   └── styles/globals.css
│
├── backend/                        ← API (port 4000)
│   ├── server.js
│   ├── routes/
│   │   ├── consultation.js
│   │   ├── summary.js
│   │   ├── admin.js
│   │   └── crm.js
│   ├── engine/
│   │   ├── decisionEngine.js       ← Orchestrates triage (see flow below)
│   │   ├── redFlagDetector.js
│   │   └── pharmacyEligibility.js
│   ├── store/consultationStore.js  ← Shared in-memory consultations + mock seed
│   ├── lib/summaryMapper.js        ← Normalizes records for GET /api/summary/:id
│   └── data/pathways/*.json        ← Clinical rules per pathway
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
└── docs/
    ├── README.md                   ← Index to the two canonical docs
    ├── PLATFORM-HANDBOOK.md        ← Engineering / product / built-vs-gap
    └── CLINICAL-GOVERNANCE.md      ← Clinical narrative + compliance
```

### How the decision engine runs (runtime)

When a consultation is evaluated (e.g. `runTriage` in `backend/engine/decisionEngine.js`):

```
Patient answers + pathway context submitted to API
        ↓
[1] Red-flag detection        → if triggered: escalated outcome, stop routine branch
        ↓ (no red flags)
[2] Pharmacy eligibility
        ↓
[3] Outcome rules               → self_care | pharmacy | gp | urgent_care | emergency_999
        ↓
[4] Summary generation          → structured text from facts + templates
```

**Pathway** is chosen by the patient up front — it is **not** an automated “classifier” after the fact. Full detail: **[docs/PLATFORM-HANDBOOK.md](./docs/PLATFORM-HANDBOOK.md)**.

### Documentation (canonical)

| Document | Purpose |
|----------|---------|
| [docs/README.md](./docs/README.md) | Index to the two handbooks |
| [docs/PLATFORM-HANDBOOK.md](./docs/PLATFORM-HANDBOOK.md) | **Primary:** runtime logic, modules, phases, epics/RACI, architecture, **implementation status (what exists vs gaps)** |
| [docs/CLINICAL-GOVERNANCE.md](./docs/CLINICAL-GOVERNANCE.md) | Clinical narrative, red flags, pathway notes, compliance checklist, MVP scope |

### Run locally

**Prerequisites:** Node.js **18+**, npm. PostgreSQL optional for schema experiments; demo triage works with in-memory consultation storage.

```bash
# Backend (http://localhost:4000)
cd backend
npm install
npm start
# or: npm run dev   # nodemon

# Frontend (http://localhost:3000)
cd ../frontend
npm install
npm run dev
```

Consultation and result pages use **in-browser API mocks by default** (`apiFetch` in `frontend/lib/api.ts`): mocks run first, and if the real `fetch` fails (backend down), mocks are retried so you are not blocked. Set **`NEXT_PUBLIC_USE_API_MOCKS=false`** in `frontend/.env.local` only when the Express API is running and you want live triage. CRM pages keep their **existing mock lists** and use **`safeFetchJson`** so a down API still shows mock data.

Optional database bootstrap:

```bash
psql -U postgres -f database/schema.sql
psql -U postgres -f database/seed.sql
```

Set `FRONTEND_URL` in the backend environment if the UI is not on `http://localhost:3000` (CORS). Example `.env` in `backend/`:

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
# DATABASE_URL=postgresql://localhost:5432/aegis_health   # when DB-backed
# JWT_SECRET=...                                           # production auth
```

### API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/consultation` | Submit consultation → triage result |
| GET | `/api/consultation/:id` | Fetch stored consultation (demo store) |
| GET | `/api/summary/:id` | Summary / record access |
| GET | `/api/admin/analytics` | Admin analytics (demo) |
| GET | `/api/admin/pathways` | List pathways |
| GET | `/api/admin/rules` | List rules |
| GET | `/api/crm/dashboard` | CRM KPIs & activity (demo data) |
| … | `/api/crm/*` | Patients, cases, tasks, communications, providers — see `backend/routes/crm.js` |

### User roles (product)

| Role | UI (current) |
|------|----------------|
| **Patient** | `/`, `/consultation`, `/result` |
| **Pharmacist** | `/pharmacist/dashboard` |
| **Admin (settings)** | `/admin_crm/settings`, `/admin_crm/profile` |
| **CRM / operations** | `/admin_crm` and sub-routes |

---

## Delivery & compliance

Phases, epics, RACI, and pilot gates: **[docs/PLATFORM-HANDBOOK.md](./docs/PLATFORM-HANDBOOK.md)** (§4–5). Regulatory checklist: **[docs/CLINICAL-GOVERNANCE.md](./docs/CLINICAL-GOVERNANCE.md)** (§5–6).

| Requirement | Status (typical MVP) |
|-------------|---------------------|
| DTAC | In preparation — technical hooks documented §5.3 |
| DCB0129 / clinical safety | In preparation |
| DCB0160 | In preparation |
| UK GDPR / DPIA | In preparation — patient `/privacy`, demo GDPR API, structured audit (see CLINICAL-GOVERNANCE §5) |
| DSPT | In preparation |
| WCAG 2.x (patient UI) | In preparation |
| MHRA / SaMD | Under organisational review |

---

## Contact

Technical: development team or repository issues.  
Clinical / safety: clinical safety officer (see RACI in [docs/PLATFORM-HANDBOOK.md](./docs/PLATFORM-HANDBOOK.md) §5).

---

*Aegis Health AI — clearer navigation, explicit rules, built for accountable care.*