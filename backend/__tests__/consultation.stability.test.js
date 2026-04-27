'use strict';

const request = require('supertest');
const app = require('../server');

describe('consultation stability and explainability contract', () => {
  it('POST /api/consultation returns structured report and non-empty reason', async () => {
    const res = await request(app)
      .post('/api/consultation')
      .send({
        pathwayCode: 'uti',
        answers: {
          q1: '1–3 days',
          q2: false,
          q3: false,
          q4: false,
          q5: false,
          q6: false,
          q7: false,
          q8: false,
          q9: 'No known allergies',
        },
        patient: { fullName: 'Test User', age: 30, gender: 'Female' },
        symptoms: ['painful urination'],
      });

    expect(res.statusCode).toBe(201);
    expect(typeof res.body.outcomeReason).toBe('string');
    expect(res.body.outcomeReason.trim().length).toBeGreaterThan(0);
    expect(res.body.explanation).toBeDefined();
    expect(typeof res.body.explanation.decision).toBe('string');
    expect(typeof res.body.explanation.reason).toBe('string');
    expect(res.body.structuredReport).toBeDefined();
    expect(Array.isArray(res.body.structuredReport.symptoms)).toBe(true);
    expect(typeof res.body.structuredReport.answers).toBe('object');
    expect(typeof res.body.structuredReport.decision).toBe('object');
    expect(typeof res.body.structuredReport.reasoning).toBe('object');
    expect(typeof res.body.structuredReport.timestamp).toBe('string');
  });

  it('GET /api/summary/:id returns structured report contract', async () => {
    const create = await request(app)
      .post('/api/consultation')
      .send({
        pathwayCode: 'uti',
        answers: {
          q1: 'Less than 24 hours',
          q2: false,
          q3: false,
          q4: false,
          q5: false,
          q6: false,
          q7: false,
          q8: false,
          q9: 'None',
        },
        patient: { fullName: 'Second User', age: 28, gender: 'Female' },
        symptoms: ['frequent urination'],
      });

    expect(create.statusCode).toBe(201);
    const consultationId = create.body.consultationId;

    const summary = await request(app).get(`/api/summary/${encodeURIComponent(consultationId)}`);
    expect(summary.statusCode).toBe(200);
    expect(typeof summary.body.outcomeReason).toBe('string');
    expect(summary.body.outcomeReason.trim().length).toBeGreaterThan(0);
    expect(summary.body.explanation).toBeDefined();
    expect(typeof summary.body.explanation.decision).toBe('string');
    expect(typeof summary.body.explanation.reason).toBe('string');
    expect(summary.body.structuredReport).toBeDefined();
    expect(summary.body.structuredReport).toHaveProperty('symptoms');
    expect(summary.body.structuredReport).toHaveProperty('answers');
    expect(summary.body.structuredReport).toHaveProperty('decision');
    expect(summary.body.structuredReport).toHaveProperty('reasoning');
    expect(summary.body.structuredReport).toHaveProperty('timestamp');
  });

  it('POST /api/summary/:id/override stores pharmacist override metadata', async () => {
    const create = await request(app)
      .post('/api/consultation')
      .send({
        pathwayCode: 'uti',
        answers: {
          q1: '1–3 days',
          q2: false,
          q3: false,
          q4: false,
          q5: false,
          q6: false,
          q7: false,
          q8: false,
          q9: 'No allergies',
        },
        patient: { fullName: 'Override User', age: 34, gender: 'Female' },
        symptoms: ['painful urination'],
      });

    expect(create.statusCode).toBe(201);

    const override = await request(app)
      .post(`/api/summary/${encodeURIComponent(create.body.consultationId)}/override`)
      .send({
        pharmacist_id: 'pharm_test_001',
        overridden_decision: 'gp',
        reason: 'Persistent pain and pharmacist concern after review.',
      });

    expect(override.statusCode).toBe(200);
    expect(override.body.success).toBe(true);
    expect(override.body.override).toMatchObject({
      original_decision: 'pharmacy',
      overridden_decision: 'gp',
      pharmacist_id: 'pharm_test_001',
      reason: 'Persistent pain and pharmacist concern after review.',
    });
    expect(override.body.summary.pharmacistOverride).toMatchObject({
      original_decision: 'pharmacy',
      overridden_decision: 'gp',
      pharmacist_id: 'pharm_test_001',
      reason: 'Persistent pain and pharmacist concern after review.',
    });
    expect(override.body.summary.explanation).toMatchObject({
      decision: 'gp',
      source: 'pharmacist_override',
    });
    expect(typeof override.body.summary.explanation.reason).toBe('string');
  });
});
