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

export interface DecisionPayload {
  code: string;
  label: string;
  urgency?: string;
  title?: string;
}

export interface ReasoningPayload {
  steps: string[];
  clinicalBasis?: string[];
  engine?: {
    source?: string;
    ruleIdsMatched?: string[];
    governanceUncertainty?: string[];
  };
}

export interface ReferralRecommendationPayload {
  service: string;
  instruction: string;
  actions: string[];
  escalationSafetyNet: string[];
  contact?: {
    type: string;
    value: string;
  };
}

export interface NearbyOptionPayload {
  type: 'self_care' | 'pharmacy' | 'gp' | 'urgent_care' | 'hospital' | 'emergency_999';
  name: string;
  distanceKm: number;
  address: string;
  phone: string;
  openNow: boolean;
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
  explanation?: {
    decision: string;
    reason: string;
    source?: string;
  };
  decision?: DecisionPayload;
  reasoning?: ReasoningPayload;
  referralRecommendation?: ReferralRecommendationPayload;
  nearbyOptions?: NearbyOptionPayload[];
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
  explanation?: {
    decision: string;
    reason: string;
    source?: string;
  };
  decision?: DecisionPayload;
  reasoning?: ReasoningPayload;
  referralRecommendation?: ReferralRecommendationPayload;
  nearbyOptions?: NearbyOptionPayload[];
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
