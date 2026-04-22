# Milestone Plan — Epics, Acceptance Criteria & RACI

**Aegis Health AI — MVP → NHS-ready triage platform**

This document is the **concrete delivery layer** on top of [alignment-and-planning.md](./alignment-and-planning.md): epics, acceptance criteria (AC), and RACI across **clinical** and **engineering** (plus product, IG, ops where relevant).

**Product / UI baseline:** [patient-flow-ui-finalization.md](./patient-flow-ui-finalization.md) (seven conditions, outcomes, flows, roles, frontend planning).

**Conventions**

- Each epic has **one Accountable (A)** for delivery sign-off unless noted.
- **R** = Responsible (does work), **C** = Consulted (input required before proceed), **I** = Informed (no blocker).
- Dates are placeholders — replace with programme dates when known.

---

## 1. Roles (RACI actors)

| Code | Role | Typical holder |
|------|------|----------------|
| **CL** | **Clinical Lead** | Clinician accountable for pathway content, red-flag wording, eligibility criteria |
| **SI** | **Safety / SI (Clinical Safety Officer)** | Clinical safety case, hazard log, DCB0129/0134-style ownership where applicable |
| **PO** | **Product Owner** | Prioritisation, scope, stakeholder comms |
| **EL** | **Engineering Lead** | Technical architecture, release readiness, engineering quality |
| **ENG** | **Engineering** | Design, implementation, tests, CI |
| **IG** | **Information Governance / DPO** | DPIA, lawful basis, retention, DSPT alignment |
| **OPS** | **Operations / Service** | Runbooks, incidents, monitoring, DR exercises |

**Clinical vs engineering split (accountability)**

- **Clinical (CL / SI)** own *what* the rules say and *whether* they are safe to release; they **do not** own code merge authority.
- **Engineering (EL / ENG)** own *how* rules are enforced in software, determinism, tests, and deployments; they **do not** change clinical meaning without CL/SI per change-control.

---

## 2. Programme RACI (governance activities)

| Activity | CL | SI | PO | EL | ENG | IG | OPS |
|----------|----|----|----|----|-----|----|----|
| Pathway / red-flag **content** sign-off | **A** | R | C | I | I | I | I |
| Clinical safety case / hazard log update | C | **A** | I | C | R | C | I |
| **Release** to named environment (e.g. pilot) | C | C | **A** | R | R | C | C |
| Rule **publish** to production ruleset | **A** | R | C | C | R | I | I |
| DPIA / retention policy | C | C | C | C | C | **A** | I |
| Incident (patient harm suspected) | **A** | **A** | C | R | R | C | R |

*(If a single “Accountable” for release is required by your org, assign PO or EL exclusively—table above reflects shared clinical + product gate.)*

---

## 3. Epics, acceptance criteria & epic-level RACI

### Phase 1 — Safety spine & auditability

#### Epic E-01 — Red-flag layer: contract, ordering, tests

| Field | Content |
|-------|---------|
| **Goal** | Red-flag evaluation is isolated, runs first on final (or defined) evaluation, and cannot be overridden by eligibility/outcome logic. |
| **Depends on** | None (foundational). |

**Acceptance criteria**

1. **AC1** Given any pathway, when answers satisfy a red-flag rule, API response sets `redFlagTriggered === true` and outcome is the **documented** emergency/urgent outcome for that rule (no pharmacy/self-care outcome).
2. **AC2** Automated integration tests cover at least **one red-flag case per MVP pathway** (or agreed minimum set).
3. **AC3** `runTriage` (or successor) **does not** invoke pharmacy eligibility or routine outcome rules after a red flag fires (code path verified by test or static assertion).
4. **AC4** Clinical documentation (`docs/clinical_rules_explained.md` or successor) matches implemented order of operations.

| CL | SI | PO | EL | ENG | IG | OPS |
|----|----|----|----|-----|----|-----|
| C | **A** | I | R | R | I | I |

---

#### Epic E-02 — Consultation audit record (immutable inputs + outputs)

| Field | Content |
|-------|---------|
| **Goal** | Every completed consultation stores sufficient data to **replay** the decision: inputs, ruleset identifier, red-flag result, outcome, summary payload. |
| **Depends on** | E-01 (ordering stable). |

**Acceptance criteria**

1. **AC1** Persisted record includes: `pathwayCode`, `answers` (or normalised equivalent), `patient` demographics used by rules, `rulesetVersion` or `rulesetHash`, `redFlagTriggered`, `redFlags[]`, final `outcome`, timestamp, `consultationId`.
2. **AC2** No consultation is marked “completed” without persistence succeeding (API returns error if store fails).
3. **AC3** PII in logs is minimised; audit trail design reviewed by **IG** (consulted).
4. **AC4** Read-back API (or admin view) can display a **non-clinical** audit line for support (IG may restrict fields).

| CL | SI | PO | EL | ENG | IG | OPS |
|----|----|----|----|-----|----|-----|
| I | C | I | **A** | R | C | I |

---

### Phase 2 — Dynamic branching questionnaire

#### Epic E-03 — Server-driven pathway graph & patient UI

| Field | Content |
|-------|---------|
| **Goal** | Branching is **authoritative on server**; client only renders current step(s) from server state. |
| **Depends on** | E-02 (session persistence model). |

**Acceptance criteria**

1. **AC1** API returns valid next question(s) for current session state; **invalid** client-reported jumps are rejected with 4xx.
2. **AC2** At least **one pathway** uses branching (not purely linear) in pilot configuration.
3. **AC3** If an answer triggers red flag mid-flow, flow **stops** per policy and user sees emergency messaging (copy signed off by **CL**).
4. **AC4** WCAG 2.1 **Level A** minimum for consultation steps (keyboard, labels, errors) — EL accountable for technical compliance, **CL** consulted on clinical wording.

| CL | SI | PO | EL | ENG | IG | OPS |
|----|----|----|----|-----|----|-----|
| C | C | **A** | R | R | I | I |

---

### Phase 3 — Rules data & pharmacy eligibility

#### Epic E-04 — Versioned rules in database (read path)

| Field | Content |
|-------|---------|
| **Goal** | Red-flag, eligibility, and outcome rules load from **versioned** store (DB aligned to `clinical_rules` / pathways schema). |
| **Depends on** | E-02, E-01. |

**Acceptance criteria**

1. **AC1** Engine loads active ruleset by `pathwayCode` + `version` (or effective date) documented in API.
2. **AC2** Consultation record stores **exact** `rulesetVersion` used for that run.
3. **AC3** Fallback behaviour if DB unavailable: **fail closed** (no benign default outcome)—behaviour agreed with **SI** and documented.
4. **AC4** Migration path from file-based rules documented and executed for MVP pathways.

| CL | SI | PO | EL | ENG | IG | OPS |
|----|----|----|----|-----|----|-----|
| C | C | I | **A** | R | I | I |

---

#### Epic E-05 — Pharmacy eligibility: strict criteria & tests

| Field | Content |
|-------|---------|
| **Goal** | Eligibility matches signed clinical matrix; table-driven tests cover edges (age, sex, exclusions). |
| **Depends on** | E-04. |

**Acceptance criteria**

1. **AC1** For each MVP pathway with pharmacy arm, **CL** signs a single matrix (age bands, exclusions) stored in repo or linked doc ID.
2. **AC2** Automated tests implement every **edge** in the matrix (minimum agreed count, e.g. ±1 day of age boundaries).
3. **AC3** Eligibility module **never** runs before red-flag clearance in the orchestration pipeline (tested).
4. **AC4** Ineligible patients receive GP (or agreed) outcome with **stable reason code**.

| CL | SI | PO | EL | ENG | IG | OPS |
|----|----|----|----|-----|----|-----|
| **A** | C | I | R | R | I | I |

---

### Phase 4 — Summaries & handoff

#### Epic E-06 — Structured consultation summary (GP / pharmacy)

| Field | Content |
|-------|---------|
| **Goal** | Deterministic summary JSON/HTML from templates + facts only; no inferred diagnoses beyond rules. |
| **Depends on** | E-02, E-05. |

**Acceptance criteria**

1. **AC1** Summary schema versioned (`summarySchemaVersion`); breaking changes require migration note.
2. **AC2** Sections include at minimum: pathway, key answers, outcome, red-flag status, safety-net text, pharmacy options **if** eligible.
3. **AC3** **CL** signs off template text for MVP pathways (version recorded).
4. **AC4** Export or CRM handoff documented in [user_flows.md](./user_flows.md) or linked runbook.

| CL | SI | PO | EL | ENG | IG | OPS |
|----|----|----|----|-----|----|-----|
| **A** | C | C | R | R | C | I |

---

### Phase 5 — Admin governance

#### Epic E-07 — Admin: rule view & publish workflow

| Field | Content |
|-------|---------|
| **Goal** | No silent prod edits; draft → review → publish with audit trail. |
| **Depends on** | E-04. |

**Acceptance criteria**

1. **AC1** Every rule change has: actor, timestamp, before/after diff (or structured delta), environment.
2. **AC2** Production publish requires **two distinct roles** (e.g. author + approver) OR equivalent documented control.
3. **AC3** **CL** or delegate must appear in approver role for clinical content; **SI** consulted for red-flag changes.
4. **AC4** Rollback restores prior **published** ruleset version within agreed RTO.

| CL | SI | PO | EL | ENG | IG | OPS |
|----|----|----|----|-----|----|-----|
| C | **A** | **A** | R | R | I | C |

*(Dual A: PO for product gate, SI for safety gate—split into two sub-milestones if your org requires a single A.)*

---

### Phase 6 — Analytics & operations

#### Epic E-08 — Analytics MVP (aggregates, PII-safe)

| Field | Content |
|-------|---------|
| **Goal** | Dashboards show aggregates and outcome distributions without unnecessary PII. |
| **Depends on** | E-02. |

**Acceptance criteria**

1. **AC1** Analytics data model approved by **IG** (fields, retention, pseudonymisation).
2. **AC2** No free-text symptom blobs in aggregate dashboards unless explicitly approved.
3. **AC3** Metrics: consultations/day, outcome split, red-flag rate, pathway volume (minimum set).
4. **AC4** Access to analytics roles is RBAC-reviewed.

| CL | SI | PO | EL | ENG | IG | OPS |
|----|----|----|----|-----|----|-----|
| I | C | **A** | R | R | **A** | C |

---

#### Epic E-09 — SRE: monitoring, alerting, DR drill

| Field | Content |
|-------|---------|
| **Goal** | Observable consultation API; one DR / restore drill documented. |
| **Depends on** | E-02 persistence. |

**Acceptance criteria**

1. **AC1** SLOs documented (e.g. p95 latency, error rate, availability).
2. **AC2** Alerts route to **OPS** with runbook link.
3. **AC3** One successful restore test from backup (or cloud equivalent) with dated record.
4. **AC4** EL signs readiness for pilot load.

| CL | SI | PO | EL | ENG | IG | OPS |
|----|----|----|----|-----|----|-----|
| I | I | I | **A** | R | C | R |

---

### Cross-cutting (parallel to phases)

#### Epic E-10 — Clinical safety case & hazard log

| Field | Content |
|-------|---------|
| **Goal** | Living hazard log + safety case updates tied to releases. |
| **Depends on** | E-01 minimum. |

**Acceptance criteria**

1. **AC1** Hazard log exists with unique IDs, severity, mitigation, owner, target date.
2. **AC2** Each **major** release has safety case delta reviewed by **SI**.
3. **AC3** Residual risks explicit and accepted per org process.

| CL | SI | PO | EL | ENG | IG | OPS |
|----|----|----|----|-----|----|-----|
| C | **A** | I | C | C | I | I |

---

#### Epic E-11 — DPIA & UK GDPR operational controls

| Field | Content |
|-------|---------|
| **Goal** | DPIA approved or in approved consultation state before pilot with real patient data. |
| **Depends on** | Data inventory. |

**Acceptance criteria**

1. **AC1** Lawful basis documented; retention schedule aligned to DB + backups.
2. **AC2** Subprocessors listed if applicable.
3. **AC3** Subject access / erasure process documented (even if manual for MVP).
4. **AC4** **IG** sign-off recorded for pilot environment.

| CL | SI | PO | EL | ENG | IG | OPS |
|----|----|----|----|-----|----|-----|
| I | C | C | C | C | **A** | I |

---

#### Epic E-12 — Patient landing & consultation accessibility

| Field | Content |
|-------|---------|
| **Goal** | WCAG 2.1 AA target for patient-facing flows where feasible; AA gaps documented. |
| **Depends on** | None. |

**Acceptance criteria**

1. **AC1** Automated a11y checks in CI for patient pages (or agreed scope).
2. **AC2** Manual smoke on keyboard-only path for complete consultation (happy path + red-flag path).
3. **AC3** Statement / roadmap for AA gaps filed with **PO** and **IG**.

| CL | SI | PO | EL | ENG | IG | OPS |
|----|----|----|----|-----|----|-----|
| I | I | **A** | R | R | C | I |

---

## 4. Epic summary matrix (RACI at a glance)

**Legend:** first letter is **Accountable** for epic sign-off per section 3 tables.

| Epic | Name | Phase | A (primary) |
|------|------|-------|-------------|
| E-01 | Red-flag contract & tests | 1 | SI |
| E-02 | Consultation audit record | 1 | EL |
| E-03 | Server-driven branching UI | 2 | PO |
| E-04 | Versioned DB rules | 3 | EL |
| E-05 | Pharmacy eligibility matrix | 3 | CL |
| E-06 | Structured summary | 4 | CL |
| E-07 | Admin publish workflow | 5 | PO + SI |
| E-08 | Analytics MVP | 6 | PO + IG |
| E-09 | SRE / DR | 6 | EL |
| E-10 | Safety case & hazards | X-cut | SI |
| E-11 | DPIA / GDPR | X-cut | IG |
| E-12 | Patient a11y | X-cut | PO |

---

## 5. Suggested milestone gates (rename to match your releases)

| Gate | Epics complete (minimum) | Clinical sign-off | Engineering sign-off |
|------|---------------------------|-------------------|----------------------|
| **M1 — Internal alpha** | E-01, E-02, E-10 draft | SI review of red-flag tests | EL: CI green, no known sev-1 |
| **M2 — Branching pilot** | + E-03 | CL copy on branched pathways | EL: load test baseline |
| **M3 — Rules in DB** | + E-04, E-05 | CL matrix signed | EL: migration run |
| **M4 — Handoff ready** | + E-06 | CL template sign-off | Integration with CRM/export |
| **M5 — Governed admin** | + E-07 | SI on publish workflow | Security review |
| **M6 — Pilot live** | + E-08, E-11, E-12 | CL + SI pilot approval | OPS + EL go-live |

---

## 6. Document control

| Version | Date | Notes |
|---------|------|--------|
| 1.0 | 2026-04-22 | Initial epics, AC, RACI |

Update **§4** and **§5** when epic IDs are imported into Jira/Azure DevOps.
