/**
 * Offline consultation API mocks for React Native (no backend, no network).
 * Uses questionGraphResolver + mockTriage for branching and outcomes.
 */

import { mergeCoreDurationIntoAnswers } from "./consultationAnswerMaps";
import { buildReasoningStepsForApi } from "./buildOutcomeSummary";
import { normalizeOutcome, outcomePresentation } from "./outcomePresentation";
import { getDefinitionsForPathway, getNextQuestionState } from "./questionGraphResolver";
import { getPathwayBundle } from "./pathwayBundleLoader";
import { runMockTriage } from "./mockTriage";
import { PATIENT_PATHWAYS } from "./patientPathways";
import { PATHWAY_QUESTIONS } from "./pathwayQuestions";
import type { PathwayQuestion } from "./pathwayQuestions";

type MockAuditRow = {
  id: string;
  event_type: string;
  created_at: string;
  request_id: string | null;
  payload: Record<string, unknown>;
};

const mockConsultations = new Map<string, Record<string, unknown>>();
const mockAuditByConsultation = new Map<string, MockAuditRow[]>();

function appendMockAudit(
  consultationId: string,
  eventType: string,
  payload: Record<string, unknown> = {},
): void {
  const row: MockAuditRow = {
    id: `mock-audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    event_type: eventType,
    created_at: new Date().toISOString(),
    request_id: null,
    payload,
  };
  const list = mockAuditByConsultation.get(consultationId) ?? [];
  list.push(row);
  mockAuditByConsultation.set(consultationId, list);
}

function listPathwayCodes(): string[] {
  return PATIENT_PATHWAYS.map((p) => p.code);
}

function getProcessEnv(key: string): string | undefined {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[key];
}

export function isNativeApiMocksEnabled(): boolean {
  if (getProcessEnv("USE_NATIVE_API_MOCKS") === "false") {
    return false;
  }
  return true;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function readJsonBody(init?: RequestInit): Record<string, unknown> {
  const raw = init?.body;
  if (typeof raw !== "string" || !raw.length) return {};
  try {
    const v = JSON.parse(raw) as unknown;
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function newConsultationId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function parseRequestUrl(input: string): { pathname: string; query: Record<string, string> } | null {
  const pathMatch = input.match(/^https?:\/\/[^/?#]+(\/[^?#]*)/);
  const pathname = pathMatch?.[1] ?? (input.startsWith("/") ? input.split("?")[0] : null);
  if (!pathname || !pathname.startsWith("/")) return null;
  const qi = input.indexOf("?");
  const query: Record<string, string> = {};
  if (qi >= 0) {
    const qs = input.slice(qi + 1).split("&");
    for (const pair of qs) {
      if (!pair) continue;
      const eq = pair.indexOf("=");
      const rawKey = eq >= 0 ? pair.slice(0, eq) : pair;
      const rawVal = eq >= 0 ? pair.slice(eq + 1) : "";
      try {
        const k = decodeURIComponent(rawKey.replace(/\+/g, " "));
        const v = decodeURIComponent(rawVal.replace(/\+/g, " "));
        if (k) query[k] = v;
      } catch {
        // ignore
      }
    }
  }
  return { pathname, query };
}

function definitionsPayload(pathwayCode: string, gender: string) {
  if (!PATHWAY_QUESTIONS[pathwayCode]) return null;
  const payload = getDefinitionsForPathway(pathwayCode, gender, {});
  if (!payload) return null;
  return payload;
}

function questionNextPayload(
  pathwayCode: string,
  currentQuestionId: string | null | undefined,
  patient: { gender?: string; age?: number },
  answers: Record<string, unknown>,
): {
  nextQuestionId: string | null;
  isComplete: boolean;
  nextQuestion: PathwayQuestion | null;
  progressMax: number;
} {
  const merged = mergeCoreDurationIntoAnswers(pathwayCode, answers);
  const state = getNextQuestionState(pathwayCode, currentQuestionId ?? null, merged, patient);
  return {
    nextQuestionId: state.nextQuestionId,
    isComplete: state.isComplete,
    nextQuestion: state.nextQuestion,
    progressMax: state.progressMax,
  };
}

function mockPostConsultationBody(
  pathwayCode: string,
  patient: { fullName: string; age: number; gender: string },
  symptoms: string[],
  answers: Record<string, unknown>,
  consent?: { version?: string; consentedAt?: string },
) {
  const meta = PATIENT_PATHWAYS.find((p) => p.code === pathwayCode);
  const pathwayLabel = meta?.fullLabel ?? pathwayCode;
  const id = newConsultationId();
  const clinicalAnswers = mergeCoreDurationIntoAnswers(pathwayCode, answers);
  const triage = runMockTriage(pathwayCode, clinicalAnswers, patient);
  const outcome = normalizeOutcome(triage.outcome);
  const pres = outcomePresentation(outcome);
  const reasoningSteps = buildReasoningStepsForApi(
    [pathwayCode],
    answers,
    triage.redFlagTriggered,
    triage.outcomeReason,
  );
  const referralActions =
    triage.referralActions ?? pres.referralActions;
  const referralInstruction =
    triage.referralInstruction ?? pres.actionLine;

  const record = {
    id,
    pathwayCode,
    patient,
    symptoms,
    answers,
    outcome: triage.outcome,
    createdAt: new Date().toISOString(),
  };
  mockConsultations.set(id, record);

  appendMockAudit(id, "consultation_started", { pathwayCode });
  if (consent?.version && consent?.consentedAt) {
    appendMockAudit(id, "patient_consent_recorded", {
      consentVersion: consent.version,
      consentedAt: consent.consentedAt,
    });
  }
  if (triage.redFlagTriggered) {
    appendMockAudit(id, "red_flag_triggered", { redFlags: triage.redFlags });
  }
  appendMockAudit(id, "consultation_completed", { pathwayCode, outcome: triage.outcome });
  appendMockAudit(id, "system_decision_emitted", {
    pathwayCode,
    outcome: triage.outcome,
    outcomeReason: triage.outcomeReason,
  });

  return {
    consultationId: id,
    outcome: triage.outcome,
    outcomeLabel: triage.outcomeLabel,
    outcomeReason: triage.outcomeReason,
    outcomeColour: triage.outcomeColour,
    decision: triage.decision,
    reasoning: {
      steps: reasoningSteps,
      clinicalBasis: ["Offline governed rules (demo)"],
      engine: { source: "rule_engine", ruleIdsMatched: [], governanceUncertainty: [] },
    },
    referralRecommendation: {
      service: triage.outcome === "pharmacy" ? "pharmacy" : triage.outcome,
      instruction: referralInstruction,
      actions: referralActions,
      escalationSafetyNet: [
        "If symptoms worsen, use NHS 111 or emergency services as appropriate.",
      ],
    },
    scoreBreakdown: [] as unknown[],
    pharmacistNotes: [] as unknown[],
    nearbyOptions: [] as unknown[],
    redFlagTriggered: triage.redFlagTriggered,
    redFlags: triage.redFlags,
    pharmacyEligible: triage.pharmacyEligible,
    summaryText: `${patient.fullName} (${patient.gender}, ${patient.age}) — ${pathwayLabel}. Symptoms: ${symptoms.length ? symptoms.join(", ") : "—"}.`,
    pathwayPatientDisclaimer: "Guidance only — not a substitute for professional medical advice.",
    safetyNetAdvice: "If you feel seriously unwell, use NHS 111 or emergency services as appropriate.",
    pharmacyTreatmentOptions: triage.outcome === "pharmacy" ? ["Speak with a pharmacist for assessment."] : [],
    selfCareAdvice: triage.outcome === "self_care" ? "Rest and self-care as appropriate." : null,
    regulatoryContext: {
      intendedPurpose: "Mobile demo mock.",
      mhraSamDConsiderations: { postureSummary: "Offline demonstration only." },
    },
  };
}

export async function tryNativeMockApiResponse(input: string, init?: RequestInit): Promise<Response | null> {
  if (!isNativeApiMocksEnabled()) return null;

  const parsed = parseRequestUrl(input);
  if (!parsed) return null;

  const path = parsed.pathname;
  const method = (init?.method || "GET").toUpperCase();

  if (method === "GET" && path.startsWith("/api/consultation/definitions/")) {
    const pathwayCode = decodeURIComponent(
      path.replace(/^\/api\/consultation\/definitions\//, "").split("/")[0] || "",
    );
    const gender = parsed.query.gender ?? "";
    const payload = definitionsPayload(pathwayCode, gender);
    if (!payload) {
      return jsonResponse(
        { error: `Unknown pathway: "${pathwayCode}".`, availablePathways: listPathwayCodes() },
        400,
      );
    }
    return jsonResponse(payload);
  }

  if (method === "POST" && path === "/api/consultation/question/next") {
    const body = readJsonBody(init);
    const pathwayCode = typeof body.pathwayCode === "string" ? body.pathwayCode : "";
    const patient =
      body.patient && typeof body.patient === "object" && body.patient !== null
        ? (body.patient as { gender?: string; age?: number })
        : {};
    const gender = typeof patient.gender === "string" ? patient.gender : "";
    const age = typeof patient.age === "number" ? patient.age : undefined;
    const rawAnswers =
      body.answers && typeof body.answers === "object" && body.answers !== null
        ? (body.answers as Record<string, unknown>)
        : {};
    const rawCurrent = body.currentQuestionId;
    const currentQuestionId: string | null =
      typeof rawCurrent === "string" ? rawCurrent : rawCurrent === null ? null : null;
    if (!pathwayCode || !getPathwayBundle(pathwayCode)) {
      return jsonResponse(
        { error: "pathwayCode is required or unknown.", availablePathways: listPathwayCodes() },
        400,
      );
    }
    const out = questionNextPayload(pathwayCode, currentQuestionId, { gender, age }, rawAnswers);
    return jsonResponse(out);
  }

  if (method === "POST" && path === "/api/consultation") {
    const body = readJsonBody(init);
    const pathwayCode = typeof body.pathwayCode === "string" ? body.pathwayCode : "";
    if (!pathwayCode || !getPathwayBundle(pathwayCode)) {
      return jsonResponse({ error: "pathwayCode is required or unknown." }, 400);
    }
    const patientRaw = body.patient;
    const patient =
      patientRaw && typeof patientRaw === "object" && patientRaw !== null
        ? (patientRaw as { fullName?: string; age?: number; gender?: string })
        : {};
    const fullName = typeof patient.fullName === "string" ? patient.fullName : "Demo patient";
    const age = typeof patient.age === "number" && !Number.isNaN(patient.age) ? patient.age : 0;
    const gender = typeof patient.gender === "string" ? patient.gender : "";
    const symptoms = Array.isArray(body.symptoms) ? (body.symptoms as string[]) : [];
    const answers =
      body.answers && typeof body.answers === "object" && body.answers !== null
        ? (body.answers as Record<string, unknown>)
        : {};
    const consentRaw = body.consent;
    const consent =
      consentRaw && typeof consentRaw === "object" && consentRaw !== null
        ? (consentRaw as { version?: string; consentedAt?: string })
        : undefined;
    return jsonResponse(
      mockPostConsultationBody(pathwayCode, { fullName, age, gender }, symptoms, answers, consent),
      201,
    );
  }

  if (method === "GET" && path.startsWith("/api/gdpr/subject-access/")) {
    const consultationId = decodeURIComponent(
      path.replace(/^\/api\/gdpr\/subject-access\//, "").split("/")[0] || "",
    );
    const record = mockConsultations.get(consultationId);
    if (!record) {
      return jsonResponse({ error: "Consultation not found.", consultationId }, 404);
    }
    appendMockAudit(consultationId, "gdpr_subject_access_export", { route: "subject_access" });
    return jsonResponse({
      exportGeneratedAt: new Date().toISOString(),
      consultation: record,
      auditTrail: mockAuditByConsultation.get(consultationId) ?? [],
      notices: [
        "This export is for the identified consultation only (offline demo).",
      ],
    });
  }

  if (method === "POST" && path === "/api/gdpr/erasure-request") {
    const body = readJsonBody(init);
    const consultationId =
      typeof body.consultationId === "string" ? body.consultationId : "";
    if (!consultationId) {
      return jsonResponse({ error: "consultationId is required." }, 400);
    }
    const existed = mockConsultations.has(consultationId);
    if (existed) {
      mockConsultations.delete(consultationId);
    }
    appendMockAudit(consultationId, "gdpr_erasure_requested", {
      recordExisted: existed,
      action: "mock_delete",
    });
    return jsonResponse({
      success: true,
      consultationId,
      removed: existed,
      message: existed
        ? "Consultation removed from active demo store. Immutable audit rows may be retained per policy."
        : "No active consultation record found; erasure request logged.",
    });
  }

  return null;
}
