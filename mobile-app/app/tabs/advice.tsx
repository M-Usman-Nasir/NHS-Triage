import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OutcomeView } from "../../components/OutcomeView";
import { buildOutcomeSummary } from "../../lib/buildOutcomeSummary";
import { SPACING } from "../../lib/spacing";
import { COLORS, TYPOGRAPHY } from "../../lib/theme";

export default function AdvicePage() {
  const navigation = useNavigation<any>();

  const summary = buildOutcomeSummary({
    pathwayCodes: ["sore_throat"],
    answers: {
      _ctx_duration: "1-3 days",
      _ctx_severity: "Moderate",
      _rf_none: true,
    },
    outcome: "pharmacy",
    api: {
      reasoningSteps: ["sore throat", "no red flags", "symptoms for 1–3 days"],
      referralActions: ["Visit your nearest pharmacy today."],
    },
  });

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.container}>
        <Text style={s.pageTitle}>Example advice</Text>
        <OutcomeView
          headline={summary.headline}
          reasoningLine={summary.reasoningLine}
          actionLine={summary.actionLine}
          outcome="pharmacy"
          onFindPharmacy={() => navigation.navigate("Home", { screen: "FindPharmacy" })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm },
  container: { paddingHorizontal: SPACING.sm, paddingTop: SPACING.xs, paddingBottom: SPACING.xl },
  pageTitle: { ...TYPOGRAPHY.title, marginBottom: SPACING.md },
});
