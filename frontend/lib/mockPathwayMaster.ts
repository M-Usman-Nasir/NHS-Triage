import { PATHWAY_QUESTIONS } from './pathwayQuestions';

export type MockPathwayMasterEntry = {
  code: string;
  label: string;
  questionIds: string[];
  hasScoring: boolean;
};

export const MOCK_PATHWAY_MASTER: Record<string, MockPathwayMasterEntry> = {
  uti: { code: 'uti', label: 'Uncomplicated UTI', questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13'], hasScoring: false },
  sore_throat: { code: 'sore_throat', label: 'Sore Throat', questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'], hasScoring: true },
  sinusitis: { code: 'sinusitis', label: 'Sinusitis', questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'], hasScoring: false },
  otitis_media: { code: 'otitis_media', label: 'Acute Otitis Media', questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'], hasScoring: false },
  insect_bites: { code: 'insect_bites', label: 'Infected Insect Bites', questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'], hasScoring: false },
  impetigo: { code: 'impetigo', label: 'Impetigo', questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'], hasScoring: true },
  shingles: { code: 'shingles', label: 'Shingles', questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'], hasScoring: false },
};

export function listMockPathwayCodes(): string[] {
  return Object.keys(MOCK_PATHWAY_MASTER);
}

export function validateMockPathwayMaster(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const code of Object.keys(MOCK_PATHWAY_MASTER)) {
    const q = PATHWAY_QUESTIONS[code];
    if (!q) {
      errors.push(`Pathway "${code}" exists in mock master but not in PATHWAY_QUESTIONS.`);
      continue;
    }
    const definedIds = q.map((item) => item.id);
    const masterIds = MOCK_PATHWAY_MASTER[code].questionIds;
    if (JSON.stringify(definedIds) !== JSON.stringify(masterIds)) {
      errors.push(`Question id drift for pathway "${code}" between mock master and PATHWAY_QUESTIONS.`);
    }
  }
  return { ok: errors.length === 0, errors };
}

