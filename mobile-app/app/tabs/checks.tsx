import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { SPACING } from "../../lib/spacing";

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

const MOCK_FOLLOW_UPS: { id: string; title: string; detail: string; icon: string }[] = [
  {
    id: "fu-1",
    title: "UTI follow-up",
    detail: "If burning urination returns within 2 weeks, start a new check or contact your GP.",
    icon: "calendar-clock",
  },
  {
    id: "fu-2",
    title: "Pharmacy visit",
    detail: "Bring any previous summary IDs when you speak to a pharmacist (demo).",
    icon: "storefront-outline",
  },
];

function pathwayIcon(code: string): string {
  switch (code) {
    case "uti":
      return "water-outline";
    case "sore_throat":
      return "thermometer-low";
    case "shingles":
      return "flash-outline";
    case "sinusitis":
      return "head-flash-outline";
    case "impetigo":
      return "bandage";
    case "otitis_media":
      return "ear-hearing";
    case "insect_bites":
      return "bug-outline";
    default:
      return "stethoscope";
  }
}

function outcomeChipStyle(code: string): { bg: string; text: string; border: string } {
  if (code === "emergency_999") return { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" };
  if (code === "gp" || code === "urgent_care") return { bg: "#fffbeb", text: "#b45309", border: "#fde68a" };
  if (code === "self_care") return { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" };
  return { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" };
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
          Completed symptom checks and suggested next steps (demo data — not from your account yet).
        </Text>

        {checks.length === 0 ? (
          <View style={s.emptyCard}>
            <MaterialCommunityIcons name="clipboard-text-off-outline" size={40} color="#94a3b8" />
            <Text style={s.emptyTitle}>No checks yet</Text>
            <Text style={s.emptyBody}>When you finish a consultation, it will appear here.</Text>
            <Pressable style={s.primaryCta} onPress={() => navigation.navigate("Home", { screen: "Patients" })}>
              <Text style={s.primaryCtaText}>Start from Home</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={s.sectionLabel}>Recent</Text>
            {checks.map((row) => {
              const chip = outcomeChipStyle(row.outcomeCode);
              return (
                <View key={row.id} style={s.rowCard}>
                  <View style={s.rowTop}>
                    <View style={s.rowIconWrap}>
                      <MaterialCommunityIcons name={pathwayIcon(row.pathwayCode)} size={22} color="#2563eb" />
                    </View>
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
                  <View style={s.statusRow}>
                    <MaterialCommunityIcons
                      name={row.status === "completed" ? "check-circle" : "progress-clock"}
                      size={16}
                      color={row.status === "completed" ? "#16a34a" : "#64748b"}
                    />
                    <Text style={s.statusText}>{row.status === "completed" ? "Completed" : "Draft"}</Text>
                  </View>
                </View>
              );
            })}

            <Text style={[s.sectionLabel, s.sectionSpaced]}>Suggested follow-ups</Text>
            {MOCK_FOLLOW_UPS.map((fu) => (
              <View key={fu.id} style={s.followCard}>
                <MaterialCommunityIcons name={fu.icon} size={22} color="#475569" />
                <View style={s.followTextWrap}>
                  <Text style={s.followTitle}>{fu.title}</Text>
                  <Text style={s.followDetail}>{fu.detail}</Text>
                </View>
              </View>
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
  bottomPad: {
    paddingBottom: 96,
    gap: SPACING.sm,
  },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a" },
  subtitle: { fontSize: 14, color: "#64748b", lineHeight: 20, marginBottom: SPACING.xs },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: SPACING.sm,
  },
  sectionSpaced: { marginTop: SPACING.lg },
  rowCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  rowTop: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.md },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  rowMain: { flex: 1, minWidth: 0 },
  rowTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  rowMeta: { fontSize: 13, color: "#64748b", marginTop: 2 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  chipText: { fontSize: 12, fontWeight: "700" },
  followUp: { fontSize: 14, color: "#334155", lineHeight: 20 },
  ref: { fontSize: 12, color: "#94a3b8" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  statusText: { fontSize: 12, color: "#64748b", fontWeight: "600" },
  followCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: SPACING.lg,
  },
  followTextWrap: { flex: 1, gap: 4 },
  followTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  followDetail: { fontSize: 14, color: "#475569", lineHeight: 20 },
  primaryCta: {
    marginTop: SPACING.md,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryCtaText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  linkCta: { alignItems: "center", paddingVertical: SPACING.md },
  linkCtaText: { color: "#2563eb", fontSize: 15, fontWeight: "700" },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: SPACING.xxl,
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  emptyBody: { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 20 },
});
