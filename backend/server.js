/**
 * server.js
 * Aegis Health AI — Backend API Server
 *
 * Express.js application entry point.
 * Mounts all API routes and starts the HTTP server.
 *
 * Routes:
 *   /api/consultation  — Patient consultation submission and retrieval
 *   /api/summary       — Consultation summary access (pharmacists/GPs)
 *   /api/admin         — Admin dashboard: rules, pathways, analytics
 *
 * To start: node server.js
 * Default port: 4000 (override with PORT env variable)
 */

'use strict';

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const consultationRoutes = require('./routes/consultation');
const summaryRoutes = require('./routes/summary');
const adminRoutes = require('./routes/admin');
const crmRoutes = require('./routes/crm');
const gdprRoutes = require('./routes/gdpr');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (basic — use morgan in production)
app.use((req, res, next) => {
  const requestId = uuidv4().slice(0, 8);
  req.requestId = requestId;
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} | req_id=${requestId}`);
  next();
});

// ─── Health check ─────────────────────────────────────────────────────────────

/**
 * GET /health
 * Simple health check endpoint.
 * Used by load balancers and monitoring tools.
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Aegis Health AI API',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /
 * API welcome message with available routes.
 */
app.get('/', (req, res) => {
  res.json({
    service: 'Aegis Health AI — Clinical Triage API',
    version: '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health:       'GET  /health',
      consultation: 'POST /api/consultation',
      consultationDefinitions: 'GET  /api/consultation/definitions/:pathwayCode',
      consultationQuestionNext: 'POST /api/consultation/question/next',
      summary:      'GET  /api/summary/:id',
      gdprSubjectAccess: 'GET  /api/gdpr/subject-access/:consultationId',
      gdprErasure:  'POST /api/gdpr/erasure-request',
      adminAudit:   'GET  /api/admin/audit',
      admin:        'GET  /api/admin/analytics',
      pathways:     'GET  /api/admin/pathways',
      rules:        'GET  /api/admin/rules',
      crm:          'GET  /api/crm/dashboard',
    },
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/consultation', consultationRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/gdpr', gdprRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/crm', crmRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found.',
    path: req.path,
    method: req.method,
  });
});

// ─── Error Handler ────────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, err.stack);
  res.status(500).json({
    error: 'Internal server error.',
    requestId: req.requestId,
    ...(process.env.NODE_ENV === 'development' && { detail: err.message }),
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║     Aegis Health AI — API Server         ║');
  console.log(`  ║     Running on http://localhost:${PORT}     ║`);
  console.log('  ║     Environment: ' + (process.env.NODE_ENV || 'development').padEnd(23) + '║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
  console.log('  Available endpoints:');
  console.log('    GET  /health');
  console.log('    POST /api/consultation');
  console.log('    GET  /api/summary/:id');
  console.log('    GET  /api/admin/analytics');
  console.log('    GET  /api/admin/pathways');
  console.log('    GET  /api/admin/rules');
  console.log('');
});

module.exports = app;
