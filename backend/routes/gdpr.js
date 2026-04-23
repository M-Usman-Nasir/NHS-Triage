/**
 * GDPR-oriented endpoints (demo: possession of consultation UUID treated as weak identifier).
 * Production must add authentication, identity verification, and DPO workflow.
 */

'use strict';

const express = require('express');
const { consultationStore } = require('../store/consultationStore');
const { logAuditEvent } = require('../lib/auditLog');
const { auditEventsForEntity } = require('../lib/auditPersistence');
const { recordToSummaryResponse } = require('../lib/summaryMapper');

const router = express.Router();

function clientIp(req) {
  const x = req.headers['x-forwarded-for'];
  if (typeof x === 'string' && x.length) return x.split(',')[0].trim();
  return req.socket?.remoteAddress || null;
}

/**
 * GET /api/gdpr/subject-access/:consultationId
 * Article 15-style export for a single consultation the caller already identifies.
 */
router.get('/subject-access/:consultationId', async (req, res) => {
  const { consultationId } = req.params;
  const record = consultationStore.get(consultationId);
  if (!record) {
    return res.status(404).json({ error: 'Consultation not found.', consultationId });
  }

  await logAuditEvent({
    eventType: 'gdpr_subject_access_export',
    requestId: req.requestId,
    entityType: 'consultation',
    entityId: consultationId,
    ip: clientIp(req),
    payload: { route: 'subject_access' },
  });

  const summary = recordToSummaryResponse(record);
  const rawTrail = await auditEventsForEntity(consultationId);
  const auditTrail = rawTrail.map((e) => ({
    id: e.id,
    event_type: e.event_type,
    created_at: e.created_at,
    request_id: e.request_id,
    payload: e.payload,
  }));

  return res.json({
    exportGeneratedAt: new Date().toISOString(),
    consultation: summary,
    auditTrail,
    notices: [
      'This export is for the identified consultation only. Wider subject access (all data held) requires authenticated identity verification in production.',
    ],
  });
});

/**
 * POST /api/gdpr/erasure-request
 * Body: { consultationId: string }
 * Removes the consultation from the in-memory store and logs erasure (demo).
 */
router.post('/erasure-request', async (req, res) => {
  const consultationId = req.body?.consultationId;
  if (!consultationId || typeof consultationId !== 'string') {
    return res.status(400).json({ error: 'consultationId is required.' });
  }

  const existed = consultationStore.has(consultationId);
  if (existed) {
    consultationStore.delete(consultationId);
  }

  await logAuditEvent({
    eventType: 'gdpr_erasure_requested',
    requestId: req.requestId,
    entityType: 'consultation',
    entityId: consultationId,
    ip: clientIp(req),
    payload: { recordExisted: existed, action: 'in_memory_delete' },
  });

  return res.status(200).json({
    success: true,
    consultationId,
    removed: existed,
    message: existed
      ? 'Consultation removed from active store. Immutable database audit rows (when enabled) would be retained per retention policy.'
      : 'No active consultation record found; erasure request logged.',
  });
});

module.exports = router;
