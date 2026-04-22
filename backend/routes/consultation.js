/**
 * consultation.js — API Route
 * Aegis Health AI
 *
 * Handles patient consultation submissions.
 *
 * Endpoints:
 *   POST /api/consultation        — Submit a new consultation
 *   GET  /api/consultation/:id    — Retrieve a consultation by ID
 *   GET  /api/consultation        — List all consultations (paginated, admin only)
 */

'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { runTriage, listAvailablePathways } = require('../engine/decisionEngine');

const router = express.Router();

// In-memory store for demo purposes.
// In production this would be replaced with PostgreSQL queries.
const consultationStore = new Map();

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
router.post('/', (req, res) => {
  const { pathwayCode, answers, patient, symptoms } = req.body;

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

  // Store consultation record
  const consultationId = uuidv4();
  const record = {
    id: consultationId,
    pathwayCode,
    answers,
    patient: patient || {},
    symptoms: symptoms || [],
    ...triageResult,
    createdAt: new Date().toISOString(),
    status: 'completed',
  };
  consultationStore.set(consultationId, record);

  // Audit log (demo — in production write to audit_logs table)
  console.log(`[AUDIT] consultation_completed | id=${consultationId} | outcome=${triageResult.outcome} | pathway=${pathwayCode}`);

  return res.status(201).json({
    consultationId,
    ...triageResult,
  });
});

/**
 * GET /api/consultation/:id
 *
 * Retrieve a stored consultation by its ID.
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const record = consultationStore.get(id);

  if (!record) {
    return res.status(404).json({ error: `Consultation not found: ${id}` });
  }

  return res.json(record);
});

/**
 * GET /api/consultation
 *
 * List all consultations (for admin/pharmacist dashboard).
 * Supports pagination via ?page=1&limit=10
 */
router.get('/', (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

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
 * GET /api/consultation/pathways/list
 *
 * Returns a list of all available clinical pathways.
 */
router.get('/pathways/list', (req, res) => {
  const pathways = listAvailablePathways();
  return res.json({ pathways });
});

module.exports = router;
