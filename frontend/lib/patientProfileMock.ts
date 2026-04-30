export type NhsConnectionKey = 'nhs_login' | 'gp_connection' | 'pharmacy_connection';
export type NhsConnectionStatus = 'not_connected' | 'connected' | 'pending';

export interface NhsConnectionItem {
  key: NhsConnectionKey;
  label: string;
  status: NhsConnectionStatus;
  lastUpdated?: string;
}

export interface ConsultationHistoryItem {
  id: string;
  date: string;
  condition: string;
  outcome: string;
}

export interface PatientProfileView {
  name: string;
  age: number;
  dob: string;
  consultationHistory: ConsultationHistoryItem[];
  healthDetails: string[];
  nhsConnections: NhsConnectionItem[];
}

export const PATIENT_PROFILE_MOCK: PatientProfileView = {
  name: 'Sarah Mitchell',
  age: 33,
  dob: '1992-03-14',
  consultationHistory: [
    { id: 'CONS-001', date: '2026-04-19', condition: 'Uncomplicated UTI', outcome: 'Pharmacy referral' },
    { id: 'CONS-002', date: '2026-03-11', condition: 'Sinusitis', outcome: 'Self-care advice' },
  ],
  healthDetails: ['No known drug allergies', 'Non-smoker', 'No pregnancy red flags'],
  nhsConnections: [
    { key: 'nhs_login', label: 'NHS Login', status: 'not_connected' },
    { key: 'gp_connection', label: 'GP Connection', status: 'not_connected' },
    { key: 'pharmacy_connection', label: 'Pharmacy Connection', status: 'not_connected' },
  ],
};
