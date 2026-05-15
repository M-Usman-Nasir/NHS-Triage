import type { PatientConsentRecord } from "../lib/complianceContent";

/** Values collected in the patient questionnaire (serialised to JSON). */
export type AnswerValue = string | boolean | string[] | number;

export interface ConsultationSubmitPayload {
  pathwayCode: string;
  answers: Record<string, AnswerValue>;
  patient: { fullName: string; age: number; gender: string };
  symptoms: string[];
  consent?: PatientConsentRecord;
}
