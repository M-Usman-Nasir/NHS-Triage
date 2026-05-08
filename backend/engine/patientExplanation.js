/**
 * patientExplanation.js
 * Care Path — Lay-language patient explanation (separate from clinical summaryText)
 */

'use strict';

const OUTCOME_INTRO = {
  self_care: 'Based on your answers, self-care at home is likely to be enough for now.',
  pharmacy: 'Based on your answers, a pharmacist is a good next step. They can assess you and supply some treatments without a GP appointment when appropriate.',
  gp: 'Based on your answers, you should arrange an appointment with your GP practice (or contact them for advice) so a doctor can assess you properly.',
  urgent_care: 'Based on your answers, you should get medical attention today — for example an urgent treatment centre, minor injuries unit, or NHS 111 if you are unsure where to go.',
  emergency_999: 'Based on your answers, your symptoms could be serious. Do not delay.',
};

/**
 * @param {object} p
 * @param {string} p.outcome
 * @param {string} p.outcomeReason
 * @param {boolean} p.redFlagTriggered
 * @param {string} [p.redFlagMessage]
 * @param {string[]} [p.comorbidityFragments]
 * @param {string[]} [p.governanceUncertainty] audit / lay note when conservative NHS defaults applied
 * @returns {string}
 */
function buildPatientExplanation(p) {
  const fragments = [];

  if (p.redFlagTriggered) {
    const lead = p.redFlagMessage || p.outcomeReason || 'Please follow the urgent advice you have been given.';
    fragments.push(lead);
    fragments.push(
      'This tool is not a medical examination. If you feel worse while waiting for help, call 999 or use NHS 111 online.',
    );
    return fragments.join(' ');
  }

  const intro = OUTCOME_INTRO[p.outcome] || 'Here is what we recommend next.';
  fragments.push(intro);

  if (p.outcomeReason && p.outcomeReason.trim()) {
    fragments.push(p.outcomeReason.trim());
  }

  if (p.comorbidityFragments && p.comorbidityFragments.length) {
    fragments.push(...p.comorbidityFragments);
  }

  if (p.governanceUncertainty && p.governanceUncertainty.length) {
    fragments.push(
      'Some answers could not be matched to every automated safety check; in line with NHS clinical governance, the system has chosen a more cautious next step rather than assuming the lowest level of care is appropriate.',
    );
  }

  fragments.push('If you become more unwell than you expected, seek help sooner — use NHS 111 or emergency services as appropriate.');

  return fragments.join(' ');
}

module.exports = { buildPatientExplanation, OUTCOME_INTRO };
