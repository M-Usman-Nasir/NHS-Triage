# User Flows — Aegis Health AI

> Covers the patient journey, pharmacist workflow, and admin operations.

---

## Flow 1: Patient Consultation Journey

```
Patient opens the platform on their phone or computer
        │
        ▼
Landing Page (/)
  - Reads platform introduction
  - Selects their condition from 7 options
  - Reads and accepts consent + disclaimer
  - Clicks "Start Consultation"
        │
        ▼
Consultation Page (/consultation?pathway=uti)
  - Enters name, age, gender
  - Optionally describes symptoms in free text
  - Answers guided questions one by one:
      Q1: Duration? → "3 days"
      Q2: Blood in urine? → No
      Q3: Fever? → No
      Q4: Loin pain? → No
      Q5: Pregnant? → No
      ...
  - Clicks "Submit Consultation"
        │
        ▼
Backend processes consultation:
  → Red Flag check → None found
  → Pharmacy eligibility → Eligible
  → Outcome rule match → "pharmacy"
  → Summary generated
        │
        ▼
Result Page (/result?id=<uuid>)
  - Sees: "💊 Visit Your Pharmacy"
  - Reads outcome reason
  - Sees treatment options
  - Reads safety net advice
  - Can print or email summary
  - Can start a new consultation
```

---

## Flow 2: Emergency Escalation (Red Flag)

```
Patient opens platform
  - Selects "Sore Throat"
        │
        ▼
Answers question: "Do you have difficulty breathing?"
  - Answers: YES
        │
        ▼
Backend:
  → Red Flag RF_ST_001 triggered: Difficulty breathing
  → Outcome = emergency_999
  → Consultation ends immediately
        │
        ▼
Result Page:
  - Sees: "🚨 Call 999 — Emergency"
  - Large red alert: "Call 999 immediately"
  - Message: "Difficulty breathing with a sore throat can be very serious."
  - No treatment options shown
  - Safety advice: "Do not drive to hospital"
```

---

## Flow 3: Pharmacist Reviews a Case

```
Pharmacist receives notification (or checks dashboard)
        │
        ▼
Pharmacist Dashboard (/pharmacist/dashboard)
  - Sees list of referred patients
  - "Chloe Davies — URGENT — Shingles" at top (orange badge)
  - "Sarah Mitchell — UTI — Standard"
        │
        ▼
Clicks on Chloe Davies
  - Right panel shows:
      Patient: Chloe Davies (F, 30)
      Pathway: Shingles
      Summary: Same-day rash, within 72-hour window...
      Treatment: Aciclovir 800mg 5x daily x 7 days
        │
        ▼
Pharmacist assesses patient in person
  - Confirms diagnosis clinically
  - Dispenses Aciclovir
        │
        ▼
Clicks "💊 Treated"
  - Status updates to "Treated"
  - Logged in audit trail
```

---

## Flow 4: GP Referral Case

```
Patient (Aisha Patel, 37F)
  - Pathway: Sore Throat
  - Answers:
      Duration: 5 days
      Difficulty swallowing: YES
      Fever: YES (38.9°C)
      Rash: YES (chest/abdomen)
        │
        ▼
Backend:
  → Red Flag RF_ST_003: Fever + rash → "gp" outcome
  → pharmacy eligible: false
        │
        ▼
Result Page:
  - "🩺 See Your GP"
  - Reason: "Possible scarlet fever — requires GP assessment"
  - No treatment options (pharmacy not appropriate)
  - Safety net: "If breathing difficulty develops, attend A&E"
```

---

## Flow 5: Admin Reviews Analytics

```
Admin logs in → /admin/dashboard
        │
        ▼
Overview Tab:
  - Total: 334 consultations (last 7 days)
  - Pharmacy referral rate: 40.4%
  - Red flag rate: 5.4%
  - Bar chart: daily volumes
        │
        ▼
Pathways Tab:
  - Table of all 7 pathways
  - Questions count, red flag count, active status
        │
        ▼
Rules Tab:
  - All red flag rules across pathways
  - Read-only view
  - Any rule edits require clinical sign-off + deployment
```

---

## Outcome Decision Tree (Summary)

```
Patient submits answers
        │
        ├─ RED FLAG detected? ──────────────────► emergency_999 / urgent_care / gp
        │
        ├─ NO red flags
        │       │
        │       ├─ Pharmacy eligible? YES
        │       │       │
        │       │       └─ Outcome rules match?
        │       │               ├─ pharmacy    → 💊 Visit Pharmacy
        │       │               └─ self_care   → 🏠 Self-Care
        │       │
        │       └─ Pharmacy eligible? NO
        │               │
        │               └─ Outcome rules match?
        │                       ├─ gp          → 🩺 See GP
        │                       └─ urgent_care → ⚠️ Urgent Care
```

---

## User Roles and Access Summary

| Feature | Patient | Pharmacist | Admin |
|---------|---------|-----------|-------|
| Complete consultation | ✅ | — | — |
| View own result | ✅ | — | — |
| View pharmacy referrals | — | ✅ | ✅ |
| Mark case as treated | — | ✅ | ✅ |
| View analytics | — | — | ✅ |
| View all consultations | — | — | ✅ |
| View clinical rules | — | — | ✅ |
| Edit clinical rules | — | — | ✅ (with sign-off) |
