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

const router = express.Router();

/**
 * GET /api/summary
 * List summaries for pharmacist / admin demo (register before /:id).
 */
router.get('/', (req, res) => {
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
 * GET /api/summary/:id
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const record = consultationStore.get(id);
  if (!record) {
    return res.status(404).json({
      error: `No consultation summary found for ID: ${id}`,
      hint: 'Complete a consultation first, or use a seeded demo id from mock_consultations.json.',
    });
  }

  const summary = recordToSummaryResponse(record);

  console.log(`[AUDIT] summary_accessed | consultation_id=${id}`);

  return res.json(summary);
});

module.exports = router;
