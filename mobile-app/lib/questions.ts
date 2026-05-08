export type Q = {
  id: string;
  text: string;
  type: "boolean" | "select";
  options?: string[];
};

export const PREFACE_QUESTIONS: Q[] = [
  {
    id: "_ctx_impact",
    text: "How much are your symptoms affecting what you can do today?",
    type: "select",
    options: [
      "Little - I can do most things",
      "Moderate - some activities are difficult",
      "A lot - I need to rest or stay home",
      "Prefer not to say",
    ],
  },
  {
    id: "_ctx_first_episode",
    text: "Have you had this kind of problem before?",
    type: "select",
    options: ["First time", "Yes - similar before", "Not sure", "Prefer not to say"],
  },
];

export const CLINICAL_QUESTIONS: Q[] = [
  { id: "q1", text: "How long have urinary symptoms been present?", type: "select", options: ["Less than 24 hours", "1-3 days", "4-7 days", "More than 7 days"] },
  { id: "q2", text: "Do you have burning or pain when passing urine?", type: "boolean" },
  { id: "q3", text: "Do you need to pass urine more often than usual?", type: "boolean" },
];
