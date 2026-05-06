'use strict';

const express = require('express');
const { logAuditEvent } = require('../lib/auditLog');
const {
  isNhsIntegrationEnabled,
  getNhsIntegrationStatus,
  buildConnectUrl,
} = require('../lib/nhsIntegrationService');

const router = express.Router();

function clientIp(req) {
  const x = req.headers['x-forwarded-for'];
  if (typeof x === 'string' && x.length) return x.split(',')[0].trim();
  return req.socket?.remoteAddress || null;
}

router.get('/status', async (req, res) => {
  const status = getNhsIntegrationStatus();
  await logAuditEvent({
    eventType: 'nhs_integration_status_checked',
    requestId: req.requestId,
    entityType: 'nhs_integration',
    entityId: null,
    ip: clientIp(req),
    payload: status,
  });
  return res.json(status);
});

router.post('/connect', async (req, res) => {
  const patientId = req.body?.patientId || null;
  if (!isNhsIntegrationEnabled()) {
    await logAuditEvent({
      eventType: 'nhs_connect_blocked',
      requestId: req.requestId,
      entityType: 'nhs_integration',
      entityId: patientId,
      ip: clientIp(req),
      payload: { reason: 'feature_flag_disabled' },
    });
    return res.status(503).json({
      success: false,
      message: 'NHS integration is currently disabled in this environment.',
    });
  }

  const state = req.requestId || 'nhs-connect-state';
  const connectUrl = buildConnectUrl(state);
  await logAuditEvent({
    eventType: 'nhs_connect_initiated',
    requestId: req.requestId,
    entityType: 'nhs_integration',
    entityId: patientId,
    ip: clientIp(req),
    payload: { connectUrl },
  });

  return res.status(201).json({
    success: true,
    connectUrl,
    state,
  });
});

module.exports = router;

