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

  it('UTI routes to GP when recurrent UTI exclusion is present', async () => {
    const res = await request(app)
      .post('/api/consultation')
      .send({
        pathwayCode: 'uti',
        answers: {
          q1: '1–3 days',
          q2: true,
          q3: true,
          q4: false,
          q5: false,
          q6: false,
          q7: false,
          q8: false,
          q9: false,
          q10: true,
          q11: false,
          q12: false,
          q13: false,
        },
        patient: { fullName: 'UTI Exclusion', age: 26, gender: 'Female' },
        symptoms: ['urinary urgency'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.outcome).toBe('gp');
  });

  it('Sore throat high FeverPAIN profile routes to GP', async () => {
    const res = await request(app)
      .post('/api/consultation')
      .send({
        pathwayCode: 'sore_throat',
        answers: {
          q1: 'Less than 3 days',
          q2: true,
          q3: false,
          q4: true,
          q5: true,
          q6: true,
          q7: false,
          q8: false,
          q9: false,
          q10: false,
        },
        patient: { fullName: 'Sore Throat High Score', age: 22, gender: 'Female' },
        symptoms: ['sore throat'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.outcome).toBe('gp');
    expect(Array.isArray(res.body.scoreBreakdown)).toBe(true);
    const feverPain = res.body.scoreBreakdown.find((entry) => entry.outputKey === 'feverPainScore');
    expect(feverPain).toBeDefined();
    expect(feverPain.score).toBeGreaterThanOrEqual(4);
  });

  it('Sinusitis under 10 days routes to self-care', async () => {
    const res = await request(app)
      .post('/api/consultation')
      .send({
        pathwayCode: 'sinusitis',
        answers: {
          q1: 'Less than 10 days',
          q2: true,
          q3: true,
          q4: false,
          q5: true,
          q6: false,
          q7: false,
          q8: 'No',
          q9: false,
        },
        patient: { fullName: 'Sinus Self Care', age: 33, gender: 'Male' },
        symptoms: ['blocked nose'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.outcome).toBe('self_care');
  });

  it('Otitis media adult routes to GP', async () => {
    const res = await request(app)
      .post('/api/consultation')
      .send({
        pathwayCode: 'otitis_media',
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
          q10: true,
        },
        patient: { fullName: 'Adult Otitis', age: 28, gender: 'Female' },
        symptoms: ['ear pain'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.outcome).toBe('gp');
  });

  it('Insect bite without 48-hour worsening routes to GP', async () => {
    const res = await request(app)
      .post('/api/consultation')
      .send({
        pathwayCode: 'insect_bites',
        answers: {
          q1: '1–3 days ago',
          q2: true,
          q3: false,
          q4: false,
          q5: false,
          q6: false,
          q7: false,
          q8: false,
        },
        patient: { fullName: 'Insect Bite No Worsening', age: 19, gender: 'Male' },
        symptoms: ['bite redness'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.outcome).toBe('gp');
  });

  it('Impetigo with more than 4 lesions routes to GP', async () => {
    const res = await request(app)
      .post('/api/consultation')
      .send({
        pathwayCode: 'impetigo',
        answers: {
          q1: '1–3 days',
          q2: ['Face'],
          q3: true,
          q4: false,
          q5: false,
          q6: false,
          q7: false,
          q8: 'More than 4',
        },
        patient: { fullName: 'Impetigo Lesion Count', age: 8, gender: 'Female' },
        symptoms: ['crusted sores'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.outcome).toBe('gp');
    const lesionScore = (res.body.scoreBreakdown || []).find((entry) => entry.outputKey === 'lesionClusterCount');
    expect(lesionScore).toBeDefined();
    expect(lesionScore.score).toBe(5);
  });

  it('Shingles with eye involvement escalates to urgent care', async () => {
    const res = await request(app)
      .post('/api/consultation')
      .send({
        pathwayCode: 'shingles',
        answers: {
          q1: '1–2 days ago',
          q2: true,
          q3: 'Around one eye',
          q4: true,
          q5: true,
          q6: false,
          q7: false,
          q8: false,
        },
        patient: { fullName: 'Shingles Eye Risk', age: 55, gender: 'Male' },
        symptoms: ['painful rash'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.outcome).toBe('urgent_care');
  });
});
