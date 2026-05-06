'use strict';

const request = require('supertest');
const app = require('../server');

describe('compliance guardrails (never-cases)', () => {
  it('does not auto-prescribe antibiotics in pharmacy output', async () => {
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
          q6: false,
          q7: true,
          q8: false,
          q9: false,
          q10: false,
        },
        patient: { fullName: 'Guardrail A', age: 24, gender: 'Female' },
        symptoms: ['sore throat'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.outcome).toBe('pharmacy');
    expect(String(res.body.outcomeReason || '')).not.toMatch(/auto-?prescrib|automatically/i);
    if (Array.isArray(res.body.pharmacyTreatmentOptions)) {
      for (const option of res.body.pharmacyTreatmentOptions) {
        expect(String(option)).not.toMatch(/auto-?prescrib|automatically/i);
      }
    }
  });

  it('does not skip exclusion criteria (UTI recurrence -> GP)', async () => {
    const res = await request(app)
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
          q10: true,
          q11: false,
          q12: false,
          q13: false,
        },
        patient: { fullName: 'Guardrail B', age: 31, gender: 'Female' },
        symptoms: ['urinary urgency'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.outcome).toBe('gp');
    expect(res.body.outcome).not.toBe('pharmacy');
  });

  it('does not ignore pregnancy (UTI pregnancy -> not pharmacy)', async () => {
    const res = await request(app)
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
          q7: true,
          q8: false,
          q9: false,
          q10: false,
          q11: false,
          q12: false,
          q13: false,
        },
        patient: { fullName: 'Guardrail C', age: 28, gender: 'Female' },
        symptoms: ['dysuria'],
      });

    expect(res.statusCode).toBe(201);
    expect(['gp', 'urgent_care', 'emergency_999']).toContain(res.body.outcome);
    expect(res.body.outcome).not.toBe('pharmacy');
  });

  it('does not ignore recurrence (impetigo recurrence -> GP)', async () => {
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
          q7: true,
          q8: '2',
        },
        patient: { fullName: 'Guardrail D', age: 9, gender: 'Female' },
        symptoms: ['crusted lesions'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.outcome).toBe('gp');
    expect(res.body.outcome).not.toBe('pharmacy');
  });

  it('does not ignore red flags (shingles eye involvement -> urgent/emergency)', async () => {
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
        patient: { fullName: 'Guardrail E', age: 44, gender: 'Male' },
        symptoms: ['painful unilateral rash'],
      });

    expect(res.statusCode).toBe(201);
    expect(['urgent_care', 'emergency_999']).toContain(res.body.outcome);
    expect(res.body.outcome).not.toBe('pharmacy');
  });

  it('does not allow pharmacy outside NHS age rules (adult otitis -> GP)', async () => {
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
        patient: { fullName: 'Guardrail F', age: 29, gender: 'Female' },
        symptoms: ['ear pain'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.outcome).toBe('gp');
    expect(res.body.outcome).not.toBe('pharmacy');
  });
});

