export type ProviderAuditEvent = {
  id: string;
  caseId: string;
  type: 'triage_generated' | 'override_applied' | 'referral_routed' | 'status_updated';
  actor: string;
  timestamp: string;
  details: string;
};

export type ProviderOverride = {
  id: string;
  caseId: string;
  originalDecision: string;
  overriddenDecision: string;
  reason: string;
  clinician: string;
  timestamp: string;
};

export type ProviderCase = {
  id: string;
  patientId: string;
  patient: {
    fullName: string;
    age: number;
    gender: string;
    nhsNumber: string;
    phone: string;
  };
  symptoms: string[];
  questionnaireResponses: Array<{
    questionId: string;
    questionText: string;
    answer: string;
  }>;
  triageOutcome: string;
  reasoning: string;
  recommendedPathway: string;
  pathwayLabel: string;
  createdAt: string;
  referral: {
    type: 'pharmacy' | 'gp' | 'urgent_care' | 'self_care';
    status: 'queued' | 'routed' | 'completed';
    routedTo: string;
    routedAt: string;
  };
  overrideAllowed: boolean;
};

export function formatUtcLabel(value: string, includeTime = true) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const iso = date.toISOString().replace('.000Z', ' UTC');
  if (includeTime) return iso.replace('T', ' ');
  return iso.slice(0, 10);
}

export const PROVIDER_CASES: ProviderCase[] = [
  {
    id: 'CASE-PR-001',
    patientId: 'PAT-001',
    patient: {
      fullName: 'Sarah Mitchell',
      age: 33,
      gender: 'Female',
      nhsNumber: '943 476 5919',
      phone: '07700 900111',
    },
    symptoms: ['painful urination', 'frequency', 'lower abdominal pain'],
    questionnaireResponses: [
      { questionId: 'q1', questionText: 'Duration of symptoms', answer: '3 days' },
      { questionId: 'q2', questionText: 'Blood in urine', answer: 'No' },
      { questionId: 'q3', questionText: 'Fever above 38C', answer: 'No' },
    ],
    triageOutcome: 'pharmacy',
    reasoning: 'Symptoms align with uncomplicated UTI and there are no red flags.',
    recommendedPathway: 'pharmacy_first',
    pathwayLabel: 'UTI',
    createdAt: '2026-04-19T09:19:00Z',
    referral: {
      type: 'pharmacy',
      status: 'routed',
      routedTo: 'Pharmacist Dashboard',
      routedAt: '2026-04-19T09:21:00Z',
    },
    overrideAllowed: true,
  },
  {
    id: 'CASE-PR-002',
    patientId: 'PAT-009',
    patient: {
      fullName: 'Chloe Davies',
      age: 30,
      gender: 'Female',
      nhsNumber: '212 554 6677',
      phone: '07700 900222',
    },
    symptoms: ['unilateral rash', 'blistering', 'burning pain'],
    questionnaireResponses: [
      { questionId: 'q1', questionText: 'Rash onset', answer: 'Today' },
      { questionId: 'q2', questionText: 'Rash around eye', answer: 'No' },
      { questionId: 'q3', questionText: 'Immunocompromised', answer: 'No' },
    ],
    triageOutcome: 'pharmacy',
    reasoning: 'Likely shingles, inside 72-hour antiviral treatment window and no exclusion red flags.',
    recommendedPathway: 'urgent_pharmacy',
    pathwayLabel: 'Shingles',
    createdAt: '2026-04-21T08:53:00Z',
    referral: {
      type: 'pharmacy',
      status: 'queued',
      routedTo: 'Pharmacist Dashboard',
      routedAt: '2026-04-21T08:55:00Z',
    },
    overrideAllowed: true,
  },
  {
    id: 'CASE-PR-003',
    patientId: 'PAT-006',
    patient: {
      fullName: 'David Chen',
      age: 58,
      gender: 'Male',
      nhsNumber: '901 882 7741',
      phone: '07700 900333',
    },
    symptoms: ['honey-coloured crusting', 'facial lesions'],
    questionnaireResponses: [
      { questionId: 'q1', questionText: 'Known diabetes', answer: 'Yes' },
      { questionId: 'q2', questionText: 'Rapid spread in 24h', answer: 'Yes' },
      { questionId: 'q3', questionText: 'Systemic symptoms', answer: 'No' },
    ],
    triageOutcome: 'gp',
    reasoning: 'Underlying diabetes increases risk; GP review is recommended over pharmacy first.',
    recommendedPathway: 'gp_referral',
    pathwayLabel: 'Impetigo',
    createdAt: '2026-04-21T13:05:00Z',
    referral: {
      type: 'gp',
      status: 'completed',
      routedTo: 'GP Service',
      routedAt: '2026-04-21T13:10:00Z',
    },
    overrideAllowed: true,
  },
];

export const PROVIDER_OVERRIDES: ProviderOverride[] = [
  {
    id: 'OVR-001',
    caseId: 'CASE-PR-002',
    originalDecision: 'pharmacy',
    overriddenDecision: 'gp',
    reason: 'Patient reported pregnancy during phone follow-up, requiring GP review.',
    clinician: 'Dr. Leila Thompson',
    timestamp: '2026-04-21T09:42:00Z',
  },
];

export const PROVIDER_AUDIT_LOG: ProviderAuditEvent[] = [
  {
    id: 'AUD-001',
    caseId: 'CASE-PR-001',
    type: 'triage_generated',
    actor: 'system',
    timestamp: '2026-04-19T09:19:00Z',
    details: 'System generated outcome: pharmacy.',
  },
  {
    id: 'AUD-002',
    caseId: 'CASE-PR-001',
    type: 'referral_routed',
    actor: 'system',
    timestamp: '2026-04-19T09:21:00Z',
    details: 'Referral routed to Pharmacist Dashboard.',
  },
  {
    id: 'AUD-003',
    caseId: 'CASE-PR-002',
    type: 'override_applied',
    actor: 'Dr. Leila Thompson',
    timestamp: '2026-04-21T09:42:00Z',
    details: 'Decision overridden from pharmacy to gp.',
  },
];
