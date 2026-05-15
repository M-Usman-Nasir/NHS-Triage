import type { PatientConsentRecord } from "./complianceContent";

let activeConsent: PatientConsentRecord | null = null;

export function setConsultationConsent(consent: PatientConsentRecord): void {
  activeConsent = consent;
}

export function getConsultationConsent(): PatientConsentRecord | null {
  return activeConsent;
}

export function clearConsultationConsent(): void {
  activeConsent = null;
}
