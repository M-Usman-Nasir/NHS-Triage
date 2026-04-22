# Compliance Checklist — Aegis Health AI

> NHS and regulatory compliance requirements for the platform.
> Updated: April 2026 | Version: V0.1 (MVP preparation)

---

## Status Legend

| Symbol | Status |
|--------|--------|
| ✅ | Complete / In place |
| 🔄 | In progress |
| ⏳ | Planned — not yet started |
| ❌ | Blocked / Not applicable |

---

## 1. DTAC — Digital Technology Assessment Criteria

> NHS England's framework for assessing the safety and quality of digital health tools.

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1.1 | Clinical safety statement prepared | ⏳ | Required before NHS pilot |
| 1.2 | Usability testing conducted | ⏳ | Planned Phase 3 |
| 1.3 | Clinical evidence of benefit documented | ⏳ | Post-pilot evidence generation |
| 1.4 | Interoperability approach defined | 🔄 | Documented in architecture.md |
| 1.5 | Accessibility assessed (WCAG 2.2 AA) | ⏳ | Planned Phase 4 |
| 1.6 | Cyber security assessment completed | ⏳ | Planned Phase 4 |
| 1.7 | Data protection impact assessment (DPIA) | ⏳ | Planned Phase 4 |

---

## 2. DCB0129 — Clinical Risk Management for Manufacturers

> Standard for managing clinical risks in health IT systems. Required for NHS deployment.

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 2.1 | Clinical Safety Officer (CSO) appointed | ⏳ | Must be HCPC/GMC registered |
| 2.2 | Hazard log created | ⏳ | Planned Phase 4 |
| 2.3 | Clinical risk management plan written | ⏳ | Planned Phase 4 |
| 2.4 | Clinical safety case report produced | ⏳ | Planned Phase 4 |
| 2.5 | Red-flag escalation logic documented | ✅ | In clinical_rules_explained.md |
| 2.6 | Clinical decision logic is deterministic and auditable | ✅ | Rule-based engine (not ML) |
| 2.7 | Each pathway references a NICE/NHS clinical guideline | ✅ | Documented in pathway JSON files |

---

## 3. DCB0160 — Clinical Risk Management for Deployment

> Standard for organisations deploying health IT systems (e.g. NHS trust or CCG deploying Aegis).

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 3.1 | Deployment safety case prepared | ⏳ | Responsibility of deploying organisation |
| 3.2 | Local hazard log reviewed against DCB0129 output | ⏳ | Required before pilot |
| 3.3 | Staff training plan defined | ⏳ | Planned Phase 5 |

---

## 4. UK GDPR & DPIA

> General Data Protection Regulation (UK version) compliance.

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 4.1 | Data Protection Impact Assessment (DPIA) prepared | ⏳ | Planned Phase 4 |
| 4.2 | Lawful basis for processing identified | 🔄 | Likely: public task / vital interests |
| 4.3 | Patient consent mechanism implemented | ✅ | Consent checkbox on landing page |
| 4.4 | Data minimisation applied | ✅ | Only necessary data collected |
| 4.5 | Right to erasure mechanism planned | ⏳ | Planned for V1.5 |
| 4.6 | Data retention policy defined | ⏳ | Planned Phase 4 |
| 4.7 | Data stored in UK/EEA only | 🔄 | Azure UK South region planned |
| 4.8 | Encryption at rest and in transit | ✅ | In architecture (TLS + AES-256) |
| 4.9 | Audit logging for all data access | ✅ | audit_logs table implemented |
| 4.10 | Privacy notice / policy page | ⏳ | Required before launch |

---

## 5. DSP Toolkit

> NHS Data Security and Protection Toolkit — annual self-assessment for organisations handling NHS data.

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 5.1 | DSP Toolkit registration completed | ⏳ | Required for NHS data access |
| 5.2 | Staff data security training evidenced | ⏳ | Required annually |
| 5.3 | System level security policies documented | 🔄 | Architecture.md provides foundation |
| 5.4 | Penetration testing completed | ⏳ | Planned before pilot |
| 5.5 | Incident response process defined | ⏳ | Planned Phase 4 |

---

## 6. WCAG 2.2 AA — Accessibility

> Web Content Accessibility Guidelines — required for NHS-facing digital services.

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 6.1 | Keyboard navigation tested | ⏳ | Planned Phase 3 |
| 6.2 | Screen reader compatibility tested | ⏳ | Planned Phase 3 |
| 6.3 | Colour contrast ratio meets 4.5:1 minimum | 🔄 | Tailwind design uses accessible palette |
| 6.4 | Font sizes readable on mobile | ✅ | Mobile-first design |
| 6.5 | Error messages are descriptive | ✅ | Implemented in frontend |
| 6.6 | Forms have visible labels | ✅ | All inputs labelled |
| 6.7 | Accessibility statement published | ⏳ | Required before public launch |

---

## 7. MHRA / SaMD Classification

> Medicines and Healthcare products Regulatory Agency — Software as a Medical Device assessment.

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 7.1 | SaMD classification review initiated | ⏳ | Planned Phase 4 |
| 7.2 | Intended purpose statement documented | ✅ | In README.md and clinical docs |
| 7.3 | Clinical decision support vs. diagnosis boundary defined | ✅ | CDS tool — does not diagnose |
| 7.4 | UKCA/CE marking requirements assessed | ⏳ | Depends on MHRA classification |

---

## 8. Interoperability (Future)

> For Phase 2+ integration with NHS systems.

| # | System | Status | Notes |
|---|--------|--------|-------|
| 8.1 | NHS Login integration | ⏳ | Patient authentication via NHS Login |
| 8.2 | FHIR R4 API compatibility | ⏳ | For GP Connect / EHR integration |
| 8.3 | GP Connect Read (patient records) | ⏳ | Phase 2+ feature |
| 8.4 | Electronic Prescription Service (EPS) | ⏳ | Long-term goal |
| 8.5 | NHS Spine connection | ⏳ | Requires IG/legal agreements |

---

## Priority Actions Before NHS Pilot

The following must be completed before any NHS-facing pilot can proceed:

1. ✅ Platform built and functionally tested
2. ⏳ Clinical Safety Officer appointed
3. ⏳ DCB0129 clinical safety case produced
4. ⏳ DPIA completed and signed off
5. ⏳ DTAC evidence pack assembled
6. ⏳ Penetration test completed
7. ⏳ WCAG 2.2 AA audit passed
8. ⏳ DSP Toolkit submission prepared
9. ⏳ Staff training materials created
10. ⏳ Stakeholder sign-off obtained

---

*This document should be reviewed and updated at each project phase gate.*
