/**
 * admin.js — API Route
 * Aegis Health AI
 *
 * Administration endpoints for managing clinical rules, viewing analytics,
 * and monitoring platform performance.
 *
 * In production, these routes would be protected by role-based access control
 * (admin role only). For demo purposes, no auth middleware is applied.
 *
 * Endpoints:
 *   GET  /api/admin/rules            — List all clinical rules across pathways
 *   GET  /api/admin/rules/:pathway   — Get rules for a specific pathway
 *   GET  /api/admin/analytics        — Get aggregated consultation analytics
 *   GET  /api/admin/pathways         — List all clinical pathways
 *   GET  /api/admin/audit            — Query structured audit events (demo store)
 */

'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const { logAuditEvent } = require('../lib/auditLog');
const { queryAuditEvents } = require('../lib/auditPersistence');

const router = express.Router();

function clientIp(req) {
  const x = req.headers['x-forwarded-for'];
  if (typeof x === 'string' && x.length) return x.split(',')[0].trim();
  return req.socket?.remoteAddress || null;
}

const PATHWAYS_DIR = path.join(__dirname, '../data/pathways');
const ruleChangeRequests = [];

/**
 * Load all pathway JSON files.
 * @returns {Array<object>} Array of pathway objects
 */
function loadAllPathways() {
  const files = fs.readdirSync(PATHWAYS_DIR).filter((f) => f.endsWith('.json'));
  return files.map((file) => {
    const content = fs.readFileSync(path.join(PATHWAYS_DIR, file), 'utf8');
    const parsed = JSON.parse(content);
    return {
      ...parsed,
      __fileUpdatedAt: fs.statSync(path.join(PATHWAYS_DIR, file)).mtime.toISOString(),
    };
  });
}

/**
 * GET /api/admin/pathways
 *
 * Returns metadata for all configured clinical pathways.
 *
 * Response example:
 * {
 *   "total": 7,
 *   "pathways": [
 *     { "code": "uti", "label": "Uncomplicated UTI", "applicableGenders": [...], ... }
 *   ]
 * }
 */
router.get('/pathways', (req, res) => {
  const pathways = loadAllPathways().map((p) => ({
    code: p.pathway,
    label: p.label,
    applicableGenders: p.applicableGenders,
    minimumAge: p.minimumAge,
    maximumAge: p.maximumAge,
    redFlagCount: (p.redFlags || []).length,
    eligibilityRuleCount: (p.eligibilityRules || []).length,
    outcomeRuleCount: (p.outcomeRules || []).length,
    questionCount: (p.questions || []).length,
  }));

  return res.json({ total: pathways.length, pathways });
});

/**
 * GET /api/admin/rules
 *
 * Returns all red-flag, eligibility, and outcome rules across all pathways.
 * Useful for a rule management dashboard where admins can review active logic.
 */
router.get('/rules', (req, res) => {
  const pathways = loadAllPathways();
  const allRules = [];

  for (const pathway of pathways) {
    // Red flags
    (pathway.redFlags || []).forEach((rule) => {
      allRules.push({
        pathway: pathway.pathway,
        pathwayLabel: pathway.label,
        ruleType: 'red_flag',
        code: rule.code,
        condition: rule.condition,
        outcome: rule.outcome,
        description: rule.description,
        patientMessage: rule.message,
        version: rule.version || pathway.version || '1.0',
        updated_by: rule.updated_by || 'admin',
        updated_at: rule.updated_at || pathway.__fileUpdatedAt || new Date().toISOString(),
      });
    });

    // Eligibility rules
    (pathway.eligibilityRules || []).forEach((rule) => {
      allRules.push({
        pathway: pathway.pathway,
        pathwayLabel: pathway.label,
        ruleType: 'eligibility',
        code: rule.id,
        condition: rule.condition,
        eligible: rule.eligible,
        reason: rule.reason,
        version: rule.version || pathway.version || '1.0',
        updated_by: rule.updated_by || 'admin',
        updated_at: rule.updated_at || pathway.__fileUpdatedAt || new Date().toISOString(),
      });
    });

    // Outcome rules
    (pathway.outcomeRules || []).forEach((rule) => {
      allRules.push({
        pathway: pathway.pathway,
        pathwayLabel: pathway.label,
        ruleType: 'outcome',
        priority: rule.priority,
        condition: rule.condition,
        outcome: rule.outcome,
        reason: rule.reason,
        version: rule.version || pathway.version || '1.0',
        updated_by: rule.updated_by || 'admin',
        updated_at: rule.updated_at || pathway.__fileUpdatedAt || new Date().toISOString(),
      });
    });
  }

  return res.json({ total: allRules.length, rules: allRules });
});

/**
 * GET /api/admin/rules/:pathway
 *
 * Returns all rules for a specific pathway.
 */
router.get('/rules/:pathway', (req, res) => {
  const { pathway } = req.params;
  const filePath = path.join(PATHWAYS_DIR, `${pathway}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `Pathway not found: ${pathway}` });
  }

  const pathwayData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  return res.json({
    pathway: pathwayData.pathway,
    label: pathwayData.label,
    questions: pathwayData.questions,
    redFlags: pathwayData.redFlags,
    eligibilityRules: pathwayData.eligibilityRules,
    outcomeRules: pathwayData.outcomeRules,
    selfCareAdvice: pathwayData.selfCareAdvice,
    pharmacyTreatmentOptions: pathwayData.pharmacyTreatmentOptions,
    safetyNetAdvice: pathwayData.safetyNetAdvice,
  });
});

/**
 * POST /api/admin/rules/change-requests
 * Controlled editing workflow entrypoint (draft request).
 * Body:
 * {
 *   ruleId, pathwayCode, proposedCondition, proposedAction, proposedPriority, requestedBy, proposedRuleVersion
 * }
 */
router.post('/rules/change-requests', async (req, res) => {
  const {
    ruleId,
    pathwayCode,
    proposedCondition,
    proposedAction,
    proposedPriority = 1,
    requestedBy = 'admin',
    proposedRuleVersion = '1.0',
  } = req.body || {};

  if (!ruleId || !pathwayCode || !proposedCondition || !proposedAction) {
    return res.status(400).json({ error: 'ruleId, pathwayCode, proposedCondition, and proposedAction are required.' });
  }

  const item = {
    id: ruleChangeRequests.length + 1,
    ruleId,
    pathwayCode,
    proposedCondition,
    proposedAction,
    proposedPriority,
    proposedRuleVersion,
    requestedBy,
    requestedAt: new Date().toISOString(),
    reviewStatus: 'draft',
    reviewedBy: null,
    reviewedAt: null,
    approvedBy: null,
    approvedAt: null,
    csoValidated: false,
    csoValidatedBy: null,
    csoValidatedAt: null,
    reviewNotes: null,
  };
  ruleChangeRequests.push(item);

  await logAuditEvent({
    eventType: 'rule_change_requested',
    requestId: req.requestId,
    entityType: 'clinical_rule_change_request',
    entityId: null,
    userId: requestedBy,
    ip: clientIp(req),
    payload: {
      requestId: item.id,
      ruleId,
      pathwayCode,
      proposedRuleVersion,
      proposedPriority,
    },
  });

  return res.status(201).json({ success: true, changeRequest: item });
});

/**
 * POST /api/admin/rules/change-requests/:id/review
 * Marks request as reviewed and logs reviewer note.
 */
router.post('/rules/change-requests/:id/review', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = ruleChangeRequests.findIndex((x) => x.id === id);
  if (idx < 0) {
    return res.status(404).json({ error: 'Change request not found.' });
  }
  const reviewedBy = req.body?.reviewedBy || 'admin';
  const reviewNotes = req.body?.reviewNotes || null;
  ruleChangeRequests[idx] = {
    ...ruleChangeRequests[idx],
    reviewStatus: 'reviewed',
    reviewedBy,
    reviewedAt: new Date().toISOString(),
    reviewNotes,
  };

  await logAuditEvent({
    eventType: 'rule_change_reviewed',
    requestId: req.requestId,
    entityType: 'clinical_rule_change_request',
    entityId: null,
    userId: reviewedBy,
    ip: clientIp(req),
    payload: {
      requestId: id,
      reviewNotes,
    },
  });

  return res.json({ success: true, changeRequest: ruleChangeRequests[idx] });
});

/**
 * POST /api/admin/rules/change-requests/:id/approve
 * Requires explicit CSO validation marker before approval.
 */
router.post('/rules/change-requests/:id/approve', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = ruleChangeRequests.findIndex((x) => x.id === id);
  if (idx < 0) {
    return res.status(404).json({ error: 'Change request not found.' });
  }
  const approvedBy = req.body?.approvedBy || 'admin';
  const csoValidated = !!req.body?.csoValidated;
  const csoValidatedBy = req.body?.csoValidatedBy || null;
  if (!csoValidated || !csoValidatedBy) {
    return res.status(400).json({ error: 'CSO validation is required before approval (csoValidated=true, csoValidatedBy).' });
  }

  ruleChangeRequests[idx] = {
    ...ruleChangeRequests[idx],
    reviewStatus: 'approved',
    approvedBy,
    approvedAt: new Date().toISOString(),
    csoValidated: true,
    csoValidatedBy,
    csoValidatedAt: new Date().toISOString(),
  };

  await logAuditEvent({
    eventType: 'rule_change_approved',
    requestId: req.requestId,
    entityType: 'clinical_rule_change_request',
    entityId: null,
    userId: approvedBy,
    ip: clientIp(req),
    payload: {
      requestId: id,
      csoValidatedBy,
      approvedBy,
    },
  });

  return res.json({ success: true, changeRequest: ruleChangeRequests[idx] });
});

/**
 * GET /api/admin/rules/change-requests
 */
router.get('/rules/change-requests', (req, res) => {
  return res.json({ total: ruleChangeRequests.length, items: ruleChangeRequests });
});

/**
 * GET /api/admin/audit
 * Clinical governance / IG audit trail (PostgreSQL when DATABASE_URL set, else in-memory).
 */
router.get('/audit', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 100;
  const offset = parseInt(req.query.offset, 10) || 0;
  const eventType = req.query.eventType ? String(req.query.eventType) : undefined;
  const entityId = req.query.entityId ? String(req.query.entityId) : undefined;

  await logAuditEvent({
    eventType: 'admin_audit_log_accessed',
    requestId: req.requestId,
    entityType: 'audit',
    entityId: null,
    ip: clientIp(req),
    payload: { limit, offset, eventType: eventType || null, entityId: entityId || null },
  });

  const result = await queryAuditEvents({ eventType, entityId }, { limit, offset });
  return res.json({
    total: result.total,
    limit,
    offset,
    events: result.items,
  });
});

/**
 * GET /api/admin/analytics
 *
 * Returns aggregated consultation analytics for the dashboard.
 * Uses mock data for the demo. In production, this queries analytics_summary table.
 *
 * Response includes:
 * - Total consultations (last 7 days)
 * - Outcome distribution
 * - Red flag rate
 * - Most common pathway
 * - Daily volume trend
 */
router.get('/analytics', (req, res) => {
  // Mock analytics — matches the seed data in seed.sql
  const mockDailyData = [
    { date: '2026-04-14', total: 42, selfCare: 12, pharmacy: 18, gp: 8,  urgentCare: 2, emergency: 2, redFlags: 3, topPathway: 'uti' },
    { date: '2026-04-15', total: 38, selfCare: 10, pharmacy: 15, gp: 9,  urgentCare: 2, emergency: 2, redFlags: 2, topPathway: 'sore_throat' },
    { date: '2026-04-16', total: 55, selfCare: 18, pharmacy: 22, gp: 10, urgentCare: 3, emergency: 2, redFlags: 4, topPathway: 'uti' },
    { date: '2026-04-17', total: 61, selfCare: 20, pharmacy: 25, gp: 12, urgentCare: 2, emergency: 2, redFlags: 3, topPathway: 'sinusitis' },
    { date: '2026-04-18', total: 47, selfCare: 15, pharmacy: 19, gp: 9,  urgentCare: 2, emergency: 2, redFlags: 2, topPathway: 'uti' },
    { date: '2026-04-19', total: 33, selfCare: 10, pharmacy: 12, gp: 7,  urgentCare: 2, emergency: 2, redFlags: 1, topPathway: 'shingles' },
    { date: '2026-04-20', total: 58, selfCare: 19, pharmacy: 24, gp: 11, urgentCare: 2, emergency: 2, redFlags: 3, topPathway: 'uti' },
  ];

  const totals = mockDailyData.reduce((acc, day) => ({
    total:      acc.total      + day.total,
    selfCare:   acc.selfCare   + day.selfCare,
    pharmacy:   acc.pharmacy   + day.pharmacy,
    gp:         acc.gp         + day.gp,
    urgentCare: acc.urgentCare + day.urgentCare,
    emergency:  acc.emergency  + day.emergency,
    redFlags:   acc.redFlags   + day.redFlags,
  }), { total: 0, selfCare: 0, pharmacy: 0, gp: 0, urgentCare: 0, emergency: 0, redFlags: 0 });

  const redFlagRate = ((totals.redFlags / totals.total) * 100).toFixed(1);
  const pharmacyRate = ((totals.pharmacy / totals.total) * 100).toFixed(1);

  return res.json({
    period: 'Last 7 days',
    summary: {
      totalConsultations: totals.total,
      redFlagRate: `${redFlagRate}%`,
      pharmacyReferralRate: `${pharmacyRate}%`,
      outcomeBreakdown: {
        selfCare:   totals.selfCare,
        pharmacy:   totals.pharmacy,
        gp:         totals.gp,
        urgentCare: totals.urgentCare,
        emergency:  totals.emergency,
      },
      totalRedFlagsTriggered: totals.redFlags,
    },
    dailyTrend: mockDailyData,
  });
});

module.exports = router;
