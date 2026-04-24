/**
 * Questionnaire definitions aligned with backend/data/pathways/*.json (ids, types, option strings).
 */

export interface PathwayQuestion {
  id: string;
  text: string;
  type: 'boolean' | 'select' | 'text' | 'multiselect';
  options?: string[];
  required: boolean;
  redFlagHint?: boolean;
}

export const PATHWAY_QUESTIONS: Record<string, PathwayQuestion[]> = {
  uti: [
    { id: 'q1', text: 'How long have you had these symptoms?', type: 'select', options: ['Less than 24 hours', '1–3 days', '4–7 days', 'More than 7 days'], required: true },
    { id: 'q2', text: 'Do you have blood in your urine?', type: 'boolean', required: true },
    { id: 'q3', text: 'Do you have a fever (temperature above 38°C)?', type: 'boolean', required: true },
    { id: 'q4', text: 'Do you have pain in your back or side (loin pain)?', type: 'boolean', required: true },
    { id: 'q5', text: 'Are you pregnant or could you be pregnant?', type: 'boolean', required: true },
    { id: 'q6', text: 'Do you have a urinary catheter?', type: 'boolean', required: true },
    { id: 'q7', text: 'Have you taken antibiotics for a UTI in the last 3 months?', type: 'boolean', required: true },
    { id: 'q8', text: 'Do you have any known kidney problems or recurring UTIs (3+ per year)?', type: 'boolean', required: true },
    { id: 'q9', text: 'Do you have any drug allergies? If yes, please specify.', type: 'text', required: false },
  ],
  sore_throat: [
    { id: 'q1', text: 'How long have you had a sore throat?', type: 'select', options: ['Less than 3 days', '3–7 days', 'More than 7 days'], required: true },
    { id: 'q2', text: 'Do you have difficulty swallowing?', type: 'boolean', required: true },
    { id: 'q3', text: 'Do you have difficulty breathing or opening your mouth fully?', type: 'boolean', required: true, redFlagHint: true },
    { id: 'q4', text: 'Do you have a fever (temperature above 38°C)?', type: 'boolean', required: true },
    { id: 'q5', text: 'Have you noticed a skin rash?', type: 'boolean', required: true },
    { id: 'q6', text: 'Do you have swollen glands in your neck?', type: 'boolean', required: true },
    { id: 'q7', text: 'Have you coughed in the last 24 hours?', type: 'boolean', required: true },
    { id: 'q8', text: 'Can you see any white patches or pus on your tonsils?', type: 'boolean', required: true },
  ],
  sinusitis: [
    { id: 'q1', text: 'How long have you had sinus symptoms?', type: 'select', options: ['Less than 10 days', '10 days to 12 weeks', 'More than 12 weeks'], required: true },
    { id: 'q2', text: 'Do you have facial pain or pressure around your cheeks, forehead, or eyes?', type: 'boolean', required: true },
    { id: 'q3', text: 'Do you have a blocked or runny nose?', type: 'boolean', required: true },
    { id: 'q4', text: 'Do you have a fever (temperature above 38°C)?', type: 'boolean', required: true },
    { id: 'q5', text: 'Do you have severe headache or pain that is worsening?', type: 'boolean', required: true },
    { id: 'q6', text: 'Do you have any visual changes, double vision, or eye swelling?', type: 'boolean', required: true, redFlagHint: true },
    { id: 'q7', text: 'Do you have neck stiffness or sensitivity to light?', type: 'boolean', required: true, redFlagHint: true },
    { id: 'q8', text: 'Have you had sinusitis before? How many times in the last year?', type: 'select', options: ['First time', '1–2 previous episodes', '3 or more previous episodes'], required: true },
    { id: 'q9', text: 'Do you have any dental pain or recent dental work?', type: 'boolean', required: false },
  ],
  otitis_media: [
    { id: 'q1', text: 'How long have you had ear pain?', type: 'select', options: ['Less than 3 days', '3–7 days', 'More than 7 days'], required: true },
    { id: 'q2', text: 'Do you have discharge coming from your ear?', type: 'boolean', required: true },
    { id: 'q3', text: 'Do you have a fever (temperature above 38°C)?', type: 'boolean', required: true },
    { id: 'q4', text: 'Do you have dizziness or problems with your balance?', type: 'boolean', required: true, redFlagHint: true },
    { id: 'q5', text: 'Do you have any facial weakness or drooping?', type: 'boolean', required: true, redFlagHint: true },
    { id: 'q6', text: 'Do you have swelling or redness behind the ear?', type: 'boolean', required: true, redFlagHint: true },
    { id: 'q7', text: 'Have you had any recent hearing loss in the affected ear?', type: 'boolean', required: true },
    { id: 'q8', text: 'Do you have a perforated eardrum (diagnosed previously)?', type: 'boolean', required: true },
  ],
  insect_bites: [
    { id: 'q1', text: 'When were you bitten?', type: 'select', options: ['Within the last 24 hours', '1–3 days ago', '4–7 days ago', 'More than 7 days ago'], required: true },
    { id: 'q2', text: 'Is the bite area red, swollen, warm, or oozing?', type: 'boolean', required: true },
    { id: 'q3', text: 'Is the redness spreading beyond the immediate bite area?', type: 'boolean', required: true },
    { id: 'q4', text: 'Do you have a fever (temperature above 38°C) or feel generally unwell?', type: 'boolean', required: true },
    { id: 'q5', text: 'Is there a red line tracking up from the bite toward your body?', type: 'boolean', required: true, redFlagHint: true },
    { id: 'q6', text: 'Do you have difficulty breathing, swelling of the face or throat, or a severe rash all over your body?', type: 'boolean', required: true, redFlagHint: true },
    { id: 'q7', text: 'Were you bitten while abroad (possible exotic tick or insect bite)?', type: 'boolean', required: true },
    { id: 'q8', text: 'Do you have any known allergies to antibiotics?', type: 'text', required: false },
  ],
  impetigo: [
    { id: 'q1', text: 'How long have you had the skin sores or rash?', type: 'select', options: ['Less than 3 days', '3–7 days', 'More than 7 days'], required: true },
    {
      id: 'q2',
      text: 'Where on your body are the sores? (Select all that apply)',
      type: 'multiselect',
      options: ['Face', 'Around the mouth/nose', 'Arms or hands', 'Legs', 'Body/torso', 'Widespread across multiple areas'],
      required: true,
    },
    { id: 'q3', text: 'Do the sores look crusty, golden/yellow coloured, or weeping?', type: 'boolean', required: true },
    { id: 'q4', text: 'Are there any fluid-filled blisters?', type: 'boolean', required: true },
    { id: 'q5', text: 'Do you have a fever (temperature above 38°C)?', type: 'boolean', required: true },
    { id: 'q6', text: 'Is the affected area rapidly spreading or getting larger quickly?', type: 'boolean', required: true },
    { id: 'q7', text: 'Do you have any conditions that affect your immune system (e.g. diabetes, cancer, HIV, on steroids)?', type: 'boolean', required: true },
    { id: 'q8', text: 'Are you pregnant?', type: 'boolean', required: true },
  ],
  shingles: [
    { id: 'q1', text: 'When did the rash first appear?', type: 'select', options: ['Today (within 24 hours)', '1–2 days ago', '3 days ago', 'More than 3 days ago'], required: true },
    { id: 'q2', text: 'Is the rash only on ONE side of your body?', type: 'boolean', required: true },
    { id: 'q3', text: 'Where is the rash located?', type: 'select', options: ['Torso / chest / back', 'Face or forehead', 'Around one eye', 'Scalp', 'Arm or leg'], required: true },
    { id: 'q4', text: 'Do you have pain, burning, or tingling in the same area as the rash?', type: 'boolean', required: true },
    { id: 'q5', text: 'Do you have any pain or changes in or around your eye?', type: 'boolean', required: true, redFlagHint: true },
    { id: 'q6', text: 'Do you have any ear pain, hearing problems, or a rash inside your ear?', type: 'boolean', required: true },
    { id: 'q7', text: 'Are you immunocompromised? (e.g. HIV, cancer treatment, on immunosuppressants)', type: 'boolean', required: true },
    { id: 'q8', text: 'Are you pregnant?', type: 'boolean', required: true },
  ],
};

export function isKnownPathwayQuestions(pathway: string): boolean {
  return Object.prototype.hasOwnProperty.call(PATHWAY_QUESTIONS, pathway);
}

/** Pathway question ids that ask about pregnancy — omitted in UI when gender is Male (binary list only). */
const PREGNANCY_QUESTION_ID_BY_PATHWAY: Record<string, string> = {
  uti: 'q5',
  impetigo: 'q8',
  shingles: 'q8',
};

/** Mirrors server questionGraph skip so offline/fallback flow matches API behaviour. */
export function pathwayClinicalQuestionsForPatient(
  pathwayCode: string,
  questions: PathwayQuestion[],
  gender: string,
): PathwayQuestion[] {
  if (gender !== 'Male') return questions;
  const skipId = PREGNANCY_QUESTION_ID_BY_PATHWAY[pathwayCode];
  if (!skipId) return questions;
  return questions.filter((q) => q.id !== skipId);
}
