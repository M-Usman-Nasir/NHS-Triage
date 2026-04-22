/**
 * crm.js — CRM API Routes
 * Aegis Health AI
 *
 * Provides full CRUD endpoints for the CRM module.
 *
 * Endpoints:
 *   GET  /api/crm/dashboard          — KPIs, activity feed, summary stats
 *   GET  /api/crm/patients           — Patient list (search, filter, paginate)
 *   GET  /api/crm/patients/:id       — Single patient profile + history
 *   PUT  /api/crm/patients/:id/notes — Update patient notes
 *   GET  /api/crm/cases              — All cases (filter by stage/priority)
 *   PUT  /api/crm/cases/:id/stage    — Move case to new stage
 *   GET  /api/crm/tasks              — Task list (filter by status/assignee)
 *   PUT  /api/crm/tasks/:id          — Update task status
 *   POST /api/crm/tasks              — Create new task
 *   GET  /api/crm/communications     — Communication log (filter by patient/channel)
 *   POST /api/crm/communications     — Log new communication
 *   GET  /api/crm/providers          — Provider list
 *   GET  /api/crm/activity           — Recent activity feed
 */

'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Load CRM mock data (in production: PostgreSQL queries)
const crmData = require('../data/crm_data.json');

// In-memory stores (mutations persist while server is running)
let patients       = [...crmData.patients];
let cases          = [...crmData.cases];
let tasks          = [...crmData.tasks];
let communications = [...crmData.communications];
let providers      = [...crmData.providers];
let activityFeed   = [...crmData.activityFeed];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function logActivity(type, text, icon = '📋', colour = 'blue') {
  activityFeed.unshift({
    id: activityFeed.length + 1,
    time: new Date().toISOString(),
    type,
    text,
    icon,
    colour,
  });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * GET /api/crm/dashboard
 * Returns KPIs and recent activity for the CRM home screen.
 */
router.get('/dashboard', (req, res) => {
  const openCases      = cases.filter((c) => c.stage !== 'closed').length;
  const criticalCases  = cases.filter((c) => c.priority === 'critical').length;
  const overdueTasks   = tasks.filter((t) => t.status === 'overdue').length;
  const pendingTasks   = tasks.filter((t) => t.status === 'pending').length;
  const highRiskPats   = patients.filter((p) => p.riskFlag === 'HIGH').length;

  const casesByStage = {
    new:        cases.filter((c) => c.stage === 'new').length,
    in_review:  cases.filter((c) => c.stage === 'in_review').length,
    treated:    cases.filter((c) => c.stage === 'treated').length,
    escalated:  cases.filter((c) => c.stage === 'escalated').length,
    closed:     cases.filter((c) => c.stage === 'closed').length,
  };

  const outcomeBreakdown = {
    self_care:     cases.filter((c) => c.outcome === 'self_care').length,
    pharmacy:      cases.filter((c) => c.outcome === 'pharmacy').length,
    gp:            cases.filter((c) => c.outcome === 'gp').length,
    urgent_care:   cases.filter((c) => c.outcome === 'urgent_care').length,
    emergency_999: cases.filter((c) => c.outcome === 'emergency_999').length,
  };

  return res.json({
    kpis: {
      totalPatients:     patients.length,
      openCases,
      criticalCases,
      overdueTasks,
      pendingTasks,
      highRiskPatients:  highRiskPats,
      totalProviders:    providers.length,
      totalCommunications: communications.length,
    },
    casesByStage,
    outcomeBreakdown,
    recentActivity: activityFeed.slice(0, 10),
  });
});

// ─── Patients ─────────────────────────────────────────────────────────────────

/**
 * GET /api/crm/patients
 * Returns patient list. Supports: ?search=name&risk=HIGH&status=active&page=1&limit=10
 */
router.get('/patients', (req, res) => {
  const { search, risk, status, page = 1, limit = 10 } = req.query;

  let result = [...patients];

  if (search) {
    const q = search.toLowerCase();
    result = result.filter((p) =>
      p.fullName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.nhsNumber.replace(/ /g, '').includes(q.replace(/ /g, ''))
    );
  }
  if (risk)   result = result.filter((p) => p.riskFlag === risk);
  if (status) result = result.filter((p) => p.status === status);

  const total = result.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  const items = result.slice(start, start + parseInt(limit));

  return res.json({ total, page: parseInt(page), limit: parseInt(limit), items });
});

/**
 * GET /api/crm/patients/:id
 * Returns full patient profile with case and communication history.
 */
router.get('/patients/:id', (req, res) => {
  const patient = patients.find((p) => p.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const patientCases  = cases.filter((c) => c.patientId === req.params.id);
  const patientComms  = communications.filter((c) => c.patientId === req.params.id);
  const patientTasks  = tasks.filter((t) => t.patientId === req.params.id);

  return res.json({ ...patient, cases: patientCases, communications: patientComms, tasks: patientTasks });
});

/**
 * PUT /api/crm/patients/:id/notes
 * Update the notes field for a patient.
 */
router.put('/patients/:id/notes', (req, res) => {
  const idx = patients.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Patient not found' });

  patients[idx] = { ...patients[idx], notes: req.body.notes };
  logActivity('patient_updated', `Notes updated for ${patients[idx].fullName}`, '📝', 'blue');
  return res.json(patients[idx]);
});

// ─── Cases ────────────────────────────────────────────────────────────────────

/**
 * GET /api/crm/cases
 * Returns all cases. Supports: ?stage=new&priority=critical&assignedTo=name
 */
router.get('/cases', (req, res) => {
  const { stage, priority, assignedTo } = req.query;
  let result = [...cases];

  if (stage)      result = result.filter((c) => c.stage === stage);
  if (priority)   result = result.filter((c) => c.priority === priority);
  if (assignedTo) result = result.filter((c) => c.assignedTo === assignedTo);

  return res.json({ total: result.length, cases: result });
});

/**
 * PUT /api/crm/cases/:id/stage
 * Move a case to a new stage (Kanban drag-drop).
 * Body: { stage: 'treated' }
 */
router.put('/cases/:id/stage', (req, res) => {
  const idx = cases.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Case not found' });

  const { stage } = req.body;
  const validStages = ['new', 'in_review', 'treated', 'escalated', 'closed'];
  if (!validStages.includes(stage)) {
    return res.status(400).json({ error: `Invalid stage. Valid: ${validStages.join(', ')}` });
  }

  cases[idx] = {
    ...cases[idx],
    stage,
    closedAt: stage === 'closed' ? new Date().toISOString() : cases[idx].closedAt,
  };

  logActivity('case_updated', `Case ${cases[idx].id} moved to ${stage}: ${cases[idx].title}`, '📋', 'blue');
  return res.json(cases[idx]);
});

// ─── Tasks ────────────────────────────────────────────────────────────────────

/**
 * GET /api/crm/tasks
 * Returns tasks. Supports: ?status=pending&assignedTo=name&priority=high
 */
router.get('/tasks', (req, res) => {
  const { status, assignedTo, priority } = req.query;
  let result = [...tasks].sort((a, b) => {
    const p = { critical: 0, high: 1, medium: 2, low: 3 };
    return (p[a.priority] || 9) - (p[b.priority] || 9);
  });

  if (status)     result = result.filter((t) => t.status === status);
  if (assignedTo) result = result.filter((t) => t.assignedTo === assignedTo);
  if (priority)   result = result.filter((t) => t.priority === priority);

  return res.json({ total: result.length, tasks: result });
});

/**
 * POST /api/crm/tasks
 * Create a new task.
 */
router.post('/tasks', (req, res) => {
  const { title, description, patientId, patientName, caseId, assignedTo, dueDate, priority, type } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const newTask = {
    id: `TASK-${String(tasks.length + 1).padStart(3, '0')}`,
    title,
    description: description || '',
    patientId:   patientId || null,
    patientName: patientName || null,
    caseId:      caseId || null,
    assignedTo:  assignedTo || null,
    dueDate:     dueDate || null,
    priority:    priority || 'medium',
    status:      'pending',
    type:        type || 'follow_up',
    createdAt:   new Date().toISOString().split('T')[0],
  };

  tasks.push(newTask);
  logActivity('task_created', `New task: ${title}`, '✅', 'blue');
  return res.status(201).json(newTask);
});

/**
 * PUT /api/crm/tasks/:id
 * Update task (status, notes, etc.)
 */
router.put('/tasks/:id', (req, res) => {
  const idx = tasks.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });

  tasks[idx] = { ...tasks[idx], ...req.body };
  logActivity('task_updated', `Task ${tasks[idx].id} updated: ${tasks[idx].title}`, '✅', 'green');
  return res.json(tasks[idx]);
});

// ─── Communications ───────────────────────────────────────────────────────────

/**
 * GET /api/crm/communications
 * Returns comms log. Supports: ?patientId=PAT-001&channel=email&direction=outbound
 */
router.get('/communications', (req, res) => {
  const { patientId, channel, direction } = req.query;
  let result = [...communications].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

  if (patientId) result = result.filter((c) => c.patientId === patientId);
  if (channel)   result = result.filter((c) => c.channel === channel);
  if (direction) result = result.filter((c) => c.direction === direction);

  return res.json({ total: result.length, communications: result });
});

/**
 * POST /api/crm/communications
 * Log a new communication (manual note or sent message).
 */
router.post('/communications', (req, res) => {
  const { patientId, patientName, caseId, channel, direction, subject, body } = req.body;
  if (!patientId || !body) return res.status(400).json({ error: 'patientId and body are required' });

  const newComm = {
    id:          `COMM-${String(communications.length + 1).padStart(3, '0')}`,
    patientId,
    patientName: patientName || '',
    caseId:      caseId || null,
    channel:     channel || 'note',
    direction:   direction || 'outbound',
    subject:     subject || null,
    body,
    status:      'delivered',
    sentAt:      new Date().toISOString(),
    sentBy:      'user',
  };

  communications.push(newComm);
  logActivity('comm_sent', `Message sent to ${patientName || patientId} via ${channel}`, '📧', 'blue');
  return res.status(201).json(newComm);
});

// ─── Providers ────────────────────────────────────────────────────────────────

/**
 * GET /api/crm/providers
 * Returns all providers.
 */
router.get('/providers', (req, res) => {
  const { role } = req.query;
  let result = [...providers];
  if (role) result = result.filter((p) => p.role === role);
  return res.json({ total: result.length, providers: result });
});

/**
 * GET /api/crm/providers/:id
 */
router.get('/providers/:id', (req, res) => {
  const provider = providers.find((p) => p.id === req.params.id);
  if (!provider) return res.status(404).json({ error: 'Provider not found' });
  return res.json(provider);
});

// ─── Activity Feed ────────────────────────────────────────────────────────────

/**
 * GET /api/crm/activity
 * Returns recent activity feed (last 20 entries).
 */
router.get('/activity', (req, res) => {
  return res.json({ total: activityFeed.length, activity: activityFeed.slice(0, 20) });
});

module.exports = router;
