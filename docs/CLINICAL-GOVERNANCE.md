# Clinical & Governance — Stakeholder Source of Truth

**Aegis Health AI — rule-based triage (not generative AI diagnosis)**  
**Companion:** [PLATFORM-HANDBOOK.md](./PLATFORM-HANDBOOK.md) (technical implementation, phases, repo map, **built vs gap** table)

---

## Table of contents

1. [How decisions are made](#1-how-decisions-are-made)  
2. [Three-stage decision process](#2-three-stage-decision-process)  
3. [Conditions covered (phase 1)](#3-conditions-covered-phase-1)  
4. [Safety features & boundaries](#4-safety-features--boundaries)  
5. [Compliance checklist](#5-compliance-checklist) — [5.1 Regulatory positioning](#51-regulatory--compliance-positioning-product-statement) · [5.2 Market alignment](#52-market-timing--nhs-policy-alignment) · [5.3 Technical controls map](#53-programme-artefacts--technical-implementation-map)  
6. [Priority actions before NHS pilot](#6-priority-actions-before-nhs-pilot)  
7. [Stakeholder scope (MVP)](#7-stakeholder-scope-mvp)  
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

---

## 3. Conditions covered (phase 1)

### Urinary tract infection (UTI)

- Based on: NICE CG149 + Pharmacy First–style guidance  
- Eligible cohort example: women 16–64 with uncomplicated symptoms (validate against current JSON)  
- Exclusions example: pregnancy, catheter, recent antibiotics, recurrent UTIs, fever + loin pain  
- Pharmacy options: e.g. trimethoprim / nitrofurantoin where rules allow  

### Sore throat

- NICE NG84 + FeverPAIN-style logic where encoded  
- Red flags: breathing difficulty, facial swelling, combined rash + fever (scarlet fever suspicion)  

### Sinusitis

- NICE NG107–aligned rules where encoded  
- Red flags: eye swelling, neck stiffness / photophobia (serious differential)  

### Acute otitis media

- NICE CG60–aligned rules where encoded  
- Red flags: mastoid tenderness/swelling, facial weakness  

### Infected insect bite

- Local vs spreading infection; anaphylaxis / lymphangitis red flags  

### Impetigo

- Non-bullous vs bullous; immunosuppression / pregnancy exclusions  

### Shingles (herpes zoster)

- **72-hour** antiviral window where encoded  
- Red flags: eye or ear involvement (ophthalmic zoster / Ramsay Hunt)  

---

## 4. Safety features & boundaries

- **Safety-net advice** on every outcome (when to seek further help).  
- **Governance:** rules should reference guideline sources; changes need clinical process (see handbook Epic E-07).  
- **CDS only:** supports decision-making; **does not** prescribe; pharmacist/GP remains accountable.  

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

**Clinical questions:** Clinical Safety Officer. **Technical:** engineering per [PLATFORM-HANDBOOK.md](./PLATFORM-HANDBOOK.md).
