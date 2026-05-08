# Clinical & Governance — Stakeholder Source of Truth

**Care Path — rule-based triage (not generative AI diagnosis)**  
**Companion:** [PLATFORM-HANDBOOK.md](./PLATFORM-HANDBOOK.md) (technical implementation, phases, repo map, **built vs gap** table)

---

## Table of contents

1. [How decisions are made](#1-how-decisions-are-made)  
2. [Three-stage decision process](#2-three-stage-decision-process) — [patient app journey (implemented)](#patient-consultation-workflow-as-implemented)  
3. [Conditions covered (phase 1)](#3-conditions-covered-phase-1) — [clinical scope matrix](#clinical-scope-matrix) · [questionnaire branching](#questionnaire-structure-branching) · [layered disclaimers](#layered-patient-disclaimers)  
4. [Safety features & boundaries](#4-safety-features--boundaries)  
5. [Compliance checklist](#5-compliance-checklist) — [Security & data protection](#security-and-data-protection) · [5.1 Regulatory positioning](#51-regulatory--compliance-positioning-product-statement) · [5.2 Market alignment](#52-market-timing--nhs-policy-alignment) · [5.3 Technical controls map](#53-programme-artefacts--technical-implementation-map)  
6. [Priority actions before NHS pilot](#6-priority-actions-before-nhs-pilot)  
7. [Stakeholder scope (MVP)](#7-stakeholder-scope-mvp) — [core platform build status](#core-platform-components--honest-build-status)  
8. [Planned NHS integration strategy (later)](#8-planned-nhs-integration-strategy-later)  
9. [Future: ML augmentation (backlog)](#9-future-ml-augmentation-backlog)  
10. [Document control](#10-document-control)

---

## 1. How decisions are made

The platform uses a **rule-based clinical decision engine**:

- Every decision traces to a written rule  
- No black-box machine learning for triage in phase 1  
- Rules are informed by NICE / NHS pathway guidance (document per pathway in JSON)  
- Decisions are auditable  

---

## 2. Three-stage decision process

### Stage 1 — Safety (red flags)

Runs **first, on every consultation evaluation, without exception** (see `decisionEngine.js`).

If a red flag matches:

- Triage follows the **escalated** outcome (e.g. 999, urgent care)  
- Routine pharmacy / self-care routing must not override that  

**Examples**

| Condition | Red-flag symptom | Typical action |
|-----------|------------------|----------------|
| Sore throat | Difficulty breathing | Emergency / 999 |
| Sinusitis | Eye swelling or vision changes | Emergency / 999 |
| Insect bite | Red line spreading up limb | Emergency / 999 |
| UTI | Fever + loin/back pain | Urgent care (per rule set) |
| Shingles | Eye pain or vision changes | Urgent / A&E |

Design principle: **over-escalate rather than under-escalate**.

### Uncertainty and default escalation (NHS governance alignment)

Where the automated rule set **cannot be evaluated reliably** or **demographics needed for age/sex checks are missing**, the product **must not** silently assume the lowest-acuity disposition (especially Pharmacy First–style supply). Implemented behaviour (see `redFlagDetector.js`, `pharmacyEligibility.js`, `decisionEngine.js`):

| Situation | Default |
|-----------|---------|
| A **safety** (red flag / emergency override) condition expression throws or cannot be evaluated | Treat as **triggered escalation** to **same-day urgent care** with a patient-appropriate message, plus an auditable `RF_GOVERNANCE_RULE_EVALUATION` marker. |
| **Age** is required by the pathway but missing or non-numeric | **Not pharmacy eligible**; route to **GP** with explicit governance wording. |
| **Gender** is required by `applicableGenders` but missing | **Not pharmacy eligible**; safer default to **GP**. |
| An **ineligibility** (exclusion) rule cannot be evaluated | **Not pharmacy eligible** (do not risk false “eligible”). |
| An **eligible** rule cannot be evaluated | That rule is skipped; if eligibility cannot be confirmed, default remains **ineligible** / **GP** as already encoded. |
| **Outcome** rules cannot be evaluated or **no** outcome rule matches after errors | **Urgent care** disposition with explicit wording (higher-touch than routine GP where the engine is uncertain). |
| Outcome is **self-care** or **pharmacy** but any **governance uncertainty** flag is set (e.g. partial rule-engine failure on eligibility) | **Upgrade to GP** and **withdraw pharmacy eligibility** so lower-acuity paths are not finalised under uncertainty. |

This is consistent with **DCB0129** expectations for deterministic CDS: auditable decisions, conservative defaults when the logic boundary is unclear, and **no silent under-triage** when the engine is unsure.

### Stage 2 — Pharmacy eligibility

Runs **only if** no red flag (or per written policy for edge cases — document exceptions).

Considers age, sex where clinically indicated, pregnancy, immunosuppression, prior antibiotics, etc., **per pathway**.

### Stage 3 — Outcome

| Outcome | Meaning |
|---------|---------|
| Self-care | Mild / self-limiting; OTC and self-management |
| Pharmacy | Pharmacy assessment/treatment appropriate |
| GP | GP assessment or prescription needed |
| Urgent care | Same-day urgent service (not routine GP) |
| Emergency (999) | Life-threatening — call 999 |

### Patient consultation workflow (as implemented)

Stakeholder specs often list steps **6–8** in the wrong **order** (decision engine, then red flags, then eligibility). In this codebase **`runTriage`** always evaluates **Stage 1 red flags first**, then **Stage 2 pharmacy eligibility** (when no red flag), then **Stage 3 outcome rules** — plus comorbidity / governance upgrades inside the same call (`decisionEngine.js`).

**Corrected journey vs a generic “10-step” narrative**

| Step (generic spec) | Implemented behaviour | Match? |
|---------------------|-------------------------|--------|
| 1. Patient opens consultation interface | Patient opens **`/`** (landing), then **`/consultation?pathway=…`** after starting | Partial wording — entry is **landing**, not only consultation |
| 2. Consent and disclaimer | **Landing:** intended-use copy, links to privacy/terms/accessibility, **explicit consent checkbox** before Start. **Result:** pathway CDS line, safety-net, regulatory details | Yes (layered — see §3 layered disclaimers) |
| 3. Demographics | **Consultation** step collects name, age, gender | Yes |
| 4. Symptom questionnaire | **Demographics** includes optional free-text “describe symptoms” (comma-separated hints). Then **preface** (3 quick context questions → merged into `symptoms` for the summary). Then **clinical** pathway questionnaire (`definitions` + `question/next` or offline fallback) | Partial — not only one “symptom questionnaire”; **clinical** items are pathway-specific |
| 5. System classifies symptoms into clinical pathway | **Pathway is chosen on the landing page** before demographics. Free text does **not** drive routing in phase 1 | **No** — replace with *patient selects pathway; engine evaluates within that pathway* |
| 6. Decision engine evaluates clinical rules | **Yes** — single `POST /api/consultation` invokes `runTriage` | Yes |
| 7. Red-flag detection | **Runs inside the engine before eligibility** — not after a separate “rules pass” | Order wrong in many specs; **implementation is Stage 1 first** |
| 8. Eligibility logic | **Pharmacy eligibility** (and related gates) after clear red-flag layer | Yes, but **only after** no red flag |
| 9. Advice and next steps | Outcome labels, patient explanation, self-care / pharmacy options, safety-net, pathway disclaimer on **result** | Yes |
| 10. Consultation summary | Structured summary text + **`GET /api/summary/:id`** for the same record | Yes |

**Disposition codes** (API / UI) align to stakeholder language as follows:

| Code | Patient-facing meaning |
|------|-------------------------|
| `self_care` | Self-care advice |
| `pharmacy` | Pharmacy assessment / Pharmacy First–style navigation (not supply) |
| `gp` | GP consultation |
| `urgent_care` | Same-day urgent care / NHS 111 when appropriate |
| `emergency_999` | Emergency services — call 999 |

**Stakeholder / sales deck wording:** If materials still use a generic “step 5 — system classifies into pathway” line, add a footnote that **that step describes a possible future symptom-first router**; **the current MVP is pathway-first** (patient selects the condition on the landing page; the engine evaluates **within** that pathway only).

---

## 3. Conditions covered (phase 1)

### Urinary tract infection (UTI)

- Pharmacy First cohort: women aged 16-64 with uncomplicated lower UTI symptom pattern  
- Inclusion pattern: dysuria plus lower urinary symptoms (frequency/urgency/cloudy urine)  
- Exclusions / referral gates: pregnancy, breastfeeding, catheter, recurrent UTI, visible haematuria  
- Red flags: fever with flank pain, vomiting (urgent same-day care)  

### Sore throat

- Age threshold: 5+ only  
- FeverPAIN-style scoring encoded directly in outcome rules (high score -> GP, moderate -> pharmacy, low -> self-care)  
- Exclusions: recurrent tonsillitis, post-tonsillectomy presentations, immunocompromise  
- Red flags: breathing difficulty / airway compromise and severe prolonged inflammatory presentation  

### Sinusitis

- Age threshold: 12+ only  
- Key gate: pharmacy pathway requires symptoms for at least 10 days (and less than 12 weeks)  
- Exclusions: recurrent sinusitis and severe systemic features  
- Red flags: eye swelling/visual change, neurological symptoms, severe headache with systemic illness  

### Acute otitis media

- Pharmacy pathway is pediatric-only (age 1-17); adults route to GP  
- Inclusion pattern: age-eligible child with otitis symptom profile and no danger signs  
- Red flags: neck stiffness, facial weakness, mastoid swelling, severe headache, perforation with discharge  

### Infected insect bite

- Age threshold: 1+  
- Key gate: symptoms must clearly worsen >=48 hours after bite/sting for pharmacy infected-bite treatment  
- Red flags: anaphylaxis symptoms, lymphangitis red line, possible sepsis features, spreading infection with systemic illness  

### Impetigo

- Age threshold: 1+  
- Inclusion pattern: localized non-bullous impetigo with no systemic illness  
- Exclusions: bullous lesions, recurrent episodes, rapid spread, systemic illness  
- Localized threshold encoded: no widespread distribution and lesion count not above pharmacy threshold  

### Shingles (herpes zoster)

- Age threshold: 18+  
- Timing gate: pharmacy route uses early-treatment window up to 7 days (highest priority early onset)  
- Exclusions: pregnancy, immunocompromise, atypical/non-unilateral pattern  
- Red flags: eye involvement (urgent same-day), ear involvement (Ramsay Hunt risk), combined eye+ear emergency profile  

### Clinical scope matrix

| Pathway (code) | Phase-1 content | Questionnaire structure |
|----------------|-----------------|-------------------------|
| UTI (`uti`) | Female 16-64 uncomplicated lower UTI with strict exclusion + red-flag gating | **Linear** `questions` (ordered list; server-driven `question/next`) |
| Sore throat (`sore_throat`) | Age >=5 with FeverPAIN-style rule scoring and explicit exclusions | **Linear** |
| Sinusitis (`sinusitis`) | Age >=12 with >=10-day gate, recurrence exclusion, eye/neuro red flags | **`questionGraph`** (branching) + `questions` for metadata |
| Acute otitis media (`otitis_media`) | Pediatric-only (1-17), adult GP deflection, mastoid/facial/neurological flags | **Linear** |
| Infected insect bite (`insect_bites`) | 48-hour worsening gate with anaphylaxis / lymphangitis / sepsis checks | **Linear** |
| Impetigo (`impetigo`) | Localized non-bullous threshold with lesion-count and spread exclusions | **Linear** |
| Shingles (`shingles`) | Age >=18 with timing gate, eye/ear risk handling, pregnancy/immunocompromise exclusions | **`questionGraph`** + `questions` |

**Honest product line:** all pathways are **server-driven** and **fully specified in JSON**; “partial” only means **not every pathway uses a full branching graph** — five use a **linear** question list with the same completion and safety ordering as graph pathways.

**Phase 1 contract baseline:** pathway structure is now enforced by `backend/data/pathways/pathway.schema.json` and validated in `backend/__tests__/pathway.schema.validation.test.js`; the canonical registry of expected runtime pathway files is `backend/data/pathways/canonical/pathways.master.json`.

### At-a-glance criteria (QA/dev)

| Condition | Age | Key rule |
|-----------|-----|----------|
| UTI | Female 16-64 | Lower uncomplicated only |
| Sore Throat | 5+ | Use FeverPAIN |
| Sinusitis | 12+ | Symptoms >= 10 days |
| Otitis Media | 1-17 | Children only |
| Infected Bite | 1+ | Worse after 48h |
| Impetigo | 1+ | Localized only |
| Shingles | 18+ | Rash within 7 days |

### Questionnaire structure (branching)

- **`questionGraph`:** conditional next-step edges (implemented for **sinusitis** and **shingles** in repo data).  
- **Linear `questions`:** fixed order; branching is expressed through **answer values** inside rules (e.g. scores, booleans), not through graph edges.  
- **Safety:** red-flag and emergency-override logic runs **before** eligibility and outcome rules regardless of graph vs linear (see §2).

### Layered patient disclaimers

Disclaimers are **deliberately layered** so no single string has to carry the entire CDS boundary:

| Layer | Where it lives | Role |
|-------|----------------|------|
| **Pathway CDS line** | `pathwayPatientDisclaimer` in each `backend/data/pathways/*.json`; copied onto the consultation record and returned on `GET /api/summary/:id` | Short, pathway-specific “navigation not diagnosis” framing |
| **Safety net** | `safetyNetAdvice` per pathway + outcome | When to seek **further** or **urgent** help |
| **Journey copy** | Landing, consultation, and result UI (and mock/offline banners) | Consent, mock mode, and general intended-use |
| **Governance** | This document §1, §4, §5 | Regulatory narrative, DTAC/DCB positioning, boundaries |

Together these layers form a **complete** disclaimer model for phase 1; the pathway field closes the gap where stakeholders asked for an explicit **per-condition** CDS line rather than only generic UI text.

### Safety-oriented triage UX patterns

The patient interface should present safety logic in a way that matches the engine order and improves patient comprehension:

- **Progress stepper:** clear stage and progress visibility across demographics, context, and clinical phases.  
- **Red-flag emphasis:** enhanced warning treatment on `redFlagHint` questions before submission.  
- **Severity signalling:** visible low/moderate/urgent/emergency badges on question/result states.  
- **Emergency banners:** persistent high-acuity banners for `urgent_care` and `emergency_999` outcomes.  
- **Referral summary cards:** structured “what to do now” guidance with actions and escalation safety-net.  

Phase 2 note: scoring systems are now config-driven via pathway `scoring.modules` declarations and executed by named engine modules in `backend/engine/scoring/` (current live module: FeverPAIN for sore throat).
Phase 3 note: operational delivery endpoints now include feature-flagged NHS integration scaffolding (`/api/nhs/*`), PDF referral summary export (`/api/summary/:id/pdf`), and pharmacist note capture (`/api/summary/:id/notes*`) with audit events for each action.

---

## 4. Safety features & boundaries

- **Safety-net advice** on every outcome (when to seek further help).  
- **Governance:** rules should reference guideline sources; changes need clinical process (see handbook Epic E-07).  
- **CDS only:** supports decision-making; **does not** prescribe; pharmacist/GP remains accountable.  

### Compliance Guardrails (must not be bypassed)

The implementation must enforce these non-negotiable controls:

- Never auto-recommend or auto-prescribe antibiotics.  
- Never skip pathway exclusion criteria.  
- Never ignore pregnancy checks where clinically relevant.  
- Never ignore recurrence gates when the pathway marks recurrence as non-pharmacy.  
- Never ignore red flags; safety escalation must override routine routing.  
- Never allow pharmacy outcomes outside pathway age limits.  

**Operational expectation:** red flags first, exclusions second, then eligibility and outcome rules. If required safety data is missing or a rule cannot be evaluated, apply conservative escalation rather than pharmacy or self-care.

### The platform does **not**

- Replace clinical judgement  
- Auto-prescribe  
- Access NHS records in phase 1  
- Use ML for core triage decisions in phase 1  
- **Diagnose** — it navigates to an appropriate **care level**

---

## 5. Compliance checklist

**Legend:** ✅ Complete / in place · 🔄 In progress · ⏳ Planned · ❌ N/A  

### DTAC (Digital Technology Assessment Criteria)

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1.1 | Clinical safety statement | ⏳ | Before NHS pilot |
| 1.2 | Usability testing | ⏳ | Phase programme |
| 1.3 | Clinical evidence of benefit | ⏳ | Post-pilot |
| 1.4 | Interoperability approach | 🔄 | See PLATFORM-HANDBOOK architecture |
| 1.5 | WCAG 2.2 AA | ⏳ | Evidence pack |
| 1.6 | Cyber security assessment | ⏳ | Pre-pilot |
| 1.7 | DPIA | ⏳ | IG owner |

### DCB0129 (manufacturer clinical risk)

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 2.1 | Clinical Safety Officer appointed | ⏳ | HCPC/GMC registered |
| 2.2 | Hazard log | ⏳ | |
| 2.3 | Clinical risk management plan | ⏳ | |
| 2.4 | Clinical safety case report | ⏳ | |
| 2.5 | Red-flag escalation documented | ✅ | This doc + engine order |
| 2.6 | Deterministic auditable logic | ✅ | Rule engine |
| 2.7 | Pathways reference guidelines | ✅ | Pathway metadata / clinical sign-off process |

### DCB0160 (deployment)

| # | Requirement | Status |
|---|-------------|--------|
| 3.1 | Deployment safety case | ⏳ Deploying org |
| 3.2 | Local hazard log vs DCB0129 | ⏳ |
| 3.3 | Staff training plan | ⏳ |

### UK GDPR

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 4.1 | DPIA | ⏳ | |
| 4.2 | Lawful basis | 🔄 | |
| 4.3 | Consent on landing | ✅ | |
| 4.4 | Data minimisation | ✅ | |
| 4.5 | Right to erasure | 🔄 | Demo: `POST /api/gdpr/erasure-request` + audit event; production needs identity-verified workflow |
| 4.6 | Retention policy | ⏳ | |
| 4.7 | UK/EEA hosting | 🔄 | |
| 4.8 | Encryption in transit / at rest | ✅ / verify prod | |
| 4.9 | Audit logging | ✅ | Append-only in-memory log + `GET /api/admin/audit` (mirrors `audit_logs`; wire INSERT for production) |
| 4.10 | Privacy notice page | ✅ | `/privacy` (+ `/terms`, `/accessibility`) |

### Security and data protection

Healthcare systems require strong data protection standards. The list below maps **stakeholder expectations** to **this repository** (honest status — not self-certification against DSPT or a production pen test).

| Expectation | Status in repo | Evidence / gap |
|-------------|----------------|----------------|
| **Encryption in transit** | 🔄 Environment-dependent | Production must terminate **TLS** at the ingress / API gateway (`FRONTEND_URL` + HTTPS). Local dev commonly uses plain HTTP. |
| **Encryption at rest** | 🔄 / ⏳ Hosting-owned | When `DATABASE_URL` is enabled, disk/volume encryption and key custody are **cloud / organisation** responsibilities. In-memory demo has no durable clinical database by default. |
| **Secure authentication & access control** | ⏳ Not on APIs | `routes/admin.js` notes **no auth middleware** for demo. Patient `POST` / `GET` consultation and summary routes are **unauthenticated** — acceptable only in closed demos; **must** be gated before any real patient data. |
| **Role-based access management** | ⏳ | Pharmacist/admin/CRM UIs are not wired to an IdP; **RBAC** is programme work (see [PLATFORM-HANDBOOK.md](./PLATFORM-HANDBOOK.md) §9). |
| **Consultation audit logs** | ✅ Engineering pattern | `backend/lib/auditLog.js` — structured events, payload sanitisation (e.g. patient name redacted in audit payload), optional **PostgreSQL** persistence when `DATABASE_URL` is set. |
| **GDPR-aligned design** | 🔄 Hooks + transparency | Landing consent, `/privacy`, `routes/gdpr.js` — **DPIA, lawful basis Article 9, retention, and verified identity** for SAR/erasure remain controller-owned. |

**Frontend (implemented)**

- Baseline **HTTP security headers** on all routes via `frontend/next.config.js` (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`; **HSTS** when `NODE_ENV=production` — deploy only behind HTTPS).  
- **`lang="en-GB"`** on the HTML document (`frontend/pages/_document.tsx`).  
- Consultation answers are held in **React state** and sent to the API; the triage UI does **not** persist consultation payloads to `localStorage` / `sessionStorage` (re-check if analytics or session plugins are added).

**Frontend / platform (later implementation)**

- **Content-Security-Policy** with nonces or platform-specific tuning after threat modelling (strict default CSP can conflict with Next.js hydration unless carefully configured).  
- **Authenticated staff sessions** (`Secure`, `HttpOnly`, `SameSite` cookies or equivalent) when JWT/session auth ships for `/api/admin/*` and pharmacist summary access.  
- **Rate limiting** and **bot protection** on public `POST` endpoints at the edge.  
- **Security.txt** and coordinated disclosure contact at the organisation level.

The clinical governance and safety narrative remains in **§2–§4**; this subsection is the **IG / security programme map** aligned to common procurement language.

### DSPT, WCAG, MHRA/SaMD

Track as programme items; intended purpose and CDS-vs-diagnosis boundary are documented in §1 and §4.

### 5.1 Regulatory & compliance positioning (product statement)

The platform **anticipates** the following UK regulatory and assurance tracks. **Anticipate** means: technical and documentation hooks exist so the deploying organisation can complete formal packs without contradicting the product design — not that sign-off is self-certified by this repository.

| Theme | Status in product | Notes |
|-------|---------------------|--------|
| **UK GDPR** | ✅ Transparency + minimisation hooks | Public **Privacy notice** (`/privacy`), consent on landing, structured audit payloads avoid logging full free-text answers by default. Lawful basis / Article 9 condition for health data must be **confirmed in DPIA** by the controller. |
| **DPIA & DTAC** | ⏳ Organisation-owned artefacts | Checklist rows in §5 remain the source of truth; DPIA/DTAC text is **not** a substitute for IG sign-off. |
| **Clinical safety (DCB0129-style)** | 🔄 / ✅ engineering controls | Deterministic engine, red-flag-first order, governance defaults — see §2 and engine modules. Full **clinical safety case** remains programme work. |
| **DSPT (Data Security & Protection Toolkit)** | 🔄 Technical enablers | DSPT is **organisation-level** evidence; the product supports alignment via audit trail shape, GDPR routes, and security expectations in [PLATFORM-HANDBOOK.md](./PLATFORM-HANDBOOK.md). |
| **PGD / Pharmacy First compliance** | ✅ CDS boundary + 🔄 Tier 2 | **Tier 1:** pathway JSON + `pharmacyEligibility.js` encode **navigation only**; PGD supply remains with the **accountable pharmacist** (`regulatoryContext` API block). **Tier 2** PGD workflow integration is §8. |
| **MHRA / SaMD considerations** | ✅ Documented posture | `regulatoryContext.mhraSamDConsiderations` and patient copy state **not diagnosis / not prescribing**; **formal classification** is organisational with MHRA input. |
| **Audit & traceability** | ✅ App-level | Events: `consultation_completed`, `consultation_record_accessed`, `summary_accessed`, `summary_list_accessed`, `gdpr_subject_access_export`, `gdpr_erasure_requested`, `admin_audit_log_accessed`. Query: `GET /api/admin/audit`. |

**Early design decisions that reduce regulatory burden** (implemented posture):

- **Does not diagnose** — navigates to a **care level**; see §4.  
- **Does not prescribe** — CDS only; pharmacist/GP accountable.  
- **Defers medical authority** — routes to regulated services (pharmacy, GP, urgent, 999).

This supports a **lower-risk SaMD/CDS posture** for early pilots **only when** the deploying organisation’s classification, IFU, and governance match the intended purpose.

### 5.2 Market timing & NHS policy alignment

These bullets describe **why** the product direction matches current NHS system pressures — they are **stakeholder narrative**, not claims of formal NHS endorsement.

**Strategic alignment (narrative)**

- **Pharmacy First** national rollout — structured pharmacy routing and eligibility language.  
- **Digitisation of community pharmacy** — summary-first handoff patterns (Tier 2–3 in §8).  
- **GP workload reduction** — appropriate deflection to self-care / pharmacy where **safely** encoded; conservative upgrade when uncertain (§2).  
- **Remote triage & access** — asynchronous questionnaire + explicit outcomes.  
- **Prevention & early intervention** — safety-netting copy on every pathway outcome.  
- **Risk stratification & population health** — **not** implemented in live triage logic; **Tier 4 / §9** backlog only.

**Demand drivers (context for commissioners)**

- GP appointment shortages and long waits for routine access.  
- Unmet latent demand in **women’s health** and **chronic** conditions (pathway expansion is roadmap, not current catalogue).  
- **Workforce pressure** and winter surges — rule-based triage scales without replacing clinicians.

### 5.3 Programme artefacts & technical implementation map

| Artefact / control | Repository / runtime location |
|--------------------|-------------------------------|
| Privacy, terms, accessibility | `frontend/pages/privacy.tsx`, `terms.tsx`, `accessibility.tsx` |
| Structured audit events | `backend/lib/auditLog.js` → `auditPersistence.js`; in-memory fallback `backend/store/auditEventStore.js` |
| PostgreSQL audit INSERT | Set `DATABASE_URL`; run `cd backend && npm run migrate` then start API — `audit_logs` |
| Admin audit query | `GET /api/admin/audit` (reads DB when `DATABASE_URL` set, else memory) |
| GDPR demo endpoints | `GET /api/gdpr/subject-access/:consultationId`, `POST /api/gdpr/erasure-request` (`backend/routes/gdpr.js`) |
| Intended purpose / PGD / MHRA API surface | `backend/lib/regulatoryContext.js`, `backend/lib/pharmacyFirstGovernance.js` — returned on `POST /api/consultation` and `GET /api/summary/:id` |
| DB target schema + migrations | `database/schema.sql`; ordered SQL in `database/migrations/` (`npm run migrate`) |

---

## 6. Priority actions before NHS pilot

1. Platform functionally tested end-to-end  
2. Clinical Safety Officer appointed  
3. DCB0129 clinical safety case  
4. DPIA signed off  
5. DTAC evidence pack  
6. Penetration test  
7. WCAG audit  
8. DSPT preparation (if in scope)  
9. Training materials  
10. Commissioner / trust sign-off  

---

## 7. Stakeholder scope (MVP)

**Included**

- End-to-end consultation journey  
- Symptom-based triage (rule-based)  
- Red-flag detection  
- Pharmacy eligibility  
- Consultation summaries  
- Basic admin + CRM-style operations (demo tier)  
- Secure backend patterns (production hardening = programme work)  

**Excluded (phase 1)**

- Advanced ML diagnosis  
- Predictive risk scoring  
- NHS EHR / Spine integration  
- Video telehealth  
- Very broad condition catalogue  
- Population-level advanced analytics  

### Core platform components — honest build status

This aligns marketing language (“modules”) with **what is implemented vs partial vs not in the UI**.

| Area | Fully in product | Partial | Not in UI / not wired |
|------|------------------|---------|------------------------|
| **Patient consultation** | Mobile-friendly flow, guided questions, server-driven branching (`questionGraph` + `/question/next`), consent, result + safety-net copy | Some pathways still use linear client fallback when graph incomplete | — |
| **Clinical decision engine** | Rule-based `runTriage`, deterministic JSON pathways, safety-first ordering | — | — |
| **Red-flag system** | Detection + escalation; governance defaults on eval failure | — | — |
| **Pharmacy eligibility** | Rules engine + API outcomes | **Case handoff:** `GET /api/summary/:id` is production-shaped; **pharmacist dashboard** (`/pharmacist/dashboard`) still uses **in-page mock cases**, not live API | — |
| **Consultation summary** | Structured `summaryText` + API + result view + print | **PDF** export endpoint returns **501** (not implemented) | — |
| **Administration** | **Read** APIs: pathways, rules, analytics route exist | **Admin UI** uses **static mock** overview/pathways/rules — **no `fetch`** to `/api/admin/*`; analytics route returns **fixed demo series**, not computed from live `consultationStore` | **Rule/pathway configuration:** no in-app editor, publish workflow, or “configure logic” UI — changes are **JSON files + deploy** (see [PLATFORM-HANDBOOK.md](./PLATFORM-HANDBOOK.md) E-04 / E-07) |
| **Analytics & reporting** | CRM/admin **screens** show charts/KPI patterns; `GET /api/consultation` can list completed rows | Volume/outcome/red-flag **reporting is not** driven from persisted consultation fact tables in this demo; CRM APIs are **mock-backed** | Dedicated “escalation analysis” product beyond red-flag rate mock |

**Deferred roadmap (not phase 1):** [§8 — NHS integration tiers](#8-planned-nhs-integration-strategy-later); [§9 — ML augmentation](#9-future-ml-augmentation-backlog).

**Deployment intent:** Controlled **pilot**, not demo-only — subject to §5–6 completion.

---

## 8. Planned NHS integration strategy (later)

**Design intent:** The system is built so it can **attach to existing NHS pathways without requiring disruption** to incumbent workflows. The tiers below are **sequenced capability**, not a mandate to implement all layers before pilot value.

| Tier | Name | Scope (when implemented) |
|------|------|--------------------------|
| **1 — Standalone** | Self-contained triage | Self-care routing, escalation (999 / urgent / GP), and pharmacy referral aligned with the current rule-based engine output. No dependency on external clinical systems. |
| **2 — Pharmacy First module** | PGD-aligned handoff | Case summary flows into **PGD eligibility decision support**; facilitates **antibiotic / antiviral supply** where Pharmacy First criteria (and local PGDs) are met — the pharmacist remains accountable; the system supplies structured inputs, not prescribing decisions. |
| **3 — Clinical integration** | Record and messaging | **Summary export** for GP record systems and messaging (e.g. **SystmOne / EMIS**-style handoff) — later stage; requires IG, messaging standards, and deployment organisation agreements. |
| **4 — Predictive analytics (long-term vision)** | Population insight | **Chronic disease stratification** and **early detection** patterns; cohort- or population-level insight — strictly **separate** from real-time triage safety logic unless governed as in [§9](#9-future-ml-augmentation-backlog). |

**Note:** Tier progression should follow sponsor readiness: prove **Tier 1** safety and audit in live pilots before committing build budget to **Tier 2–3** integrations.

---

## 9. Future: ML augmentation (backlog)

**Status:** Planned only — **not implemented** in the current rule-based engine. Phase 1 remains: auditable JSON pathways, red-flag-first orchestration, and no black-box ML for core disposition (§1, §4, §7).

### 9.1 Principle

**Machine learning modules enhance (not replace) deterministic safety rules.**

### 9.2 Candidate capabilities (backlog)

| # | Capability | Intent |
|---|------------|--------|
| 1 | **Symptom classifier (free text → pathway)** | NLP / classification suggests which **condition flow** (pathway) to open; patient or clinician may still override. Default remains explicit pathway selection if confidence is low. |
| 2 | **Risk scoring for deterioration** | Model surfaces **risk of worsening** (e.g. early warning style features) to prioritise follow-up or wording — **not** to replace red-flag rules that demand fixed escalation. |
| 3 | **Flow-shortening model** | Suggests **skipping or reordering low-yield questions** where evidence supports it; must respect minimum safety questions defined clinically per pathway. |
| 4 | **Personalisation from prior consultations** | Uses **history** (with consent, retention, and DPIA) to pre-fill context or adapt wording — **not** to bypass eligibility or red-flag logic. |
| 5 | **Smart safety-netting** | Uses **historical patterns** (e.g. re-presentations) to tune safety-net advice or recall prompts — **additive** to pathway `safetyNetAdvice`, not a substitute. |

Each item requires its own epic: data governance, model cards, validation set, clinical sign-off, and rollback plan before production use.

### 9.3 Governance rule (non-negotiable)

**ML may propose more efficient pathways** (e.g. fewer questions, suggested pathway, richer safety-net copy) **but must never:**

- **Downgrade** a disposition that deterministic rules would have produced (only maintain or escalate acuity when in conflict), or  
- **Override red-flag or emergency-override escalation** — the safety layer in `decisionEngine.js` / `redFlagDetector.js` remains **authoritative**; ML output is advisory upstream (e.g. pathway suggestion) or downstream (e.g. copy), never a bypass.

This supports **regulatory defensibility** (DCB0129-style: explainable baseline + controlled ML envelope) and **clinician trust** (rules win on safety).

### 9.4 Implementation notes (when you start)

- Log every ML suggestion with **version, input hash, and outcome** of the deterministic engine for audit.  
- Define **kill-switch** and A/B or shadow mode before any ML influences patient-facing routing.  
- Update DPIA, clinical safety case, and IFU when ML touches free text or longitudinal data.

**Owner (when scheduled):** Product + Clinical Safety Officer. **Technical epics:** [PLATFORM-HANDBOOK.md](./PLATFORM-HANDBOOK.md).

---

## 10. Document control

| Version | Date | Notes |
|---------|------|--------|
| 1.0 | 2026-04-23 | Merged clinical_rules_explained + compliance_checklist + ClientQ&A themes |
| 1.1 | 2026-04-23 | §9 inlined — deferred ML augmentation backlog (no separate ML doc) |
| 1.2 | 2026-04-23 | §8 added — planned NHS integration tiers (T1–T4); ML backlog renumbered §9 |
| 1.3 | 2026-04-23 | §5.1–5.3 — regulatory/market positioning; GDPR/audit/PGD API hooks; checklist rows 4.5/4.9/4.10 updated |
| 1.4 | 2026-04-23 | §5.3 — PostgreSQL audit persistence (`DATABASE_URL`), `database/migrations/`, `npm run migrate`; `audit_logs.request_id` in schema |
| 1.5 | 2026-04-23 | §7 — core platform “partial / not in UI” matrix (pharmacist mock, admin mock, analytics, PDF) |
| 1.6 | 2026-04-23 | §3 — clinical scope matrix; graph vs linear branching; layered disclaimers + `pathwayPatientDisclaimer` data/API |
| 1.7 | 2026-04-23 | §2 — patient consultation workflow (implementation truth vs generic 10-step spec; outcome code table) |
| 1.8 | 2026-04-23 | §2 — stakeholder/sales footnote (symptom-first router vs pathway-first MVP) |
| 1.9 | 2026-04-23 | §5 — Security and data protection (expectation vs repo; frontend implemented vs backlog) |
| 2.0 | 2026-05-05 | §3 updated with NHS Pharmacy First alignment detail across all seven pathways (inclusion/exclusion/red flags, timing gates, lesion thresholds, referral logic) |

**Clinical questions:** Clinical Safety Officer. **Technical:** engineering per [PLATFORM-HANDBOOK.md](./PLATFORM-HANDBOOK.md).

Advanced (Recommended)

Later we can also add:

📍 Location-based referral
“Nearest pharmacy near you”
📄 Download summary (PDF)
Patient shows to pharmacist
👨‍⚕️ Direct routing (future)
Send to pharmacist dashboard