/**
 * Static payloads for in-browser API mocks (CRM + admin) when no backend is connected.
 */

export const MOCK_CRM_DASHBOARD = {
  kpis: {
    totalPatients: 10,
    openCases: 4,
    criticalCases: 1,
    overdueTasks: 1,
    pendingTasks: 5,
    highRiskPatients: 1,
    totalProviders: 4,
    totalCommunications: 6,
  },
  casesByStage: { new: 1, in_review: 1, treated: 2, escalated: 1, closed: 1 },
  outcomeBreakdown: { self_care: 1, pharmacy: 2, gp: 2, urgent_care: 0, emergency_999: 1 },
  recentActivity: [
    { id: 1, time: '2026-04-21T13:05:00Z', type: 'case_opened', text: 'New case: David Chen — Impetigo GP Referral', colour: 'blue' },
    { id: 2, time: '2026-04-21T10:15:00Z', type: 'case_treated', text: 'Chloe Davies shingles case marked as Treated', colour: 'green' },
    { id: 3, time: '2026-04-21T08:55:00Z', type: 'comm_sent', text: 'Urgent email sent to Chloe Davies — shingles', colour: 'blue' },
    { id: 4, time: '2026-04-20T11:38:00Z', type: 'consultation', text: 'Consultation: Aisha Patel — Sore Throat (GP)', colour: 'yellow' },
    { id: 5, time: '2026-04-19T18:22:00Z', type: 'comm_received', text: 'Reply from Sarah Mitchell — UTI improving', colour: 'green' },
    { id: 6, time: '2026-04-16T14:08:00Z', type: 'red_flag', text: 'RED FLAG: James Parker — 999 emergency triggered', colour: 'red' },
  ],
};

export type MockPatientListItem = {
  id: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  postcode: string;
  phone: string;
  email: string;
  gpName: string;
  gpSurgery: string;
  nhsNumber: string;
  tags: string[];
  riskFlag: string | null;
  status: string;
  totalConsultations: number;
  lastContactDate: string | null;
  notes: string;
  createdAt: string;
};

export const MOCK_CRM_PATIENTS_ITEMS: MockPatientListItem[] = [
  { id: 'PAT-001', fullName: 'Sarah Mitchell', dateOfBirth: '1992-03-14', age: 33, gender: 'Female', postcode: 'SW1A 1AA', phone: '07700900001', email: 'sarah.mitchell@example.com', gpName: 'Dr. Helena Cross', gpSurgery: 'Pimlico Medical Centre', nhsNumber: '485 777 3456', tags: ['pharmacy_regular', 'uti_recurring'], riskFlag: null, status: 'active', totalConsultations: 3, lastContactDate: '2026-04-19', notes: '3 UTI consultations in 12 months.', createdAt: '2025-11-12' },
  { id: 'PAT-002', fullName: 'James Parker', dateOfBirth: '1951-11-22', age: 74, gender: 'Male', postcode: 'M1 1AE', phone: '07700900002', email: 'james.parker@example.com', gpName: 'Dr. Arjun Mehta', gpSurgery: 'Manchester Central Practice', nhsNumber: '312 445 9876', tags: ['high_risk', 'cardiac_history', 'red_flag_triggered'], riskFlag: 'HIGH', status: 'active', totalConsultations: 1, lastContactDate: '2026-04-16', notes: '999 referral 16 Apr. Cardiac.', createdAt: '2026-04-16' },
  { id: 'PAT-003', fullName: 'Aisha Patel', dateOfBirth: '1988-07-05', age: 37, gender: 'Female', postcode: 'B1 1BB', phone: '07700900003', email: 'aisha.patel@example.com', gpName: 'Dr. Mark Osei', gpSurgery: 'Brindleyplace Health Centre', nhsNumber: '621 334 0011', tags: ['gp_referred', 'sore_throat'], riskFlag: null, status: 'active', totalConsultations: 2, lastContactDate: '2026-04-20', notes: 'GP referral possible scarlet fever.', createdAt: '2026-01-08' },
  { id: 'PAT-004', fullName: 'Tom Henderson', dateOfBirth: '1975-01-30', age: 51, gender: 'Male', postcode: 'LS1 1AB', phone: '07700900004', email: 'tom.henderson@example.com', gpName: 'Dr. Fatima Nkosi', gpSurgery: 'Leeds City Health Centre', nhsNumber: '789 102 3344', tags: ['new_patient'], riskFlag: null, status: 'active', totalConsultations: 0, lastContactDate: null, notes: '', createdAt: '2026-04-21' },
  { id: 'PAT-005', fullName: 'Fatima Al-Hassan', dateOfBirth: '2000-09-18', age: 25, gender: 'Female', postcode: 'E1 6AN', phone: '07700900005', email: 'fatima.alhassan@example.com', gpName: 'Dr. Chen Wei', gpSurgery: 'Tower Hamlets GP Practice', nhsNumber: '543 221 8899', tags: [], riskFlag: null, status: 'active', totalConsultations: 1, lastContactDate: '2026-03-15', notes: 'Single sinusitis consultation.', createdAt: '2026-03-15' },
  { id: 'PAT-006', fullName: 'David Chen', dateOfBirth: '1965-06-12', age: 60, gender: 'Male', postcode: 'BS1 4DJ', phone: '07700900006', email: 'david.chen@example.com', gpName: 'Dr. Leila Thompson', gpSurgery: 'Bristol Central Surgery', nhsNumber: '876 543 2100', tags: ['diabetic', 'high_risk'], riskFlag: 'MEDIUM', status: 'active', totalConsultations: 2, lastContactDate: '2026-04-10', notes: 'Type 2 diabetic. Impetigo GP referral.', createdAt: '2025-09-01' },
  { id: 'PAT-007', fullName: 'Emma Wilson', dateOfBirth: '2001-04-25', age: 24, gender: 'Female', postcode: 'OX1 1NP', phone: '07700900007', email: 'emma.wilson@example.com', gpName: 'Dr. Singh Preethi', gpSurgery: 'Oxford Road Surgery', nhsNumber: '234 567 8901', tags: [], riskFlag: null, status: 'active', totalConsultations: 1, lastContactDate: '2026-04-18', notes: 'Mild sinusitis self-care.', createdAt: '2026-04-18' },
  { id: 'PAT-008', fullName: 'Robert Okafor', dateOfBirth: '1983-12-03', age: 42, gender: 'Male', postcode: 'NE1 7RU', phone: '07700900008', email: 'robert.okafor@example.com', gpName: 'Dr. Anna Reid', gpSurgery: 'Newcastle Quayside Practice', nhsNumber: '111 222 3334', tags: [], riskFlag: null, status: 'active', totalConsultations: 0, lastContactDate: null, notes: '', createdAt: '2026-04-21' },
  { id: 'PAT-009', fullName: 'Chloe Davies', dateOfBirth: '1995-08-17', age: 30, gender: 'Female', postcode: 'CF10 1EP', phone: '07700900009', email: 'chloe.davies@example.com', gpName: 'Dr. Evans Morgan', gpSurgery: 'Cardiff Bay Health Centre', nhsNumber: '999 888 7776', tags: ['urgent_treated', 'shingles'], riskFlag: null, status: 'active', totalConsultations: 1, lastContactDate: '2026-04-21', notes: 'Shingles antiviral dispensed.', createdAt: '2026-04-21' },
  { id: 'PAT-010', fullName: 'Mohammed Iqbal', dateOfBirth: '1970-02-08', age: 56, gender: 'Male', postcode: 'BB1 1AA', phone: '07700900010', email: 'mohammed.iqbal@example.com', gpName: 'Dr. Kavita Shah', gpSurgery: 'Blackburn Medical Practice', nhsNumber: '445 667 8890', tags: ['hypertensive'], riskFlag: 'MEDIUM', status: 'active', totalConsultations: 2, lastContactDate: '2026-04-05', notes: 'Hypertensive.', createdAt: '2025-12-20' },
];

const MOCK_PATIENT_FULL: Record<string, Record<string, unknown>> = {
  'PAT-001': {
    id: 'PAT-001',
    fullName: 'Sarah Mitchell',
    dateOfBirth: '1992-03-14',
    age: 33,
    gender: 'Female',
    postcode: 'SW1A 1AA',
    phone: '07700900001',
    email: 'sarah.mitchell@example.com',
    gpName: 'Dr. Helena Cross',
    gpSurgery: 'Pimlico Medical Centre',
    nhsNumber: '485 777 3456',
    preferredContact: 'email',
    tags: ['pharmacy_regular', 'uti_recurring'],
    riskFlag: null,
    status: 'active',
    totalConsultations: 3,
    lastContactDate: '2026-04-19',
    createdAt: '2025-11-12',
    notes:
      'Patient has had 3 UTI consultations in the past 12 months. Responded well to Nitrofurantoin. GP aware of recurrence pattern.',
    cases: [{ id: 'CASE-001', title: 'UTI — Pharmacy Referral', stage: 'treated', priority: 'medium', openedAt: '2026-04-19', outcome: 'pharmacy' }],
    communications: [
      { id: 'COMM-001', channel: 'email', direction: 'outbound', subject: 'Your pharmacy consultation summary — UTI', sentAt: '2026-04-19T14:35:00Z', status: 'delivered' },
      { id: 'COMM-005', channel: 'email', direction: 'inbound', subject: 'Re: Your pharmacy consultation summary — UTI', sentAt: '2026-04-19T18:22:00Z', status: 'received' },
    ],
    tasks: [{ id: 'TASK-001', title: 'Follow up — Sarah Mitchell UTI treatment response', dueDate: '2026-04-21', status: 'overdue', priority: 'medium' }],
  },
  'PAT-002': {
    id: 'PAT-002',
    fullName: 'James Parker',
    dateOfBirth: '1951-11-22',
    age: 74,
    gender: 'Male',
    postcode: 'M1 1AE',
    phone: '07700900002',
    email: 'james.parker@example.com',
    gpName: 'Dr. Arjun Mehta',
    gpSurgery: 'Manchester Central Practice',
    nhsNumber: '312 445 9876',
    preferredContact: 'phone',
    tags: ['high_risk', 'cardiac_history', 'red_flag_triggered'],
    riskFlag: 'HIGH',
    status: 'active',
    totalConsultations: 1,
    lastContactDate: '2026-04-16',
    createdAt: '2026-04-16',
    notes: 'Referred to 999 via red flag on 16 Apr 2026. Cardiac symptoms. Ensure GP follow-up after hospital discharge.',
    cases: [{ id: 'CASE-002', title: 'Cardiac Emergency — 999 Escalation', stage: 'escalated', priority: 'critical', openedAt: '2026-04-16', outcome: 'emergency_999' }],
    communications: [{ id: 'COMM-002', channel: 'sms', direction: 'outbound', subject: null, sentAt: '2026-04-16T14:08:00Z', status: 'delivered' }],
    tasks: [{ id: 'TASK-002', title: 'Hospital discharge follow-up — James Parker', dueDate: '2026-04-22', status: 'pending', priority: 'critical' }],
  },
};

export function getMockCrmPatientDetail(patientId: string): Record<string, unknown> | null {
  const full = MOCK_PATIENT_FULL[patientId];
  if (full) return { ...full };
  const row = MOCK_CRM_PATIENTS_ITEMS.find((p) => p.id === patientId);
  if (!row) return null;
  return {
    ...row,
    preferredContact: 'email',
    cases: [] as unknown[],
    communications: [] as unknown[],
    tasks: [] as unknown[],
  };
}

/** Pharmacy dashboard list — pharmacy outcome summaries (demo). */
export const MOCK_SUMMARY_LIST_FOR_PHARMACY = [
  {
    id: 'c0000001-0000-0000-0000-000000000001',
    patient: { fullName: 'Sarah Mitchell', age: 33, gender: 'Female' },
    pathway: 'uti',
    pathwayLabel: 'UTI',
    outcome: 'pharmacy',
    outcomeLabel: 'Pharmacy Referral',
    outcomeReason: 'Symptoms consistent with uncomplicated UTI and no red flags.',
    explanation: { decision: 'pharmacy', reason: 'Symptoms consistent with uncomplicated UTI and no red flags.', source: 'rule_engine' },
    createdAt: '2026-04-19T09:19:00Z',
    status: 'pending',
    symptoms: ['painful urination', 'frequency', 'lower abdominal pain'],
    answers: { q1: '1–3 days', q2: true },
    summaryText: 'Sarah Mitchell (F, 33). Mock pharmacy referral.',
    pharmacyTreatmentOptions: ['Trimethoprim 200mg BD x 7 days', 'Nitrofurantoin MR 100mg BD x 5 days'],
  },
  {
    id: 'c0000001-0000-0000-0000-000000000005',
    patient: { fullName: 'Chloe Davies', age: 30, gender: 'Female' },
    pathway: 'shingles',
    pathwayLabel: 'Shingles',
    outcome: 'pharmacy',
    outcomeLabel: 'Urgent Pharmacy Referral',
    outcomeReason: 'Within 72-hour treatment window and no exclusion red flags.',
    explanation: { decision: 'pharmacy', reason: 'Within 72-hour treatment window.', source: 'rule_engine' },
    createdAt: '2026-04-21T08:53:00Z',
    status: 'pending',
    symptoms: ['unilateral rash', 'blistering', 'burning pain'],
    answers: {},
    summaryText: 'Chloe Davies (F, 30). Mock urgent pharmacy.',
    pharmacyTreatmentOptions: ['Aciclovir 800mg 5x daily x 7 days'],
  },
];
