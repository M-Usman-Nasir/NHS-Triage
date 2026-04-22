# System Architecture — Aegis Health AI

> For developers and technical stakeholders.
> Version: V0.1 | Updated: April 2026

---

## Overview

Aegis Health AI is a cloud-hosted, API-driven web platform built with a modern three-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    PATIENT / BROWSER                    │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────┐
│              FRONTEND (Next.js / React)                 │
│   - Patient consultation interface                      │
│   - Pharmacist review dashboard                         │
│   - Admin analytics dashboard                           │
└───────────────────────┬─────────────────────────────────┘
                        │ REST API calls (JSON)
┌───────────────────────▼─────────────────────────────────┐
│              BACKEND API (Node.js / Express)            │
│   - POST /api/consultation   → Run triage               │
│   - GET  /api/summary/:id    → Retrieve summary         │
│   - GET  /api/admin/*        → Analytics + rules        │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │           CLINICAL DECISION ENGINE              │   │
│   │                                                 │   │
│   │  1. redFlagDetector.js  → Safety checks first   │   │
│   │  2. pharmacyEligibility.js → Routing logic      │   │
│   │  3. decisionEngine.js   → Final outcome         │   │
│   └─────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │ SQL queries
┌───────────────────────▼─────────────────────────────────┐
│              DATABASE (PostgreSQL)                      │
│   - patients          - consultations                   │
│   - clinical_pathways - clinical_rules                  │
│   - audit_logs        - analytics_summary               │
└─────────────────────────────────────────────────────────┘
```

---

## Component Details

### Frontend (Next.js 14)

| File | Purpose |
|------|---------|
| `pages/index.tsx` | Landing page, consent, condition selection |
| `pages/consultation.tsx` | Dynamic questionnaire with branching logic |
| `pages/result.tsx` | Triage outcome display with summary |
| `pages/pharmacist/dashboard.tsx` | Pharmacist case review panel |
| `pages/admin/dashboard.tsx` | Analytics, pathways, rules viewer |

**Key design decisions:**
- Mobile-first, responsive layout using Tailwind CSS
- Questions displayed one at a time for clinical clarity and UX
- Boolean questions auto-advance on selection
- Demo mode (`?demo=true`) works without a running backend

### Backend (Node.js / Express)

| File | Purpose |
|------|---------|
| `server.js` | Entry point, middleware, route mounting |
| `routes/consultation.js` | Consultation submission + retrieval |
| `routes/summary.js` | Summary access for healthcare professionals |
| `routes/admin.js` | Rules, analytics, pathway management |

### Clinical Decision Engine

The engine is deterministic — no AI or ML is involved at V1.0. All decisions are traceable to explicit rules.

```
decisionEngine.js          ← Orchestrator
    ↓
redFlagDetector.js         ← Safety: runs first, always
    ↓ (no red flags)
pharmacyEligibility.js     ← Eligibility: can pharmacy treat?
    ↓
outcomeRules evaluation     ← Priority-ordered rule matching
    ↓
generateSummary()           ← Plain English summary
```

All clinical rules live in JSON files under `backend/data/pathways/`. This means:
- Rules can be reviewed and audited without reading code
- Clinical staff can review rule intent directly
- Rules can be updated independently of application code (with appropriate governance)

### Database (PostgreSQL)

Key tables:

| Table | Purpose |
|-------|---------|
| `patients` | Demographics, contact info |
| `consultations` | One row per consultation, full answers + outcome |
| `clinical_pathways` | Active pathways and metadata |
| `clinical_rules` | Admin-visible rule registry |
| `pharmacist_reviews` | Pharmacist actions on cases |
| `audit_logs` | Immutable event log (GDPR/governance) |
| `analytics_summary` | Pre-aggregated daily stats |

---

## Data Flow — Single Consultation

```
1. Patient visits / → selects condition → gives consent
2. Patient fills /consultation → submits answers
3. Frontend POSTs to /api/consultation:
   {
     pathwayCode: "uti",
     answers: { q1: "3 days", q2: false, ... },
     patient: { fullName: "...", age: 33, gender: "Female" },
     symptoms: ["painful urination", ...]
   }
4. Backend: redFlagDetector runs
   → No flags detected
5. Backend: pharmacyEligibility checks
   → Eligible = true
6. Backend: outcomeRules evaluated
   → outcome = "pharmacy"
7. Backend: generateSummary creates text
8. Response returned:
   { consultationId, outcome: "pharmacy", summaryText: "...", ... }
9. Frontend redirects to /result?id=<uuid>
10. Pharmacist views case in /pharmacist/dashboard
```

---

## Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Transport | HTTPS only (TLS 1.2+) |
| Authentication | JWT tokens (Bearer) |
| Authorisation | Role-based: patient / pharmacist / admin |
| Data at rest | AES-256 encryption (database) |
| Data in transit | TLS encrypted |
| Audit logging | Immutable audit_logs table |
| Session management | Short-lived JWT + refresh tokens |
| Input validation | Server-side validation on all endpoints |

---

## Deployment Architecture (Target: Azure)

```
Internet
    ↓
Azure Front Door (CDN + WAF)
    ↓
Azure App Service (Frontend — Next.js)
    ↓
Azure App Service (Backend — Node.js)
    ↓
Azure Database for PostgreSQL (Flexible Server)
    ↓
Azure Blob Storage (audit log backups, PDF summaries)
```

**Alternative: Cloudways** (simpler managed hosting for early pilot)

---

## Environment Variables

### Backend `.env`

```
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/aegis_health
JWT_SECRET=<long-random-string>
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Development Setup

```bash
# Backend
cd backend
npm install
node server.js          # Starts on :4000

# Frontend
cd frontend
npm install
npm run dev             # Starts on :3000

# Database (PostgreSQL required)
psql -U postgres -c "CREATE DATABASE aegis_health;"
psql -U postgres -d aegis_health -f database/schema.sql
psql -U postgres -d aegis_health -f database/seed.sql
```
