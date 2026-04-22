# Clinical Rules Explained
## Aegis Health AI — For Clinical Stakeholders and Clients

> This document explains how the platform makes triage decisions, in plain English.
> It is written for non-technical healthcare stakeholders, commissioners, and clinical leads.

---

## How the System Makes Decisions

The platform uses a **rule-based clinical decision engine** — not artificial intelligence.

This means:
- Every decision can be traced to a specific, written rule
- No "black box" decisions
- Rules are based on NICE guidance and NHS clinical pathways
- All decisions are auditable and explainable

---

## The Three-Stage Decision Process

### Stage 1: Safety Check (Red Flags)
This runs **first, on every consultation, without exception**.

The system checks whether the patient has described any emergency or high-risk symptoms.

If a red flag is found:
- The consultation **stops immediately**
- The patient is told to call 999, attend A&E, or seek urgent care
- No further questions are asked

**Examples of red flags:**

| Condition | Red Flag Symptom | Action |
|-----------|-----------------|--------|
| Sore Throat | Difficulty breathing | Call 999 |
| Sinusitis | Eye swelling or vision changes | Call 999 |
| Insect Bite | Red line spreading up limb | Call 999 |
| UTI | Fever + loin/back pain | Urgent Care |
| Shingles | Eye pain or visual changes | A&E immediately |

The system is designed to **over-escalate rather than under-escalate**. A false positive (sending someone to A&E who didn't need it) is far safer than a false negative (not sending someone who did).

---

### Stage 2: Eligibility Check
If no red flags are found, the system checks whether the patient is eligible for pharmacy-led treatment.

This depends on:
- **Gender** — e.g. UTI pathway is for females aged 16–64 only
- **Age** — some pathways have age restrictions
- **Condition-specific factors** — e.g. pregnancy, immunosuppression, previous antibiotic use

If the patient is **not eligible for pharmacy**, they are referred to their GP.

---

### Stage 3: Outcome Decision
Based on the patient's answers and eligibility, the system selects the most appropriate care pathway:

| Outcome | Meaning |
|---------|---------|
| 🏠 Self-care | Condition is mild and likely to resolve with rest and OTC medication |
| 💊 Pharmacy | Pharmacy can assess and treat — no GP appointment needed |
| 🩺 GP | Needs a GP assessment, prescription, or further investigation |
| ⚠️ Urgent care | Needs same-day attention at an Urgent Treatment Centre or NHS 111 |
| 🚨 Emergency 999 | Life-threatening — call 999 immediately |

---

## Conditions Covered (Phase 1)

Each condition has its own set of questions, red flags, and eligibility rules:

### Urinary Tract Infection (UTI)
- **Based on**: NICE CG149 + Pharmacy First guidance
- **Eligible**: Women aged 16–64 with uncomplicated symptoms
- **Ineligible if**: Pregnant, catheterised, recent antibiotics, recurrent UTIs, fever + loin pain
- **Pharmacy treatment**: Trimethoprim or Nitrofurantoin

### Sore Throat
- **Based on**: NICE NG84 + FeverPAIN scoring
- **Decision tool**: FeverPAIN score (0–5) determines antibiotic likelihood
- **Red flags**: Difficulty breathing, facial swelling, rash + fever (possible scarlet fever)
- **Pharmacy treatment**: Throat lozenges or antibiotics (if bacterial cause likely)

### Sinusitis
- **Based on**: NICE NG107
- **Key rule**: Self-care first if symptoms are under 10 days (likely viral)
- **Pharmacy eligible**: Symptoms lasting 10 days to 12 weeks (possible bacterial)
- **Red flags**: Eye swelling, neck stiffness (possible meningitis/orbital cellulitis)

### Acute Otitis Media (Ear Infection)
- **Based on**: NICE CG60
- **Key rule**: Watchful waiting if symptoms under 3 days without fever
- **Red flags**: Swelling behind the ear (mastoiditis), facial nerve weakness

### Infected Insect Bite
- **Based on**: NICE CKS + Pharmacy First
- **Key rule**: Localised infection = pharmacy. Spreading/systemic = GP or A&E
- **Red flags**: Anaphylaxis, red line tracking up limb (lymphangitis)

### Impetigo
- **Based on**: NICE CKS Impetigo
- **Key rule**: Non-bullous impetigo without complicating factors = pharmacy
- **Ineligible if**: Bullous (blistering) type, immunosuppressed, pregnant
- **Pharmacy treatment**: Hydrogen peroxide 1% cream or fusidic acid

### Shingles (Herpes Zoster)
- **Based on**: NICE CKS Shingles
- **Critical rule**: Antiviral treatment must be started within **72 hours** of rash onset
- **Red flags**: Eye involvement (ophthalmic zoster — risk of blindness), ear involvement (Ramsay Hunt syndrome)
- **Pharmacy treatment**: Aciclovir 800mg 5x daily for 7 days (urgent)

---

## Safety Features

### Safety Net Advice
Every consultation outcome includes "safety net" advice — instructions on when to seek further help even after receiving self-care or pharmacy advice.

Example for UTI:
> *"Return or seek further help if: fever develops, symptoms worsen, or no improvement within 48 hours of treatment."*

### Clinical Governance
- All decisions are logged in an immutable audit trail
- Every rule references the clinical guideline it is based on
- The system cannot prescribe — it recommends. The pharmacist or GP always makes the final clinical decision.
- The platform is a **Clinical Decision Support (CDS) tool**, not a prescribing system.

---

## What the Platform Does NOT Do

- Does **not** replace clinical judgement — it supports it
- Does **not** automatically prescribe medication
- Does **not** access GP or hospital records (in Phase 1)
- Does **not** use AI or machine learning for clinical decisions (Phase 1)
- Does **not** make diagnoses — it triages to the right care level

---

## Questions?

For clinical questions about the rules or pathways, please contact the Clinical Safety Officer.

For technical questions, refer to the [architecture document](./architecture.md).
