// Keep in sync with frontend/lib/pathwayQuestions.ts

/**
 * Questionnaire definitions aligned with backend/data/pathways/*.json (ids, types, option strings).
 */

export interface PathwayQuestion {
  id: string;
  text: string;
  type: "boolean" | "select" | "text" | "multiselect";
  options?: string[];
  required: boolean;
  redFlagHint?: boolean;
}

export const PATHWAY_QUESTIONS: Record<string, PathwayQuestion[]> = {
  uti: [
    { id: "q1", text: "How long have urinary symptoms been present?", type: "select", options: ["Less than 24 hours", "1–3 days", "4–7 days", "More than 7 days"], required: true },
    { id: "q2", text: "Do you have burning or pain when passing urine?", type: "boolean", required: true },
    { id: "q3", text: "Do you need to pass urine more often than usual?", type: "boolean", required: true },
    { id: "q4", text: "Do you have sudden urgency to pass urine?", type: "boolean", required: true },
    { id: "q5", text: "Is your urine cloudy?", type: "boolean", required: true },
    { id: "q6", text: "Do you have blood visible in your urine?", type: "boolean", required: true },
    { id: "q7", text: "Are you pregnant or could you be pregnant?", type: "boolean", required: true },
    { id: "q8", text: "Are you breastfeeding?", type: "boolean", required: true },
    { id: "q9", text: "Do you have a urinary catheter?", type: "boolean", required: true },
    { id: "q10", text: "Have you had recurrent UTIs (3 or more in the last 12 months)?", type: "boolean", required: true },
    { id: "q11", text: "Do you have fever (temperature 38°C or above)?", type: "boolean", required: true, redFlagHint: true },
    { id: "q12", text: "Do you have pain in your back, side, or flank?", type: "boolean", required: true, redFlagHint: true },
    { id: "q13", text: "Are you vomiting?", type: "boolean", required: true, redFlagHint: true },
  ],
  sore_throat: [
    { id: "q1", text: "How long have symptoms been present?", type: "select", options: ["Less than 3 days", "3–7 days", "More than 7 days"], required: true },
    { id: "q2", text: "Do you have painful swallowing?", type: "boolean", required: true },
    { id: "q3", text: "Do you have difficulty breathing or trouble opening your mouth?", type: "boolean", required: true, redFlagHint: true },
    { id: "q4", text: "Have you had fever in the last 24 hours?", type: "boolean", required: true },
    { id: "q5", text: "Can you see pus or white spots on your tonsils?", type: "boolean", required: true },
    { id: "q6", text: "Do your tonsils or throat look severely inflamed?", type: "boolean", required: true },
    { id: "q7", text: "Have you coughed in the last 24 hours?", type: "boolean", required: true },
    { id: "q8", text: "Have you had recurrent tonsillitis in the past year?", type: "boolean", required: true },
    { id: "q9", text: "Have you had your tonsils removed (tonsillectomy)?", type: "boolean", required: true },
    { id: "q10", text: "Are you immunocompromised (for example due to treatment or a long-term condition)?", type: "boolean", required: true },
  ],
  sinusitis: [
    { id: "q1", text: "How long have you had sinus symptoms?", type: "select", options: ["Less than 10 days", "10 days to 12 weeks", "More than 12 weeks"], required: true },
    { id: "q2", text: "Do you have facial pain or pressure around your cheeks, forehead, or eyes?", type: "boolean", required: true },
    { id: "q3", text: "Do you have a blocked or runny nose?", type: "boolean", required: true },
    { id: "q4", text: "Do you have a severe headache?", type: "boolean", required: true },
    { id: "q5", text: "Do you have reduced or lost sense of smell?", type: "boolean", required: true },
    { id: "q6", text: "Do you have any visual changes, double vision, or eye swelling?", type: "boolean", required: true, redFlagHint: true },
    { id: "q7", text: "Do you have neurological symptoms (confusion, drowsiness, weakness, speech problems, neck stiffness, or light sensitivity)?", type: "boolean", required: true, redFlagHint: true },
    { id: "q8", text: "Have you had recurrent sinusitis episodes in the last year?", type: "select", options: ["No", "Yes"], required: true },
    { id: "q9", text: "Do you have high fever (38°C or above) or feel systemically very unwell?", type: "boolean", required: true },
  ],
  otitis_media: [
    { id: "q1", text: "How long has the ear pain been present?", type: "select", options: ["Less than 3 days", "3–7 days", "More than 7 days"], required: true },
    { id: "q2", text: "Is the child pulling at the ear or very irritable due to ear discomfort?", type: "boolean", required: true },
    { id: "q3", text: "Is there fever (38°C or above)?", type: "boolean", required: true },
    { id: "q4", text: "Is there reduced hearing in the affected ear?", type: "boolean", required: true },
    { id: "q5", text: "Do you have neck stiffness?", type: "boolean", required: true, redFlagHint: true },
    { id: "q6", text: "Do you have any facial weakness or drooping?", type: "boolean", required: true, redFlagHint: true },
    { id: "q7", text: "Do you have swelling or redness behind the ear?", type: "boolean", required: true, redFlagHint: true },
    { id: "q8", text: "Do you have severe headache?", type: "boolean", required: true, redFlagHint: true },
    { id: "q9", text: "Has there been ear discharge from a known perforated eardrum?", type: "boolean", required: true, redFlagHint: true },
    { id: "q10", text: "Have symptoms clearly worsened despite 48-72 hours of self-care?", type: "boolean", required: true },
  ],
  insect_bites: [
    { id: "q1", text: "When did the bite or sting happen?", type: "select", options: ["Within the last 24 hours", "1–3 days ago", "4–7 days ago", "More than 7 days ago"], required: true },
    { id: "q2", text: "Is the bite area red, warm, swollen, painful, or oozing?", type: "boolean", required: true },
    { id: "q3", text: "Is the redness spreading beyond the immediate bite area?", type: "boolean", required: true },
    { id: "q4", text: "Do you have fever (38°C or above) or feel systemically unwell?", type: "boolean", required: true },
    { id: "q5", text: "Is there a red line tracking up from the bite toward your body?", type: "boolean", required: true, redFlagHint: true },
    { id: "q6", text: "Do you have difficulty breathing, swelling of the face or throat, or a severe rash all over your body?", type: "boolean", required: true, redFlagHint: true },
    { id: "q7", text: "Did symptoms clearly worsen 48 hours after the bite or sting?", type: "boolean", required: true },
    { id: "q8", text: "Do you have confusion, severe shivering, very fast breathing, or other sepsis warning signs?", type: "boolean", required: true, redFlagHint: true },
  ],
  impetigo: [
    { id: "q1", text: "How long have you had the skin sores or rash?", type: "select", options: ["Less than 3 days", "3–7 days", "More than 7 days"], required: true },
    {
      id: "q2",
      text: "Where on your body are the sores? (Select all that apply)",
      type: "multiselect",
      options: ["Face", "Around the mouth/nose", "Arms or hands", "Legs", "Body/torso", "Widespread across multiple areas"],
      required: true,
    },
    { id: "q3", text: "Do the sores look crusty, golden/yellow coloured, or weeping?", type: "boolean", required: true },
    { id: "q4", text: "Are there fluid-filled blisters (bullous lesions)?", type: "boolean", required: true },
    { id: "q5", text: "Do you feel systemically unwell or have fever (38°C or above)?", type: "boolean", required: true },
    { id: "q6", text: "Are lesions rapidly spreading or worsening quickly?", type: "boolean", required: true },
    { id: "q7", text: "Do you have recurrent impetigo episodes?", type: "boolean", required: true },
    { id: "q8", text: "Roughly how many lesion clusters do you have?", type: "select", options: ["1", "2", "3", "4", "More than 4"], required: true },
  ],
  shingles: [
    { id: "q1", text: "When did the rash first appear?", type: "select", options: ["Today (within 24 hours)", "1–2 days ago", "3 days ago", "4–7 days ago", "More than 7 days ago"], required: true },
    { id: "q2", text: "Is the rash only on ONE side of your body?", type: "boolean", required: true },
    { id: "q3", text: "Where is the rash located?", type: "select", options: ["Torso / chest / back", "Face or forehead", "Around one eye", "Scalp", "Arm or leg"], required: true },
    { id: "q4", text: "Do you have pain, burning, or tingling in the same area as the rash?", type: "boolean", required: true },
    { id: "q5", text: "Is the rash near or around your eye?", type: "boolean", required: true, redFlagHint: true },
    { id: "q6", text: "Do you have any ear pain, hearing problems, or a rash inside your ear?", type: "boolean", required: true },
    { id: "q7", text: "Are you immunocompromised? (e.g. HIV, cancer treatment, on immunosuppressants)", type: "boolean", required: true },
    { id: "q8", text: "Are you pregnant?", type: "boolean", required: true },
  ],
};

export function isKnownPathwayQuestions(pathway: string): boolean {
  return Object.prototype.hasOwnProperty.call(PATHWAY_QUESTIONS, pathway);
}

/** Pathway question ids that ask about pregnancy — omitted in UI when gender is Male (binary list only). */
const PREGNANCY_QUESTION_ID_BY_PATHWAY: Record<string, string> = {
  uti: "q7",
  shingles: "q8",
};

/** Mirrors server questionGraph skip so offline/fallback flow matches API behaviour. */
export function pathwayClinicalQuestionsForPatient(
  pathwayCode: string,
  questions: PathwayQuestion[],
  gender: string,
): PathwayQuestion[] {
  if (gender !== "Male") return questions;
  const skipId = PREGNANCY_QUESTION_ID_BY_PATHWAY[pathwayCode];
  if (!skipId) return questions;
  return questions.filter((q) => q.id !== skipId);
}
