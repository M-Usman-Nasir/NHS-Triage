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
 */

'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const PATHWAYS_DIR = path.join(__dirname, '../data/pathways');

/**
 * Load all pathway JSON files.
 * @returns {Array<object>} Array of pathway objects
 */
function loadAllPathways() {
  const files = fs.readdirSync(PATHWAYS_DIR).filter((f) => f.endsWith('.json'));
  return files.map((file) => {
    const content = fs.readFileSync(path.join(PATHWAYS_DIR, file), 'utf8');
    return JSON.parse(content);
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
