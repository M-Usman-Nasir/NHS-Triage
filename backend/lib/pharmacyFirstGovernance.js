/**
 * Pharmacy First / PGD governance constants for documentation parity and API consumers.
 * Clinical and legal sign-off for any live PGD workflow remains with the deploying pharmacy organisation.
 */

'use strict';

const PHARMACY_FIRST_SYSTEM_BOUNDARIES = {
  tier1CurrentBuild: [
    'Rule-based eligibility and care navigation only.',
    'No integration to PMR, EPS, or PGD workflow systems in this repository tier.',
  ],
  tier2Planned: [
    'Case summary export for pharmacist PGD decision support (see CLINICAL-GOVERNANCE.md §8 Tier 2).',
  ],
  pharmacistAccountability: [
    'Final PGD eligibility, supply, safety netting, and record-keeping rest with the accountable pharmacist.',
  ],
};

const PGD_COMPLIANCE_NOTES = [
  'The application does not store or execute PGD protocol text; it encodes referral/eligibility style rules in pathway JSON for triage navigation.',
  'Where pharmacy supply is mentioned in patient copy, it is always framed as pharmacist assessment under Pharmacy First / PGD where locally commissioned.',
];

module.exports = {
  PHARMACY_FIRST_SYSTEM_BOUNDARIES,
  PGD_COMPLIANCE_NOTES,
};
