# Aegis Health AI — Project Task Tracker

> **Project**: AI Consultation & Triage Platform
> **Client**: Aegis Health AI
> **Total Budget**: £30,000 GBP
> **Timeline**: 20 Weeks (5 Phases)
> **Last Updated**: 21 Apr 2026

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Completed |
| 🔄 | In Progress |
| ⏳ | Pending |
| ❌ | Blocked |

---

## Phase 0 — Project Alignment & Discovery (Week 1–2)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 0.1 | Create TASKS.md project tracker | ✅ | This file |
| 0.2 | Create project README.md | ✅ | Developer + client overview |
| 0.3 | Set up folder structure | ✅ | frontend / backend / docs / database |
| 0.4 | Define database schema | ✅ | schema.sql — patients, consultations, outcomes, audit_logs |
| 0.5 | Create seed data (mock records) | ✅ | 10 patients, 5 consultations, analytics data |
| 0.6 | Document end-to-end workflow | ✅ | docs/user_flows.md — 5 user flows documented |
| 0.7 | Document architecture | ✅ | docs/architecture.md — full system design |
| 0.8 | Compliance checklist | ✅ | docs/compliance_checklist.md — DTAC, GDPR, DCB0129 |

---

## Phase 1 — UX, Wireframes & Technical Foundation (Week 3–5)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Create clinical decision trees (7 pathways) | ✅ | uti, sore_throat, sinusitis, otitis_media, insect_bites, impetigo, shingles |
| 1.2 | Build backend server entry point | ✅ | backend/server.js — Express + CORS + logging |
| 1.3 | Build consultation API route | ✅ | POST /api/consultation — full triage pipeline |
| 1.4 | Build summary API route | ✅ | GET /api/summary/:id — returns full report |
| 1.5 | Build admin API route | ✅ | GET /api/admin/rules, /pathways, /analytics |
| 1.6 | Design frontend pages (Next.js) | ✅ | index, consultation, result, pharmacist/dashboard, admin/dashboard |

---

## Phase 2 — Core MVP Build (Week 6–11)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Clinical decision engine (rule evaluator) | ✅ | backend/engine/decisionEngine.js — full pipeline |
| 2.2 | Red-flag detection system | ✅ | backend/engine/redFlagDetector.js — 20+ red flags |
| 2.3 | Pharmacy eligibility module | ✅ | backend/engine/pharmacyEligibility.js |
| 2.4 | Consultation summary generator | ✅ | Built into decisionEngine.js generateSummary() |
| 2.5 | Patient consultation interface (frontend) | ✅ | Dynamic branching, per-pathway questions |
| 2.6 | Pharmacist dashboard | ✅ | Review panel, case detail, status updates |
| 2.7 | Admin dashboard | ✅ | Analytics, pathway table, rules viewer |
| 2.8 | Role-based access control | ⏳ | JWT + roles defined — middleware pending |
| 2.9 | Audit logging system | ✅ | audit_logs table + console logging in routes |

---

## CRM Module (Added V0.5)

| # | Task | Status | Notes |
|---|------|--------|-------|
| C.1 | CRM mock data (patients, cases, comms, tasks, providers) | ✅ | backend/data/crm_data.json |
| C.2 | CRM backend API routes | ✅ | /api/crm/* — 12 endpoints |
| C.3 | CRM shared sidebar layout component | ✅ | frontend/components/CRMLayout.tsx |
| C.4 | CRM dashboard (KPIs, activity, charts) | ✅ | /crm |
| C.5 | Patients list (search, filter, risk badges) | ✅ | /crm/patients |
| C.6 | Patient profile (tabs: overview, cases, comms, tasks) | ✅ | /crm/patients/[id] |
| C.7 | Cases Kanban pipeline (5 stages, move cases) | ✅ | /crm/cases |
| C.8 | Communications log (inbox/outbox, compose modal) | ✅ | /crm/communications |
| C.9 | Provider directory (pharmacists + GPs, metrics) | ✅ | /crm/providers |
| C.10 | Tasks & follow-ups (priority sort, create, complete) | ✅ | /crm/tasks |
| C.11 | Reports & analytics (trends, pathway stats, export) | ✅ | /crm/reports |

---

## Phase 3 — Internal Testing & Iteration (Week 12–14)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Unit tests — decision engine | ⏳ | Test all 7 pathways |
| 3.2 | Unit tests — red-flag detection | ⏳ | Test emergency escalation |
| 3.3 | End-to-end workflow tests | ⏳ | Full patient journey test |
| 3.4 | UAT checklist creation | ⏳ | For client sign-off |
| 3.5 | Bug log and issue tracking | ⏳ | Document known issues |

---

## Phase 4 — Compliance & Stakeholder Readiness (Week 15–17)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | DTAC evidence pack draft | ⏳ | NHS Digital Assessment Criteria |
| 4.2 | DCB0129 clinical safety file | ⏳ | Clinical risk management |
| 4.3 | DPIA (Data Protection Impact Assessment) | ⏳ | UK GDPR requirement |
| 4.4 | DSP Toolkit readiness checklist | ⏳ | Data Security & Protection |
| 4.5 | WCAG 2.2 AA accessibility review | ⏳ | Accessibility compliance |
| 4.6 | Demo script and walkthrough doc | ⏳ | For stakeholder presentations |

---

## Phase 5 — Pilot Readiness & Next-Phase Planning (Week 18–20)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Pilot gap analysis | ⏳ | What is missing before NHS pilot |
| 5.2 | Phase 2 roadmap (post-MVP) | ⏳ | AI features, EHR integration |
| 5.3 | NHS integration considerations doc | ⏳ | FHIR / GP Connect / NHS login |
| 5.4 | Evidence-generation strategy | ⏳ | Clinical validation plan |
| 5.5 | Stakeholder presentation pack | ⏳ | Final client-facing deck |

---

## Budget Tracker

| Version | Phase | Timeline | Budget | Status |
|---------|-------|----------|--------|--------|
| V0.1 | Platform Foundation | Month 1 | £4,000 | ✅ Complete (scaffolded) |
| V0.5 | Functional Prototype | Month 2 | £5,000 | ⏳ Pending |
| V1.0 | MVP Triage Platform | Month 3–4 | £9,000 | ⏳ Pending |
| V1.5 | Pharmacy Pilot Version | Month 5–6 | £7,000 | ⏳ Pending |
| V2.0 | AI Optimization | Month 7–8 | £5,000 | ⏳ Pending |
| | **TOTAL** | **8 months** | **£30,000** | |

---

## Clinical Pathways Tracker

| Condition | Decision Tree | Red-Flag Rules | Pharmacy Eligibility | Status |
|-----------|--------------|----------------|----------------------|--------|
| Sore Throat | ✅ | ✅ | ✅ | Complete |
| Sinusitis | ✅ | ✅ | ✅ | Complete |
| Acute Otitis Media | ✅ | ✅ | ✅ | Complete |
| Infected Insect Bites | ✅ | ✅ | ✅ | Complete |
| Impetigo | ✅ | ✅ | ✅ | Complete |
| Shingles | ✅ | ✅ | ✅ | Complete |
| UTI (Uncomplicated) | ✅ | ✅ | ✅ | Complete |

---

## Team Roles

| Role | Responsibility |
|------|---------------|
| Project Manager | Roadmap, delivery, client comms |
| Technical Lead | Architecture, code review |
| Backend Engineers | APIs, decision engine, database |
| Frontend Engineers | Patient UI, pharmacist & admin dashboards |
| AI Engineer | ML modules (Phase V2.0) |
| DevOps Engineer | Cloud infrastructure, CI/CD |
| QA Engineer | Testing, UAT, bug tracking |

---

## Quick Links

- [README.md](./README.md) — Project overview
- [docs/architecture.md](./docs/architecture.md) — System architecture
- [docs/user_flows.md](./docs/user_flows.md) — Patient & pharmacist journeys
- [docs/clinical_rules_explained.md](./docs/clinical_rules_explained.md) — Clinical logic (client-facing)
- [docs/compliance_checklist.md](./docs/compliance_checklist.md) — NHS compliance
- [database/schema.sql](./database/schema.sql) — Database schema
- [backend/engine/](./backend/engine/) — Decision engine modules
- [frontend/pages/](./frontend/pages/) — UI pages

---

*This tracker is updated throughout the development lifecycle. Each completed task is marked ✅ with notes.*
