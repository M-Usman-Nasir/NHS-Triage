/**
 * summary.js — API Route
 * Aegis Health AI
 *
 * Consultation summaries read from the shared consultation store
 * (same source as POST /api/consultation + seeded demo rows).
 */

'use strict';

const express = require('express');
const { consultationStore } = require('../store/consultationStore');
const { recordToSummaryResponse } = require('../lib/summaryMapper');
const { logAuditEvent } = require('../lib/auditLog');
const { buildDecisionExplanation } = require('../lib/explanationEngine');

const router = express.Router();

function clientIp(req) {
  const x = req.headers['x-forwarded-for'];
  if (typeof x === 'string' && x.length) return x.split(',')[0].trim();
  return req.socket?.remoteAddress || null;
}

/**
 * GET /api/summary
 * List summaries for pharmacist / admin demo (register before /:id).
 */
router.get('/', async (req, res) => {
  await logAuditEvent({
    eventType: 'summary_list_accessed',
    requestId: req.requestId,
    entityType: 'consultation',
    entityId: null,
    ip: clientIp(req),
    payload: { count: consultationStore.size },
  });

  const summaries = Array.from(consultationStore.values())
    .sort((a, b) => new Date(b.createdAt || b.completedAt || 0) - new Date(a.createdAt || a.completedAt || 0))
    .map((c) => {
      const s = recordToSummaryResponse(c);
      return {
        id: s.id,
        patient: s.patient,
        pathway: s.pathway,
        pathwayLabel: s.pathwayLabel,
        outcome: s.outcome,
        outcomeLabel: s.outcomeLabel,
        redFlagTriggered: s.redFlagTriggered,
        createdAt: s.createdAt,
        status: s.status,
      };
    });

  return res.json({ total: summaries.length, summaries });
});

/**
 * GET /api/summary/:id/pdf — must be before /:id
 */
router.get('/:id/pdf', (req, res) => {
  const { id } = req.params;
  const record = consultationStore.get(id);
  if (!record) {
    return res.status(404).json({ error: `Consultation not found: ${id}` });
  }

  return res.status(501).json({
    message: 'PDF generation is not yet implemented.',
    consultationId: id,
    hint: 'This endpoint will return a downloadable PDF of the consultation summary in a future release.',
  });
});

/**
 * POST /api/summary/:id/override
 * Pharmacist can override system decision with explicit rationale.
 * Body:
 * {
 *   pharmacist_id: "pharm-123",
 *   overridden_decision: "gp",
 *   reason: "Patient appears systemically unwell"
 * }
 */
router.post('/:id/override', async (req, res) => {
  const { id } = req.params;
  const { pharmacist_id, overridden_decision, reason } = req.body || {};

  if (!pharmacist_id || !overridden_decision || !reason) {
    return res.status(400).json({
      error: 'pharmacist_id, overridden_decision and reason are required.',
    });
  }

  const validOutcomes = ['self_care', 'pharmacy', 'gp', 'urgent_care', 'emergency_999'];
  if (!validOutcomes.includes(overridden_decision)) {
    return res.status(400).json({ error: `Invalid overridden_decision. Valid: ${validOutcomes.join(', ')}` });
  }

  const record = consultationStore.get(id);
  if (!record) {
    return res.status(404).json({
      error: `No consultation summary found for ID: ${id}`,
    });
  }

  const originalDecision = record.outcome;
  const appliedAt = new Date().toISOString();

  record.pharmacistOverride = {
    original_decision: originalDecision,
    overridden_decision,
    pharmacist_id,
    reason,
    timestamp: appliedAt,
  };
  record.outcome = overridden_decision;
  record.outcomeLabel = overridden_decision;
  record.outcomeReason = `Overridden by pharmacist (${pharmacist_id}): ${reason}`;
  record.explanation = buildDecisionExplanation({
    decision: overridden_decision,
    reason: record.outcomeReason,
    source: 'pharmacist_override',
  });
  record.status = 'reviewed';
  record.decision = {
    code: overridden_decision,
    label: overridden_decision,
    urgency: record.decision?.urgency || 'unknown',
    title: record.decision?.title || overridden_decision,
  };
  record.reasoning = {
    steps: [record.outcomeReason],
    clinicalBasis: [record.outcomeReason],
    engine: {
      source: 'pharmacist_override',
      ruleIdsMatched: [],
      governanceUncertainty: record.governanceUncertainty || [],
    },
  };
  record.referralRecommendation = {
    service: overridden_decision,
    instruction: record.outcomeReason,
    actions: [],
    escalationSafetyNet: record.safetyNetAdvice ? [record.safetyNetAdvice] : [],
  };
  consultationStore.set(id, record);

  await logAuditEvent({
    eventType: 'pharmacist_override_applied',
    requestId: req.requestId,
    entityType: 'consultation',
    entityId: id,
    userId: pharmacist_id,
    ip: clientIp(req),
    payload: {
      original_decision: originalDecision,
      overridden_decision,
      pharmacist_id,
      reason,
      timestamp: appliedAt,
    },
  });

  return res.json({
    success: true,
    override: record.pharmacistOverride,
    summary: recordToSummaryResponse(record),
  });
});

/**
 * GET /api/summary/:id
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const record = consultationStore.get(id);
  if (!record) {
    return res.status(404).json({
      error: `No consultation summary found for ID: ${id}`,
      hint: 'Complete a consultation first, or use a seeded demo id from mock_consultations.json.',
    });
  }

  const summary = recordToSummaryResponse(record);

  await logAuditEvent({
    eventType: 'summary_accessed',
    requestId: req.requestId,
    entityType: 'consultation',
    entityId: id,
    ip: clientIp(req),
    payload: { outcome: record.outcome, pathwayCode: record.pathwayCode },
  });
  await logAuditEvent({
    eventType: 'user_viewed_result',
    requestId: req.requestId,
    entityType: 'consultation',
    entityId: id,
    ip: clientIp(req),
    payload: { route: 'summary_view' },
  });

  return res.json(summary);
});

module.exports = router;
