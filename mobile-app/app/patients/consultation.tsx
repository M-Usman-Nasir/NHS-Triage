import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  ActivityIndicator,
  InteractionManager,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../App";
import { useMultiConditionFlow } from "../../hooks/useMultiConditionFlow";
import { augmentAnswersForPathway } from "../../lib/augmentConsultationAnswers";
import { apiFetch, apiUrl } from "../../lib/api";
import {
  CORE_TRIAGE_QUESTIONS,
  contextAnswersToSymptomHints,
  isContextQuestionId,
  stripContextAnswers,
} from "../../lib/consultationPrefaceQuestions";
import { mergeCoreDurationIntoAnswers } from "../../lib/consultationAnswerMaps";
import { getPathwayBundle } from "../../lib/pathwayBundleLoader";
import {
  applyChecklistAnswersToClinical,
  getClinicalSkipCaption,
  getDefinitionsForPathway,
  getNextQuestionState,
} from "../../lib/questionGraphResolver";
import { ClinicalQuestionCard } from "../../components/ClinicalQuestionCard";
import { BRAND_NAME, CONSULTATION } from "../../lib/patientCopy";
import { evaluateRedFlagSelections } from "../../lib/redFlagRouting";
import { RedFlagChecklist } from "../../components/RedFlagChecklist";
import { MOCK_DATA_DISCLOSURE } from "../../lib/complianceContent";
import { PATIENT_PATHWAYS } from "../../lib/patientPathways";
import { SPACING } from "../../lib/spacing";
import { BACK_NAV_ICON } from "../../lib/iconPolicy";
import { COLORS, RADII, TYPOGRAPHY } from "../../lib/theme";
import {
  isKnownPathwayQuestions,
  PATHWAY_QUESTIONS,
  pathwayClinicalQuestionsForPatient,
  type PathwayQuestion,
} from "../../lib/pathwayQuestions";
import { getConsultationConsent, clearConsultationConsent } from "../../lib/consultationConsentStore";
import type { AnswerValue, ConsultationSubmitPayload } from "../../types/consultation";

interface PatientInfo {
  fullName: string;
  age: string;
  gender: string;
}

const GENDER_OPTIONS = ["Female", "Male", "Other", "Prefer not to say"] as const;

function isUnreachableErrorMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("network request failed") ||
    m.includes("failed to fetch") ||
    m.includes("networkerror") ||
    m.includes("fetch failed") ||
    m.includes("aborted")
  );
}

function isAnswerEmpty(question: PathwayQuestion, value: AnswerValue | undefined): boolean {
  if (value === undefined) {
    if (question.type === "text" && question.required === false) return false;
    return question.required;
  }
  if (question.type === "multiselect") {
    return !Array.isArray(value) || value.length === 0;
  }
  if (question.type === "text" && question.required === false) {
    return false;
  }
  if (question.type === "text" && typeof value === "string" && value.trim() === "") {
    return question.required;
  }
  return false;
}

export default function ConsultationPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "Consultation">>();
  const pathwaysParam = route.params?.pathways ?? "";
  const insets = useSafeAreaInsets();

  const {
    pathwayCodes,
    pathwayIndex,
    activePathwayCode,
    hasMorePathways,
    moveToNextPathway,
    completedConsultationIds,
    setCompletedConsultationIds,
  } = useMultiConditionFlow(pathwaysParam);

  const [wizardStep, setWizardStep] = useState<
    "demographics" | "coreTriage" | "redFlags" | "clinical" | "submitting"
  >("demographics");
  const [urgentBanner, setUrgentBanner] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientInfo>({ fullName: "", age: "", gender: "" });
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [symptoms, setSymptoms] = useState("");
  const [error, setError] = useState("");

  const [questionsById, setQuestionsById] = useState<Record<string, PathwayQuestion>>({});
  const [clinicalCurrentId, setClinicalCurrentId] = useState<string | null>(null);
  const [clinicalHistory, setClinicalHistory] = useState<string[]>([]);
  const [clinicalProgressMax, setClinicalProgressMax] = useState(1);
  const [useServerFlow, setUseServerFlow] = useState(true);
  const [clinicalSchemaLoading, setClinicalSchemaLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [clinicalSkipCaption, setClinicalSkipCaption] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const prevPathwayCodeRef = useRef<string | null>(null);
  /** Prevents re-loading clinical schema on every answer (was causing blink / reset to q1). */
  const clinicalSessionKeyRef = useRef<string | null>(null);
  const clinicalQuestion = clinicalCurrentId ? questionsById[clinicalCurrentId] : undefined;
  const pathwayBundle = activePathwayCode ? getPathwayBundle(activePathwayCode) : null;
  const redFlagItems = pathwayBundle?.redFlagChecklist ?? [];

  const wizardStepNumber = (): number => {
    if (wizardStep === "demographics") return 1;
    if (wizardStep === "coreTriage") return 2;
    if (wizardStep === "redFlags") return 3;
    if (wizardStep === "clinical") return 4;
    return 5;
  };

  const pathwayLabelByCode = (code: string) => PATIENT_PATHWAYS.find((p) => p.code === code)?.label ?? code;
  const headerPathwayText = pathwayCodes.map((code) => pathwayLabelByCode(code)).join(" + ");

  useEffect(() => {
    if (!activePathwayCode) return;
    const switched =
      prevPathwayCodeRef.current != null && prevPathwayCodeRef.current !== activePathwayCode;
    prevPathwayCodeRef.current = activePathwayCode;

    setAnswers((existing) => {
      return Object.fromEntries(
        Object.entries(existing).filter(
          ([key]) => isContextQuestionId(key) || key.startsWith("_rf"),
        ),
      );
    });
    setUrgentBanner(null);
    if (switched) {
      setWizardStep("redFlags");
    }
    setError("");
    setQuestionsById({});
    setClinicalCurrentId(null);
    setClinicalHistory([]);
    setClinicalProgressMax(1);
    setUseServerFlow(true);
    setClinicalSchemaLoading(false);
    setClinicalSkipCaption(null);
    clinicalSessionKeyRef.current = null;
  }, [activePathwayCode]);

  useEffect(() => {
    if (wizardStep !== "clinical") {
      clinicalSessionKeyRef.current = null;
      return;
    }
    if (!activePathwayCode) return;

    const sessionKey = `${activePathwayCode}:${patient.gender}`;
    if (clinicalSessionKeyRef.current === sessionKey) {
      return;
    }
    clinicalSessionKeyRef.current = sessionKey;

    let cancelled = false;
    setClinicalSchemaLoading(true);
    const mergedAnswers = mergeCoreDurationIntoAnswers(
      activePathwayCode,
      answers as Record<string, unknown>,
    );
    void (async () => {
      try {
        const genderParam = patient.gender ? `?gender=${encodeURIComponent(patient.gender)}` : "";
        const r = await apiFetch(
          apiUrl(`/api/consultation/definitions/${encodeURIComponent(activePathwayCode)}${genderParam}`),
        );
        if (!r.ok) throw new Error("definitions");
        const data = (await r.json()) as {
          questions: PathwayQuestion[];
          firstQuestionId: string | null;
          progressMax: number;
        };
        if (cancelled) return;
        const bundle = getPathwayBundle(activePathwayCode);
        const byId: Record<string, PathwayQuestion> = {};
        for (const q of data.questions || []) {
          const fromBundle = bundle?.questions.find((bq) => bq.id === q.id);
          byId[q.id] = {
            ...q,
            clinicalNote: q.clinicalNote ?? fromBundle?.clinicalNote,
          };
        }
        const localDefs = getDefinitionsForPathway(activePathwayCode, patient.gender, mergedAnswers);
        const firstId = localDefs?.firstQuestionId ?? data.firstQuestionId;
        setQuestionsById(byId);
        setClinicalProgressMax(Math.max(data.progressMax || Object.keys(byId).length, 1));
        setClinicalCurrentId(firstId);
        setClinicalSkipCaption(getClinicalSkipCaption(activePathwayCode, firstId, mergedAnswers));
        setUseServerFlow(true);
        setClinicalHistory([]);
      } catch {
        if (cancelled) return;
        const defs = getDefinitionsForPathway(activePathwayCode, patient.gender, mergedAnswers);
        const qs =
          defs?.questions ??
          pathwayClinicalQuestionsForPatient(
            activePathwayCode,
            PATHWAY_QUESTIONS[activePathwayCode],
            patient.gender,
          );
        const bundle = getPathwayBundle(activePathwayCode);
        const byId: Record<string, PathwayQuestion> = {};
        for (const q of qs) {
          const fromBundle = bundle?.questions.find((bq) => bq.id === q.id);
          byId[q.id] = {
            ...q,
            clinicalNote: q.clinicalNote ?? fromBundle?.clinicalNote,
          };
        }
        const firstId = defs?.firstQuestionId ?? qs[0]?.id ?? null;
        setQuestionsById(byId);
        setClinicalProgressMax(defs?.progressMax ?? Math.max(qs.length, 1));
        setClinicalCurrentId(firstId);
        setClinicalSkipCaption(getClinicalSkipCaption(activePathwayCode, firstId, mergedAnswers));
        setUseServerFlow(false);
        setClinicalHistory([]);
      } finally {
        if (!cancelled) setClinicalSchemaLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- answers intentionally omitted; reload only when entering clinical
  }, [wizardStep, activePathwayCode, patient.gender]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const onShow = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height));
    const onHide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  const scrollToBottomAfterKeyboard = () => {
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    });
  };

  const handleDemographicsSubmit = () => {
    if (!patient.fullName || !patient.age || !patient.gender) {
      setError("Please complete all fields before continuing.");
      return;
    }
    setError("");
    setWizardStep("coreTriage");
  };

  const handleCoreTriageSubmit = () => {
    for (const q of CORE_TRIAGE_QUESTIONS) {
      if (isAnswerEmpty(q, answers[q.id])) {
        setError("Please answer both questions to continue.");
        return;
      }
    }
    setError("");
    setWizardStep("redFlags");
  };

  const handleRedFlagsContinue = (selectedIds: string[], noneSelected: boolean) => {
    if (!activePathwayCode) return;
    const result = evaluateRedFlagSelections(redFlagItems, selectedIds, noneSelected);
    if (result.action === "emergency") {
      navigation.replace("Emergency", {
        from: activePathwayCode,
        question: result.question,
        flags: result.labels,
      });
      return;
    }
    const merged = applyChecklistAnswersToClinical(
      activePathwayCode,
      answers as Record<string, unknown>,
      selectedIds,
      noneSelected,
    ) as Record<string, AnswerValue>;
    setAnswers(merged);
    setUrgentBanner(
      result.tier === "urgent_care" && result.labels.length > 0
        ? "You reported symptoms that may need urgent same-day care. If you feel worse, use NHS 111 or emergency services."
        : null,
    );
    setWizardStep("clinical");
  };

  const patientPayload = () => ({
    fullName: patient.fullName,
    age: parseInt(patient.age, 10),
    gender: patient.gender,
  });

  const submitConsultation = async (finalAnswers: Record<string, AnswerValue>) => {
    if (!activePathwayCode) return;
    setWizardStep("submitting");
    const clinicalOnly = stripContextAnswers(finalAnswers as Record<string, unknown>) as Record<string, AnswerValue>;
    const answersForApi = augmentAnswersForPathway(
      activePathwayCode,
      clinicalOnly as Record<string, unknown>,
    ) as Record<string, AnswerValue>;
    const baseSymptoms = symptoms.split(",").map((s) => s.trim()).filter(Boolean);
    const contextHints = contextAnswersToSymptomHints(finalAnswers as Record<string, unknown>);
    const consent = getConsultationConsent();
    const payload: ConsultationSubmitPayload = {
      pathwayCode: activePathwayCode,
      answers: answersForApi,
      patient: {
        fullName: patient.fullName,
        age: parseInt(patient.age, 10),
        gender: patient.gender,
      },
      symptoms: [...baseSymptoms, ...contextHints],
      ...(consent ? { consent } : {}),
    };
    try {
      const res = await apiFetch(apiUrl("/api/consultation"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let data: {
        consultationId?: string;
        error?: string;
        outcome?: string;
        outcomeReason?: string;
        redFlagTriggered?: boolean;
        decision?: { title?: string };
        reasoning?: { steps?: string[] };
        referralRecommendation?: { instruction?: string; actions?: string[] };
      } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        data = {};
      }
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Submission failed");
      }
      if (!data.consultationId) {
        throw new Error("Invalid response from server.");
      }
      const nextIds = [...completedConsultationIds, data.consultationId];
      if (hasMorePathways) {
        setCompletedConsultationIds(nextIds);
        moveToNextPathway();
        setWizardStep("redFlags");
        return;
      }
      const allIds = nextIds.join(",");
      const referral = data.referralRecommendation;
      clearConsultationConsent();
      navigation.replace("Result", {
        id: nextIds[0],
        ids: allIds,
        outcome: data.outcome,
        outcomeReason: data.outcomeReason,
        pathwayCodes: pathwayCodes.join(","),
        reasoningSteps: JSON.stringify(data.reasoning?.steps ?? []),
        actionLine: referral?.actions?.[0] ?? referral?.instruction,
        answersSnapshot: JSON.stringify(finalAnswers),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed";
      setWizardStep("clinical");
      const detail = isUnreachableErrorMessage(message)
        ? CONSULTATION.submitErrorOffline
        : `${message} You can try again or go back and check your answers.`;
      setError(detail);
    }
  };

  const proceedClinicalAfterAnswer = async (merged: Record<string, AnswerValue>) => {
    if (!activePathwayCode || !clinicalCurrentId) return;
    const withDuration = mergeCoreDurationIntoAnswers(
      activePathwayCode,
      merged as Record<string, unknown>,
    ) as Record<string, AnswerValue>;
    const clinicalOnly = stripContextAnswers(withDuration as Record<string, unknown>) as Record<
      string,
      AnswerValue
    >;
    const augmented = augmentAnswersForPathway(
      activePathwayCode,
      clinicalOnly as Record<string, unknown>,
    ) as Record<string, AnswerValue>;
    const patient = patientPayload();

    try {
      if (useServerFlow) {
        const res = await apiFetch(apiUrl("/api/consultation/question/next"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pathwayCode: activePathwayCode,
            answers: augmented,
            patient,
            currentQuestionId: clinicalCurrentId,
          }),
        });
        const data = (await res.json()) as { isComplete?: boolean; nextQuestionId?: string | null; error?: string };
        if (!res.ok) {
          throw new Error(typeof data.error === "string" ? data.error : "Could not load next question.");
        }
        if (data.isComplete) {
          setAnswers(withDuration);
          await submitConsultation(withDuration);
          return;
        }
        if (data.nextQuestionId) {
          setClinicalHistory((h) => [...h, clinicalCurrentId]);
          setClinicalCurrentId(data.nextQuestionId);
          setAnswers(withDuration);
        }
      } else {
        const state = getNextQuestionState(
          activePathwayCode,
          clinicalCurrentId,
          augmented as Record<string, unknown>,
          patient,
        );
        if (state.isComplete || !state.nextQuestionId) {
          setAnswers(withDuration);
          await submitConsultation(withDuration);
          return;
        }
        setClinicalHistory((h) => [...h, clinicalCurrentId]);
        setClinicalCurrentId(state.nextQuestionId);
        setClinicalProgressMax(state.progressMax);
        setAnswers(withDuration);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not continue.";
      setError(
        isUnreachableErrorMessage(msg)
          ? "We could not load the next step. Demo mode normally works offline — try again, or go back."
          : msg,
      );
    }
  };

  const routeToEmergencyScreen = (questionText: string, flags?: string[]) => {
    navigation.replace("Emergency", {
      from: activePathwayCode || "unknown",
      question: questionText,
      flags,
    });
  };

  const handleClinicalAnswer = (value: string | boolean) => {
    if (!clinicalQuestion) return;
    if (clinicalQuestion.redFlagHint && value === true) {
      routeToEmergencyScreen(clinicalQuestion.text);
      return;
    }
    const qId = clinicalQuestion.id;
    const merged = { ...answers, [qId]: value };
    if (clinicalQuestion.type === "boolean") {
      void proceedClinicalAfterAnswer(merged);
      return;
    }
    setAnswers(merged);
  };

  const toggleClinicalMultiselect = (option: string) => {
    if (!clinicalQuestion || clinicalQuestion.type !== "multiselect") return;
    const qId = clinicalQuestion.id;
    setAnswers((prev) => {
      const cur = Array.isArray(prev[qId]) ? (prev[qId] as string[]) : [];
      const has = cur.includes(option);
      const next = has ? cur.filter((o) => o !== option) : [...cur, option];
      return { ...prev, [qId]: next };
    });
  };

  const advanceClinicalManual = () => {
    if (!clinicalQuestion) return;
    const currentAnswer = answers[clinicalQuestion.id];
    if (clinicalQuestion.required && isAnswerEmpty(clinicalQuestion, currentAnswer)) {
      setError(
        clinicalQuestion.type === "multiselect"
          ? "Please select at least one option."
          : "Please answer this question to continue.",
      );
      return;
    }
    setError("");
    void proceedClinicalAfterAnswer(answers);
  };

  const goBack = () => {
    if (wizardStep === "clinical") {
      if (clinicalHistory.length > 0) {
        const prevId = clinicalHistory[clinicalHistory.length - 1];
        const leaving = clinicalCurrentId;
        setClinicalHistory((h) => h.slice(0, -1));
        setClinicalCurrentId(prevId);
        setAnswers((prev) => {
          const next = { ...prev };
          if (leaving) delete next[leaving];
          return next;
        });
        setError("");
        return;
      }
      setWizardStep("redFlags");
      setError("");
      return;
    }
    if (wizardStep === "redFlags") {
      setWizardStep("coreTriage");
      setError("");
      return;
    }
    if (wizardStep === "coreTriage") {
      setWizardStep("demographics");
      setError("");
      return;
    }
    if (wizardStep === "demographics") {
      navigation.goBack();
      return;
    }
    navigation.goBack();
  };

  const skipCurrentCondition = () => {
    if (hasMorePathways) {
      moveToNextPathway();
      setWizardStep("redFlags");
      setError("");
      return;
    }
    if (completedConsultationIds.length > 0) {
      const allIds = completedConsultationIds.join(",");
      navigation.replace("Result", { id: completedConsultationIds[0], ids: allIds, outcome: "pharmacy" });
      return;
    }
    navigation.navigate("Patients");
  };

  if (pathwayCodes.length === 0) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.pageInset}>
          <Text style={s.centerText}>No clinical pathway was selected.</Text>
          <Pressable style={s.linkBtn} onPress={() => navigation.navigate("Patients")}>
            <Text style={s.linkBtnText}>Return to triage</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const unknownCode = pathwayCodes.find((code) => !isKnownPathwayQuestions(code));
  if (unknownCode) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.pageInset}>
          <Text style={s.centerTitle}>Unknown pathway</Text>
          <Text style={s.centerText}>&quot;{unknownCode}&quot; is not a recognised pathway. Choose a symptom from triage.</Text>
          <Pressable style={s.linkBtn} onPress={() => navigation.navigate("Patients")}>
            <Text style={s.linkBtnText}>Return to triage</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <View style={s.pageInset}>
        <View style={s.headerRow}>
          <Pressable style={s.backBtn} onPress={goBack}>
            <MaterialCommunityIcons name={BACK_NAV_ICON} size={20} color={COLORS.textMuted} />
          </Pressable>
          <View style={s.headerTitles}>
            <Text style={s.headerTitle} numberOfLines={1}>
              {BRAND_NAME}
            </Text>
            <Text style={s.headerSub} numberOfLines={1}>
              {headerPathwayText}
              {pathwayCodes.length > 1 ? ` (${pathwayIndex + 1}/${pathwayCodes.length})` : ""}
            </Text>
          </View>
          <View style={s.backBtn} />
        </View>

        <ScrollView
          ref={scrollRef}
          style={s.scroll}
          contentContainerStyle={[
            s.scrollContent,
            { paddingBottom: SPACING.lg + keyboardHeight + (keyboardHeight > 0 ? insets.bottom : 0) },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {wizardStep === "demographics" && (
            <View>
              <Text style={s.stepPill}>Step {wizardStepNumber()} of 5: About you</Text>
              <Text style={s.screenTitle}>Before we begin</Text>
              <Text style={s.screenBody}>{CONSULTATION.demographicsIntro}</Text>

              <View style={s.card}>
                <Text style={s.fieldLabel}>Full name</Text>
                <Text style={s.fieldHint}>{CONSULTATION.nameMinimisation}</Text>
                <TextInput
                  style={s.input}
                  placeholder="e.g. Sarah Mitchell"
                  placeholderTextColor={COLORS.textMuted}
                  value={patient.fullName}
                  onChangeText={(t) => setPatient({ ...patient, fullName: t })}
                />
                <Text style={[s.fieldLabel, s.fieldLabelSpaced]}>Age</Text>
                <Text style={s.fieldHint}>{CONSULTATION.ageMinimisation}</Text>
                <TextInput
                  style={s.input}
                  placeholder="e.g. 34"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  value={patient.age}
                  onChangeText={(t) => setPatient({ ...patient, age: t.replace(/\D/g, "").slice(0, 3) })}
                />
                <Text style={[s.fieldLabel, s.fieldLabelSpaced]}>Gender</Text>
                <Text style={s.fieldHint}>{CONSULTATION.genderMinimisation}</Text>
                <View style={s.genderRow}>
                  {GENDER_OPTIONS.map((opt) => {
                    const sel = patient.gender === opt;
                    return (
                      <Pressable
                        key={opt}
                        style={[s.genderChip, sel && s.genderChipOn]}
                        onPress={() => setPatient({ ...patient, gender: opt })}
                      >
                        <Text style={[s.genderChipText, sel && s.genderChipTextOn]}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={[s.fieldLabel, s.fieldLabelSpaced]}>
                  Describe your symptoms <Text style={s.optional}>(optional)</Text>
                </Text>
                <Text style={s.fieldHint}>{CONSULTATION.symptomsMinimisation}</Text>
                <TextInput
                  style={s.input}
                  placeholder="e.g. burning when passing urine, fever"
                  placeholderTextColor={COLORS.textMuted}
                  value={symptoms}
                  onChangeText={setSymptoms}
                  onFocus={scrollToBottomAfterKeyboard}
                />
              </View>

              {error ? (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable style={s.primaryBtn} onPress={handleDemographicsSubmit}>
                <Text style={s.primaryBtnText}>Continue</Text>
              </Pressable>
            </View>
          )}

          {wizardStep === "coreTriage" && (
            <View>
              <Text style={s.stepPill}>Step {wizardStepNumber()} of 5: Your symptoms</Text>
              <Text style={s.screenTitle}>Tell us more</Text>
              <Text style={s.screenBody}>{CONSULTATION.coreTriageIntro}</Text>
              <View style={s.card}>
                {CORE_TRIAGE_QUESTIONS.map((q) => (
                  <View key={q.id} style={s.coreBlock}>
                    <Text style={s.qTitle}>{q.text}</Text>
                    {q.options && (
                      <View style={s.optionsBlock}>
                        {q.options.map((opt) => {
                          const selected = answers[q.id] === opt;
                          return (
                            <Pressable
                              key={opt}
                              style={[s.optionRow, selected && s.optionRowOn]}
                              onPress={() => setAnswers({ ...answers, [q.id]: opt })}
                            >
                              <View style={[s.radioOuter, selected && s.radioOuterOn]}>
                                {selected ? <View style={s.radioInner} /> : null}
                              </View>
                              <Text style={s.optionText}>{opt}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                  </View>
                ))}
                {error ? <Text style={s.errorInline}>{error}</Text> : null}
                <Pressable style={s.primaryBtn} onPress={handleCoreTriageSubmit}>
                  <Text style={s.primaryBtnText}>Continue</Text>
                </Pressable>
              </View>
            </View>
          )}

          {wizardStep === "redFlags" && (
            <View>
              <Text style={s.stepPill}>Step {wizardStepNumber()} of 5: Safety check</Text>
              <RedFlagChecklist
                items={redFlagItems}
                onContinue={handleRedFlagsContinue}
                error={error || undefined}
              />
            </View>
          )}

          {wizardStep === "clinical" && clinicalSchemaLoading && (
            <View style={s.loadingBox}>
              <ActivityIndicator size="large" color={COLORS.nhsBlue} />
              <Text style={s.loadingText}>Loading clinical pathway…</Text>
            </View>
          )}

          {wizardStep === "clinical" && !clinicalSchemaLoading && clinicalQuestion && (
            <View>
              <Text style={s.stepPill}>Step {wizardStepNumber()} of 5: Clinical questions</Text>
              {urgentBanner ? (
                <View style={s.warnBanner}>
                  <Text style={s.warnTitle}>Important</Text>
                  <Text style={s.warnBody}>{urgentBanner}</Text>
                </View>
              ) : null}
              {pathwayCodes.length > 1 ? (
                <Pressable style={s.skipBtn} onPress={skipCurrentCondition}>
                  <Text style={s.skipBtnText}>Skip this condition</Text>
                </Pressable>
              ) : null}
              {clinicalQuestion.redFlagHint ? (
                <View style={s.dangerBanner}>
                  <Text style={s.dangerTitle}>Safety question</Text>
                  <Text style={s.dangerBody}>{CONSULTATION.clinicalSafetyHint}</Text>
                </View>
              ) : null}
              {!useServerFlow ? (
                <View style={s.warnBanner}>
                  <Text style={s.warnTitle}>{CONSULTATION.offlinePathwayTitle}</Text>
                  <Text style={s.warnBody}>{MOCK_DATA_DISCLOSURE}</Text>
                </View>
              ) : null}
              <Text style={s.clinicalProgressLabel}>
                {CONSULTATION.clinicalProgressLabel} · Question {clinicalHistory.length + 1}
              </Text>
              {clinicalSkipCaption ? <Text style={s.skipCaption}>{clinicalSkipCaption}</Text> : null}
              <ClinicalQuestionCard question={clinicalQuestion}>
                {clinicalQuestion.type === "boolean" && (
                  <View style={s.boolRow}>
                    {(["Yes", "No"] as const).map((opt) => (
                      <Pressable
                        key={opt}
                        style={[
                          s.boolBtn,
                          answers[clinicalQuestion.id] === (opt === "Yes") &&
                            (opt === "Yes" ? s.boolYes : s.boolNo),
                        ]}
                        onPress={() => handleClinicalAnswer(opt === "Yes")}
                      >
                        <Text
                          style={[
                            s.boolBtnText,
                            answers[clinicalQuestion.id] === (opt === "Yes") && s.boolBtnTextOn,
                          ]}
                        >
                          {opt}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
                {clinicalQuestion.type === "select" && clinicalQuestion.options && (
                  <View style={s.optionsBlock}>
                    {clinicalQuestion.options.map((opt) => {
                      const selected = answers[clinicalQuestion.id] === opt;
                      return (
                        <Pressable
                          key={opt}
                          style={[s.optionRow, selected && s.optionRowOn]}
                          onPress={() => setAnswers({ ...answers, [clinicalQuestion.id]: opt })}
                        >
                          <View style={[s.radioOuter, selected && s.radioOuterOn]}>
                            {selected ? <View style={s.radioInner} /> : null}
                          </View>
                          <Text style={s.optionText}>{opt}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
                {clinicalQuestion.type === "multiselect" && clinicalQuestion.options && (
                  <View style={s.optionsBlock}>
                    {clinicalQuestion.options.map((opt) => {
                      const selected =
                        Array.isArray(answers[clinicalQuestion.id]) &&
                        (answers[clinicalQuestion.id] as string[]).includes(opt);
                      return (
                        <Pressable
                          key={opt}
                          style={[s.optionRow, selected && s.optionRowOn]}
                          onPress={() => toggleClinicalMultiselect(opt)}
                        >
                          <View style={[s.checkBox, selected && s.checkBoxOn]}>
                            {selected ? <MaterialCommunityIcons name="check" size={14} color={COLORS.textPrimary} /> : null}
                          </View>
                          <Text style={s.optionText}>{opt}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
                {clinicalQuestion.type === "text" && (
                  <TextInput
                    style={[s.input, s.textArea]}
                    multiline
                    placeholder="Type here (or leave blank if not applicable)"
                    placeholderTextColor={COLORS.textMuted}
                    value={typeof answers[clinicalQuestion.id] === "string" ? (answers[clinicalQuestion.id] as string) : ""}
                    onChangeText={(t) => setAnswers({ ...answers, [clinicalQuestion.id]: t })}
                    onFocus={scrollToBottomAfterKeyboard}
                  />
                )}
                {error ? <Text style={s.errorInline}>{error}</Text> : null}
                {clinicalQuestion.type !== "boolean" && (
                  <View style={s.mt6}>
                    <Pressable style={s.primaryBtn} onPress={advanceClinicalManual}>
                      <Text style={s.primaryBtnText}>Next</Text>
                    </Pressable>
                    {!clinicalQuestion.required ? (
                      <Text style={s.hintCenter}>
                        Optional — you can tap Next without selecting if you prefer.
                      </Text>
                    ) : null}
                  </View>
                )}
              </ClinicalQuestionCard>
            </View>
          )}

          {wizardStep === "submitting" && (
            <View style={s.loadingBox}>
              <ActivityIndicator size="large" color={COLORS.nhsBlue} />
              <Text style={s.submitTitle}>{CONSULTATION.submitTitle}</Text>
              <Text style={s.submitBody}>{CONSULTATION.submitBody}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  pageInset: {
    flex: 1,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitles: { flex: 1, minWidth: 0 },
  headerTitle: { ...TYPOGRAPHY.caption, fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
  headerSub: { ...TYPOGRAPHY.caption, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: SPACING.md, flexGrow: 1 },
  stepPill: {
    ...TYPOGRAPHY.label,
    alignSelf: "flex-start",
    marginBottom: SPACING.sm,
  },
  clinicalProgressLabel: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  skipCaption: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: SPACING.sm, fontStyle: "italic" },
  screenTitle: { ...TYPOGRAPHY.title },
  screenBody: { ...TYPOGRAPHY.bodySecondary, marginTop: 6 },
  card: {
    marginTop: 10,
    padding: 12,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  fieldHint: { ...TYPOGRAPHY.caption, marginTop: 4, marginBottom: 4 },
  fieldLabelSpaced: { marginTop: 10 },
  optional: { fontWeight: "400", color: COLORS.textMuted },
  input: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  genderRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  genderChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  genderChipOn: { borderColor: COLORS.selectedBorder, backgroundColor: COLORS.surface },
  genderChipText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  genderChipTextOn: { color: COLORS.textPrimary },
  errorBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.errorBg,
  },
  errorText: { fontSize: 14, color: COLORS.error },
  errorInline: { marginTop: 10, fontSize: 14, fontWeight: "600", color: COLORS.error },
  primaryBtn: {
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.nhsBlue,
    borderRadius: RADII.sm,
    paddingVertical: 12,
  },
  primaryBtnText: { color: COLORS.surface, fontSize: 16, fontWeight: "700" },
  coreBlock: { marginBottom: 16 },
  qTitle: { ...TYPOGRAPHY.heading, fontSize: 18, lineHeight: 24 },
  boolRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  boolBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },
  boolYes: { borderColor: COLORS.selectedBorder, backgroundColor: COLORS.surface },
  boolNo: { borderColor: COLORS.border, backgroundColor: COLORS.surface },
  boolBtnText: { fontSize: 16, fontWeight: "700", color: COLORS.textSecondary },
  boolBtnTextOn: { color: COLORS.textPrimary },
  optionsBlock: { marginTop: 10, gap: 6 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  optionRowOn: { borderColor: COLORS.selectedBorder, backgroundColor: COLORS.surface },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterOn: { borderColor: COLORS.selectedBorder },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.selectedBorder },
  optionText: { flex: 1, fontSize: 15, color: COLORS.textPrimary, lineHeight: 21 },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: RADII.sm,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  checkBoxOn: { backgroundColor: COLORS.surface, borderColor: COLORS.selectedBorder },
  mt6: { marginTop: 12 },
  hintCenter: { marginTop: 6, textAlign: "center", fontSize: 12, color: COLORS.textMuted },
  loadingBox: { paddingVertical: 24, alignItems: "center" },
  loadingText: { marginTop: 8, fontSize: 14, color: COLORS.textSecondary },
  skipBtn: {
    alignSelf: "flex-end",
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  skipBtnText: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  dangerBanner: {
    marginBottom: 8,
    padding: 10,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.errorBg,
  },
  dangerTitle: { fontSize: 13, fontWeight: "700", color: COLORS.error },
  dangerBody: { marginTop: 4, fontSize: 12, lineHeight: 18, color: COLORS.textPrimary },
  warnBanner: {
    marginBottom: 8,
    padding: 10,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.warningBg,
  },
  warnTitle: { fontSize: 13, fontWeight: "700", color: COLORS.warning },
  warnBody: { marginTop: 4, fontSize: 12, lineHeight: 18, color: COLORS.textPrimary },
  submitTitle: { marginTop: 10, ...TYPOGRAPHY.title, fontSize: 20 },
  submitBody: { marginTop: 6, ...TYPOGRAPHY.bodySecondary, textAlign: "center", paddingHorizontal: 12 },
  centerText: { ...TYPOGRAPHY.bodySecondary, textAlign: "center" },
  centerTitle: { ...TYPOGRAPHY.heading, textAlign: "center", marginBottom: 6 },
  linkBtn: { marginTop: 12, alignSelf: "center", paddingVertical: 8 },
  linkBtnText: { fontSize: 15, fontWeight: "600", color: COLORS.textPrimary, textDecorationLine: "underline" },
});
