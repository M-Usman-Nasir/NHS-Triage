/**
 * In-browser API mocks for consultation + summary when enabled.
 * Mirrors consultation + summary contract enough for full UI flow without the Express backend.
 *
 * - `NEXT_PUBLIC_USE_API_MOCKS=true` — always use mocks for handled routes first (and after network failure when applicable).
 * - `NEXT_PUBLIC_USE_API_MOCKS=false` — real API only (requires a running backend for consultation/summary).
 * - **Unset (recommended for local UI without backend)** — mocks **default on** in dev and production builds so the patient flow works offline. Set `false` when you connect a real API.
 */

import type { SummaryApiResponse } from '../types/consultation';
import { PATIENT_PATHWAYS } from './patientPathways';
import { PATHWAY_QUESTIONS, pathwayClinicalQuestionsForPatient, type PathwayQuestion } from './pathwayQuestions';
import { getNearbyOptionsForOutcome } from './referralDirectory';
import { applyMockPathwayScoring } from './mockScoring';
import { listMockPathwayCodes, validateMockPathwayMaster } from './mockPathwayMaster';
import {
  getMockCrmPatientDetail,
  MOCK_CRM_DASHBOARD,
  MOCK_CRM_PATIENTS_ITEMS,
  MOCK_SUMMARY_LIST_FOR_PHARMACY,
} from './crmAdminMockResponses';

export function isApiMocksEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_API_MOCKS !== 'false';
}

const mockSummaryById = new Map<string, SummaryApiResponse>();
const MOCK_SUMMARY_STORAGE_KEY = 'mock-summary-by-id-v1';
const MOCK_MASTER_VALIDATION = validateMockPathwayMaster();

function getStoredMockSummaryMap(): Record<string, SummaryApiResponse> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(MOCK_SUMMARY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as Record<string, SummaryApiResponse>;
  } catch {
    return {};
  }
}

function setStoredMockSummaryMap(store: Record<string, SummaryApiResponse>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MOCK_SUMMARY_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage quota/privacy mode failures; runtime map still works.
  }
}

function persistMockSummary(summary: SummaryApiResponse): void {
  const current = getStoredMockSummaryMap();
  current[summary.id] = summary;
  setStoredMockSummaryMap(current);
}

function loadPersistedMockSummary(id: string): SummaryApiResponse | null {
  const current = getStoredMockSummaryMap();
  const item = current[id];
  return item && typeof item === 'object' ? item : null;
}

function mockStructuredDecision(outcome: string, outcomeLabel: string, outcomeReason: string) {
  if (outcome === 'emergency_999') {
    return {
      decision: {
        code: 'emergency_999',
        label: outcomeLabel,
        urgency: 'immediate_emergency',
        title: 'Call emergency services immediately',
      },
      reasoning: {
        steps: [
          'A severe high-risk symptom pattern was detected from your answers.',
          'Emergency escalation is required to avoid treatment delay.',
          outcomeReason,
        ],
        clinicalBasis: [outcomeReason],
        engine: {
          source: 'rule_engine',
          ruleIdsMatched: ['MOCK_EMERGENCY_RULE'],
          governanceUncertainty: [],
        },
      },
      referralRecommendation: {
        service: 'emergency_999',
        instruction: 'Call emergency services immediately.',
        actions: ['Call 999 now.', 'Do not delay seeking help.', 'Stay with another person if possible.'],
        escalationSafetyNet: ['If the call disconnects, call 999 again immediately.'],
        contact: { type: 'phone', value: '999' },
      },
    };
  }

  if (outcome === 'self_care') {
    return {
      decision: {
        code: 'self_care',
        label: outcomeLabel,
        urgency: 'routine',
        title: 'Self-care recommended',
      },
      reasoning: {
        steps: [
          'No emergency warning signs were detected from your answers.',
          'Your symptom pattern is currently suitable for home management.',
          outcomeReason,
        ],
        clinicalBasis: [outcomeReason],
        engine: {
          source: 'rule_engine',
          ruleIdsMatched: ['MOCK_SELF_CARE_RULE'],
          governanceUncertainty: [],
        },
      },
      referralRecommendation: {
        service: 'self_care',
        instruction: 'You can manage this at home.',
        actions: ['Follow self-care advice.', 'Rest and monitor your symptoms over the next 24-48 hours.'],
        escalationSafetyNet: [
          'If symptoms worsen, contact your GP or NHS 111.',
          'If severe symptoms develop suddenly, call 999.',
        ],
      },
    };
  }

  return {
    decision: {
      code: 'pharmacy',
      label: outcomeLabel,
      urgency: 'same_day',
      title: 'Pharmacy consultation recommended',
    },
    reasoning: {
      steps: [
        'No emergency warning signs were detected from your answers.',
        'Your condition appears suitable for pharmacy-first assessment.',
        outcomeReason,
      ],
      clinicalBasis: [outcomeReason],
      engine: {
        source: 'rule_engine',
        ruleIdsMatched: ['MOCK_PHARMACY_RULE'],
        governanceUncertainty: [],
      },
    },
    referralRecommendation: {
      service: 'pharmacy',
      instruction: 'You should go to a pharmacy.',
      actions: [
        'Visit your nearest pharmacy today.',
        'Speak with the pharmacist and explain your symptoms.',
        'Show your consultation summary if requested.',
      ],
      escalationSafetyNet: [
        'If symptoms worsen or do not improve, contact your GP or NHS 111.',
        'If you develop severe breathing issues or chest pain, call 999 immediately.',
      ],
    },
  };
}

function mockOutcomeFromAnswers(
  pathwayCode: string,
  answers: Record<string, unknown>,
  patient: { age: number; gender: string },
): {
  outcome: 'self_care' | 'pharmacy' | 'gp' | 'urgent_care' | 'emergency_999';
  scoreBreakdown: NonNullable<SummaryApiResponse['scoreBreakdown']>;
} {
  const hasTrue = (key: string) => answers[key] === true;
  const scored = applyMockPathwayScoring(pathwayCode, answers);
  const ctx = scored.context;
  const age = Number.isFinite(Number(patient.age)) ? Number(patient.age) : -1;
  const gender = typeof patient.gender === 'string' ? patient.gender : '';

  if (pathwayCode === 'uti') {
    if (hasTrue('q11') && hasTrue('q12')) return { outcome: 'urgent_care', scoreBreakdown: scored.scoreBreakdown };
    if (hasTrue('q13')) return { outcome: 'urgent_care', scoreBreakdown: scored.scoreBreakdown };
    if (gender !== 'Female' || age < 16 || age > 64 || hasTrue('q7') || hasTrue('q8') || hasTrue('q9') || hasTrue('q10') || hasTrue('q6')) {
      return { outcome: 'gp', scoreBreakdown: scored.scoreBreakdown };
    }
    const lowerUtiPattern = hasTrue('q2') && (hasTrue('q3') || hasTrue('q4') || hasTrue('q5'));
    return { outcome: lowerUtiPattern ? 'pharmacy' : 'self_care', scoreBreakdown: scored.scoreBreakdown };
  }

  if (pathwayCode === 'sore_throat') {
    if (hasTrue('q3')) return { outcome: 'emergency_999', scoreBreakdown: scored.scoreBreakdown };
    if (hasTrue('q10') && hasTrue('q4')) return { outcome: 'urgent_care', scoreBreakdown: scored.scoreBreakdown };
    if (age < 5 || hasTrue('q8') || hasTrue('q9') || hasTrue('q10')) return { outcome: 'gp', scoreBreakdown: scored.scoreBreakdown };
    const feverPain = Number.isFinite(Number(ctx.feverPainScore)) ? Number(ctx.feverPainScore) : 0;
    if (feverPain >= 4) return { outcome: 'gp', scoreBreakdown: scored.scoreBreakdown };
    if (feverPain >= 2) return { outcome: 'pharmacy', scoreBreakdown: scored.scoreBreakdown };
    return { outcome: 'self_care', scoreBreakdown: scored.scoreBreakdown };
  }

  if (pathwayCode === 'sinusitis') {
    if (hasTrue('q6') || hasTrue('q7')) return { outcome: 'emergency_999', scoreBreakdown: scored.scoreBreakdown };
    if (hasTrue('q4') && hasTrue('q9')) return { outcome: 'urgent_care', scoreBreakdown: scored.scoreBreakdown };
    if (age < 12 || answers.q1 === 'More than 12 weeks' || answers.q8 === 'Yes') return { outcome: 'gp', scoreBreakdown: scored.scoreBreakdown };
    if (answers.q1 === 'Less than 10 days') return { outcome: 'self_care', scoreBreakdown: scored.scoreBreakdown };
    return { outcome: 'pharmacy', scoreBreakdown: scored.scoreBreakdown };
  }

  if (pathwayCode === 'otitis_media') {
    if (hasTrue('q6') || hasTrue('q7')) return { outcome: 'emergency_999', scoreBreakdown: scored.scoreBreakdown };
    if (hasTrue('q5') || hasTrue('q8') || hasTrue('q9')) return { outcome: 'urgent_care', scoreBreakdown: scored.scoreBreakdown };
    if (age < 1 || age > 17) return { outcome: 'gp', scoreBreakdown: scored.scoreBreakdown };
    return { outcome: hasTrue('q2') && (hasTrue('q3') || hasTrue('q4') || hasTrue('q10')) ? 'pharmacy' : 'self_care', scoreBreakdown: scored.scoreBreakdown };
  }

  if (pathwayCode === 'insect_bites') {
    if (hasTrue('q6') || hasTrue('q5') || hasTrue('q8')) return { outcome: 'emergency_999', scoreBreakdown: scored.scoreBreakdown };
    if (hasTrue('q4') && hasTrue('q3')) return { outcome: 'urgent_care', scoreBreakdown: scored.scoreBreakdown };
    if (age < 1 || hasTrue('q7') === false || hasTrue('q3') || hasTrue('q4')) return { outcome: 'gp', scoreBreakdown: scored.scoreBreakdown };
    return { outcome: hasTrue('q2') ? 'pharmacy' : 'self_care', scoreBreakdown: scored.scoreBreakdown };
  }

  if (pathwayCode === 'impetigo') {
    if (hasTrue('q5') && hasTrue('q6')) return { outcome: 'urgent_care', scoreBreakdown: scored.scoreBreakdown };
    if (hasTrue('q5')) return { outcome: 'urgent_care', scoreBreakdown: scored.scoreBreakdown };
    const widespread = Array.isArray(answers.q2) && (answers.q2 as string[]).includes('Widespread across multiple areas');
    const lesionClusterCount = Number.isFinite(Number(ctx.lesionClusterCount)) ? Number(ctx.lesionClusterCount) : 0;
    if (hasTrue('q4') || hasTrue('q6') || hasTrue('q7') || lesionClusterCount > 4 || widespread) return { outcome: 'gp', scoreBreakdown: scored.scoreBreakdown };
    return { outcome: hasTrue('q3') ? 'pharmacy' : 'self_care', scoreBreakdown: scored.scoreBreakdown };
  }

  if (pathwayCode === 'shingles') {
    if (hasTrue('q5') && hasTrue('q6')) return { outcome: 'emergency_999', scoreBreakdown: scored.scoreBreakdown };
    if (hasTrue('q5') || hasTrue('q6') || hasTrue('q7') || hasTrue('q8')) return { outcome: 'urgent_care', scoreBreakdown: scored.scoreBreakdown };
    if (age < 18 || answers.q1 === 'More than 7 days ago' || answers.q2 === false) return { outcome: 'gp', scoreBreakdown: scored.scoreBreakdown };
    return { outcome: 'pharmacy', scoreBreakdown: scored.scoreBreakdown };
  }

  return { outcome: 'pharmacy', scoreBreakdown: scored.scoreBreakdown };
}

function outcomeLabelFromCode(outcome: string): string {
  if (outcome === 'self_care') return 'Self-Care Advice';
  if (outcome === 'pharmacy') return 'Pharmacy Referral';
  if (outcome === 'gp') return 'GP Appointment Recommended';
  if (outcome === 'urgent_care') return 'Urgent Care Required';
  if (outcome === 'emergency_999') return 'Call 999 - Emergency';
  return 'Clinical Recommendation';
}

function mockOutcomeReason(pathwayCode: string, outcome: string): string {
  if (outcome === 'self_care') return `Demo ${pathwayCode}: current answers are suitable for self-care with safety-net advice.`;
  if (outcome === 'pharmacy') return `Demo ${pathwayCode}: answers suggest pharmacy-first assessment is appropriate.`;
  if (outcome === 'gp') return `Demo ${pathwayCode}: exclusion or complexity criteria indicate GP review is safer.`;
  if (outcome === 'urgent_care') return `Demo ${pathwayCode}: warning symptoms indicate urgent same-day assessment.`;
  return `Demo ${pathwayCode}: emergency red-flag pattern detected; call 999 immediately.`;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseUrl(input: RequestInfo | URL): URL | null {
  try {
    if (typeof input === 'string') {
      if (input.startsWith('http://') || input.startsWith('https://')) return new URL(input);
      if (typeof window !== 'undefined' && input.startsWith('/')) {
        return new URL(input, window.location.origin);
      }
      return new URL(input);
    }
    if (input instanceof URL) return input;
    const raw = input.url;
    if (raw.startsWith('http://') || raw.startsWith('https://')) return new URL(raw);
    if (typeof window !== 'undefined' && raw.startsWith('/')) {
      return new URL(raw, window.location.origin);
    }
    return new URL(raw);
  } catch {
    return null;
  }
}

function readJsonBody(init?: RequestInit): Record<string, unknown> {
  const raw = init?.body;
  if (typeof raw !== 'string' || !raw.length) return {};
  try {
    const v = JSON.parse(raw) as unknown;
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function newConsultationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function definitionsPayload(pathwayCode: string, gender: string) {
  const base = PATHWAY_QUESTIONS[pathwayCode];
  if (!base) {
    return null;
  }
  const questions = pathwayClinicalQuestionsForPatient(pathwayCode, base, gender);
  const meta = PATIENT_PATHWAYS.find((p) => p.code === pathwayCode);
  return {
    pathwayCode,
    label: meta?.label ?? pathwayCode,
    questions,
    firstQuestionId: questions[0]?.id ?? null,
    progressMax: Math.max(questions.length, 1),
  };
}

function questionNextPayload(
  pathwayCode: string,
  currentQuestionId: string | null | undefined,
  patientGender: string,
): { nextQuestionId: string | null; isComplete: boolean; nextQuestion: PathwayQuestion | null; progressMax: number } {
  const base = PATHWAY_QUESTIONS[pathwayCode];
  if (!base) {
    return { nextQuestionId: null, isComplete: true, nextQuestion: null, progressMax: 1 };
  }
  const list = pathwayClinicalQuestionsForPatient(pathwayCode, base, patientGender);
  const progressMax = Math.max(list.length, 1);
  if (currentQuestionId == null || currentQuestionId === '') {
    const first = list[0];
    return {
      nextQuestionId: first?.id ?? null,
      isComplete: !first,
      nextQuestion: first ?? null,
      progressMax,
    };
  }
  const idx = list.findIndex((q) => q.id === currentQuestionId);
  if (idx < 0) {
    return { nextQuestionId: null, isComplete: true, nextQuestion: null, progressMax };
  }
  if (idx >= list.length - 1) {
    return { nextQuestionId: null, isComplete: true, nextQuestion: null, progressMax };
  }
  const next = list[idx + 1];
  return {
    nextQuestionId: next.id,
    isComplete: false,
    nextQuestion: next,
    progressMax,
  };
}

function buildMockSummary(
  id: string,
  pathwayCode: string,
  patient: { fullName: string; age: number; gender: string },
  symptoms: string[],
  answers: Record<string, unknown>,
): SummaryApiResponse {
  const meta = PATIENT_PATHWAYS.find((p) => p.code === pathwayCode);
  const pathwayLabel = meta?.fullLabel ?? pathwayCode;
  const triage = mockOutcomeFromAnswers(pathwayCode, answers, patient);
  const outcome = triage.outcome;
  const outcomeLabel = outcomeLabelFromCode(outcome);
  const outcomeReason = mockOutcomeReason(pathwayCode, outcome);
  const structured = mockStructuredDecision(outcome, outcomeLabel, outcomeReason);
  const nearbyOptions = getNearbyOptionsForOutcome(outcome);
  const redFlagTriggered = outcome === 'urgent_care' || outcome === 'emergency_999';
  const pharmacyEligible = outcome === 'pharmacy';
  return {
    id,
    createdAt: new Date().toISOString(),
    patient,
    pathway: pathwayCode,
    pathwayLabel,
    symptoms,
    answers,
    redFlagTriggered,
    redFlagReasons: redFlagTriggered
      ? [{ code: `MOCK_${outcome.toUpperCase()}`, description: 'Mock safety escalation', message: outcomeReason }]
      : [],
    pharmacyEligible,
    outcome,
    outcomeLabel,
    outcomeReason,
    decision: structured.decision,
    reasoning: structured.reasoning,
    referralRecommendation: structured.referralRecommendation,
    scoreBreakdown: triage.scoreBreakdown,
    pharmacistNotes: [],
    nearbyOptions,
    summaryText: `${patient.fullName} (${patient.gender}, ${patient.age}) — ${pathwayLabel}. Mock consultation (API mocks).`,
    pathwayPatientDisclaimer:
      'Demo mode: care-navigation only. Connect backend clinical pathways for final CDS wording and governance content.',
    safetyNetAdvice:
      'Demo mode safety net: if symptoms worsen or new severe symptoms appear, use NHS 111 or emergency services as appropriate.',
    pharmacyTreatmentOptions: ['(Mock) Discuss treatment options with a pharmacist.', '(Mock) Not a real prescription.'],
    selfCareAdvice: null,
    patientExplanation:
      'This screen uses pathway-aware demo data so triage cards, severity badges, and referral banners can be validated without a backend.',
    regulatoryContext: {
      intendedPurpose: 'Frontend development mock — not for patient care or clinical decisions.',
      mhraSamDConsiderations: {
        postureSummary: 'Offline UI demonstration only.',
      },
      pharmacyFirstAndPgd: {
        pgdSupply: {
          systemRole: 'Mock response — no PGD assessment performed.',
          performedBy: 'A licensed pharmacist when using the real system.',
        },
      },
    },
  };
}

function pharmacistListShape(s: SummaryApiResponse) {
  return {
    id: s.id,
    patient: s.patient,
    pathway: s.pathway,
    pathwayLabel: s.pathwayLabel,
    outcome: s.outcome,
    outcomeLabel: s.outcomeLabel,
    outcomeReason: s.outcomeReason,
    explanation: {
      decision: s.outcome,
      reason: s.outcomeReason || '',
      source: 'rule_engine' as const,
    },
    createdAt: s.createdAt,
    status: 'pending' as const,
    symptoms: s.symptoms,
    answers: s.answers,
    summaryText: s.summaryText,
    pharmacyTreatmentOptions: s.pharmacyTreatmentOptions,
  };
}

/**
 * Returns a Response for recognised API paths when mocks are enabled, or null to use the network.
 */
export async function tryMockApiResponse(input: RequestInfo | URL, init?: RequestInit): Promise<Response | null> {
  if (!isApiMocksEnabled()) return null;
  if (!MOCK_MASTER_VALIDATION.ok) {
    console.warn('[apiMocks] Mock pathway master validation warning:', MOCK_MASTER_VALIDATION.errors.join(' | '));
  }

  const u = parseUrl(input);
  if (!u) return null;

  const path = u.pathname;
  const method = (init?.method || 'GET').toUpperCase();

  if (method === 'GET' && path.startsWith('/api/consultation/definitions/')) {
    const pathwayCode = decodeURIComponent(path.replace(/^\/api\/consultation\/definitions\//, '').split('/')[0] || '');
    const gender = typeof u.searchParams.get('gender') === 'string' ? u.searchParams.get('gender')! : '';
    const payload = definitionsPayload(pathwayCode, gender);
    if (!payload) {
      return jsonResponse({ error: `Unknown pathway: "${pathwayCode}".`, availablePathways: listMockPathwayCodes() }, 400);
    }
    return jsonResponse(payload);
  }

  if (method === 'POST' && path === '/api/consultation/question/next') {
    const body = readJsonBody(init);
    const pathwayCode = typeof body.pathwayCode === 'string' ? body.pathwayCode : '';
    const patient = body.patient && typeof body.patient === 'object' && body.patient !== null ? (body.patient as { gender?: string }) : {};
    const gender = typeof patient.gender === 'string' ? patient.gender : '';
    const rawCurrent = body.currentQuestionId;
    const currentQuestionId: string | null =
      typeof rawCurrent === 'string' ? rawCurrent : rawCurrent === null ? null : null;
    if (!pathwayCode || !PATHWAY_QUESTIONS[pathwayCode]) {
      return jsonResponse({ error: 'pathwayCode is required or unknown.', availablePathways: listMockPathwayCodes() }, 400);
    }
    const out = questionNextPayload(pathwayCode, currentQuestionId, gender);
    return jsonResponse(out);
  }

  if (method === 'POST' && path === '/api/consultation') {
    const body = readJsonBody(init);
    const pathwayCode = typeof body.pathwayCode === 'string' ? body.pathwayCode : '';
    if (!pathwayCode || !PATHWAY_QUESTIONS[pathwayCode]) {
      return jsonResponse({ error: 'pathwayCode is required or unknown.' }, 400);
    }
    const patientRaw = body.patient;
    const patient =
      patientRaw && typeof patientRaw === 'object' && patientRaw !== null
        ? (patientRaw as { fullName?: string; age?: number; gender?: string })
        : {};
    const fullName = typeof patient.fullName === 'string' ? patient.fullName : 'Demo patient';
    const age = typeof patient.age === 'number' && !Number.isNaN(patient.age) ? patient.age : 0;
    const gender = typeof patient.gender === 'string' ? patient.gender : '';
    const symptoms = Array.isArray(body.symptoms) ? (body.symptoms as string[]) : [];
    const answers = body.answers && typeof body.answers === 'object' && body.answers !== null ? (body.answers as Record<string, unknown>) : {};

    const id = newConsultationId();
    const summary = buildMockSummary(id, pathwayCode, { fullName, age, gender }, symptoms, answers);
    mockSummaryById.set(id, summary);
    persistMockSummary(summary);

    return jsonResponse(
      {
        consultationId: id,
        outcome: summary.outcome,
        outcomeLabel: summary.outcomeLabel,
        outcomeColour: 'blue',
        outcomeReason: summary.outcomeReason,
        decision: summary.decision,
        reasoning: summary.reasoning,
        referralRecommendation: summary.referralRecommendation,
        scoreBreakdown: summary.scoreBreakdown,
        pharmacistNotes: summary.pharmacistNotes,
        nearbyOptions: summary.nearbyOptions,
        redFlagTriggered: summary.redFlagTriggered,
        redFlags: [],
        pharmacyEligible: summary.pharmacyEligible,
        summaryText: summary.summaryText,
        pathwayPatientDisclaimer: summary.pathwayPatientDisclaimer,
        safetyNetAdvice: summary.safetyNetAdvice,
        pharmacyTreatmentOptions: summary.pharmacyTreatmentOptions,
        selfCareAdvice: summary.selfCareAdvice,
        regulatoryContext: summary.regulatoryContext,
      },
      201,
    );
  }

  if (method === 'GET' && path === '/api/summary') {
    const seen = new Set<string>();
    const summaries: unknown[] = [];
    for (const row of MOCK_SUMMARY_LIST_FOR_PHARMACY) {
      summaries.push(row);
      seen.add(row.id);
    }
    for (const s of Array.from(mockSummaryById.values())) {
      if (s.outcome === 'pharmacy' && !seen.has(s.id)) {
        summaries.push(pharmacistListShape(s));
        seen.add(s.id);
      }
    }
    for (const id of Object.keys(getStoredMockSummaryMap())) {
      const s = loadPersistedMockSummary(id);
      if (s && s.outcome === 'pharmacy' && !seen.has(s.id)) {
        summaries.push(pharmacistListShape(s));
        seen.add(s.id);
      }
    }
    return jsonResponse({ summaries });
  }

  if (method === 'GET' && path === '/api/crm/dashboard') {
    return jsonResponse(MOCK_CRM_DASHBOARD);
  }

  if (method === 'GET' && path === '/api/crm/patients') {
    return jsonResponse({ items: MOCK_CRM_PATIENTS_ITEMS });
  }

  const crmPatientGet = path.match(/^\/api\/crm\/patients\/([^/]+)$/);
  if (method === 'GET' && crmPatientGet) {
    const patientId = decodeURIComponent(crmPatientGet[1] || '');
    const detail = getMockCrmPatientDetail(patientId);
    if (!detail) return jsonResponse({ error: 'Patient not found.' }, 404);
    return jsonResponse(detail);
  }

  const crmPatientNotes = path.match(/^\/api\/crm\/patients\/([^/]+)\/notes$/);
  if (method === 'PUT' && crmPatientNotes) {
    return jsonResponse({ success: true, patientId: decodeURIComponent(crmPatientNotes[1] || '') });
  }

  if (method === 'POST' && path === '/api/crm/tasks') {
    return jsonResponse({ success: true, id: `TASK-MOCK-${Date.now()}` }, 201);
  }

  const crmTaskPut = path.match(/^\/api\/crm\/tasks\/([^/]+)$/);
  if (method === 'PUT' && crmTaskPut) {
    return jsonResponse({ success: true, id: decodeURIComponent(crmTaskPut[1] || '') });
  }

  if (method === 'PUT' && /^\/api\/crm\/cases\/[^/]+\/stage$/.test(path)) {
    return jsonResponse({ success: true });
  }

  if (method === 'POST' && path === '/api/crm/communications') {
    return jsonResponse({ success: true }, 201);
  }

  if (method === 'GET' && path === '/api/admin/pathways') {
    return jsonResponse({
      pathways: PATIENT_PATHWAYS.map((p) => ({ code: p.code, label: p.label })),
    });
  }

  const adminRulesMatch = path.match(/^\/api\/admin\/rules\/([^/]+)$/);
  if (method === 'GET' && adminRulesMatch) {
    const pathwayCode = decodeURIComponent(adminRulesMatch[1] || '');
    const base = PATHWAY_QUESTIONS[pathwayCode];
    if (!base) {
      return jsonResponse({ error: `Unknown pathway: "${pathwayCode}".` }, 404);
    }
    const meta = PATIENT_PATHWAYS.find((p) => p.code === pathwayCode);
    const redFlags = base
      .filter((q) => q.redFlagHint)
      .map((q) => ({
        code: `RF_${pathwayCode}_${q.id}`,
        condition: `${q.id} === true`,
        outcome: 'urgent_care',
      }));
    return jsonResponse({
      pathway: pathwayCode,
      label: meta?.label ?? pathwayCode,
      questions: base.map((q) => ({ id: q.id, text: q.text, type: q.type, required: q.required })),
      redFlags,
    });
  }

  const adminQuestionPut = path.match(
    /^\/api\/admin\/pathways\/([^/]+)\/questions\/([^/]+)$/,
  );
  if (method === 'PUT' && adminQuestionPut) {
    return jsonResponse({ success: true });
  }

  const adminQuestionPost = path.match(/^\/api\/admin\/pathways\/([^/]+)\/questions$/);
  if (method === 'POST' && adminQuestionPost) {
    return jsonResponse({ success: true }, 201);
  }

  const adminQuestionDelete = path.match(/^\/api\/admin\/pathways\/([^/]+)\/questions\/([^/]+)$/);
  if (method === 'DELETE' && adminQuestionDelete) {
    return jsonResponse({ success: true });
  }

  if (method === 'GET' && /^\/api\/summary\/[^/]+\/pdf$/.test(path)) {
    const id = decodeURIComponent(path.replace(/^\/api\/summary\//, '').replace(/\/pdf$/, '') || '');
    const summary = mockSummaryById.get(id) || loadPersistedMockSummary(id);
    if (!summary) {
      return jsonResponse({ error: `No consultation summary found for ID: ${id}` }, 404);
    }
    const pseudoPdf = `%PDF-1.1
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 140 >>
stream
BT /F1 12 Tf 50 740 Td (Care Path Mock Referral Summary) Tj T* (${summary.pathwayLabel}) Tj T* (${summary.outcomeLabel}) Tj ET
endstream
endobj
trailer
<< /Root 1 0 R >>
%%EOF`;
    return new Response(pseudoPdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="consultation-summary-${id}.pdf"`,
      },
    });
  }

  if (method === 'GET' && /^\/api\/summary\/[^/]+\/notes$/.test(path)) {
    const id = decodeURIComponent(path.replace(/^\/api\/summary\//, '').replace(/\/notes$/, '') || '');
    const summary = mockSummaryById.get(id) || loadPersistedMockSummary(id);
    if (!summary) {
      return jsonResponse({ error: `No consultation summary found for ID: ${id}` }, 404);
    }
    return jsonResponse({ consultationId: id, notes: summary.pharmacistNotes || [] });
  }

  if (method === 'POST' && /^\/api\/summary\/[^/]+\/notes$/.test(path)) {
    const id = decodeURIComponent(path.replace(/^\/api\/summary\//, '').replace(/\/notes$/, '') || '');
    const summary = mockSummaryById.get(id) || loadPersistedMockSummary(id);
    if (!summary) {
      return jsonResponse({ error: `No consultation summary found for ID: ${id}` }, 404);
    }
    const body = readJsonBody(init);
    const pharmacistId = typeof body.pharmacist_id === 'string' ? body.pharmacist_id : '';
    const noteText = typeof body.note === 'string' ? body.note.trim() : '';
    if (!pharmacistId || !noteText) {
      return jsonResponse({ error: 'pharmacist_id and note are required.' }, 400);
    }
    const created = {
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      pharmacistId,
      note: noteText,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    const nextNotes = [...(summary.pharmacistNotes || []), created];
    const nextSummary = { ...summary, pharmacistNotes: nextNotes };
    mockSummaryById.set(id, nextSummary);
    persistMockSummary(nextSummary);
    return jsonResponse({ success: true, note: created, notes: nextNotes }, 201);
  }

  if (method === 'POST' && /^\/api\/summary\/[^/]+\/override$/.test(path)) {
    const id = decodeURIComponent(path.replace(/^\/api\/summary\//, '').replace(/\/override$/, '') || '');
    const body = readJsonBody(init);
    const overridden_decision = typeof body.overridden_decision === 'string' ? body.overridden_decision : 'gp';
    const reason = typeof body.reason === 'string' ? body.reason : '';
    const pharmacist_id = typeof body.pharmacist_id === 'string' ? body.pharmacist_id : 'demo_pharmacist';
    const original_decision =
      typeof body.original_decision === 'string' ? body.original_decision : 'pharmacy';

    const fromMap = mockSummaryById.get(id) || loadPersistedMockSummary(id);
    const listEntry = MOCK_SUMMARY_LIST_FOR_PHARMACY.find((x) => x.id === id);

    const overrideBlock = {
      original_decision,
      overridden_decision,
      pharmacist_id,
      reason,
      timestamp: new Date().toISOString(),
    };

    if (fromMap) {
      const nextOutcome = overridden_decision as SummaryApiResponse['outcome'];
      const updatedSummary: SummaryApiResponse = {
        ...fromMap,
        outcome: nextOutcome,
        outcomeLabel: outcomeLabelFromCode(nextOutcome),
        outcomeReason: reason || fromMap.outcomeReason,
      };
      mockSummaryById.set(id, updatedSummary);
      persistMockSummary(updatedSummary);
      const summaryOut = {
        ...pharmacistListShape(updatedSummary),
        outcome: overridden_decision,
        outcomeLabel: outcomeLabelFromCode(overridden_decision),
        explanation: { decision: overridden_decision, reason, source: 'pharmacist_override' as const },
        pharmacistOverride: overrideBlock,
      };
      return jsonResponse({ summary: summaryOut });
    }

    if (listEntry) {
      const summaryOut = {
        ...listEntry,
        outcome: overridden_decision,
        outcomeLabel: outcomeLabelFromCode(overridden_decision),
        explanation: {
          decision: overridden_decision,
          reason,
          source: 'pharmacist_override' as const,
        },
        pharmacistOverride: overrideBlock,
      };
      return jsonResponse({ summary: summaryOut });
    }

    return jsonResponse({ error: `No consultation summary found for ID: ${id}` }, 404);
  }

  if (method === 'GET' && path.startsWith('/api/summary/')) {
    const id = decodeURIComponent(path.replace(/^\/api\/summary\//, '').split('/')[0] || '');
    if (!id) {
      return jsonResponse({ error: 'Missing consultation id.' }, 400);
    }
    const stored = mockSummaryById.get(id);
    if (stored) {
      return jsonResponse(stored);
    }
    const persisted = loadPersistedMockSummary(id);
    if (persisted) {
      mockSummaryById.set(id, persisted);
      return jsonResponse(persisted);
    }
    return jsonResponse(
      {
        id,
        pathway: 'uti',
        pathwayLabel: 'Urinary Tract Infection',
        redFlagTriggered: false,
        pharmacyEligible: true,
        outcome: 'pharmacy',
        outcomeLabel: 'Pharmacy Referral',
        outcomeReason: 'Mock API: no in-memory record for this id; returning static demo summary.',
        ...mockStructuredDecision(
          'pharmacy',
          'Pharmacy Referral',
          'Mock API: no in-memory record for this id; returning static demo summary.',
        ),
        nearbyOptions: getNearbyOptionsForOutcome('pharmacy'),
        summaryText: 'Mock summary (id was not created in this browser session). Enable flow from consultation with mocks on.',
        patient: { fullName: 'Demo patient', age: 33, gender: 'Female' },
        pharmacistNotes: [],
      } satisfies SummaryApiResponse,
      200,
    );
  }

  return null;
}
