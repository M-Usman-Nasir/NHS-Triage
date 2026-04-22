/**
 * consultationStore.js
 * Single in-memory store for completed consultations (demo).
 * Used by POST/GET /api/consultation and GET /api/summary/:id so summaries
 * always match live submissions.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const consultationStore = new Map();

let seeded = false;

function seedConsultationsFromMock() {
  if (seeded) return;
  const filePath = path.join(__dirname, '../data/mock_consultations.json');
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const c of raw.consultations) {
    consultationStore.set(c.id, {
      ...c,
      pathwayCode: c.pathway,
      createdAt: c.completedAt || c.createdAt,
    });
  }
  seeded = true;
}

seedConsultationsFromMock();

module.exports = {
  consultationStore,
  seedConsultationsFromMock,
};
