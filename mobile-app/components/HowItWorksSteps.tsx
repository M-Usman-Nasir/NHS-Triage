import { StyleSheet, Text, View } from "react-native";
import { SPACING } from "../lib/spacing";
import { COLORS, TYPOGRAPHY } from "../lib/theme";

type Props = {
  hint?: string;
};

const STEPS: { step: string; title: string }[] = [
  { step: "1", title: "Choose symptoms" },
  { step: "2", title: "Answer questions" },
  { step: "3", title: "Get advice" },
];

export function HowItWorksSteps({ hint }: Props) {
  return (
    <View style={s.wrap} accessibilityLabel="How it works">
      <View style={s.row}>
        {STEPS.map(({ step, title }) => (
          <View
            key={step}
            style={s.cell}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`Step ${step}: ${title}`}
          >
            <View style={s.stepBadge}>
              <Text style={s.stepNum}>{step}</Text>
            </View>
            <Text style={s.stepTitle}>{title}</Text>
          </View>
        ))}
      </View>
      {hint ? <Text style={s.hint}>{hint}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: SPACING.md },
  row: { flexDirection: "row", gap: SPACING.xs },
  cell: { flex: 1, alignItems: "center", minWidth: 0 },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.nhsBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: { fontSize: 12, fontWeight: "700", color: COLORS.surface },
  stepTitle: {
    ...TYPOGRAPHY.caption,
    marginTop: 6,
    textAlign: "center",
    color: COLORS.textPrimary,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
  },
  hint: { ...TYPOGRAPHY.caption, marginTop: SPACING.sm, textAlign: "center" },
});
