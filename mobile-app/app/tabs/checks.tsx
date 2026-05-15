import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "../../components/Card";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { SPACING } from "../../lib/spacing";
import { COLORS, TYPOGRAPHY } from "../../lib/theme";

/** UI-only shape; replace with API rows when backend exists. */
export type MockSymptomCheck = {
  id: string;
  pathwayCode: string;
  pathwayLabel: string;
  completedAt: string;
  outcomeCode: string;
  outcomeLabel: string;
  status: "completed" | "draft";
  consultationId?: string;
  followUpSummary?: string;
};

const MOCK_SYMPTOM_CHECKS: MockSymptomCheck[] = [
  {
    id: "chk-001",
    pathwayCode: "uti",
    pathwayLabel: "UTI",
    completedAt: "2026-05-12T14:20:00Z",
    outcomeCode: "pharmacy",
    outcomeLabel: "Pharmacy",
    status: "completed",
    consultationId: "c0000001-0000-0000-0000-000000000001",
    followUpSummary: "Visit a pharmacy today if symptoms persist after self-care.",
  },
  {
    id: "chk-002",
    pathwayCode: "sore_throat",
    pathwayLabel: "Sore throat",
    completedAt: "2026-05-10T09:05:00Z",
    outcomeCode: "gp",
    outcomeLabel: "GP",
    status: "completed",
    consultationId: "c0000001-0000-0000-0000-000000000002",
    followUpSummary: "Book a GP appointment within 48 hours if fever worsens.",
  },
  {
    id: "chk-003",
    pathwayCode: "shingles",
    pathwayLabel: "Shingles",
    completedAt: "2026-05-08T16:40:00Z",
    outcomeCode: "pharmacy",
    outcomeLabel: "Urgent pharmacy",
    status: "completed",
    followUpSummary: "Antiviral window — attend pharmacy same day (demo copy).",
  },
  {
    id: "chk-004",
    pathwayCode: "sinusitis",
    pathwayLabel: "Sinusitis",
    completedAt: "2026-05-01T11:00:00Z",
    outcomeCode: "self_care",
    outcomeLabel: "Self-care",
    status: "completed",
    followUpSummary: "Saline rinse and OTC relief; review if symptoms exceed 10 days.",
  },
];

const MOCK_FOLLOW_UPS: { id: string; title: string; detail: string }[] = [
  {
    id: "fu-1",
    title: "UTI follow-up",
    detail: "If burning urination returns within 2 weeks, start a new check or contact your GP.",
  },
  {
    id: "fu-2",
    title: "Pharmacy visit",
    detail: "Bring any previous summary IDs when you speak to a pharmacist (demo).",
  },
];

function outcomeChipStyle(code: string): { bg: string; text: string; border: string } {
  if (code === "emergency_999") return { bg: COLORS.errorBg, text: COLORS.error, border: COLORS.border };
  if (code === "gp" || code === "urgent_care") return { bg: COLORS.warningBg, text: COLORS.warning, border: COLORS.border };
  return { bg: COLORS.surface, text: COLORS.textSecondary, border: COLORS.border };
}

function formatCompletedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChecksPage() {
  const navigation = useNavigation<any>();
  const checks = MOCK_SYMPTOM_CHECKS;

  return (
    <Screen>
      <View style={s.bottomPad}>
        <Text style={s.title}>My checks</Text>
        <Text style={s.subtitle}>
          Completed symptom checks and suggested next steps (demo data).
        </Text>

        {checks.length === 0 ? (
          <Card style={s.emptyCard}>
            <Text style={s.emptyTitle}>No checks yet</Text>
            <Text style={s.emptyBody}>When you finish a consultation, it will appear here.</Text>
            <PrimaryButton
              label="Start from Home"
              onPress={() => navigation.navigate("Home", { screen: "Patients" })}
              style={s.primaryCta}
            />
          </Card>
        ) : (
          <>
            <Text style={s.sectionLabel}>Recent</Text>
            {checks.map((row) => {
              const chip = outcomeChipStyle(row.outcomeCode);
              return (
                <Card key={row.id} style={s.rowCard}>
                  <View style={s.rowTop}>
                    <View style={s.rowMain}>
                      <Text style={s.rowTitle}>{row.pathwayLabel}</Text>
                      <Text style={s.rowMeta}>{formatCompletedAt(row.completedAt)}</Text>
                    </View>
                    <View style={[s.chip, { backgroundColor: chip.bg, borderColor: chip.border }]}>
                      <Text style={[s.chipText, { color: chip.text }]}>{row.outcomeLabel}</Text>
                    </View>
                  </View>
                  {row.followUpSummary ? <Text style={s.followUp}>{row.followUpSummary}</Text> : null}
                  {row.consultationId ? (
                    <Text style={s.ref} accessibilityLabel="Consultation reference">
                      Ref: {row.consultationId}
                    </Text>
                  ) : null}
                  <Text style={s.statusText}>
                    {row.status === "completed" ? "Completed" : "Draft"}
                  </Text>
                </Card>
              );
            })}

            <Text style={[s.sectionLabel, s.sectionSpaced]}>Suggested follow-ups</Text>
            {MOCK_FOLLOW_UPS.map((fu) => (
              <Card key={fu.id} style={s.followCard}>
                <Text style={s.followTitle}>{fu.title}</Text>
                <Text style={s.followDetail}>{fu.detail}</Text>
              </Card>
            ))}

            <Pressable style={s.linkCta} onPress={() => navigation.navigate("Home", { screen: "Patients" })}>
              <Text style={s.linkCtaText}>Start another check</Text>
            </Pressable>
          </>
        )}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  bottomPad: { paddingBottom: 96, gap: SPACING.sm },
  title: { ...TYPOGRAPHY.title },
  subtitle: { ...TYPOGRAPHY.caption, marginBottom: SPACING.xs },
  sectionLabel: { ...TYPOGRAPHY.label, marginTop: SPACING.sm },
  sectionSpaced: { marginTop: SPACING.lg },
  rowCard: { gap: SPACING.sm },
  rowTop: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.md },
  rowMain: { flex: 1, minWidth: 0 },
  rowTitle: { ...TYPOGRAPHY.heading, fontSize: 16 },
  rowMeta: { ...TYPOGRAPHY.caption, marginTop: 2 },
  chip: {
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  chipText: { fontSize: 12, fontWeight: "600" },
  followUp: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary },
  ref: { fontSize: 12, color: COLORS.textMuted },
  statusText: { ...TYPOGRAPHY.caption, fontWeight: "600" },
  followCard: { gap: 4 },
  followTitle: { fontSize: 15, fontWeight: "600", color: COLORS.textPrimary },
  followDetail: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary },
  primaryCta: { marginTop: SPACING.md },
  linkCta: { alignItems: "center", paddingVertical: SPACING.md },
  linkCtaText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: "600" },
  emptyCard: { alignItems: "center", marginTop: SPACING.md, gap: SPACING.sm },
  emptyTitle: { ...TYPOGRAPHY.heading, fontSize: 18 },
  emptyBody: { ...TYPOGRAPHY.caption, textAlign: "center" },
});
