import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../App";
import {
  CONSENT_CHECKBOX_LABEL,
  CONSENT_COPY_VERSION,
  PRIVACY_LINK_LABEL,
  TERMS_LINK_LABEL,
} from "../../lib/complianceContent";
import { PATIENT_PATHWAYS } from "../../lib/patientPathways";
import { SPACING } from "../../lib/spacing";

const iconNameByCode: Record<string, string> = {
  uti: "water-outline",
  sore_throat: "thermometer",
  sinusitis: "weather-windy",
  otitis_media: "ear-hearing",
  insect_bites: "ladybug",
  impetigo: "bandage",
  shingles: "flash-outline",
};

export default function SymptomSelectionPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "SymptomSelection">>();
  const initialCodes = route.params?.initialCodes;

  const [selectedPathways, setSelectedPathways] = useState<string[]>(() => {
    if (!initialCodes) return [];
    return initialCodes
      .split(",")
      .map((c) => c.trim())
      .filter((c) => PATIENT_PATHWAYS.some((p) => p.code === c));
  });
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    if (selectedPathways.length === 0) {
      setConsentGiven(false);
    }
  }, [selectedPathways.length]);

  const selectedPathwayLabels = useMemo(
    () => PATIENT_PATHWAYS.filter((p) => selectedPathways.includes(p.code)).map((p) => p.fullLabel),
    [selectedPathways],
  );

  const canContinue = consentGiven && selectedPathways.length > 0;
  const progressPercent = useMemo(() => 1 / 5, []);

  const togglePathway = (code: string) => {
    setSelectedPathways((current) =>
      current.includes(code) ? current.filter((c) => c !== code) : [...current, code],
    );
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.pageInset}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          bounces
        >
          <View style={s.headerRow}>
            <Pressable style={s.backBtn} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={20} color="#2563eb" />
            </Pressable>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: `${progressPercent * 100}%` }]} />
            </View>
            <View style={s.backBtn} />
          </View>

          <Text style={s.step}>Step 1 of 5</Text>
          <Text style={s.title}>What problem are you having?</Text>
          <Text style={s.subtitle}>Tap one or more pathways to select. Tap again to remove.</Text>

          <View style={s.grid}>
            {PATIENT_PATHWAYS.map((p) => {
              const active = selectedPathways.includes(p.code);
              return (
                <Pressable
                  key={p.code}
                  style={[s.card, active && s.cardActive]}
                  onPress={() => togglePathway(p.code)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${p.fullLabel}. ${p.description}`}
                >
                  {active ? (
                    <View style={s.checkBadge}>
                      <MaterialCommunityIcons name="check" size={12} color="#fff" />
                    </View>
                  ) : null}
                  <MaterialCommunityIcons
                    name={iconNameByCode[p.code] ?? "stethoscope"}
                    size={30}
                    color={active ? "#1d4ed8" : "#1e3a8a"}
                  />
                  <Text style={[s.cardLabel, active && s.cardLabelActive]}>{p.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {selectedPathwayLabels.length > 0 ? (
            <View style={s.selectedBanner}>
              <Text style={s.selectedBannerLabel}>Selected</Text>
              <Text style={s.selectedBannerText}>{selectedPathwayLabels.join(", ")}</Text>
            </View>
          ) : null}

          {selectedPathways.length > 0 ? (
            <View style={s.consentBox}>
              <View style={s.consentTitleRow}>
                <MaterialCommunityIcons name="alert-outline" size={20} color="#b45309" />
                <Text style={s.consentTitle}>Important — Please Read</Text>
              </View>
              <Text style={s.consentBullet}>{"\u2022"} Guidance only — not a substitute for professional advice.</Text>
              <Text style={s.consentBullet}>
                {"\u2022"} Life-threatening emergency? Call <Text style={s.consentBold}>999</Text> immediately.
              </Text>
              <Text style={s.consentBullet}>{"\u2022"} Your data is processed under UK GDPR.</Text>

              <Pressable
                style={s.checkboxRow}
                onPress={() => setConsentGiven((v) => !v)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: consentGiven }}
              >
                <View style={[s.checkboxOuter, consentGiven && s.checkboxOuterOn]}>
                  {consentGiven ? (
                    <MaterialCommunityIcons name="check" size={16} color="#fff" />
                  ) : null}
                </View>
                <Text style={s.checkboxLabel}>{CONSENT_CHECKBOX_LABEL}</Text>
              </Pressable>

              <Text style={s.consentFooter}>
                By continuing, you agree to our{" "}
                <Text style={s.link} onPress={() => navigation.push("Privacy")}>
                  {PRIVACY_LINK_LABEL}
                </Text>{" "}
                and{" "}
                <Text style={s.link} onPress={() => navigation.push("Terms")}>
                  {TERMS_LINK_LABEL}
                </Text>
                . Consent text version: {CONSENT_COPY_VERSION}.
              </Text>
            </View>
          ) : null}

          <Pressable
            style={[s.cta, !canContinue && s.ctaDisabled]}
            disabled={!canContinue}
            onPress={() => navigation.push("Consultation", { pathways: selectedPathways.join(",") })}
          >
            <Text style={s.ctaText}>Continue</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  pageInset: {
    flex: 1,
    paddingTop: SPACING.screenInset,
    paddingBottom: SPACING.screenInset,
    paddingLeft: SPACING.screenInset,
    paddingRight: SPACING.screenInset,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: SPACING.xxl,
    flexGrow: 1,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  progressTrack: { flex: 1, height: 4, borderRadius: 99, backgroundColor: "#e2e8f0", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99, backgroundColor: "#2563eb" },
  step: { marginTop: 8, textAlign: "center", fontSize: 11, color: "#64748b", fontWeight: "600" },
  title: {
    marginTop: 10,
    fontSize: 32,
    lineHeight: 38,
    color: "#0f172a",
    fontWeight: "800",
    flexShrink: 1,
  },
  subtitle: { marginTop: 6, fontSize: 18, color: "#64748b" },
  grid: { marginTop: 16, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  card: {
    width: "48.6%",
    minHeight: 112,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    position: "relative",
  },
  cardActive: { borderColor: "#2563eb", backgroundColor: "#f8fbff" },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: { fontSize: 16, color: "#0f172a", fontWeight: "700" },
  cardLabelActive: { color: "#1d4ed8" },
  selectedBanner: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
  },
  selectedBannerLabel: { fontSize: 12, fontWeight: "700", color: "#64748b" },
  selectedBannerText: { marginTop: 6, fontSize: 15, color: "#1d4ed8", fontWeight: "600" },
  consentBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fcd34d",
    backgroundColor: "#fffbeb",
  },
  consentTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  consentTitle: { fontSize: 15, fontWeight: "700", color: "#92400e", flex: 1 },
  consentBullet: { fontSize: 13, color: "#78350f", lineHeight: 20, marginBottom: 4 },
  consentBold: { fontWeight: "700" },
  checkboxRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginTop: 12 },
  checkboxOuter: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#94a3b8",
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxOuterOn: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  checkboxLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: "#451a03", lineHeight: 20 },
  consentFooter: { marginTop: 10, fontSize: 12, color: "#78350f", lineHeight: 18 },
  link: { fontWeight: "700", textDecorationLine: "underline", color: "#1d4ed8" },
  cta: {
    marginTop: SPACING.xl,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaDisabled: { backgroundColor: "#94a3b8" },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
