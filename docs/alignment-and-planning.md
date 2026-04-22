# Alignment & Planning — MVP → NHS-Ready Platform

**Aegis Health AI — regulated, safety-critical healthcare triage**

This document aligns product scope, clinical safety, compliance, and technical architecture. It is a **living planning artefact**: dates, owners, and acceptance criteria should be updated as the programme matures.

**Related documents**

| Document | Purpose |
|----------|---------|
| [clinical_rules_explained.md](./clinical_rules_explained.md) | Stakeholder-facing explanation of rule-based triage |
| [architecture.md](./architecture.md) | System structure |
| [compliance_checklist.md](./compliance_checklist.md) | Compliance tracking |
| [user_flows.md](./user_flows.md) | User journeys |
| [milestone-plan.md](./milestone-plan.md) | Epics, acceptance criteria, RACI (clinical vs engineering) |
| [patient-flow-ui-finalization.md](./patient-flow-ui-finalization.md) | Seven conditions, outcomes, flow diagrams, roles, UI baseline, frontend plan |

---

## 1. Programme intent

Deliver a **deterministic, auditable** clinical triage pathway from patient questionnaire through to structured outputs for pharmacy, GP, and emergency escalation—suitable for **pilot → assurance → scaled NHS-aligned** deployment.

**Non-negotiables**

- **Safety over convenience** — over-escalation is acceptable; under-escalation is not.
- **No black-box triage** — every outcome traceable to explicit rules and inputs.
- **Red-flag layer is separate** — it must not be “balanced” against pharmacy or outcome rules.

---

## 2. Four planning tracks (single backlog)

Work should be tagged in the backlog as **Tech**, **Safety**, **Compliance**, or **Arch** so MVP scope does not silently drop safety or governance.

| Track | Definition of “ready” |
|-------|-------------------------|
| **Technical** | Versioned pathways, reproducible builds, environment separation, validated APIs, observability, backup/restore drills |
| **Clinical safety** | Clinical safety case (e.g. DCB0129 / DCB0134 where applicable), hazard analysis, rule traceability, documented short-circuit behaviour for red flags |
| **Compliance** | UK GDPR (lawful basis, DPIA, retention), DSPT-aligned controls where targeted, audit trails, accessibility (WCAG), transparency and signposting |
| **Scalable architecture** | Stateless API tier, rules **data** decoupled from **engine**, idempotent writes, append-only or immutable audit events, reporting without unnecessary PII |

---

## 3. Seven core modules

### 3.1 Patient consultation interface

| Aspect | MVP | Hardening / NHS-ready |
|--------|-----|------------------------|
| Flow | Step-by-step questionnaire | **Dynamic branching** — pathway as a directed graph or guarded sections |
| Trust | Client collects answers | **Server** validates “next question”; session state persisted and replayable for audit |
| Safety UI | Clear consent, emergency signposting | Short-circuit UI when red flag fires; no further “helpful” questions |

### 3.2 Clinical decision engine

| Aspect | MVP | Hardening |
|--------|-----|-----------|
| Logic | Rule-based decision trees; deterministic evaluation | Versioned rulesets; `pathway_version` / `ruleset_hash` stored **per consultation** |
| Transparency | Human-readable reasons | Stable **reason codes** + rule identifiers in API and storage |
| AI | Not in critical path | Any LLM use only with explicit governance—not for core triage decisions |

**Implementation note (repo):** `backend/engine/decisionEngine.js` orchestrates triage; extend with persisted trace metadata as rules move from files to database.

### 3.3 Red-flag detection system (separate safety layer)

| Principle | Detail |
|-----------|--------|
| Responsibility | Single module: evaluate red-flag rules on **current answers + demographics** (and agreed free-text inputs if any) |
| Outcome | Returns `triggered \| not`, **codes**, **messages**; **overrides** downstream eligibility and routine outcomes |
| Ordering | Invoked **first** on each relevant step or on final submit (document which); main engine **must not** weaken a red-flag result for convenience |
| Change control | Red-flag changes require **stricter** review than copy or analytics tweaks |

**Implementation note (repo):** `backend/engine/redFlagDetector.js` + flow described in `clinical_rules_explained.md`. Harden by persisting **which rules ran and which fired** on each consultation record.

### 3.4 Pharmacy eligibility module

| Aspect | MVP | Hardening |
|--------|-----|-----------|
| Scope | Strict criteria (age, sex where clinically indicated, exclusions) | Full matrix per pathway + automated tests per cell |
| Ordering | After red-flag clearance only | **Never** evaluated in a way that could override red flags |

### 3.5 Consultation summary generator

| Aspect | MVP | Hardening |
|--------|-----|-----------|
| Content | Structured sections from **templates + facts** | PDF/HTML; headings aligned to GP/pharmacy handoff expectations |
| Safety | No inferred clinical facts beyond rules | Versioned templates; locale- and pathway-specific blocks |

### 3.6 Admin dashboard

| Aspect | MVP | Hardening |
|--------|-----|-----------|
| Rules | Read-only viewer; pathway on/off | Draft → reviewed → **published** workflow; rollback |
| Access | Basic auth / roles as available | RBAC, separation of duties, audit of every change |

**Implementation note (repo):** `database/schema.sql` — `clinical_pathways`, `clinical_rules` with `rule_type` (`red_flag`, `eligibility`, `escalation`, `outcome`). Admin UI should eventually drive **versioned** publishes, not ad-hoc DB edits.

### 3.7 Analytics & reporting

| Aspect | MVP | Hardening |
|--------|-----|-----------|
| Data | Aggregates; minimal PII in reports | Cohort analytics; dedicated reporting store or events |
| Privacy | No raw free-text in dashboards without policy | Pseudonymisation, retention-aligned exports |

---

## 4. Alignment & Planning — **phases**

Phases are sequential at a programme level; within a phase, workstreams can run in parallel where dependencies allow.

### Phase 0 — Alignment & baseline (weeks-scale, adjust to team)

**Goals:** Shared vocabulary, risk register seed, current-state map.

| Workstream | Outcomes |
|------------|----------|
| Clinical | Named clinical lead; sign-off that red-flag-first model is correct; initial hazard list |
| Product | Frozen list of pathways for MVP; explicit “out of scope” |
| Engineering | Repo map: engine, API, DB, frontend; list gaps vs this document |
| Compliance | Lawful basis + DPIA kick-off; data inventory (RoPA seed) |

**Exit criteria:** Signed one-pager on **red-flag overrides everything**; backlog tagged with four tracks.

---

### Phase 1 — Safety spine & auditability

**Goals:** Red-flag module contract, immutable audit trail design, engine tests.

| Workstream | Outcomes |
|------------|----------|
| Safety | Documented short-circuit: what runs after a red flag (and what does not) |
| Tech | Integration tests: “red flag always wins” across pathways |
| Arch | Consultation record stores: inputs, `ruleset_version`, red-flag evaluation result, final outcome |
| Compliance | Audit log fields defined; no secrets/PII in application logs |

**Exit criteria:** CI fails if red-flag ordering or bypass tests fail.

---

### Phase 2 — Dynamic branching questionnaire

**Goals:** Server-driven pathway graph; client reflects server state only.

| Workstream | Outcomes |
|------------|----------|
| Tech | API for `GET next-question` or batch graph with validation; state machine tests |
| Safety | Any answer that triggers red flag ends or resets flow per policy |
| Compliance | Consent captured at right point; session retention policy applied |

**Exit criteria:** Branching pathways can be added without frontend code changes (configuration-driven), within agreed limits.

---

### Phase 3 — Rules data & pharmacy eligibility

**Goals:** Eligibility and outcome rules loaded from versioned store; strict criteria tested.

| Workstream | Outcomes |
|------------|----------|
| Tech | Migrate or dual-run: file-based → DB-backed rules with migration path |
| Safety | Table-driven tests: age edges, pregnancy flags, pathway-specific exclusions |
| Admin | Read-only or limited edit of rules with audit trail |

**Exit criteria:** Each pathway has published ruleset version referenced on every completed consultation.

---

### Phase 4 — Summaries & professional handoff

**Goals:** Structured summary for GP/pharmacist; CRM or export hooks.

| Workstream | Outcomes |
|------------|----------|
| Tech | Template engine; stable JSON schema for downstream systems |
| Clinical | Sign-off on wording for safety-net and emergency blocks |
| Compliance | Purpose limitation for sharing summaries with third parties |

**Exit criteria:** Sample consultations produce acceptable summaries for clinical review.

---

### Phase 5 — Admin governance & change control

**Goals:** Safe publishing of rules; roles; rollback.

| Workstream | Outcomes |
|------------|----------|
| Tech | Draft/published rules; feature flags or blue/green for ruleset activation |
| Safety | Change log linked to clinical sign-off |
| Compliance | Access reviews; break-glass procedure if documented |

**Exit criteria:** No production rule change without traceable author + reviewer (as per policy).

---

### Phase 6 — Analytics, SRE, and scale

**Goals:** Outcome and red-flag metrics; operability under load.

| Workstream | Outcomes |
|------------|----------|
| Tech | Metrics, alerting, runbooks; load test on consultation API |
| Arch | Read scaling for reporting; PII boundaries documented |
| Compliance | DPIA updates for new datasets; retention jobs |

**Exit criteria:** SLOs defined (e.g. availability, latency); disaster-recovery drill completed once.

---

### Phase 7 — Assurance packaging (ongoing / gate per deployment)

**Goals:** NHS or commissioner-ready evidence pack.

| Artefacts (illustrative, not exhaustive) | Owner |
|------------------------------------------|--------|
| Clinical safety case updates per major release | Clinical + SI |
| Pen test / vulnerability management | Security |
| WCAG evidence | Product + Eng |
| DSPT-aligned controls (if in scope) | IG |
| Operational model (support, incidents) | Ops |

**Exit criteria:** Go/no-go checklist signed for target environment (pilot vs production).

---

## 5. Mapping to current repository (high level)

| Area | Location / notes |
|------|-------------------|
| Decision orchestration | `backend/engine/decisionEngine.js` — red flag → eligibility → outcome → summary |
| Red-flag detection | `backend/engine/redFlagDetector.js` |
| Consultation API | `backend/routes/consultation.js` — validation, `runTriage`, audit log hook |
| Schema direction | `database/schema.sql` — `clinical_pathways`, `clinical_rules` |
| Stakeholder narrative | `docs/clinical_rules_explained.md` |
| Patient UI | `frontend/pages/consultation.tsx`, `frontend/pages/index.tsx` |
| Admin / CRM UI (operational) | `frontend/pages/admin/`, `frontend/pages/crm/` |

---

## 6. Document control

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0 | 2026-04-22 | Programme | Initial alignment, seven modules, phased plan |

Review this document at least **quarterly** or after any **major pathway or red-flag rule** release.
