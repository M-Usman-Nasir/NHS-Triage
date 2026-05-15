import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../App";
import { GdprConsentPanel } from "../../components/GdprConsentPanel";
import { ListRow } from "../../components/ListRow";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Card } from "../../components/Card";
import { createConsentRecord } from "../../lib/complianceContent";
import { setConsultationConsent } from "../../lib/consultationConsentStore";
import { pathwayIconName } from "../../lib/pathwayIcons";
import { PATIENT_PATHWAYS, pathwaysGroupedByCategory } from "../../lib/patientPathways";
import { SPACING } from "../../lib/spacing";
import { COLORS, TYPOGRAPHY } from "../../lib/theme";
import { BACK_NAV_ICON } from "../../lib/iconPolicy";

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

  const grouped = pathwaysGroupedByCategory();

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
            <Pressable style={s.backBtn} onPress={() => navigation.goBack()} accessibilityLabel="Go back">
              <MaterialCommunityIcons name={BACK_NAV_ICON} size={20} color={COLORS.textMuted} />
            </Pressable>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: `${progressPercent * 100}%` }]} />
            </View>
            <View style={s.backBtn} />
          </View>

          <Text style={s.step}>Step 1 of 5</Text>
          <Text style={s.title}>What problem are you having?</Text>
          <Text style={s.subtitle}>
            Choose all options that apply to you. Tap again to remove a selection.
          </Text>

          {grouped.map(({ category, pathways }) => (
            <View key={category.id} style={s.categoryBlock}>
              <Text style={s.categoryLabel}>{category.title.toUpperCase()}</Text>
              <Card style={s.listCard}>
                {pathways.map((p, index) => {
                  const active = selectedPathways.includes(p.code);
                  return (
                    <ListRow
                      key={p.code}
                      leadingIcon={pathwayIconName(p.code)}
                      title={p.fullLabel}
                      subtitle={p.description}
                      selected={active}
                      showChevron={false}
                      last={index === pathways.length - 1}
                      onPress={() => togglePathway(p.code)}
                    />
                  );
                })}
              </Card>
            </View>
          ))}

          {selectedPathwayLabels.length > 0 ? (
            <Text style={s.selectedLine}>
              Selected: {selectedPathwayLabels.join(", ")}
            </Text>
          ) : null}

          {selectedPathways.length > 0 ? (
            <GdprConsentPanel
              consentGiven={consentGiven}
              onConsentChange={setConsentGiven}
              onPrivacyPress={() => navigation.push("Privacy")}
              onTermsPress={() => navigation.push("Terms")}
            />
          ) : null}

          <PrimaryButton
            label="Continue"
            disabled={!canContinue}
            onPress={() => {
              setConsultationConsent(createConsentRecord());
              navigation.push("Consultation", { pathways: selectedPathways.join(",") });
            }}
            style={s.cta}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  pageInset: {
    flex: 1,
    paddingTop: SPACING.screenInset,
    paddingBottom: SPACING.screenInset,
    paddingLeft: SPACING.screenInset,
    paddingRight: SPACING.screenInset,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xxl, flexGrow: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  progressTrack: { flex: 1, height: 4, borderRadius: 99, backgroundColor: COLORS.border, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99, backgroundColor: COLORS.nhsBlue },
  step: { ...TYPOGRAPHY.label, marginTop: 8, textAlign: "left" },
  title: { ...TYPOGRAPHY.title, marginTop: 8 },
  subtitle: { ...TYPOGRAPHY.bodySecondary, marginTop: 6 },
  categoryBlock: { marginTop: SPACING.md },
  categoryLabel: { ...TYPOGRAPHY.label, marginBottom: SPACING.xs },
  listCard: { padding: 0, overflow: "hidden" },
  selectedLine: { ...TYPOGRAPHY.caption, marginTop: 12, color: COLORS.textPrimary },
  cta: { marginTop: SPACING.xl },
});