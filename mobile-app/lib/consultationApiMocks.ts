/**
 * Offline consultation API mocks for React Native (no backend, no network).
 * Mirrors the three consultation routes the app uses: definitions, question/next, submit.
 *
 * Disable only when pointing at a real API (e.g. set USE_NATIVE_API_MOCKS=false via Metro/babel).
 */

import { PATIENT_PATHWAYS } from "./patientPathways";
import {
  PATHWAY_QUESTIONS,
  pathwayClinicalQuestionsForPatient,
  type PathwayQuestion,
} from "./pathwayQuestions";

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

/** Parse `http://host:port/path?a=b` without relying on DOM `URL` typings in RN. */
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
        // ignore malformed pairs
      }
    }
  }
  return { pathname, query };
}

function definitionsPayload(pathwayCode: string, gender: string) {
  const base = PATHWAY_QUESTIONS[pathwayCode];
  if (!base) return null;
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
  if (currentQuestionId == null || currentQuestionId === "") {
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

function mockPostConsultationBody(
  pathwayCode: string,
  patient: { fullName: string; age: number; gender: string },
  symptoms: string[],
) {
  const meta = PATIENT_PATHWAYS.find((p) => p.code === pathwayCode);
  const pathwayLabel = meta?.fullLabel ?? pathwayCode;
  const id = newConsultationId();
  return {
    consultationId: id,
    outcome: "pharmacy",
    outcomeLabel: "Pharmacy Referral",
    outcomeReason: `Demo (offline): ${pathwayLabel} — illustrative outcome only; connect an API for live triage.`,
    outcomeColour: "blue",
    decision: {
      code: "pharmacy",
      label: "Pharmacy Referral",
      urgency: "same_day",
      title: "Pharmacy consultation recommended",
    },
    reasoning: {
      steps: [
        "No emergency warning signs were assumed for this offline demo.",
        "A real deployment would run governed clinical rules on a server.",
      ],
      clinicalBasis: ["Offline demo mode"],
      engine: {
        source: "rule_engine",
        ruleIdsMatched: ["NATIVE_MOCK"],
        governanceUncertainty: [],
      },
    },
    referralRecommendation: {
      service: "pharmacy",
      instruction: "In production, follow local pharmacy-first pathways.",
      actions: ["Speak with a pharmacist when using the connected product."],
      escalationSafetyNet: [
        "If symptoms worsen, use NHS 111 or emergency services as appropriate.",
        "This screen is not a substitute for clinical assessment.",
      ],
    },
    scoreBreakdown: [] as unknown[],
    pharmacistNotes: [] as unknown[],
    nearbyOptions: [] as unknown[],
    redFlagTriggered: false,
    redFlags: [] as unknown[],
    pharmacyEligible: true,
    summaryText: `${patient.fullName} (${patient.gender}, ${patient.age}) — ${pathwayLabel}. Symptoms: ${symptoms.length ? symptoms.join(", ") : "—"}. Offline mock submission.`,
    pathwayPatientDisclaimer:
      "Demo mode: care-navigation only. Connect a backend for governed clinical outputs.",
    safetyNetAdvice: "If you feel seriously unwell, use NHS 111 or emergency services as appropriate.",
    pharmacyTreatmentOptions: [
      "(Mock) Treatment options would be confirmed with a pharmacist when the API is connected.",
    ],
    selfCareAdvice: null,
    regulatoryContext: {
      intendedPurpose: "Mobile demo mock — not for patient care.",
      mhraSamDConsiderations: { postureSummary: "Offline demonstration only." },
      pharmacyFirstAndPgd: {
        pgdSupply: {
          systemRole: "Mock only.",
          performedBy: "A licensed pharmacist in production.",
        },
      },
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
        ? (body.patient as { gender?: string })
        : {};
    const gender = typeof patient.gender === "string" ? patient.gender : "";
    const rawCurrent = body.currentQuestionId;
    const currentQuestionId: string | null =
      typeof rawCurrent === "string" ? rawCurrent : rawCurrent === null ? null : null;
    if (!pathwayCode || !PATHWAY_QUESTIONS[pathwayCode]) {
      return jsonResponse(
        { error: "pathwayCode is required or unknown.", availablePathways: listPathwayCodes() },
        400,
      );
    }
    const out = questionNextPayload(pathwayCode, currentQuestionId, gender);
    return jsonResponse(out);
  }

  if (method === "POST" && path === "/api/consultation") {
    const body = readJsonBody(init);
    const pathwayCode = typeof body.pathwayCode === "string" ? body.pathwayCode : "";
    if (!pathwayCode || !PATHWAY_QUESTIONS[pathwayCode]) {
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
    return jsonResponse(mockPostConsultationBody(pathwayCode, { fullName, age, gender }, symptoms), 201);
  }

  return null;
}
