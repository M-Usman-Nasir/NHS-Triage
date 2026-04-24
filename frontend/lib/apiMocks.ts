/**
 * In-browser API mocks for consultation + summary when enabled.
 * Mirrors consultation + summary contract enough for full UI flow without the Express backend.
 *
 * - `NEXT_PUBLIC_USE_API_MOCKS=true` — always use mocks for handled routes.
 * - `NEXT_PUBLIC_USE_API_MOCKS=false` — never use mocks (real API only).
 * - Unset — in `next dev` (NODE_ENV=development) mocks default on so the UI works without the backend.
 */

import type { SummaryApiResponse } from '../types/consultation';
import { PATIENT_PATHWAYS } from './patientPathways';
import { PATHWAY_QUESTIONS, pathwayClinicalQuestionsForPatient, type PathwayQuestion } from './pathwayQuestions';

export function isApiMocksEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_USE_API_MOCKS === 'false') return false;
  if (process.env.NEXT_PUBLIC_USE_API_MOCKS === 'true') return true;
  return process.env.NODE_ENV === 'development';
}

const mockSummaryById = new Map<string, SummaryApiResponse>();

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
    outcome: 'pharmacy',
    outcomeLabel: 'Pharmacy Referral',
    outcomeReason:
      'Mock API: fixed demo outcome for UI testing. Run the real backend for NHS-aligned triage results.',
    summaryText: `${patient.fullName} (${patient.gender}, ${patient.age}) — ${pathwayLabel}. Mock consultation (API mocks).`,
    safetyNetAdvice:
      'Mock mode only: if you feel worse or develop new symptoms, use NHS 111 or seek appropriate care.',
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

    return jsonResponse(
      {
        consultationId: id,
        outcome: summary.outcome,
        outcomeLabel: summary.outcomeLabel,
        outcomeColour: 'blue',
        outcomeReason: summary.outcomeReason,
        redFlagTriggered: summary.redFlagTriggered,
        redFlags: [],
        pharmacyEligible: summary.pharmacyEligible,
        summaryText: summary.summaryText,
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
        summaryText: 'Mock summary (id was not created in this browser session). Enable flow from consultation with mocks on.',
        patient: { fullName: 'Demo patient', age: 33, gender: 'Female' },
      } satisfies SummaryApiResponse,
      200,
    );
  }

  return null;
}
