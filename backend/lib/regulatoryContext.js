/**
 * Machine-readable regulatory / intended-use context for API consumers (IG, SI, pharmacy integrations).
 * Does not replace organisational DPIA, DTAC, MHRA classification, or PGD documentation.
 */

'use strict';

const { PHARMACY_FIRST_SYSTEM_BOUNDARIES, PGD_COMPLIANCE_NOTES } = require('./pharmacyFirstGovernance');

const SOFTWARE_INTENDED_PURPOSE =
  'Clinical decision support for NHS-aligned triage: signposts users to self-care, community pharmacy (including Pharmacy First–style pathways where encoded in JSON rules), GP, same-day urgent services, or emergency (999). The software does not issue a medical diagnosis, does not select or issue prescriptions, and does not replace accountable pharmacist or medical judgement.';

/**
 * @param {object} p
 * @param {string} p.pathwayCode
 * @param {string} p.outcome
 * @param {boolean} p.pharmacyEligible
 * @param {boolean} [p.redFlagTriggered]
 */
function buildRegulatoryContext(p) {
  const { pathwayCode, outcome, pharmacyEligible, redFlagTriggered = false } = p;
  return {
    softwareVersion: process.env.APP_VERSION || '0.1.0',
    intendedPurpose: SOFTWARE_INTENDED_PURPOSE,
    ukGdpr: {
      dataCategories:
        'Pathway code, structured clinical answers, optional demographics used by rules, optional symptom keywords — see Privacy Policy.',
      lawfulBasisNote:
        'Deploying organisation must confirm Article 6/9 lawful basis and record in DPIA before processing special-category health data at scale.',
    },
    mhraSamDConsiderations: {
      postureSummary:
        'Positioned as clinical decision support / care navigation (not autonomous diagnostic or prescribing software). Formal SaMD classification and labelling are organisational activities with MHRA input.',
      notForDiagnosis: true,
      notForPrescribing: true,
      accountabilityRemainsWith: [
        'community_pharmacist_for_pgd_supply',
        'gp_or_advanced_practitioner_for_gp_routes',
        'urgent_emergency_services_for_escalated_routes',
      ],
    },
    pharmacyFirstAndPgd: {
      alignment:
        'Automated pharmacy eligibility follows pathway-encoded criteria aligned with NHS Pharmacy First–style navigation only.',
      pgdSupply: {
        performedBy: 'Licensed pharmacist under applicable PGD and local governance only.',
        systemRole: 'Supplies structured summary and eligibility hints; does not complete PGD clinical assessment or supply decision.',
      },
      systemBoundaries: PHARMACY_FIRST_SYSTEM_BOUNDARIES,
      complianceNotes: PGD_COMPLIANCE_NOTES,
    },
    clinicalSafetyToolkit: {
      dcb0129StyleControls:
        'Deterministic rules, red-flag-first ordering, governance defaults on evaluation failure — see CLINICAL-GOVERNANCE.md.',
      dsptNote:
        'NHS Data Security and Protection Toolkit (DSPT) evidence is collected at organisation level; technical controls support alignment (audit trail, minimised payloads).',
    },
    pathwayCode,
    dispositionOutcome: outcome,
    pharmacyRoutingSuggested: Boolean(pharmacyEligible && outcome === 'pharmacy'),
    redFlagTriggered: Boolean(redFlagTriggered),
  };
}

module.exports = {
  buildRegulatoryContext,
  SOFTWARE_INTENDED_PURPOSE,
};
