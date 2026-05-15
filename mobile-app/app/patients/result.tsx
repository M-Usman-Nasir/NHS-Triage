import { CommonActions, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import type { RootStackParamList } from "../../App";
import { SafeAreaView } from "react-native-safe-area-context";
import { OutcomeView } from "../../components/OutcomeView";
import { SecondaryButton } from "../../components/SecondaryButton";
import { buildOutcomeSummary } from "../../lib/buildOutcomeSummary";
import { normalizeOutcome } from "../../lib/outcomePresentation";
import { SPACING } from "../../lib/spacing";
import { COLORS, TYPOGRAPHY } from "../../lib/theme";

function parseJsonArray(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function parseAnswersSnapshot(raw: string | undefined): Record<string, unknown> | undefined {
  if (!raw) return undefined;
  try {
    const v = JSON.parse(raw) as unknown;
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}

export default function ResultPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "Result">>();
  const refId = route.params?.id;
  const refIds = route.params?.ids;
  const outcome = normalizeOutcome(route.params?.outcome);
  const pathwayCodes = (route.params?.pathwayCodes ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const reasoningSteps = parseJsonArray(route.params?.reasoningSteps);
  const answers = parseAnswersSnapshot(route.params?.answersSnapshot);

  const summary = buildOutcomeSummary({
    pathwayCodes,
    answers,
    outcome,
    api: {
      outcomeReason: route.params?.outcomeReason,
      reasoningSteps,
      referralInstruction: route.params?.actionLine,
      redFlagTriggered: answers?._rf_none !== true && reasoningSteps.some((s) =>
        s.toLowerCase().includes("red flag"),
      ),
    },
  });

  if (route.params?.actionLine) {
    summary.actionLine = route.params.actionLine;
  }

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.pageInset}>
        <OutcomeView
          headline={summary.headline}
          reasoningLine={summary.reasoningLine}
          actionLine={summary.actionLine}
          outcome={outcome}
          onFindPharmacy={summary.showFindPharmacy ? () => navigation.push("FindPharmacy") : undefined}
          referenceId={refId}
          referenceIds={refIds}
          footer={
            <>
              {refId ? (
                <Pressable
                  style={s.privacyLink}
                  onPress={() => navigation.push("DataPrivacy", { consultationId: refId })}
                  accessibilityRole="link"
                >
                  <Text style={s.privacyLinkText}>View your data & activity log</Text>
                </Pressable>
              ) : null}
              <SecondaryButton
                label="Start a new consultation"
                onPress={() =>
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: "Patients" }],
                    }),
                  )
                }
                style={s.linkButton}
              />
            </>
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  pageInset: {
    flexGrow: 1,
    paddingTop: SPACING.screenInset,
    paddingBottom: SPACING.screenInset,
    paddingLeft: SPACING.screenInset,
    paddingRight: SPACING.screenInset,
  },
  privacyLink: { marginTop: 20, paddingVertical: 8 },
  privacyLinkText: { ...TYPOGRAPHY.caption, fontWeight: "600", textDecorationLine: "underline", color: COLORS.textPrimary },
  linkButton: { marginTop: 12 },
});
