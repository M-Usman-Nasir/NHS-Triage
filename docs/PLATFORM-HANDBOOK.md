# Platform Handbook — Single Source of Truth (Engineering & Product)

**Aegis Health AI — NHS-aligned digital triage**  
**Canonical:** Use this document to align scope, trace what is built, and record what is still required. When behaviour or scope changes, update the relevant section here (and reference the PR / ticket).

**Companion (clinical & compliance depth):** [CLINICAL-GOVERNANCE.md](./CLINICAL-GOVERNANCE.md) — includes **[§2 — patient app journey vs engine order](./CLINICAL-GOVERNANCE.md#patient-consultation-workflow-as-implemented)**, **[§3 — pathway matrix, branching vs linear, layered disclaimers](./CLINICAL-GOVERNANCE.md#clinical-scope-matrix)**, **[§5 — Security & data protection](./CLINICAL-GOVERNANCE.md#security-and-data-protection)**, **[§5.1–5.3 regulatory & market positioning](./CLINICAL-GOVERNANCE.md#51-regulatory--compliance-positioning-product-statement)**, **[§8 — Planned NHS integration tiers (later)](./CLINICAL-GOVERNANCE.md#8-planned-nhs-integration-strategy-later)**, and **[§9 — Future ML augmentation (backlog)](./CLINICAL-GOVERNANCE.md#9-future-ml-augmentation-backlog)** (not phase 1).

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

### 2.4 Non-negotiable system requirements (must add / must hold)

These are mandatory quality constraints for release readiness.

#### A) Stability
- No broken user flow in patient, pharmacist, admin, or CRM critical paths.
- All primary/alternate/error paths must be tested before release.
- Any path that can submit, escalate, or handoff must have automated regression coverage.

#### B) Explainability
- Every triage decision must carry a clear, user-readable and audit-readable reason.
- Minimum decision explanation contract:
  - **Outcome** (e.g., `pharmacy`)
  - **Reason** (e.g., `No red flags + eligible symptoms`)
- Decision responses that do not include a reason are considered non-compliant.

#### C) Structured output
- Triage output must not be a bare result code; it must be a structured report payload.
- Minimum required report fields:
  - Symptoms
  - Answers
  - Decision
  - Reasoning
  - Timestamp
- This structured report must be persisted and retrievable for summary/handoff/audit.

### 2.5 Strict architecture constraint (MVP boundary)

The MVP architecture is explicitly constrained to a **standalone system**.

#### Scope lock for MVP
- **No external integrations** are in MVP scope (e.g., NHS Login, Spine, GP Connect, third-party telehealth, external ML services).
- All core workflow capability must be delivered using internal app modules and local platform data stores.

#### Mandatory MVP modules
- Patient UI
- Backend API
- Rule engine
- Database
- Admin panel
- Pharmacist panel
- Audit system

Any proposal that introduces dependency on external platforms must be tracked as a **post-MVP capability** and must not block MVP delivery or acceptance.

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
| Admin (settings) | `/admin_crm/settings` |
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

1. **Patient:** Landing (**pathway choice + consent + page copy**) → **consultation** (demographics + optional symptom text + **preface** context questions + **clinical** pathway questions via `definitions` / `question/next`) → **POST** `/api/consultation` → **result** (outcome + summary + pathway disclaimer + safety-net + `GET /api/summary/:id`). Pathway is **not** inferred from free text in phase 1 — see [CLINICAL-GOVERNANCE §2 — patient consultation workflow](./CLINICAL-GOVERNANCE.md#patient-consultation-workflow-as-implemented).  
2. **Red flag:** Evaluated **first** inside `runTriage`; if answers trigger RF → emergency/urgent outcome; routine pharmacy line must not apply.  
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
| Stability: no broken flows + all paths tested | **Partial** | Core patient flow implemented; selective tests | Define full path matrix (happy/alternate/error), add CI regression suite, enforce release gate |
| Explainability: every decision has reason | **Done (core)** | `decisionEngine` response includes `outcomeReason`; rendered in `pages/result.tsx` | Add automated contract check that reason is always present (including fallback/error branches) |
| Structured output report (symptoms/answers/decision/reasoning/timestamp) | **Partial** | Consultation + summary payloads include most fields (`routes/consultation.js`, `routes/summary.js`, `summaryMapper`) | Formalize versioned report schema and enforce required fields in contract validation |
| Pharmacist dashboard → live summaries | **Partial** | `GET /api/summary`, `GET /api/summary/` list exist | `pages/pharmacist/dashboard.tsx` uses **mock rows**; wire to API + auth |
| Admin settings → admin APIs | **Partial** | `GET /api/admin/pathways`, `/rules`, `/analytics` | `pages/admin_crm/settings.tsx` uses **local mock data** only (no `fetch` to backend) |
| Admin analytics from live consultations | **Partial** | `GET /api/consultation` list + store | `routes/admin.js` `/analytics` returns **static demo** series; not aggregated from `consultationStore` |
| Consultation PDF export | **Partial** | `GET /api/summary/:id/pdf` | Returns **501** until implemented |
| In-app pathway / rule configuration | **Not in UI** | Pathways are `backend/data/pathways/*.json` | Editor + publish / RBAC (E-04, E-07) |
| Live CRM from triage DB | **Partial** | `routes/crm.js` + pages | Mock JSON / in-memory mutations; not PostgreSQL consultations |
| API contracts (schemas) | **Partial** | `frontend/schemas/*.json`, `types/consultation.ts` | Wire CI validation / OpenAPI when backend stabilises |
| JWT + RBAC on APIs | **Not done** | Admin comments note no middleware | E-07 security |
| Structured audit events (application) | **Done** | `lib/auditLog.js` → `lib/auditPersistence.js`, `GET /api/admin/audit` | In-memory when no `DATABASE_URL`; else INSERT `audit_logs` |
| SQL migrations | **Done** | `database/migrations/*.sql`, `npm run migrate` | Add `000004_*.sql` for future DDL |
| Immutable DB audit trail | **Done** (opt-in) | `DATABASE_URL` + migrate + `pg` pool in `lib/db.js` | Retention / legal-hold policy still programme-owned |
| GDPR demo API (access + erasure log) | **Done** | `routes/gdpr.js` | Identity verification + DPO process for production |
| Frontend HTTP security headers | **Done** | `frontend/next.config.js` (frame/options/referrer/permissions; HSTS in production) | CSP / edge rate limits — see [CLINICAL-GOVERNANCE §5](./CLINICAL-GOVERNANCE.md#security-and-data-protection) backlog |
| Regulatory / PGD context on API | **Done** | `lib/regulatoryContext.js`, `lib/pharmacyFirstGovernance.js` | Returned on consultation POST + summary GET |
| WCAG evidence pack | **In progress** | Landing/consultation + `/accessibility` | Formal audit (E-12) |
| DPIA / DTAC pack | **Not done** | See governance doc | IG programme |

### 9.1 Secure backend readiness gaps (implementation backlog)

This subsection captures **security hardening gaps** identified in the current backend for planned implementation.

| Priority | Gap | Current evidence | Implementation target |
|----------|-----|------------------|-----------------------|
| **P0** | Missing authentication and authorization on sensitive APIs | `backend/routes/admin.js` comment explicitly notes demo/no auth; CRM/admin/GDPR routes mounted in `backend/server.js` without auth middleware | Add authN + role-based authZ middleware (admin/clinician/ops scopes), protect `/api/admin/*`, `/api/crm/*`, GDPR endpoints, and consultation-list endpoints |
| **P0** | No API rate limiting / abuse protection | `backend/package.json` has no limiter package; `backend/server.js` has no rate-limit middleware | Add route-class-based rate limits (strict for auth/GDPR/admin writes, moderate for consultation flow, broader for read-only dashboards) |
| **P0** | GDPR identity model is demo-level (UUID possession) | `backend/routes/gdpr.js` header notes weak identifier + production verification requirement | Implement identity verification, request workflow status, and DPO-reviewed approval for export/erasure actions |
| **P1** | Input validation is inconsistent and manual | `backend/routes/consultation.js`, `backend/routes/crm.js` perform field checks only; no Joi/Zod in dependencies | Introduce schema validation middleware for all write endpoints; return consistent 4xx error shapes |
| **P1** | Missing CSRF strategy for state-changing routes | Multiple `POST`/`PUT` handlers; no CSRF middleware/tokens present | For cookie/session auth: add CSRF middleware + token strategy; for bearer tokens: lock CORS + same-site posture and document model |
| **P1** | Missing hardened HTTP security headers middleware | No `helmet` equivalent in `backend/server.js` | Add baseline security headers middleware and align with frontend header/CSP strategy |
| **P1** | Security event coverage incomplete for all write actions | Audit logging exists (`backend/lib/auditLog.js`) but not uniformly attached to every mutating route | Extend audit hooks to all mutating endpoints with actor, request id, entity id, outcome, and failure reason |
| **P2** | Logging and data minimization policy not fully enforced app-wide | Request logger in `backend/server.js` is basic; sanitization focused on audit payload helper | Standardize structured logger, redact sensitive fields globally, and enforce log schema |
| **P2** | CORS hardening depends on env discipline only | `backend/server.js` uses single origin env var with localhost fallback | Add environment guardrails (fail-fast on unsafe production config), explicit allow-list handling, and deployment checks |
| **P2** | Security assurance automation not yet defined | No dedicated security checks/scripts surfaced in backend scripts | Add automated security checks (dependency audit policy, endpoint auth tests, rate-limit tests, headers tests) in CI |

### 9.2 Recommended implementation sequence (security)

1. **Gatekeeping first:** authN/authZ + route protection + role model  
2. **Abuse controls:** rate limiting + request throttling + failure telemetry  
3. **Data rights hardening:** GDPR identity verification workflow  
4. **Validation baseline:** schema middleware across all write routes  
5. **Protocol hardening:** CSRF model + security headers  
6. **Operational controls:** structured secure logging + CI security checks

### 9.3 Security implementation checklist template (copy/paste)

Use this template for each security workstream ticket/PR.  
Status key: `[ ]` not started, `[~]` in progress, `[x]` complete.

```
Security Workstream: <title>
Owner: <name>
Target environment: <dev/staging/prod>
Related gap(s): <P0/P1/P2 ids from §9.1>
Date started: <yyyy-mm-dd>
Target completion: <yyyy-mm-dd>

1) Scope and design
[ ] Document exact routes/surfaces in scope
[ ] Confirm threat model assumptions
[ ] Confirm fallback/rollback plan
[ ] Confirm observability (logs/metrics/alerts) plan

2) Implementation
[ ] Backend code implemented
[ ] Configuration/env vars added to .env.example
[ ] Error responses follow platform API shape
[ ] Audit logging added for success/failure paths

3) Verification
[ ] Unit tests added/updated
[ ] Integration tests added/updated
[ ] Negative-path tests completed (unauthorized/invalid/abuse)
[ ] Manual verification in local/dev
[ ] Manual verification in staging

4) Security and compliance checks
[ ] Least-privilege access confirmed
[ ] Sensitive data redaction confirmed in logs
[ ] CORS/session/CSRF behavior validated (as applicable)
[ ] Rate-limit behavior validated (as applicable)
[ ] GDPR workflow impact reviewed (as applicable)

5) Release readiness
[ ] Documentation updated (PLATFORM-HANDBOOK + related docs)
[ ] Migration/rollout steps documented (if any)
[ ] Backward compatibility impact assessed
[ ] Go/no-go sign-off captured

Completion notes:
- What changed:
- Evidence links (PR/tests/logs):
- Remaining risks:
```

#### Quick checklist by priority group

**P0 checklist (must-have before production exposure)**
- [ ] AuthN/AuthZ enforced on admin/CRM/GDPR sensitive routes
- [ ] Rate limiting enabled on critical endpoints
- [ ] GDPR identity verification workflow implemented

**P1 checklist (hardening before broader rollout)**
- [ ] Schema validation middleware across all write routes
- [ ] CSRF strategy implemented for chosen auth model
- [ ] Security headers middleware enabled and tested
- [ ] Audit coverage complete for mutating endpoints

**P2 checklist (operational maturity)**
- [ ] Structured logging + redaction policy enforced
- [ ] CORS/env guardrails fail fast on unsafe production config
- [ ] CI security checks automated and passing

### 9.4 Future capability backlog (not in current build)

The following items are intentionally tracked for later phases and are **not implemented now**:

| Capability | Current status | Future implementation note |
|------------|----------------|----------------------------|
| AI diagnosis | **Not implemented** | Keep current product boundary as deterministic triage support; if introduced later, require separate safety/regulatory workstream, model governance, and explicit clinical accountability controls. |
| Machine learning | **Not implemented** | Candidate use-cases should begin as advisory/risk-assist features behind controls; require model lifecycle process (training data governance, drift monitoring, rollback, auditability). |
| NHS integrations (NHS Login, Spine, GP Connect) | **Not implemented** | Plan as phased integration programme with environment-specific onboarding, security review, and contractual/assurance gates before production use. |
| Video / telehealth | **Not implemented** | Treat as a separate clinical workflow module (scheduling, consent, identity, recording policy, escalation and handoff rules). |
| Advanced analytics | **Partially implemented (demo analytics only)** | Expand from current demo dashboards to governed analytics with production data quality controls, role-based access, and IG-approved reporting definitions. |

---

## 10. Repository map

| Path | Role |
|------|------|
| `frontend/pages/index.tsx` | Landing |
| `frontend/pages/privacy.tsx`, `terms.tsx`, `accessibility.tsx` | Legal / IG pages |
| `frontend/pages/consultation.tsx` | Questionnaire |
| `frontend/pages/result.tsx` | Outcomes |
| `frontend/pages/admin_crm/` (includes `settings.tsx`, `profile.tsx`) | CRM + admin settings |
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
| 1.2 | 2026-04-23 | §9 — explicit partial / not-in-ui rows (pharmacist, admin, analytics, PDF, rule editor) aligned with [CLINICAL-GOVERNANCE.md](./CLINICAL-GOVERNANCE.md#core-platform-components--honest-build-status) |
| 1.3 | 2026-04-23 | Companion intro — link to CLINICAL-GOVERNANCE §3 (pathway matrix, branching, layered disclaimers) |
| 1.4 | 2026-04-23 | §8 patient flow — demographics + preface + clinical; red-flag first; link to CLINICAL-GOVERNANCE §2 workflow table |
| 1.5 | 2026-04-23 | §9 row — frontend security headers; companion link to CLINICAL-GOVERNANCE §5 security & data protection |
| 1.6 | 2026-04-27 | Added §9.1–9.2 secure backend readiness gaps + prioritized implementation sequence |
| 1.7 | 2026-04-27 | Added §9.3 security implementation checklist template + priority-group quick checklist |
| 1.8 | 2026-04-27 | Added §9.4 future capability backlog (AI diagnosis, ML, NHS integrations, telehealth, advanced analytics) |
| 1.9 | 2026-04-27 | Added mandatory system requirements for stability, explainability, and structured output; added status rows in §9 |
| 2.0 | 2026-04-27 | Added strict MVP architecture constraint: standalone-only, no external integrations, and mandatory module list in §2.5 |

**Superseded files (removed from repo):** `alignment-and-planning.md`, `milestone-plan.md`, `patient-flow-ui-finalization.md`, `architecture.md`, `user_flows.md`, `TASKS.md`, `MVP_Build.md` (under docs), `ClientQ&A.md` — content merged here or into CLINICAL-GOVERNANCE.

Future NHS Integration Architecture

Later, when approved:

Patient clicks:
[ Connect NHS Account ]
Flow:
User → NHS Authentication → Permission Grant → Linked Profile

 Database Design (Important)

Add fields:

patients table
id
name
dob
gender
phone
email
nhs_connected
nhs_number
gp_connected
integration_connections
id
patient_id
service_type
status
connected_at
token_reference

Security Requirements ⭐

If you ever add NHS integrations:

You MUST implement:

OAuth authentication
Encryption
Audit logging
Consent management