'use strict';

const { applyPathwayScoring } = require('../engine/scoring');

describe('config-driven scoring modules', () => {
  it('computes FeverPAIN score from pathway config', () => {
    const pathway = {
      questions: [
        { id: 'q1' },
        { id: 'q4' },
        { id: 'q5' },
        { id: 'q6' },
        { id: 'q7' },
      ],
      scoring: {
        modules: [
          {
            id: 'feverPain',
            module: 'feverPain',
            outputKey: 'feverPainScore',
            factors: [
              { id: 'fever_24h', condition: 'q4 === true', points: 1 },
              { id: 'purulence', condition: 'q5 === true', points: 1 },
              { id: 'severe_inflammation', condition: 'q6 === true', points: 1 },
              { id: 'no_cough', condition: 'q7 === false', points: 1 },
              { id: 'onset_under_3_days', condition: "q1 === 'Less than 3 days'", points: 1 },
            ],
          },
        ],
      },
    };

    const result = applyPathwayScoring({
      pathway,
      context: {
        q1: 'Less than 3 days',
        q4: true,
        q5: true,
        q6: false,
        q7: false,
      },
      patient: { age: 20, gender: 'Female' },
    });

    expect(result.context.feverPainScore).toBe(4);
    expect(result.governanceUncertainty).toEqual([]);
    expect(result.scoreBreakdown).toHaveLength(1);
    expect(result.scoreBreakdown[0].ok).toBe(true);
  });

  it('records uncertainty when pathway references missing scoring module', () => {
    const pathway = {
      questions: [{ id: 'q1' }],
      scoring: {
        modules: [
          {
            id: 'unknownScale',
            module: 'unknown-scale',
            outputKey: 'unknownScore',
            factors: [{ id: 'always', condition: 'true', points: 1 }],
          },
        ],
      },
    };

    const result = applyPathwayScoring({
      pathway,
      context: { q1: true },
      patient: { age: 20, gender: 'Female' },
    });

    expect(result.context.unknownScore).toBeNull();
    expect(result.governanceUncertainty).toContain('scoring_module_not_found:unknown-scale');
    expect(result.scoreBreakdown[0].ok).toBe(false);
  });

  it('computes lesion cluster count using dedicated module', () => {
    const pathway = {
      questions: [{ id: 'q8' }],
      scoring: {
        modules: [
          {
            id: 'lesionClusterCount',
            module: 'lesionClusterCount',
            outputKey: 'lesionClusterCount',
            factors: [
              { id: 'clusters_1', condition: "q8 === '1'", points: 1 },
              { id: 'clusters_2', condition: "q8 === '2'", points: 2 },
              { id: 'clusters_3', condition: "q8 === '3'", points: 3 },
              { id: 'clusters_4', condition: "q8 === '4'", points: 4 },
              { id: 'clusters_gt4', condition: "q8 === 'More than 4'", points: 5 },
            ],
          },
        ],
      },
    };

    const result = applyPathwayScoring({
      pathway,
      context: { q8: 'More than 4' },
      patient: { age: 9, gender: 'Female' },
    });

    expect(result.context.lesionClusterCount).toBe(5);
    expect(result.governanceUncertainty).toEqual([]);
    expect(result.scoreBreakdown[0].module).toBe('lesionClusterCount');
    expect(result.scoreBreakdown[0].ok).toBe(true);
  });
});

