import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../App";
import { SPACING } from "../../lib/spacing";

type SymptomOption = {
  id: string;
  label: string;
  icon: string;
};

const SYMPTOMS: SymptomOption[] = [
  { id: "uti", label: "UTI", icon: "water-outline" },
  { id: "sore_throat", label: "Sore throat", icon: "head-heart-outline" },
  { id: "sinusitis", label: "Sinusitis", icon: "weather-windy" },
  { id: "cough", label: "Cough", icon: "lungs" },
  { id: "fever", label: "Fever", icon: "thermometer" },
  { id: "blocked_nose", label: "Blocked nose", icon: "nose" },
  { id: "ear_pain", label: "Ear pain", icon: "ear-hearing" },
  // { id: "other", label: "Other", icon: "dots-horizontal" },
];

export default function SymptomSelectionPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selected, setSelected] = useState<string[]>(["sore_throat"]);

  const canContinue = selected.length > 0;
  const progressPercent = useMemo(() => 1 / 5, []);

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
          <Text style={s.subtitle}>Select all that apply.</Text>

          <View style={s.grid}>
            {SYMPTOMS.map((item) => {
              const active = selected.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  style={[s.card, active && s.cardActive]}
                  onPress={() =>
                    setSelected((prev) =>
                      prev.includes(item.id) ? prev.filter((x) => x !== item.id) : [...prev, item.id]
                    )
                  }
                >
                  {active ? (
                    <View style={s.checkBadge}>
                      <MaterialCommunityIcons name="check" size={12} color="#fff" />
                    </View>
                  ) : null}
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={30}
                    color={active ? "#1d4ed8" : "#1e3a8a"}
                  />
                  <Text style={[s.cardLabel, active && s.cardLabelActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={[s.cta, !canContinue && s.ctaDisabled]}
            disabled={!canContinue}
            onPress={() => navigation.push("Consultation", { pathways: selected.join(",") })}
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
