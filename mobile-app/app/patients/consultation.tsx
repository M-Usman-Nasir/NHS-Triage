import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../App";
import { SPACING } from "../../lib/spacing";

type Question = {
  id: string;
  text: string;
  options: string[];
};

type QuestionStep = {
  title: string;
  subtitle: string;
  questions: Question[];
};

const QUESTION_STEPS: QuestionStep[] = [
  {
    title: "About your symptoms",
    subtitle: "Answer the following questions.",
    questions: [
      {
        id: "duration",
        text: "How long have you had these symptoms?",
        options: ["Less than 24 hours", "1-3 days", "4-7 days", "More than 7 days"],
      },
      {
        id: "severity",
        text: "How would you describe your sore throat?",
        options: ["Mild", "Moderate", "Severe"],
      },
    ],
  },
  {
    title: "Other symptoms",
    subtitle: "Select the option that best matches.",
    questions: [
      {
        id: "fever",
        text: "Do you have a fever?",
        options: ["No", "Mild fever", "High fever"],
      },
      {
        id: "breathing",
        text: "Any breathing difficulty?",
        options: ["None", "Slight", "Severe"],
      },
    ],
  },
  {
    title: "Safety checks",
    subtitle: "Final checks before recommendation.",
    questions: [
      {
        id: "allergy",
        text: "Do you have any medication allergies?",
        options: ["No known allergies", "Yes", "Not sure"],
      },
      {
        id: "pregnant",
        text: "Are you currently pregnant or breastfeeding?",
        options: ["No", "Yes", "Prefer not to say"],
      },
    ],
  },
];

export default function ConsultationPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "Consultation">>();
  const selectedPathways = (route.params?.pathways || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const activeStep = QUESTION_STEPS[stepIndex];
  const stepNumber = stepIndex + 2;
  const progressPercent = stepNumber / 5;

  const pathwayLabel = useMemo(() => {
    if (selectedPathways.includes("sore_throat")) return "sore throat";
    if (selectedPathways.length === 0) return "symptoms";
    return selectedPathways[0].replace(/_/g, " ");
  }, [selectedPathways]);

  const validateStep = () => {
    for (const q of activeStep.questions) {
      if (!answers[q.id]) return false;
    }
    return true;
  };

  const onBack = () => {
    if (stepIndex === 0) {
      navigation.goBack();
      return;
    }
    setError("");
    setStepIndex((v) => v - 1);
  };

  const onContinue = () => {
    if (!validateStep()) {
      setError("Please answer all questions before continuing.");
      return;
    }
    setError("");
    if (stepIndex < QUESTION_STEPS.length - 1) {
      setStepIndex((v) => v + 1);
      return;
    }
    navigation.replace("Result");
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.container}>
        <View style={s.headerRow}>
          <Pressable style={s.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#2563eb" />
          </Pressable>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${progressPercent * 100}%` }]} />
          </View>
          <View style={s.backBtn} />
        </View>

        <Text style={s.stepText}>Step {stepNumber} of 5</Text>
        <Text style={s.title}>{activeStep.title}</Text>
        <Text style={s.subtitle}>{activeStep.subtitle}</Text>

        <ScrollView contentContainerStyle={s.formArea} showsVerticalScrollIndicator={false}>
          {activeStep.questions.map((q) => (
            <View key={q.id} style={s.qCard}>
              <Text style={s.qTitle}>{q.text.replace("sore throat", pathwayLabel)}</Text>
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt;
                return (
                  <Pressable
                    key={opt}
                    style={s.optionRow}
                    onPress={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                  >
                    <View style={[s.radioOuter, selected && s.radioOuterOn]}>
                      {selected ? <View style={s.radioInner} /> : null}
                    </View>
                    <Text style={s.optionText}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>

        {error ? <Text style={s.error}>{error}</Text> : null}
        <View style={s.footerRow}>
          <Pressable style={s.backAction} onPress={onBack}>
            <Text style={s.backActionText}>Back</Text>
          </Pressable>
          <Pressable style={s.continueAction} onPress={onContinue}>
            <Text style={s.continueActionText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc", paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm },
  container: { flex: 1, paddingHorizontal: SPACING.sm, paddingTop: SPACING.xs, paddingBottom: SPACING.xs },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  progressTrack: { flex: 1, height: 4, borderRadius: 99, backgroundColor: "#e2e8f0", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99, backgroundColor: "#2563eb" },
  stepText: { marginTop: 8, textAlign: "center", fontSize: 11, color: "#64748b", fontWeight: "600" },
  title: { marginTop: 10, fontSize: 38, lineHeight: 42, color: "#0f172a", fontWeight: "800" },
  subtitle: { marginTop: 6, fontSize: 18, color: "#64748b" },
  formArea: { paddingTop: 12, paddingBottom: 12, gap: 10 },
  qCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
  qTitle: { fontSize: 20, lineHeight: 24, color: "#0f172a", fontWeight: "700", marginBottom: 2 },
  optionRow: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: 10 },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#94a3b8",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  radioOuterOn: { borderColor: "#2563eb" },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2563eb" },
  optionText: { fontSize: 17, color: "#1e293b", lineHeight: 22 },
  error: { color: "#b91c1c", fontSize: 13, marginBottom: 6 },
  footerRow: { flexDirection: "row", gap: 10, paddingBottom: 4 },
  backAction: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    paddingVertical: 13,
    alignItems: "center",
  },
  backActionText: { color: "#1d4ed8", fontSize: 16, fontWeight: "700" },
  continueAction: { flex: 1, borderRadius: 10, backgroundColor: "#2563eb", paddingVertical: 13, alignItems: "center" },
  continueActionText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
