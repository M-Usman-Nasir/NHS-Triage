export const CONSENT_COPY_VERSION = "2026-04-27.v1";

export const CONSENT_CHECKBOX_LABEL =
  "I understand and consent to proceeding with this consultation.";

export const PRIVACY_LINK_LABEL = "Privacy notice";
export const TERMS_LINK_LABEL = "Terms";

export const CDS_DISCLAIMER =
  "Clinical decision support only. Always follow advice from a qualified healthcare professional.";

export const MOCK_DATA_DISCLOSURE =
  "Working without a connection — your answers stay on this device while we use built-in clinical checks.";

export const DATA_PROCESSING_PURPOSE =
  "We use your answers to run a structured symptom check and suggest an appropriate next step (such as self-care, pharmacy, GP, or urgent care). We do not use your data for advertising.";

export const DATA_MINIMISATION_POINTS = [
  "Only questions required for the symptom check you chose",
  "Optional free-text symptoms if you choose to add them",
  "Basic details (such as age and gender) only where safety rules need them",
  "No sale of data to third-party marketers",
] as const;

export const DATA_SECURITY_POINTS = [
  "In transit: use a secure connection (HTTPS) when the live service is available",
  "On your device: answers stay in the app until you submit or leave the check",
  "On our systems: access is logged for safety and audit; we do not use your data for ads",
] as const;

export const LAWFUL_BASIS_SUMMARY =
  "For this demo, we rely on your consent when you tick the box and start a check. Health-related answers are special category data — a production NHS deployment must document the Article 9 condition and complete a DPIA.";

export const PATIENT_RIGHTS = [
  "Right of access — see what we hold about your consultation",
  "Right to rectification — via the organisation holding your record",
  "Right to erasure — subject to clinical and legal retention requirements",
  "Right to object or restrict processing — contact the data controller",
  "Right to complain to the ICO (ico.org.uk)",
] as const;

export const ERASURE_RETENTION_NOTE =
  "Removing your consultation from the active demo store does not delete immutable audit records that may be kept under retention policy in production.";

export const PRIVACY_NOTICE_SECTIONS = [
  {
    title: "Who we are",
    body:
      "Care Path provides this app as a demonstration of structured, rule-based clinical triage (clinical decision support). The data controller for any live deployment will be the commissioning organisation.",
  },
  {
    title: "What we process",
    body:
      "Pathway selection, your answers to clinical questions, optional demographics, optional free-text symptoms, and technical metadata (timestamps, consultation reference ID) for audit and support.",
  },
  {
    title: "Why we process it (lawful basis)",
    body: LAWFUL_BASIS_SUMMARY,
  },
  {
    title: "How long we keep it",
    body:
      "Retention is configured by the deploying organisation. The demo may store consultations in memory for the lifetime of the server process. You can request erasure for a known consultation reference in development environments.",
  },
  {
    title: "Who receives your data",
    body:
      "Outputs are designed to be shared only with appropriate care settings you choose in the real world (for example a pharmacist or GP). This demo does not send data to the NHS Spine or third-party advertising networks.",
  },
  {
    title: "Your rights (UK GDPR)",
    body: PATIENT_RIGHTS.map((r) => `• ${r}`).join("\n"),
  },
  {
    title: "International transfers",
    body:
      "Production systems should be hosted in the UK or EEA with appropriate safeguards. Configure hosting and subprocessors per organisational policy.",
  },
  {
    title: "Security measures",
    body: DATA_SECURITY_POINTS.map((p) => `• ${p}`).join("\n"),
  },
  {
    title: "Clinical safety and regulatory boundaries",
    body:
      "This software does not diagnose disease, does not prescribe, and does not replace a regulated clinician or pharmacist.",
  },
] as const;

export type PatientConsentRecord = {
  version: string;
  consentedAt: string;
};

export function createConsentRecord(): PatientConsentRecord {
  return {
    version: CONSENT_COPY_VERSION,
    consentedAt: new Date().toISOString(),
  };
}
