import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../App";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SecondaryButton } from "../../components/SecondaryButton";
import { ERASURE_RETENTION_NOTE } from "../../lib/complianceContent";
import { fetchSubjectAccess, requestErasure, type SubjectAccessExport } from "../../lib/gdprApi";
import { SPACING } from "../../lib/spacing";
import { COLORS, TYPOGRAPHY } from "../../lib/theme";
import { BACK_NAV_ICON } from "../../lib/iconPolicy";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function DataPrivacyPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "DataPrivacy">>();
  const consultationId = route.params?.consultationId?.trim() ?? "";

  const [loading, setLoading] = useState(Boolean(consultationId));
  const [exportData, setExportData] = useState<SubjectAccessExport | null>(null);
  const [error, setError] = useState("");
  const [erasureDone, setErasureDone] = useState(false);
  const [erasing, setErasing] = useState(false);

  const load = useCallback(async () => {
    if (!consultationId) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchSubjectAccess(consultationId);
      setExportData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load activity.");
    } finally {
      setLoading(false);
    }
  }, [consultationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onErasure = async () => {
    if (!consultationId) return;
    setErasing(true);
    setError("");
    try {
      await requestErasure(consultationId);
      setErasureDone(true);
      setExportData(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erasure request failed.");
    } finally {
      setErasing(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.pageInset}>
        <Pressable style={s.backRow} onPress={() => navigation.goBack()} accessibilityLabel="Go back">
          <MaterialCommunityIcons name={BACK_NAV_ICON} size={20} color={COLORS.textMuted} />
          <Text style={s.backText}>Back</Text>
        </Pressable>

        <Text style={s.title}>Your data & privacy</Text>
        <Text style={s.body}>
          See what was recorded for your check and request removal in this demo environment.
        </Text>

        {!consultationId ? (
          <Text style={s.hint}>
            Complete a symptom check first — your reference ID will let you view activity here from the
            result screen.
          </Text>
        ) : null}

        {consultationId ? (
          <Text style={s.ref}>Reference: {consultationId}</Text>
        ) : null}

        {loading ? <ActivityIndicator style={s.spinner} color={COLORS.nhsBlue} /> : null}

        {error ? <Text style={s.error}>{error}</Text> : null}

        {exportData && !erasureDone ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>Activity log</Text>
            {exportData.auditTrail.length === 0 ? (
              <Text style={s.caption}>No audit events recorded yet.</Text>
            ) : (
              exportData.auditTrail.map((row) => (
                <View key={row.id} style={s.logRow}>
                  <Text style={s.logLabel}>{row.label}</Text>
                  <Text style={s.logWhen}>{formatWhen(row.created_at)}</Text>
                </View>
              ))
            )}
            {exportData.notices?.length ? (
              <Text style={[s.caption, s.notice]}>{exportData.notices.join(" ")}</Text>
            ) : null}
          </View>
        ) : null}

        {erasureDone ? (
          <Text style={s.success}>
            Erasure request completed for this reference. {ERASURE_RETENTION_NOTE}
          </Text>
        ) : null}

        {consultationId && !erasureDone ? (
          <PrimaryButton
            label={erasing ? "Requesting…" : "Request erasure of this check"}
            disabled={erasing || loading}
            onPress={() => void onErasure()}
            style={s.cta}
          />
        ) : null}

        <SecondaryButton
          label="Privacy notice"
          onPress={() => navigation.push("Privacy")}
          style={s.linkBtn}
        />
        <SecondaryButton
          label="Terms"
          onPress={() => navigation.push("Terms")}
          style={s.linkBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  pageInset: {
    paddingTop: SPACING.screenInset,
    paddingBottom: SPACING.screenInset,
    paddingLeft: SPACING.screenInset,
    paddingRight: SPACING.screenInset,
  },
  backRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  backText: { fontSize: 16, fontWeight: "600", color: COLORS.textPrimary },
  title: { ...TYPOGRAPHY.title },
  body: { ...TYPOGRAPHY.bodySecondary, marginTop: 8 },
  hint: { ...TYPOGRAPHY.caption, marginTop: 12 },
  ref: { ...TYPOGRAPHY.caption, marginTop: 12, fontWeight: "600" },
  spinner: { marginTop: 24 },
  error: { ...TYPOGRAPHY.caption, color: COLORS.warning, marginTop: 12 },
  card: {
    marginTop: 16,
    padding: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  cardTitle: { ...TYPOGRAPHY.heading, fontSize: 16 },
  logRow: { marginTop: 12, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  logLabel: { ...TYPOGRAPHY.body, fontSize: 15 },
  logWhen: { ...TYPOGRAPHY.caption, marginTop: 4 },
  caption: { ...TYPOGRAPHY.caption, marginTop: 8 },
  notice: { fontStyle: "italic" },
  success: { ...TYPOGRAPHY.caption, marginTop: 16, color: COLORS.textPrimary },
  cta: { marginTop: 20 },
  linkBtn: { marginTop: 12 },
});
