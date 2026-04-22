/** Values collected in the patient questionnaire (serialised to JSON). */
export type AnswerValue = string | boolean | string[] | number;

export interface ConsultationSubmitPayload {
  pathwayCode: string;
  answers: Record<string, AnswerValue>;
  patient: { fullName: string; age: number; gender: string };
  symptoms: string[];
}

/** GET /api/summary/:id — aligned with backend/lib/summaryMapper.js */
export interface SummaryApiResponse {
  id: string;
  createdAt?: string;
  patient?: { fullName: string; age: number; gender: string };
  pathway: string;
  pathwayLabel: string;
  symptoms?: string[];
  answers?: Record<string, unknown>;
  redFlagTriggered: boolean;
  redFlagReasons?: Array<{ code: string; description: string; message: string }>;
  pharmacyEligible: boolean;
  outcome: string;
  outcomeLabel: string;
  outcomeReason: string;
  summaryText: string;
  safetyNetAdvice?: string | null;
  pharmacyTreatmentOptions?: string[] | null;
  selfCareAdvice?: string | null;
  status?: string;
}

export interface TriageResultView {
  consultationId: string;
  patient?: { fullName: string; age: number; gender: string };
  pathway?: string;
  pathwayLabel?: string;
  outcome: string;
  outcomeLabel: string;
  outcomeReason: string;
  redFlagTriggered: boolean;
  redFlags?: Array<{ code: string; description: string; message: string }>;
  pharmacyEligible: boolean;
  summaryText: string;
  safetyNetAdvice?: string;
  pharmacyTreatmentOptions?: string[];
  selfCareAdvice?: string;
}
