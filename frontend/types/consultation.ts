/** Values collected in the patient questionnaire (serialised to JSON). */
export type AnswerValue = string | boolean | string[] | number;

export interface ConsultationSubmitPayload {
  pathwayCode: string;
  answers: Record<string, AnswerValue>;
  patient: { fullName: string; age: number; gender: string };
  symptoms: string[];
}

/** Machine-readable regulatory / intended-use block from GET /api/summary/:id */
export interface RegulatoryContextPayload {
  softwareVersion?: string;
  intendedPurpose?: string;
  ukGdpr?: { dataCategories?: string; lawfulBasisNote?: string };
  mhraSamDConsiderations?: {
    postureSummary?: string;
    notForDiagnosis?: boolean;
    notForPrescribing?: boolean;
    accountabilityRemainsWith?: string[];
  };
  pharmacyFirstAndPgd?: {
    alignment?: string;
    pgdSupply?: { performedBy?: string; systemRole?: string };
    complianceNotes?: string[];
  };
  clinicalSafetyToolkit?: { dcb0129StyleControls?: string; dsptNote?: string };
  pathwayCode?: string;
  dispositionOutcome?: string;
  pharmacyRoutingSuggested?: boolean;
  redFlagTriggered?: boolean;
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
  pathwayPatientDisclaimer?: string | null;
  safetyNetAdvice?: string | null;
  pharmacyTreatmentOptions?: string[] | null;
  selfCareAdvice?: string | null;
  status?: string;
  patientExplanation?: string;
  comorbidityModifiersApplied?: Array<{ id: string; blockPharmacy?: boolean; reason?: string; patientExplanationAppend?: string }>;
  governanceUncertainty?: string[];
  regulatoryContext?: RegulatoryContextPayload;
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
  pathwayPatientDisclaimer?: string;
  safetyNetAdvice?: string;
  pharmacyTreatmentOptions?: string[];
  selfCareAdvice?: string;
  patientExplanation?: string;
  comorbidityModifiersApplied?: Array<{ id: string; blockPharmacy?: boolean; reason?: string; patientExplanationAppend?: string }>;
  governanceUncertainty?: string[];
  regulatoryContext?: RegulatoryContextPayload;
}
