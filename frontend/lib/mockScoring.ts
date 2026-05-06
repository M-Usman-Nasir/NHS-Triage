import type { ScoreBreakdownPayload } from '../types/consultation';

type AnswerMap = Record<string, unknown>;

type AdditiveFactor = {
  id: string;
  points: number;
  matches: (answers: AnswerMap) => boolean;
};

type ScoringModuleDef = {
  module: string;
  outputKey: string;
  factors: AdditiveFactor[];
  errorMessage: string;
};

const MODULES_BY_PATHWAY: Record<string, ScoringModuleDef[]> = {
  sore_throat: [
    {
      module: 'feverPain',
      outputKey: 'feverPainScore',
      errorMessage: 'One or more FeverPAIN factors failed to evaluate.',
      factors: [
        { id: 'fever_24h', points: 1, matches: (a) => a.q4 === true },
        { id: 'purulence', points: 1, matches: (a) => a.q5 === true },
        { id: 'severe_inflammation', points: 1, matches: (a) => a.q6 === true },
        { id: 'no_cough', points: 1, matches: (a) => a.q7 === false },
        { id: 'onset_under_3_days', points: 1, matches: (a) => a.q1 === 'Less than 3 days' },
      ],
    },
  ],
  impetigo: [
    {
      module: 'lesionClusterCount',
      outputKey: 'lesionClusterCount',
      errorMessage: 'One or more lesion-count factors failed to evaluate.',
      factors: [
        { id: 'clusters_1', points: 1, matches: (a) => a.q8 === '1' },
        { id: 'clusters_2', points: 2, matches: (a) => a.q8 === '2' },
        { id: 'clusters_3', points: 3, matches: (a) => a.q8 === '3' },
        { id: 'clusters_4', points: 4, matches: (a) => a.q8 === '4' },
        { id: 'clusters_gt4', points: 5, matches: (a) => a.q8 === 'More than 4' },
      ],
    },
  ],
};

function runAdditiveFactors(
  factors: AdditiveFactor[],
  answers: AnswerMap,
  errorMessage: string,
): { score: number; ok: boolean; error: string | null; factors: NonNullable<ScoreBreakdownPayload['factors']> } {
  let score = 0;
  let ok = true;
  const breakdown: NonNullable<ScoreBreakdownPayload['factors']> = [];
  for (const factor of factors) {
    try {
      const matched = factor.matches(answers) === true;
      if (matched) score += factor.points;
      breakdown.push({ id: factor.id, matched, points: matched ? factor.points : 0 });
    } catch {
      ok = false;
      breakdown.push({ id: factor.id, matched: false, points: 0, error: 'Mock factor evaluation failed.' });
    }
  }
  return { score, ok, error: ok ? null : errorMessage, factors: breakdown };
}

export function applyMockPathwayScoring(pathwayCode: string, answers: AnswerMap): {
  context: AnswerMap;
  scoreBreakdown: ScoreBreakdownPayload[];
} {
  const context: AnswerMap = { ...answers };
  const scoreBreakdown: ScoreBreakdownPayload[] = [];
  const modules = MODULES_BY_PATHWAY[pathwayCode] || [];
  for (const moduleDef of modules) {
    const out = runAdditiveFactors(moduleDef.factors, context, moduleDef.errorMessage);
    context[moduleDef.outputKey] = out.score;
    scoreBreakdown.push({
      module: moduleDef.module,
      outputKey: moduleDef.outputKey,
      score: out.score,
      ok: out.ok,
      error: out.error,
      factors: out.factors,
    });
  }
  return { context, scoreBreakdown };
}

