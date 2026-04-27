/**
 * consultation.js — API Route
 * Aegis Health AI
 *
 * Handles patient consultation submissions.
 *
 * Endpoints:
 *   POST /api/consultation              — Submit a new consultation
 *   GET  /api/consultation/definitions/:pathwayCode — Pathway questions + first step (branching)
 *   POST /api/consultation/question/next — Server-driven next clinical question
 *   GET  /api/consultation/:id          — Retrieve a consultation by ID
 *   GET  /api/consultation              — List all consultations (paginated, admin only)
 */

'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { runTriage, listAvailablePathways } = require('../engine/decisionEngine');
const {
  getNextQuestionState,
  loadPathway: loadPathwayForGraph,
  validateClinicalAnswersComplete,
} = require('../engine/questionGraph');
const { consultationStore } = require('../store/consultationStore');
const { logAuditEvent } = require('../lib/auditLog');
const { buildRegulatoryContext } = require('../lib/regulatoryContext');
const { buildStructuredReport } = require('../lib/structuredReport');
const { buildDecisionExplanation } = require('../lib/explanationEngine');

const router = express.Router();

function clientIp(req) {
  const x = req.headers['x-forwarded-for'];
  if (typeof x === 'string' && x.length) return x.split(',')[0].trim();
  return req.socket?.remoteAddress || null;
}

/**
 * POST /api/consultation
 *
 * Submit a new patient consultation and receive a triage decision.
 *
 * Request body:
 * {
 *   "pathwayCode": "uti",
 *   "answers": { "q1": "3 days", "q2": false, ... },
 *   "patient": { "fullName": "Sarah M", "age": 33, "gender": "Female" },
 *   "symptoms": ["painful urination", "frequent urination"]
 * }
 *
 * Response:
 * {
 *   "consultationId": "uuid",
 *   "outcome": "pharmacy",
 *   "outcomeLabel": "Pharmacy Referral",
 *   "outcomeColour": "blue",
 *   "outcomeReason": "...",
 *   "redFlagTriggered": false,
 *   "redFlags": [],
 *   "pharmacyEligible": true,
 *   "summaryText": "...",
 *   "safetyNetAdvice": "...",
 *   "pharmacyTreatmentOptions": ["..."],
 *   "selfCareAdvice": null
 * }
 */
router.post('/', async (req, res) => {
  const { pathwayCode, answers, patient, symptoms } = req.body;
  await logAuditEvent({
    eventType: 'consultation_started',
    requestId: req.requestId,
    entityType: 'consultation',
    entityId: null,
    ip: clientIp(req),
    payload: {
      pathwayCode: pathwayCode || null,
      hasAnswersPayload: !!answers,
      hasPatientPayload: !!patient,
    },
  });

  // Validate required fields
  if (!pathwayCode) {
    return res.status(400).json({ error: 'pathwayCode is required.' });
  }
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'answers must be an object.' });
  }

  const availablePathways = listAvailablePathways();
  if (!availablePathways.includes(pathwayCode)) {
    return res.status(400).json({
      error: `Unknown pathway: "${pathwayCode}".`,
      availablePathways,
    });
  }

  const flowCheck = validateClinicalAnswersComplete(pathwayCode, answers, patient || {});
  if (!flowCheck.ok) {
    return res.status(400).json({
      error: 'Clinical questionnaire is incomplete for this pathway.',
      missingQuestionId: flowCheck.missing,
      detail: flowCheck.error,
    });
  }

  let triageResult;
  try {
    triageResult = runTriage({
      pathwayCode,
      answers,
      patient: patient || {},
      symptoms: symptoms || [],
    });
  } catch (err) {
    console.error('[consultation] Triage engine error:', err.message);
    return res.status(500).json({ error: 'Triage engine encountered an error.', detail: err.message });
  }

  const pathwayDoc = loadPathwayForGraph(pathwayCode);
  const pathwayPatientDisclaimer = pathwayDoc.pathwayPatientDisclaimer || null;
  const normalizedOutcomeReason =
    typeof triageResult.outcomeReason === 'string' && triageResult.outcomeReason.trim()
      ? triageResult.outcomeReason.trim()
      : 'Outcome determined by rule-based triage after safety and eligibility evaluation.';
  triageResult.outcomeReason = normalizedOutcomeReason;
  triageResult.explanation = buildDecisionExplanation({
    decision: triageResult.outcome,
    reason: normalizedOutcomeReason,
    source: triageResult.redFlagTriggered ? 'red_flag_engine' : 'rule_engine',
  });

  // Store consultation record
  const consultationId = uuidv4();
  const record = {
    id: consultationId,
    pathwayCode,
    answers,
    patient: patient || {},
    symptoms: symptoms || [],
    ...triageResult,
    pathwayPatientDisclaimer,
    createdAt: new Date().toISOString(),
    status: 'completed',
  };
  const regulatoryContext = buildRegulatoryContext({
    pathwayCode,
    outcome: triageResult.outcome,
    pharmacyEligible: triageResult.pharmacyEligible,
    redFlagTriggered: triageResult.redFlagTriggered,
  });
  record.regulatoryContext = regulatoryContext;
  record.structuredReport = buildStructuredReport(record);
  consultationStore.set(consultationId, record);

  if (triageResult.redFlagTriggered) {
    await logAuditEvent({
      eventType: 'red_flag_triggered',
      requestId: req.requestId,
      entityType: 'consultation',
      entityId: consultationId,
      ip: clientIp(req),
      payload: {
        pathwayCode,
        redFlags: triageResult.redFlags || [],
      },
    });
  }

  await logAuditEvent({
    eventType: 'consultation_completed',
    requestId: req.requestId,
    entityType: 'consultation',
    entityId: consultationId,
    ip: clientIp(req),
    payload: {
      pathwayCode,
      outcome: triageResult.outcome,
      pharmacyEligible: triageResult.pharmacyEligible,
      redFlagTriggered: triageResult.redFlagTriggered,
      governanceUncertainty: triageResult.governanceUncertainty || [],
    },
  });
  await logAuditEvent({
    eventType: 'system_decision_emitted',
    requestId: req.requestId,
    entityType: 'consultation',
    entityId: consultationId,
    ip: clientIp(req),
    payload: {
      pathwayCode,
      outcome: triageResult.outcome,
      outcomeReason: triageResult.outcomeReason,
    },
  });

  return res.status(201).json({
    consultationId,
    ...triageResult,
    regulatoryContext,
    pathwayPatientDisclaimer,
    structuredReport: record.structuredReport,
  });
});

/**
 * GET /api/consultation/pathways/list
 *
 * Returns a list of all available clinical pathways.
 * MUST be registered before /:id so "pathways" is not captured as an id.
 */
router.get('/pathways/list', (req, res) => {
  const pathways = listAvailablePathways();
  return res.json({ pathways });
});

/**
 * GET /api/consultation/definitions/:pathwayCode
 *
 * Pathway questionnaire + first clinical question (server-driven flow).
 */
router.get('/definitions/:pathwayCode', (req, res) => {
  const { pathwayCode } = req.params;
  const availablePathways = listAvailablePathways();
  if (!availablePathways.includes(pathwayCode)) {
    return res.status(400).json({
      error: `Unknown pathway: "${pathwayCode}".`,
      availablePathways,
    });
  }
  try {
    const pathway = loadPathwayForGraph(pathwayCode);
    const gender = typeof req.query.gender === 'string' ? req.query.gender : '';
    const initial = getNextQuestionState(pathwayCode, null, {}, { gender });
    return res.json({
      pathwayCode,
      label: pathway.label || pathway.pathway,
      questions: pathway.questions || [],
      firstQuestionId: initial.nextQuestionId,
      progressMax: initial.progressMax,
    });
  } catch (err) {
    console.error('[consultation] definitions error:', err.message);
    return res.status(500).json({ error: 'Could not load pathway definitions.', detail: err.message });
  }
});

/**
 * POST /api/consultation/question/next
 *
 * Body: { pathwayCode, answers, patient?, currentQuestionId?: string | null }
 * Returns the next clinical question id (or isComplete when the pathway is finished).
 */
router.post('/question/next', async (req, res) => {
  const { pathwayCode, answers = {}, currentQuestionId = null } = req.body;
  const patient = req.body.patient || {};

  if (!pathwayCode) {
    return res.status(400).json({ error: 'pathwayCode is required.' });
  }
  const availablePathways = listAvailablePathways();
  if (!availablePathways.includes(pathwayCode)) {
    return res.status(400).json({
      error: `Unknown pathway: "${pathwayCode}".`,
      availablePathways,
    });
  }
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'answers must be an object.' });
  }

  try {
    const state = getNextQuestionState(pathwayCode, currentQuestionId, answers, patient);
    await logAuditEvent({
      eventType: 'question_answered',
      requestId: req.requestId,
      entityType: 'consultation_question',
      entityId: null,
      ip: clientIp(req),
      payload: {
        pathwayCode,
        answeredQuestionId: currentQuestionId,
        nextQuestionId: state.nextQuestionId,
        isComplete: state.isComplete,
      },
    });
    return res.json({
      nextQuestionId: state.nextQuestionId,
      isComplete: state.isComplete,
      nextQuestion: state.nextQuestion,
      progressMax: state.progressMax,
    });
  } catch (err) {
    console.error('[consultation] question/next error:', err.message);
    return res.status(500).json({ error: 'Could not resolve next question.', detail: err.message });
  }
});

/**
 * GET /api/consultation
 *
 * List all consultations (for admin/pharmacist dashboard).
 * Supports pagination via ?page=1&limit=10
 */
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  await logAuditEvent({
    eventType: 'consultation_list_accessed',
    requestId: req.requestId,
    entityType: 'consultation',
    entityId: null,
    ip: clientIp(req),
    payload: { page, limit },
  });

  const all = Array.from(consultationStore.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = all.length;
  const start = (page - 1) * limit;
  const items = all.slice(start, start + limit);

  return res.json({
    total,
    page,
    limit,
    items,
  });
});

/**
 * GET /api/consultation/:id
 *
 * Retrieve a stored consultation by its ID.
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const record = consultationStore.get(id);

  if (!record) {
    return res.status(404).json({ error: `Consultation not found: ${id}` });
  }

  await logAuditEvent({
    eventType: 'consultation_record_accessed',
    requestId: req.requestId,
    entityType: 'consultation',
    entityId: id,
    ip: clientIp(req),
    payload: { pathwayCode: record.pathwayCode },
  });

  return res.json(record);
});

module.exports = router;
