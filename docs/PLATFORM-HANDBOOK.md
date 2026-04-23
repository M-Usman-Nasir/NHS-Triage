# Platform Handbook — Single Source of Truth (Engineering & Product)

**Aegis Health AI — NHS-aligned digital triage**  
**Canonical:** Use this document to align scope, trace what is built, and record what is still required. When behaviour or scope changes, update the relevant section here (and reference the PR / ticket).

**Companion (clinical & compliance depth):** [CLINICAL-GOVERNANCE.md](./CLINICAL-GOVERNANCE.md) — includes **[§5.1–5.3 regulatory & market positioning](./CLINICAL-GOVERNANCE.md#51-regulatory--compliance-positioning-product-statement)**, **[§8 — Planned NHS integration tiers (later)](./CLINICAL-GOVERNANCE.md#8-planned-nhs-integration-strategy-later)**, and **[§9 — Future ML augmentation (backlog)](./CLINICAL-GOVERNANCE.md#9-future-ml-augmentation-backlog)** (not phase 1).

---

## Table of contents

1. [Purpose & how to use this handbook](#1-purpose--how-to-use-this-handbook)  
2. [System logic & engineering rules](#2-system-logic--engineering-rules)  
3. [Seven core modules](#3-seven-core-modules)  
4. [Phased programme](#4-phased-programme)  
5. [Epics, acceptance criteria & RACI (condensed)](#5-epics-acceptance-criteria--raci-condensed)  
6. [Pathways, outcomes & roles](#6-pathways-outcomes--roles)  
7. [Architecture (condensed)](#7-architecture-condensed)  
8. [User flows (summary)](#8-user-flows-summary)  
9. [**Implementation status — built vs gap**](#9-implementation-status--built-vs-gap)  
10. [Repository map](#10-repository-map)  
11. [Document control](#11-document-control)

---

## 1. Purpose & how to use this handbook

| Audience | Use this handbook to… |
|----------|------------------------|
| **Engineering** | Know runtime order, module boundaries, repo locations, and what remains to build. |
| **Product / delivery** | Track phases, epics, and gates without duplicating Jira/Azure content (link epics here by ID when useful). |
| **Clinical / SI** | Cross-check that implemented behaviour matches [CLINICAL-GOVERNANCE.md](./CLINICAL-GOVERNANCE.md); safety narrative lives there. |

**Rule:** If it affects safety order, outcomes, or regulatory claims, update **both** this handbook (technical fact) and **CLINICAL-GOVERNANCE** (stakeholder/clinical wording) in the same change window.

---

## 2. System logic & engineering rules

### 2.1 Runtime order (authoritative)

| Step | Stage |
|------|--------|
| **0** | Patient **selects pathway** (not ML “diagnosis”; chooses question + rule set). |
| **1** | Patient **answers** questions (+ demographics as required). |
| **2** | **Submit** to API → single triage run (`runTriage`). |
| **3** | **Decision engine (orchestrator)** runs **only** in this internal order: **(3a) Red-flag** → **(3b) Pharmacy eligibility** → **(3c) Outcome rules** → **(3d) Summary**. |
| **4** | Response returned; record should be persisted with audit metadata (see §9). |

Red-flag **must not** run after routine outcome or pharmacy logic in any code path.

### 2.2 Engineering rules

| Always | Never |
|--------|--------|
| Escalate if unsure (document defaults). | Diagnose or imply a formal diagnosis beyond triage navigation. |
| Log decisions (inputs, ruleset id/hash, outcomes; no secrets/excess PII). | Replace clinician/pharmacist judgement in copy or logic. |
| Keep rules **deterministic** (same inputs + ruleset → same outcome). | Skip or bypass red-flag evaluation in production triage. |

### 2.3 Build order (implementation sequence)

May differ from runtime order: question flow → red-flag module → orchestrator → eligibility → summary → UI/API integration → tests. **Ship** only when runtime order in §2.1 is enforced and tested.

---

## 3. Seven core modules

| # | Module | Responsibility |
|---|--------|----------------|
| 1 | **Patient consultation interface** | Pathway choice, questionnaire, consent, result display. |
| 2 | **Clinical decision engine** | Deterministic orchestration of triage steps. |
| 3 | **Red-flag detection** | Separate safety layer; first inside engine; overrides routine routing. |
| 4 | **Pharmacy eligibility** | Strict criteria; runs only after red-flag clearance. |
| 5 | **Consultation summary generator** | Structured report from facts + templates. |
| 6 | **Admin dashboard** | Pathways/rules visibility, analytics (governed publish workflow = gap). |
| 7 | **Analytics & reporting** | Usage and outcomes; PII-safe aggregates (CRM/reporting pages = partial). |

---

## 4. Phased programme

| Phase | Theme | Exit signal (summary) |
|-------|--------|------------------------|
| **0** | Alignment & baseline | Red-flag-first agreed; backlog tagged Tech/Safety/Compliance/Arch. |
| **1** | Safety spine & auditability | Red-flag tests in CI; consultation record design includes ruleset + RF result. |
| **2** | Server-driven branching questionnaire | Next question from server; invalid jumps rejected. |
| **3** | Rules in DB + eligibility hardening | Published `rulesetVersion` on each consultation; matrix tests. |
| **4** | Summaries & professional handoff | Schema + clinical sign-off on templates. |
| **5** | Admin governance | Two-person rule publish; rollback. |
| **6** | Analytics & SRE | SLOs + DR drill. |
| **7** | Assurance packaging | Go/no-go evidence per environment. |

---

## 5. Epics, acceptance criteria & RACI (condensed)

Roles: **CL** Clinical Lead, **SI** Safety Officer, **PO** Product Owner, **EL** Engineering Lead, **ENG** Engineering, **IG** IG/DPO, **OPS** Operations.

| Epic | Goal | Accountable |
|------|------|-------------|
| **E-01** Red-flag contract & tests | RF first; tests prove no bypass | SI |
| **E-02** Consultation audit record | Persist inputs + ruleset + RF + outcome | EL |
| **E-03** Server-driven branching | API-owned question graph | PO |
| **E-04** Versioned DB rules | Load rules from DB | EL |
| **E-05** Pharmacy eligibility matrix | Signed matrix + edge tests | CL |
| **E-06** Structured summary | Versioned schema + CL sign-off | CL |
| **E-07** Admin publish workflow | Draft/review/publish + audit | PO + SI |
| **E-08** Analytics MVP | IG-approved aggregates | PO + IG |
| **E-09** SRE / DR | SLOs + restore drill | EL |
| **E-10** Safety case & hazards | Living hazard log | SI |
| **E-11** DPIA / GDPR | Pilot sign-off | IG |
| **E-12** Patient accessibility | WCAG programme | PO |

*(Full acceptance criteria lived in legacy `milestone-plan.md`; re-expand rows here or in your tracker when needed.)*

### Programme RACI (selected gates)

| Activity | Accountable |
|----------|-------------|
| Pathway / red-flag **content** sign-off | CL |
| Clinical safety case | SI |
| Release to named environment | PO or EL (pick one per org) |
| DPIA | IG |

---

## 6. Pathways, outcomes & roles

### 6.1 Pathway codes (seven)

`uti`, `sore_throat`, `sinusitis`, `otitis_media`, `insect_bites`, `impetigo`, `shingles`

### 6.2 Outcome codes (five — engine)

| Code | Label |
|------|--------|
| `self_care` | Self-care |
| `pharmacy` | Pharmacy |
| `gp` | GP |
| `urgent_care` | Urgent care |
| `emergency_999` | Emergency (999) |

### 6.3 Roles → routes (current UI)

| Role | Routes |
|------|--------|
| Patient | `/`, `/consultation`, `/result` |
| Pharmacist | `/pharmacist/dashboard` |
| Admin | `/admin/dashboard` |
| CRM staff | `/crm/*` |

---

## 7. Architecture (condensed)

```
Browser (Next.js)
       │ HTTPS / JSON
       ▼
Express API (Node)
  ├── /api/consultation  → runTriage → store
  ├── /api/summary
  ├── /api/admin
  └── /api/crm
       │
       ├── engine/decisionEngine.js   (orchestrator)
       ├── engine/redFlagDetector.js
       ├── engine/pharmacyEligibility.js
       └── data/pathways/*.json
       ▼
PostgreSQL (schema in repo; not all flows persist to DB in demo)
```

**Important:** `POST /api/consultation` and `GET /api/summary/:id` both read the same **in-memory consultation store** (seeded demo rows + live submissions). Unify on PostgreSQL for production (see §9).

---

## 8. User flows (summary)

1. **Patient:** Landing → choose pathway → consent → consultation questions → submit → result (outcome + summary + safety-net).  
2. **Red flag:** If answers trigger RF → emergency/urgent outcome; routine pharmacy line must not apply.  
3. **Pharmacist:** Dashboard list → case detail → status / print (demo).  
4. **Admin:** Tabs for overview / pathways / rules (demo).  
5. **CRM:** Patients, cases, tasks, comms, providers, reports (demo APIs + UI).

---

## 9. Implementation status — built vs gap

Use this table in **planning meetings** and tick rows in git issues when scope changes.

| Capability | Status | Evidence / location | Gap / next step |
|------------|--------|---------------------|-----------------|
| Red-flag **first** in engine | **Done** | `decisionEngine.js` → `redFlagDetector.js` | More integration tests per pathway |
| Pharmacy eligibility | **Done** | `pharmacyEligibility.js` | Signed clinical matrix + edge-case tests (E-05) |
| Outcome rules from JSON | **Done** | `backend/data/pathways/*.json` | DB-backed version + publish workflow (E-04, E-07) |
| Summary text in triage result | **Done** | `decisionEngine.js` | Versioned summary schema + PDF (E-06) |
| POST consultation + triage | **Done** | `routes/consultation.js` | Persist to PostgreSQL; ruleset hash on row |
| GET consultation by ID | **Done** | In-memory `Map` | Same store as summary / single source |
| GET consultation list | **Done** | Pagination query params | Auth |
| GET pathways list | **Done** | `consultation.js` `/pathways/list` | — |
| GET summary by ID | **Done** | `summary.js` + `lib/summaryMapper.js` read **`store/consultationStore`** (seeded mocks + live POST) | PDF export still 501 |
| Admin analytics / pathways / rules | **Demo** | `routes/admin.js` | Auth + real DB |
| CRM APIs + pages | **Demo** | `routes/crm.js`, `frontend/pages/crm/*` | Real DB; remove mock-only gaps |
| Patient landing + consent | **Done** | `pages/index.tsx` | Links to `/privacy`, `/terms`, `/accessibility` |
| Consultation UI | **Done** | `pages/consultation.tsx`, `GET/POST` consultation definitions + `question/next`, `lib/pathwayQuestions.ts` (fallback) | **Server-driven branching** (E-03): `questionGraph` in pathway JSON (e.g. sinusitis, shingles); offline fallback uses linear `PATHWAY_QUESTIONS` |
| Result UI | **Done** | `pages/result.tsx`, `lib/mapSummaryToResult.ts` | Live summary vs `?demo=true`; errors do not fall back to mock silently |
| API contracts (schemas) | **Partial** | `frontend/schemas/*.json`, `types/consultation.ts` | Wire CI validation / OpenAPI when backend stabilises |
| JWT + RBAC on APIs | **Not done** | Admin comments note no middleware | E-07 security |
| Structured audit events (application) | **Done** | `lib/auditLog.js` → `lib/auditPersistence.js`, `GET /api/admin/audit` | In-memory when no `DATABASE_URL`; else INSERT `audit_logs` |
| SQL migrations | **Done** | `database/migrations/*.sql`, `npm run migrate` | Add `000004_*.sql` for future DDL |
| Immutable DB audit trail | **Done** (opt-in) | `DATABASE_URL` + migrate + `pg` pool in `lib/db.js` | Retention / legal-hold policy still programme-owned |
| GDPR demo API (access + erasure log) | **Done** | `routes/gdpr.js` | Identity verification + DPO process for production |
| Regulatory / PGD context on API | **Done** | `lib/regulatoryContext.js`, `lib/pharmacyFirstGovernance.js` | Returned on consultation POST + summary GET |
| WCAG evidence pack | **In progress** | Landing/consultation + `/accessibility` | Formal audit (E-12) |
| DPIA / DTAC pack | **Not done** | See governance doc | IG programme |

---

## 10. Repository map

| Path | Role |
|------|------|
| `frontend/pages/index.tsx` | Landing |
| `frontend/pages/privacy.tsx`, `terms.tsx`, `accessibility.tsx` | Legal / IG pages |
| `frontend/pages/consultation.tsx` | Questionnaire |
| `frontend/pages/result.tsx` | Outcomes |
| `frontend/pages/admin/` | Admin |
| `frontend/pages/pharmacist/` | Pharmacist |
| `frontend/pages/crm/` | CRM |
| `frontend/lib/triageOutcomeIcons.tsx` | Outcome icons |
| `frontend/lib/api.ts`, `frontend/.env.example` | `NEXT_PUBLIC_API_URL` for patient + CRM fetches |
| `frontend/schemas/` | JSON Schema drafts for consultation POST + summary GET |
| `frontend/types/consultation.ts` | Shared TS types for payloads and summary |
| `backend/engine/*.js` | Triage engine |
| `backend/routes/*.js` | HTTP API |
| `backend/lib/db.js` | Optional `pg` pool (`DATABASE_URL`) |
| `backend/lib/auditLog.js`, `backend/lib/auditPersistence.js`, `backend/store/auditEventStore.js` | Audit trail (PostgreSQL or in-memory) |
| `backend/scripts/run-migrations.js` | `npm run migrate` |
| `backend/lib/regulatoryContext.js` | Intended purpose + PGD/MHRA posture JSON for clients |
| `backend/routes/gdpr.js` | Subject access export + erasure request (demo) |
| `database/migrations/*.sql` | Versioned DDL |
| `backend/data/pathways/` | Rule data |
| `database/schema.sql` | Target persistence model |

---

## 11. Document control

| Version | Date | Notes |
|---------|------|--------|
| 1.0 | 2026-04-23 | Consolidated alignment, milestones, MVP build, patient-flow, architecture, user flows, TASKS into this handbook |
| 1.1 | 2026-04-23 | PostgreSQL migrations + optional `audit_logs` persistence (`DATABASE_URL`, `npm run migrate`); handbook §9 status table updated |

**Superseded files (removed from repo):** `alignment-and-planning.md`, `milestone-plan.md`, `patient-flow-ui-finalization.md`, `architecture.md`, `user_flows.md`, `TASKS.md`, `MVP_Build.md` (under docs), `ClientQ&A.md` — content merged here or into CLINICAL-GOVERNANCE.
