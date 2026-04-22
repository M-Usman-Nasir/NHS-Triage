/**
 * summary.js — API Route
 * Aegis Health AI
 *
 * Provides consultation summary retrieval for pharmacists and GPs.
 * The summary is a structured report that can be shared with healthcare professionals.
 *
 * Endpoints:
 *   GET /api/summary/:id          — Get full consultation summary
 *   GET /api/summary/:id/pdf      — Get summary formatted for PDF download (placeholder)
 */

'use strict';

const express = require('express');

const router = express.Router();

// Mock summary store — populated from the mock consultations data file
const mockConsultations = require('../data/mock_consultations.json');

// Build a lookup map from mock data
const summaryStore = new Map();
mockConsultations.consultations.forEach((c) => {
  summaryStore.set(c.id, c);
});

/**
 * GET /api/summary/:id
 *
 * Returns a structured consultation summary by ID.
 *
 * The summary includes:
 * - Patient demographics
 * - Reported symptoms
 * - All answers submitted
 * - Red flag status
 * - Triage outcome and reasoning
 * - Treatment options (if pharmacy referral)
 * - Safety net advice
 *
 * Example response:
 * {
 *   "id": "c0000001-...",
 *   "patient": { "fullName": "Sarah Mitchell", "age": 33, "gender": "Female" },
 *   "pathway": "uti",
 *   "pathwayLabel": "Uncomplicated UTI",
 *   "symptoms": ["painful urination", ...],
 *   "redFlagTriggered": false,
 *   "outcome": "pharmacy",
 *   "outcomeLabel": "Pharmacy Referral",
 *   "summaryText": "...",
 *   "pharmacyTreatmentOptions": ["Trimethoprim 200mg..."],
 *   "safetyNetAdvice": "..."
 * }
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const consultation = summaryStore.get(id);

  if (!consultation) {
    return res.status(404).json({
      error: `No consultation summary found for ID: ${id}`,
      hint: 'Valid demo IDs: c0000001-0000-0000-0000-000000000001 through ...000005',
    });
  }

  // Map to the summary response shape
  const summary = {
    id: consultation.id,
    createdAt: consultation.completedAt,
    patient: consultation.patient,
    pathway: consultation.pathway,
    pathwayLabel: consultation.pathwayLabel,
    symptoms: consultation.symptoms,
    answers: consultation.answers,
    redFlagTriggered: consultation.redFlagTriggered,
    redFlagReasons: consultation.redFlagReasons || [],
    pharmacyEligible: consultation.pharmacyEligible,
    outcome: consultation.outcome,
    outcomeLabel: consultation.outcomeLabel,
    outcomeReason: consultation.outcomeReason,
    summaryText: consultation.summaryText,
    status: consultation.status,
  };

  // Audit log
  console.log(`[AUDIT] summary_accessed | consultation_id=${id}`);

  return res.json(summary);
});

/**
 * GET /api/summary/:id/pdf
 *
 * Placeholder endpoint for PDF generation.
 * In production this would use a library like pdfkit or Puppeteer
 * to render the summary as a downloadable PDF.
 */
router.get('/:id/pdf', (req, res) => {
  const { id } = req.params;

  const consultation = summaryStore.get(id);
  if (!consultation) {
    return res.status(404).json({ error: `Consultation not found: ${id}` });
  }

  // TODO: Implement PDF generation using pdfkit or Puppeteer
  return res.status(501).json({
    message: 'PDF generation is not yet implemented.',
    consultationId: id,
    hint: 'This endpoint will return a downloadable PDF of the consultation summary in a future release.',
  });
});

/**
 * GET /api/summary
 *
 * Returns a list of all available mock summaries (for demo/pharmacist dashboard).
 */
router.get('/', (req, res) => {
  const summaries = Array.from(summaryStore.values()).map((c) => ({
    id: c.id,
    patient: c.patient,
    pathway: c.pathway,
    pathwayLabel: c.pathwayLabel,
    outcome: c.outcome,
    outcomeLabel: c.outcomeLabel,
    redFlagTriggered: c.redFlagTriggered,
    createdAt: c.completedAt,
    status: c.status,
  }));

  return res.json({ total: summaries.length, summaries });
});

module.exports = router;
