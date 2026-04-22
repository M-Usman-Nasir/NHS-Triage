# Aegis Health AI
## AI Consultation & Triage Platform

> An NHS-aligned AI-assisted digital triage system that guides patients through structured symptom consultations and safely routes them to the most appropriate care pathway.

---

## For the Client

### What does this platform do?

Aegis Health AI allows patients to describe their symptoms through a simple digital questionnaire on their phone or computer. The system then:

1. **Asks the right questions** — guided questions based on the patient's symptoms
2. **Checks for danger signs** — automatically identifies emergencies (e.g. chest pain → calls 999)
3. **Routes the patient safely** — to the correct care level:
   - Self-care advice at home
   - Pharmacy (most minor conditions)
   - GP appointment
   - Urgent care / walk-in
   - Emergency 999
4. **Generates a summary** — a clear report for the pharmacist or GP

### Why does this matter?

- Reduces pressure on GP surgeries
- Gets patients the right care faster
- Reduces unsafe self-diagnosis
- Pharmacists can see exactly what the patient reported
- Fully auditable for NHS governance

### Conditions Covered (Phase 1)

| Condition | Common Example |
|-----------|---------------|
| Sore Throat | Tonsillitis, strep throat |
| Sinusitis | Facial pain, blocked nose |
| Acute Otitis Media | Ear infection (adults) |
| Infected Insect Bites | Cellulitis from bite |
| Impetigo | Skin infection in adults |
| Shingles | Painful rash, nerve pain |
| UTI | Urinary tract infection (women) |

---

## For Developers

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (React), Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Decision Engine | Rule-based JSON trees (deterministic) |
| Cloud | Azure / Cloudways |
| Auth | JWT + Role-based access control |

### Project Structure

```
aegis-health-ai/
│
├── README.md                         ← You are here
├── TASKS.md                          ← Full task tracker with status
│
├── /frontend                         ← Next.js web app
│   ├── /pages
│   │   ├── index.tsx                 ← Landing page + consent
│   │   ├── consultation.tsx          ← Symptom questionnaire
│   │   ├── result.tsx                ← Triage outcome display
│   │   ├── pharmacist/
│   │   │   └── dashboard.tsx         ← Pharmacist case review panel
│   │   └── admin/
│   │       └── dashboard.tsx         ← Admin rules + analytics
│   ├── /components
│   │   ├── QuestionCard.tsx          ← Single question UI component
│   │   ├── RedFlagAlert.tsx          ← Emergency warning banner
│   │   ├── ConsultationSummary.tsx   ← Printable/shareable summary
│   │   └── OutcomeBadge.tsx          ← Colour-coded outcome label
│   └── /mock
│       └── patients.json             ← 10 demo patient records
│
├── /backend                          ← Node.js API server
│   ├── server.js                     ← Express app entry point
│   ├── /routes
│   │   ├── consultation.js           ← POST /api/consultation
│   │   ├── summary.js                ← GET /api/summary/:id
│   │   └── admin.js                  ← GET/POST /api/admin/rules
│   ├── /engine
│   │   ├── decisionEngine.js         ← Evaluates clinical rules
│   │   ├── redFlagDetector.js        ← Checks for emergency symptoms
│   │   └── pharmacyEligibility.js    ← Pharmacy routing logic
│   └── /data
│       ├── /pathways
│       │   ├── sore_throat.json      ← Clinical decision tree
│       │   ├── sinusitis.json
│       │   ├── otitis_media.json
│       │   ├── insect_bites.json
│       │   ├── impetigo.json
│       │   ├── shingles.json
│       │   └── uti.json
│       └── mock_consultations.json   ← 5 completed consultation records
│
├── /database
│   ├── schema.sql                    ← PostgreSQL table definitions
│   └── seed.sql                      ← Mock data inserts for local dev
│
└── /docs
    ├── architecture.md               ← System design for developers
    ├── user_flows.md                 ← Patient & pharmacist journeys
    ├── clinical_rules_explained.md   ← Clinical logic (client-friendly)
    └── compliance_checklist.md       ← NHS DTAC, GDPR, DCB0129 notes
```

### How the Decision Engine Works

```
Patient submits symptoms
        ↓
[1] Red-Flag Detector runs first
    → Any emergency symptoms? → ESCALATE to 999 / Urgent Care
        ↓ (no red flags)
[2] Pathway Classifier
    → Match symptoms to clinical pathway (e.g. UTI, Sore Throat)
        ↓
[3] Rule Evaluator
    → Apply clinical rules (age, duration, gender, comorbidities)
        ↓
[4] Pharmacy Eligibility Check
    → Can this be treated at pharmacy? Yes/No
        ↓
[5] Outcome Decision
    → Self-care / Pharmacy / GP / Urgent Care / 999
        ↓
[6] Summary Generator
    → Structured report with symptoms, reasoning, next steps
```

### Running Locally (Development)

```bash
# 1. Clone the project
git clone <repo-url>
cd aegis-health-ai

# 2. Install backend dependencies
cd backend
npm install
node server.js

# 3. Install frontend dependencies
cd ../frontend
npm install
npm run dev

# 4. Set up the database (PostgreSQL required)
psql -U postgres -f database/schema.sql
psql -U postgres -f database/seed.sql
```

Backend runs on: `http://localhost:4000`
Frontend runs on: `http://localhost:3000`

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/consultation` | Submit patient consultation |
| GET | `/api/summary/:id` | Retrieve consultation summary |
| GET | `/api/admin/rules` | List all clinical rules |
| POST | `/api/admin/rules` | Create/update a clinical rule |
| GET | `/api/admin/analytics` | View consultation statistics |

### User Roles

| Role | Access |
|------|--------|
| `patient` | Complete consultations, view own results |
| `pharmacist` | View assigned consultations, access summaries |
| `admin` | Manage rules, view analytics, configure pathways |

### Environment Variables

Create a `.env` file in `/backend`:

```
PORT=4000
DATABASE_URL=postgresql://localhost:5432/aegis_health
JWT_SECRET=your-secret-key
NODE_ENV=development
```

---

## Delivery Timeline

| Version | Milestone | Month | Cost |
|---------|-----------|-------|------|
| V0.1 | Platform Foundation | 1 | £4,000 |
| V0.5 | Functional Prototype | 2 | £5,000 |
| V1.0 | MVP Triage Platform | 3–4 | £9,000 |
| V1.5 | Pharmacy Pilot Version | 5–6 | £7,000 |
| V2.0 | AI Optimization | 7–8 | £5,000 |

---

## Compliance Summary

| Requirement | Status |
|------------|--------|
| DTAC (Digital Technology Assessment Criteria) | In preparation |
| DCB0129 (Clinical Safety) | In preparation |
| DCB0160 (Deployment Safety) | In preparation |
| UK GDPR / DPIA | In preparation |
| DSP Toolkit | In preparation |
| WCAG 2.2 AA (Accessibility) | In preparation |
| MHRA/SaMD Classification | Under review |

---

## Contact & Support

For technical queries, refer to the development team or open an issue in the project repository.

For clinical or compliance questions, escalate to the clinical safety officer.

---

*Aegis Health AI — Improving patient access. Reducing clinical pressure. Built for the NHS.*
