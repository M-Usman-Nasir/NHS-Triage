import { StyleSheet, Text, View } from "react-native";
import type { PathwayQuestion } from "../lib/pathwayQuestions";
import { COLORS, RADII, TYPOGRAPHY } from "../lib/theme";

type Props = {
  question: PathwayQuestion;
  children: React.ReactNode;
};

export function ClinicalQuestionCard({ question, children }: Props) {
  const helper = question.helperText ?? question.clinicalNote;

  return (
    <View style={s.card}>
      <Text style={s.qTitle}>{question.text}</Text>
      {helper ? <Text style={s.helper}>{helper}</Text> : null}
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    marginTop: 10,
    padding: 12,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  qTitle: { ...TYPOGRAPHY.heading, fontSize: 18, lineHeight: 24 },
  helper: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 6, lineHeight: 20 },
});
