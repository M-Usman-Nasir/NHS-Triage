# MVP Build — System Logic & Engineering Rules

**Final understanding (authoritative for engineering)** — aligned with `backend/engine/decisionEngine.js` and [docs/clinical_rules_explained.md](docs/clinical_rules_explained.md).

---

## 1. Runtime order (what happens when the user finishes the questionnaire)

Use this sequence for **design, APIs, audits, and training**. Do **not** run pharmacy eligibility or routine outcome rules before red-flag clearance.

| Step | Stage | What happens |
|------|--------|----------------|
| **0** | **Pathway context** | User **selects** a pathway (e.g. UTI, sore throat) — this is **not** automated “diagnosis”; it chooses which **question set and rules** apply. |
| **1** | **User answers questions** | All required answers collected (and demographics where needed). |
| **2** | **Submit to server** | Single triage execution (e.g. `runTriage`) — **deterministic**, logged inputs. |
| **3** | **Decision engine runs** *(orchestrator)* | The engine runs **in a fixed internal order** (steps 3a–3d are **inside** one call — not reorderable). |
| **3a** | **Red-flag check** *(first inside engine)* | **Emergency / safety override.** If triggered → set escalated outcome (e.g. `emergency_999`, `urgent_care` per rules) and **skip** routine pharmacy + routine outcome branching that could undertriage. |
| **3b** | **Pharmacy eligibility check** | Runs **only if** no red flag (or per your written policy for edge cases — document exceptions). |
| **3c** | **Outcome rules** | Self-care / pharmacy / GP / etc. from **rule table**, using answers + eligibility context. |
| **3d** | **Summary generated** | Structured text from **facts + templates** (no free-form “diagnosis”). |
| **4** | **Response to client** | Final outcome + summary + reason codes returned; **persist** consultation + audit metadata. |

### Correction vs a linear list like “… then decision engine, then red flag”

If red-flag were **after** a general “decision engine” step that already chose pharmacy/GP, safety would be wrong. **Red-flag is always the first evaluation inside the triage orchestrator** once answers are submitted.

```text
User answers  →  Submit  →  Decision Engine
                              ├─ 1. Red-flag (override)
                              ├─ 2. Pharmacy eligibility
                              ├─ 3. Outcome rules
                              └─ 4. Summary
```

### “System detects condition”

In this product, **condition = chosen pathway** (user + clinician-designed lists), **not** an ML classifier guessing ICD codes. If you add inference later, it must **not** replace pathway selection or red-flag rules without a new safety case.

---

## 2. Critical engineering rules

### Always

| Rule | Meaning |
|------|--------|
| **Escalate if unsure** | Prefer higher acuity / GP / 999 over “convenient” lower triage when rules or data are ambiguous — **document** default behaviour. |
| **Log every decision** | Inputs, `rulesetVersion` / hash, red-flag result, eligibility, outcome, summary version, timestamp, correlation id — **no secrets or unnecessary PII** in logs. |
| **Keep rules deterministic** | Same inputs + same ruleset → **same** outcome; no LLM in the core decision path unless explicitly approved and isolated. |

### Never

| Rule | Meaning |
|------|--------|
| **Diagnose** | Output is **triage / care navigation**, not a clinical diagnosis entity. |
| **Replace doctors / pharmacists** | Copy and flows must state this is **guidance**; professional assessment remains authoritative. |
| **Skip red-flag logic** | No shortcut, feature flag, or “optimisation” that bypasses red-flag evaluation for production triage. |

---

## 3. Core development order (build sequence — can differ from runtime)

Implementation order is flexible, but **ship** only when runtime order and tests match §1.

1. **Question flow** — dynamic `question → answer → next` (eventually server-authoritative; see [docs/patient-flow-ui-finalization.md](docs/patient-flow-ui-finalization.md)).
2. **Red-flag module** — isolated, fully tested, **first** in orchestration.
3. **Decision orchestrator** — wires red-flag → eligibility → outcomes → summary.
4. **Pharmacy eligibility** — strict matrix + tests.
5. **Summary generator** — templates + facts.
6. **UI + API integration** — patient flow, result page, audit persistence.
7. **Testing & iteration** — all paths, all seven pathways (where active), edge cases (missing answers, conflicting answers per policy).

---

## 4. Compliance & pilot readiness (short)

- Audit logs and data-flow docs (see [docs/compliance_checklist.md](docs/compliance_checklist.md)).
- Security basics: authentication, encryption in transit (and at rest for prod), access control.
- Pilot: define what is missing, what must improve, roadmap — [docs/milestone-plan.md](docs/milestone-plan.md).

---

## 5. Related code (for developers)

| Piece | Location |
|-------|-----------|
| Orchestrator | `backend/engine/decisionEngine.js` |
| Red flags | `backend/engine/redFlagDetector.js` |
| Pharmacy eligibility | `backend/engine/pharmacyEligibility.js` |
| Persist consultation | `backend/routes/consultation.js` |
