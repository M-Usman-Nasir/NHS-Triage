export type PathwayCategoryId = "urinary" | "ent" | "skin";

export type PathwayCategoryMeta = {
  id: PathwayCategoryId;
  title: string;
  order: number;
};

export type PatientPathwayMeta = {
  code: string;
  label: string;
  fullLabel: string;
  description: string;
  categoryId: PathwayCategoryId;
};

export const PATHWAY_CATEGORIES: Record<PathwayCategoryId, PathwayCategoryMeta> = {
  urinary: { id: "urinary", title: "Urinary symptoms", order: 1 },
  ent: { id: "ent", title: "Ear, nose and throat", order: 2 },
  skin: { id: "skin", title: "Skin and rashes", order: 3 },
};

export const PATIENT_PATHWAYS: PatientPathwayMeta[] = [
  {
    code: "uti",
    label: "UTI",
    fullLabel: "Urinary Tract Infection",
    description: "Painful or frequent urination",
    categoryId: "urinary",
  },
  {
    code: "sore_throat",
    label: "Sore Throat",
    fullLabel: "Sore Throat",
    description: "Throat pain, difficulty swallowing",
    categoryId: "ent",
  },
  {
    code: "sinusitis",
    label: "Sinusitis",
    fullLabel: "Sinusitis",
    description: "Blocked nose, facial pressure",
    categoryId: "ent",
  },
  {
    code: "otitis_media",
    label: "Ear Infection",
    fullLabel: "Ear Infection",
    description: "Ear pain, discharge",
    categoryId: "ent",
  },
  {
    code: "insect_bites",
    label: "Insect Bite",
    fullLabel: "Infected Insect Bite",
    description: "Redness, swelling at bite site",
    categoryId: "skin",
  },
  {
    code: "impetigo",
    label: "Impetigo",
    fullLabel: "Impetigo",
    description: "Crusty, golden sores on skin",
    categoryId: "skin",
  },
  {
    code: "shingles",
    label: "Shingles",
    fullLabel: "Shingles",
    description: "Painful rash on one side",
    categoryId: "skin",
  },
];

export type PathwaysByCategory = {
  category: PathwayCategoryMeta;
  pathways: PatientPathwayMeta[];
};

/** Pathways grouped by clinical category, sorted by category order. */
export function pathwaysGroupedByCategory(): PathwaysByCategory[] {
  const sortedCategories = Object.values(PATHWAY_CATEGORIES).sort((a, b) => a.order - b.order);
  return sortedCategories.map((category) => ({
    category,
    pathways: PATIENT_PATHWAYS.filter((p) => p.categoryId === category.id),
  }));
}

/** Symptom-step codes from `symptomSelection` that are not full pathway rows on the home list */
const SYMPTOM_STEP_LABELS: Record<string, string> = {
  cough: "Cough",
  fever: "Fever",
  blocked_nose: "Blocked nose",
  ear_pain: "Ear pain",
  other: "Other",
};

/** Human-readable label for a home pathway code or symptom-selection id */
export function labelForPatientSelectionCode(code: string): string {
  const pathway = PATIENT_PATHWAYS.find((p) => p.code === code);
  if (pathway) return pathway.fullLabel;
  const symptom = SYMPTOM_STEP_LABELS[code];
  if (symptom) return symptom;
  return code.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
}
