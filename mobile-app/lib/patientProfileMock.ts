export const PATIENT_PROFILE_MOCK = {
  name: "Sarah Mitchell",
  age: 33,
  dob: "1992-03-14",
  consultationHistory: [
    { id: "CONS-001", date: "2026-04-19", condition: "Uncomplicated UTI", outcome: "Pharmacy referral" },
    { id: "CONS-002", date: "2026-03-11", condition: "Sinusitis", outcome: "Self-care advice" },
  ],
  healthDetails: ["No known drug allergies", "Non-smoker", "No pregnancy red flags"],
  nhsConnections: [
    { key: "nhs_login", label: "NHS Login", status: "not_connected" },
    { key: "gp_connection", label: "GP Connection", status: "not_connected" },
    { key: "pharmacy_connection", label: "Pharmacy Connection", status: "not_connected" },
  ],
};
