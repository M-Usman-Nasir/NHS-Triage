'use strict';

const request = require('supertest');
const app = require('../server');

async function createConsultation() {
  const create = await request(app)
    .post('/api/consultation')
    .send({
      pathwayCode: 'uti',
      answers: {
        q1: '1–3 days',
        q2: true,
        q3: true,
        q4: true,
        q5: false,
        q6: false,
        q7: false,
        q8: false,
        q9: false,
        q10: false,
        q11: false,
        q12: false,
        q13: false,
      },
      patient: { fullName: 'Phase Three User', age: 29, gender: 'Female' },
      symptoms: ['urinary urgency'],
    });
  expect(create.statusCode).toBe(201);
  return create.body.consultationId;
}

describe('phase 3 operational delivery', () => {
  it('returns NHS integration status and blocks connect when disabled', async () => {
    const status = await request(app).get('/api/nhs/status');
    expect(status.statusCode).toBe(200);
    expect(typeof status.body.enabled).toBe('boolean');

    const connect = await request(app).post('/api/nhs/connect').send({ patientId: 'test-patient' });
    expect([201, 503]).toContain(connect.statusCode);
    if (connect.statusCode === 503) {
      expect(connect.body.success).toBe(false);
    }
  });

  it('creates pharmacist notes and exposes them on summary', async () => {
    const consultationId = await createConsultation();

    const add = await request(app)
      .post(`/api/summary/${encodeURIComponent(consultationId)}/notes`)
      .send({
        pharmacist_id: 'pharm_100',
        note: 'Patient advised to return if fever develops.',
      });
    expect(add.statusCode).toBe(201);
    expect(add.body.success).toBe(true);
    expect(Array.isArray(add.body.notes)).toBe(true);
    expect(add.body.notes.length).toBeGreaterThan(0);

    const list = await request(app).get(`/api/summary/${encodeURIComponent(consultationId)}/notes`);
    expect(list.statusCode).toBe(200);
    expect(Array.isArray(list.body.notes)).toBe(true);
    expect(list.body.notes.length).toBeGreaterThan(0);

    const summary = await request(app).get(`/api/summary/${encodeURIComponent(consultationId)}`);
    expect(summary.statusCode).toBe(200);
    expect(Array.isArray(summary.body.pharmacistNotes)).toBe(true);
    expect(summary.body.pharmacistNotes.length).toBeGreaterThan(0);
  });

  it('generates PDF summary download', async () => {
    const consultationId = await createConsultation();
    const pdf = await request(app).get(`/api/summary/${encodeURIComponent(consultationId)}/pdf`);
    expect(pdf.statusCode).toBe(200);
    expect(pdf.headers['content-type']).toMatch(/application\/pdf/);
    expect(Number(pdf.headers['content-length'] || 0)).toBeGreaterThan(0);
  });
});

