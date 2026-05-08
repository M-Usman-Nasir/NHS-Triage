export type PatientPathwayMeta = {
  code: string;
  label: string;
  fullLabel: string;
  description: string;
};

export const PATIENT_PATHWAYS: PatientPathwayMeta[] = [
  { code: "uti", label: "UTI", fullLabel: "Urinary Tract Infection", description: "Painful or frequent urination" },
  { code: "sore_throat", label: "Sore Throat", fullLabel: "Sore Throat", description: "Throat pain, difficulty swallowing" },
  { code: "sinusitis", label: "Sinusitis", fullLabel: "Sinusitis", description: "Blocked nose, facial pressure" },
  { code: "otitis_media", label: "Ear Infection", fullLabel: "Ear Infection", description: "Ear pain, discharge" },
  { code: "insect_bites", label: "Insect Bite", fullLabel: "Infected Insect Bite", description: "Redness, swelling at bite site" },
  { code: "impetigo", label: "Impetigo", fullLabel: "Impetigo", description: "Crusty, golden sores on skin" },
  { code: "shingles", label: "Shingles", fullLabel: "Shingles", description: "Painful rash on one side" },
];
