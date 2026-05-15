/** Patient-readable labels for backend audit event types. */

const LABELS: Record<string, string> = {
  patient_consent_recorded: "You gave consent to proceed",
  consultation_started: "Your check started",
  consultation_completed: "Your check was completed",
  system_decision_emitted: "A care recommendation was generated",
  red_flag_triggered: "A safety alert was raised",
  gdpr_subject_access_export: "You viewed your data summary",
  gdpr_erasure_requested: "You requested erasure of this consultation",
};

export function labelForAuditEvent(eventType: string): string {
  return LABELS[eventType] ?? "System activity recorded";
}

export type PatientAuditEntry = {
  id: string;
  event_type: string;
  created_at: string;
  label: string;
};

export function mapAuditTrail(
  rows: { id: string; event_type: string; created_at: string }[],
): PatientAuditEntry[] {
  return rows.map((row) => ({
    ...row,
    label: labelForAuditEvent(row.event_type),
  }));
}
