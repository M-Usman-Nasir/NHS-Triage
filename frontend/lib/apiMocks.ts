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

export function isApiMocksEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_API_MOCKS !== 'false';
}

const mockSummaryById = new Map<string, SummaryApiResponse>();
const MOCK_SUMMARY_STORAGE_KEY = 'mock-summary-by-id-v1';

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

function mockOutcomeFromAnswers(answers: Record<string, unknown>): 'self_care' | 'pharmacy' | 'gp' | 'urgent_care' | 'emergency_999' {
  const values = Object.values(answers);
  const hasTrue = (key: string) => answers[key] === true;
  const hasEmergencySignal =
    hasTrue('q3') && hasTrue('q4') ||
    hasTrue('q6') ||
    values.some((v) => typeof v === 'string' && /breath|chest pain|collapse/i.test(v));
  if (hasEmergencySignal) return 'emergency_999';
  if (hasTrue('q5') || hasTrue('q7')) return 'urgent_care';
  if (hasTrue('q8')) return 'gp';
  if (values.some((v) => typeof v === 'string' && /mild|improving/i.test(v))) return 'self_care';
  return 'pharmacy';
}

function outcomeLabelFromCode(outcome: string): string {
  if (outcome === 'self_care') return 'Self-Care Advice';
  if (outcome === 'pharmacy') return 'Pharmacy Referral';
  if (outcome === 'gp') return 'GP Appointment Recommended';
  if (outcome === 'urgent_care') return 'Urgent Care Required';
  if (outcome === 'emergency_999') return 'Call 999 - Emergency';
  return 'Clinical Recommendation';
}

function mockOutcomeReason(outcome: string): string {
  if (outcome === 'self_care') return 'Mock decision: symptoms appear mild and suitable for home care with safety-net advice.';
  if (outcome === 'pharmacy') return 'Mock decision: symptoms are suitable for pharmacy-first assessment and treatment advice.';
  if (outcome === 'gp') return 'Mock decision: GP assessment is preferred for this symptom profile.';
  if (outcome === 'urgent_care') return 'Mock decision: same-day urgent clinical review is recommended.';
  return 'Mock decision: high-risk signal detected; emergency response is recommended.';
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseUrl(input: RequestInfo | URL): URL | null {
  try {
    if (typeof input === 'string') return new URL(input);
    if (input instanceof URL) return input;
    return new URL(input.url);
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
  const outcome = mockOutcomeFromAnswers(answers);
  const outcomeLabel = outcomeLabelFromCode(outcome);
  const outcomeReason = mockOutcomeReason(outcome);
  const structured = mockStructuredDecision(outcome, outcomeLabel, outcomeReason);
  const nearbyOptions = getNearbyOptionsForOutcome(outcome);
  return {
    id,
    createdAt: new Date().toISOString(),
    patient,
    pathway: pathwayCode,
    pathwayLabel,
    symptoms,
    answers,
    redFlagTriggered: false,
    redFlagReasons: [],
    pharmacyEligible: true,
    outcome,
    outcomeLabel,
    outcomeReason,
    decision: structured.decision,
    reasoning: structured.reasoning,
    referralRecommendation: structured.referralRecommendation,
    nearbyOptions,
    summaryText: `${patient.fullName} (${patient.gender}, ${patient.age}) — ${pathwayLabel}. Mock consultation (API mocks).`,
    pathwayPatientDisclaimer:
      'Mock mode: generic care-navigation disclaimer — run the backend for pathway-specific CDS lines from clinical JSON.',
    safetyNetAdvice:
      'Mock mode only: if you feel worse or develop new symptoms, use NHS 111 or seek appropriate care immediately.',
    pharmacyTreatmentOptions: ['(Mock) Discuss treatment options with a pharmacist.', '(Mock) Not a real prescription.'],
    selfCareAdvice: null,
    patientExplanation:
      'This screen uses mock data so the frontend works without the API. Clinical outcomes are not calculated.',
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

/**
 * Returns a Response for recognised API paths when mocks are enabled, or null to use the network.
 */
export async function tryMockApiResponse(input: RequestInfo | URL, init?: RequestInit): Promise<Response | null> {
  if (!isApiMocksEnabled()) return null;

  const u = parseUrl(input);
  if (!u) return null;

  const path = u.pathname;
  const method = (init?.method || 'GET').toUpperCase();

  if (method === 'GET' && path.startsWith('/api/consultation/definitions/')) {
    const pathwayCode = decodeURIComponent(path.replace(/^\/api\/consultation\/definitions\//, '').split('/')[0] || '');
    const gender = typeof u.searchParams.get('gender') === 'string' ? u.searchParams.get('gender')! : '';
    const payload = definitionsPayload(pathwayCode, gender);
    if (!payload) {
      return jsonResponse({ error: `Unknown pathway: "${pathwayCode}".`, availablePathways: Object.keys(PATHWAY_QUESTIONS) }, 400);
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
      return jsonResponse({ error: 'pathwayCode is required or unknown.', availablePathways: Object.keys(PATHWAY_QUESTIONS) }, 400);
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
      } satisfies SummaryApiResponse,
      200,
    );
  }

  return null;
}
