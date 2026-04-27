export interface CrmCase {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  pathway: string;
  outcome: string;
  stage: string;
  priority: string;
  assignedTo: string | null;
  openedAt: string;
  closedAt: string | null;
  notes: string;
  followUpDate: string | null;
}
