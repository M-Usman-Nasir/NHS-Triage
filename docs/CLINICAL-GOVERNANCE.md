# Clinical & Governance — Stakeholder Source of Truth

**Aegis Health AI — rule-based triage (not generative AI diagnosis)**  
**Companion:** [PLATFORM-HANDBOOK.md](./PLATFORM-HANDBOOK.md) (technical implementation, phases, repo map, **built vs gap** table)

---

## Table of contents

1. [How decisions are made](#1-how-decisions-are-made)  
2. [Three-stage decision process](#2-three-stage-decision-process)  
3. [Conditions covered (phase 1)](#3-conditions-covered-phase-1)  
4. [Safety features & boundaries](#4-safety-features--boundaries)  
5. [Compliance checklist](#5-compliance-checklist)  
6. [Priority actions before NHS pilot](#6-priority-actions-before-nhs-pilot)  
7. [Stakeholder scope (MVP)](#7-stakeholder-scope-mvp)  
8. [Document control](#8-document-control)

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

| # | Requirement | Status |
|---|-------------|--------|
| 4.1 | DPIA | ⏳ |
| 4.2 | Lawful basis | 🔄 |
| 4.3 | Consent on landing | ✅ |
| 4.4 | Data minimisation | ✅ |
| 4.5 | Right to erasure | ⏳ |
| 4.6 | Retention policy | ⏳ |
| 4.7 | UK/EEA hosting | 🔄 |
| 4.8 | Encryption in transit / at rest | ✅ / verify prod |
| 4.9 | Audit logging | 🔄 DB + app |
| 4.10 | Privacy notice page | ⏳ |

### DSPT, WCAG, MHRA/SaMD

Track as programme items; intended purpose and CDS-vs-diagnosis boundary are documented in §1 and §4.

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

**Deployment intent:** Controlled **pilot**, not demo-only — subject to §5–6 completion.

---

## 8. Document control

| Version | Date | Notes |
|---------|------|--------|
| 1.0 | 2026-04-23 | Merged clinical_rules_explained + compliance_checklist + ClientQ&A themes |

**Clinical questions:** Clinical Safety Officer. **Technical:** engineering per [PLATFORM-HANDBOOK.md](./PLATFORM-HANDBOOK.md).
