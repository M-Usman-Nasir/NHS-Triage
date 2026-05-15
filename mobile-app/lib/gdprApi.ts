import { apiFetch, apiUrl } from "./api";
import type { PatientAuditEntry } from "./auditEventLabels";
import { mapAuditTrail } from "./auditEventLabels";

export type SubjectAccessExport = {
  exportGeneratedAt: string;
  consultation: Record<string, unknown>;
  auditTrail: PatientAuditEntry[];
  notices: string[];
};

export async function fetchSubjectAccess(consultationId: string): Promise<SubjectAccessExport> {
  const res = await apiFetch(apiUrl(`/api/gdpr/subject-access/${encodeURIComponent(consultationId)}`));
  const data = (await res.json()) as SubjectAccessExport & { error?: string };
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Could not load your data.");
  }
  return {
    ...data,
    auditTrail: mapAuditTrail(
      (data.auditTrail ?? []).map((row) => ({
        id: row.id,
        event_type: row.event_type,
        created_at: row.created_at,
      })),
    ),
  };
}

export async function requestErasure(consultationId: string): Promise<{ message: string; removed: boolean }> {
  const res = await apiFetch(apiUrl("/api/gdpr/erasure-request"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ consultationId }),
  });
  const data = (await res.json()) as { message?: string; removed?: boolean; error?: string };
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Erasure request failed.");
  }
  return {
    message: data.message ?? "Request recorded.",
    removed: Boolean(data.removed),
  };
}
