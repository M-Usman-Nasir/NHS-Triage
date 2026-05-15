import type { PathwayQuestion } from "./pathwayQuestions";

export type RedFlagTier = "emergency_999" | "urgent_care" | "gp";

export type RedFlagChecklistItem = {
  id: string;
  label: string;
  linkedQuestionId?: string;
  tier: RedFlagTier;
};

export type QuestionGraphNode = {
  next?: string | null;
  branches?: { condition: string | boolean; next: string | null }[];
};

export type QuestionGraph = {
  startId: string;
  nodes: Record<string, QuestionGraphNode>;
};

export type PathwayBundle = {
  pathway: string;
  label: string;
  questions: PathwayQuestion[];
  questionGraph?: QuestionGraph;
  redFlagChecklist: RedFlagChecklistItem[];
  redFlags?: { code: string; condition: string; outcome: string; message: string }[];
  emergencyOverrides?: { code: string; condition: string; outcome: string; message: string }[];
  outcomeRules?: { priority: number; condition: string; outcome: string; reason?: string }[];
  eligibilityRules?: { id?: string; condition: string; eligible: boolean; reason?: string }[];
};
