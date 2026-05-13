import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../App";
import { useMultiConditionFlow } from "../../hooks/useMultiConditionFlow";
import { augmentAnswersForPathway } from "../../lib/augmentConsultationAnswers";
import { apiFetch, apiUrl } from "../../lib/api";
import {
  CONSULTATION_PREFACE_QUESTIONS,
  contextAnswersToSymptomHints,
  stripContextAnswers,
} from "../../lib/consultationPrefaceQuestions";
import { MOCK_DATA_DISCLOSURE } from "../../lib/complianceContent";
import { PATIENT_PATHWAYS } from "../../lib/patientPathways";
import { SPACING } from "../../lib/spacing";
import {
  isKnownPathwayQuestions,
  PATHWAY_QUESTIONS,
  pathwayClinicalQuestionsForPatient,
  type PathwayQuestion,
} from "../../lib/pathwayQuestions";
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

  const {
    pathwayCodes,
    pathwayIndex,
    activePathwayCode,
    hasMorePathways,
    moveToNextPathway,
    completedConsultationIds,
    setCompletedConsultationIds,
  } = useMultiConditionFlow(pathwaysParam);

  const [wizardStep, setWizardStep] = useState<"demographics" | "preface" | "clinical" | "submitting">(
    "demographics",
  );
  const [prefaceIndex, setPrefaceIndex] = useState(0);
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

  const prefaceQuestions = CONSULTATION_PREFACE_QUESTIONS;
  const prefaceCount = prefaceQuestions.length;
  const prefaceQuestion = prefaceQuestions[prefaceIndex];
  const clinicalQuestion = clinicalCurrentId ? questionsById[clinicalCurrentId] : undefined;

  const pathwayLabelByCode = (code: string) => PATIENT_PATHWAYS.find((p) => p.code === code)?.label ?? code;
  const headerPathwayText = pathwayCodes.map((code) => pathwayLabelByCode(code)).join(" + ");

  useEffect(() => {
    if (!activePathwayCode) return;
    setAnswers((existing) => {
      const prefaceIds = new Set(CONSULTATION_PREFACE_QUESTIONS.map((q) => q.id));
      return Object.fromEntries(Object.entries(existing).filter(([key]) => prefaceIds.has(key)));
    });
    setError("");
    setQuestionsById({});
    setClinicalCurrentId(null);
    setClinicalHistory([]);
    setClinicalProgressMax(1);
    setUseServerFlow(true);
    setClinicalSchemaLoading(false);
  }, [activePathwayCode]);

  useEffect(() => {
    if (wizardStep !== "clinical" || !activePathwayCode) return;
    let cancelled = false;
    setClinicalSchemaLoading(true);
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
        const byId: Record<string, PathwayQuestion> = {};
        for (const q of data.questions || []) {
          byId[q.id] = q;
        }
        setQuestionsById(byId);
        setClinicalProgressMax(Math.max(data.progressMax || Object.keys(byId).length, 1));
        setClinicalCurrentId(data.firstQuestionId);
        setUseServerFlow(true);
        setClinicalHistory([]);
      } catch {
        if (cancelled) return;
        const qs = pathwayClinicalQuestionsForPatient(
          activePathwayCode,
          PATHWAY_QUESTIONS[activePathwayCode],
          patient.gender,
        );
        const byId = Object.fromEntries(qs.map((q) => [q.id, q]));
        setQuestionsById(byId);
        setClinicalProgressMax(Math.max(qs.length, 1));
        setClinicalCurrentId(qs[0]?.id ?? null);
        setUseServerFlow(false);
        setClinicalHistory([]);
      } finally {
        if (!cancelled) setClinicalSchemaLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wizardStep, activePathwayCode, patient.gender]);

  const handleDemographicsSubmit = () => {
    if (!patient.fullName || !patient.age || !patient.gender) {
      setError("Please complete all fields before continuing.");
      return;
    }
    setError("");
    setWizardStep("preface");
    setPrefaceIndex(0);
  };

  const patientPayload = () => ({
    fullName: patient.fullName,
    age: parseInt(patient.age, 10),
    gender: patient.gender,
  });

  const resolveNextLinear = (fromId: string, list: PathwayQuestion[]): string | null => {
    const idx = list.findIndex((x) => x.id === fromId);
    if (idx < 0 || idx >= list.length - 1) return null;
    return list[idx + 1].id;
  };

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
    const payload: ConsultationSubmitPayload = {
      pathwayCode: activePathwayCode,
      answers: answersForApi,
      patient: {
        fullName: patient.fullName,
        age: parseInt(patient.age, 10),
        gender: patient.gender,
      },
      symptoms: [...baseSymptoms, ...contextHints],
    };
    try {
      const res = await apiFetch(apiUrl("/api/consultation"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let data: { consultationId?: string; error?: string; outcome?: string } = {};
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
        setWizardStep("clinical");
        return;
      }
      const allIds = nextIds.join(",");
      navigation.replace("Result", { id: nextIds[0], ids: allIds });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed";
      setWizardStep("clinical");
      const detail = isUnreachableErrorMessage(message)
        ? "We could not complete that step. In demo mode your answers stay on the device — try again, or go back and change an answer."
        : `${message} You can try again or go back and check your answers.`;
      setError(detail);
    }
  };

  const proceedClinicalAfterAnswer = async (merged: Record<string, AnswerValue>) => {
    if (!activePathwayCode || !clinicalCurrentId) return;
    const clinicalOnly = stripContextAnswers(merged as Record<string, unknown>) as Record<string, AnswerValue>;
    const augmented = augmentAnswersForPathway(
      activePathwayCode,
      clinicalOnly as Record<string, unknown>,
    ) as Record<string, AnswerValue>;

    try {
      if (useServerFlow) {
        const res = await apiFetch(apiUrl("/api/consultation/question/next"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pathwayCode: activePathwayCode,
            answers: augmented,
            patient: patientPayload(),
            currentQuestionId: clinicalCurrentId,
          }),
        });
        const data = (await res.json()) as { isComplete?: boolean; nextQuestionId?: string | null; error?: string };
        if (!res.ok) {
          throw new Error(typeof data.error === "string" ? data.error : "Could not load next question.");
        }
        if (data.isComplete) {
          setAnswers(merged);
          await submitConsultation(merged);
          return;
        }
        if (data.nextQuestionId) {
          setClinicalHistory((h) => [...h, clinicalCurrentId]);
          setClinicalCurrentId(data.nextQuestionId);
          setAnswers(merged);
        }
      } else {
        const list = pathwayClinicalQuestionsForPatient(
          activePathwayCode,
          PATHWAY_QUESTIONS[activePathwayCode],
          patient.gender,
        );
        const nextId = resolveNextLinear(clinicalCurrentId, list);
        if (!nextId) {
          setAnswers(merged);
          await submitConsultation(merged);
          return;
        }
        setClinicalHistory((h) => [...h, clinicalCurrentId]);
        setClinicalCurrentId(nextId);
        setAnswers(merged);
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

  const advancePreface = (merged: Record<string, AnswerValue>) => {
    const q = prefaceQuestion;
    if (!q) return;
    const currentAnswer = merged[q.id];
    if (q.required && isAnswerEmpty(q, currentAnswer)) {
      setError("Please answer this question to continue.");
      return;
    }
    setError("");
    if (prefaceIndex < prefaceCount - 1) {
      setPrefaceIndex((i) => i + 1);
    } else {
      setWizardStep("clinical");
    }
  };

  const handlePrefaceAnswer = (value: string | boolean) => {
    if (!prefaceQuestion) return;
    const qId = prefaceQuestion.id;
    const merged = { ...answers, [qId]: value };
    setAnswers(merged);
    if (prefaceQuestion.type === "boolean") {
      setTimeout(() => advancePreface(merged), 250);
    }
  };

  const routeToEmergencyScreen = (questionText: string) => {
    navigation.push("Emergency", { from: activePathwayCode || "unknown", question: questionText });
  };

  const handleClinicalAnswer = (value: string | boolean) => {
    if (!clinicalQuestion) return;
    if (clinicalQuestion.redFlagHint && value === true) {
      routeToEmergencyScreen(clinicalQuestion.text);
      return;
    }
    const qId = clinicalQuestion.id;
    const merged = { ...answers, [qId]: value };
    setAnswers(merged);
    if (clinicalQuestion.type === "boolean") {
      setTimeout(() => void proceedClinicalAfterAnswer(merged), 250);
    }
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

  const advancePrefaceManual = () => {
    if (!prefaceQuestion) return;
    advancePreface(answers);
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
      setWizardStep("preface");
      setPrefaceIndex(prefaceCount - 1);
      setError("");
      return;
    }
    if (wizardStep === "preface") {
      if (prefaceIndex > 0) {
        setPrefaceIndex((i) => i - 1);
        setError("");
        return;
      }
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
      setWizardStep("clinical");
      setError("");
      return;
    }
    if (completedConsultationIds.length > 0) {
      const allIds = completedConsultationIds.join(",");
      navigation.replace("Result", { id: completedConsultationIds[0], ids: allIds });
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
            <MaterialCommunityIcons name="arrow-left" size={20} color="#2563eb" />
          </Pressable>
          <View style={s.headerTitles}>
            <Text style={s.headerTitle} numberOfLines={1}>
              Care Path
            </Text>
            <Text style={s.headerSub} numberOfLines={1}>
              {headerPathwayText}
              {pathwayCodes.length > 1 ? ` (${pathwayIndex + 1}/${pathwayCodes.length})` : ""}
            </Text>
          </View>
          <View style={s.backBtn} />
        </View>

        <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
          {wizardStep === "demographics" && (
            <View>
              <Text style={s.stepPill}>Step 1 — About you</Text>
              <Text style={s.screenTitle}>Before we begin</Text>
              <Text style={s.screenBody}>
                A few details so we can tailor safety checks and your summary. Clinical questions follow a
                server-driven pathway (including branching rules) so the same logic is used in the app and the triage
                engine.
              </Text>
              <View style={s.infoRow}>
                <MaterialCommunityIcons name="shield-check-outline" size={20} color="#2563eb" />
                <Text style={s.infoText}>
                  <Text style={s.infoBold}>Rules-based triage</Text>
                  {" — "}
                  your answers are checked against NHS-aligned pathway rules, not a free-text chatbot.
                </Text>
              </View>

              <View style={s.card}>
                <Text style={s.fieldLabel}>Full name</Text>
                <TextInput
                  style={s.input}
                  placeholder="e.g. Sarah Mitchell"
                  placeholderTextColor="#94a3b8"
                  value={patient.fullName}
                  onChangeText={(t) => setPatient({ ...patient, fullName: t })}
                />
                <Text style={[s.fieldLabel, s.fieldLabelSpaced]}>Age</Text>
                <TextInput
                  style={s.input}
                  placeholder="e.g. 34"
                  placeholderTextColor="#94a3b8"
                  keyboardType="number-pad"
                  value={patient.age}
                  onChangeText={(t) => setPatient({ ...patient, age: t.replace(/\D/g, "").slice(0, 3) })}
                />
                <Text style={[s.fieldLabel, s.fieldLabelSpaced]}>Gender</Text>
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
                <TextInput
                  style={s.input}
                  placeholder="e.g. burning when passing urine, fever"
                  placeholderTextColor="#94a3b8"
                  value={symptoms}
                  onChangeText={setSymptoms}
                />
              </View>

              {error ? (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable style={s.primaryBtn} onPress={handleDemographicsSubmit}>
                <Text style={s.primaryBtnText}>Continue to questions</Text>
                <MaterialCommunityIcons name="chevron-right" size={22} color="#fff" />
              </Pressable>
            </View>
          )}

          {wizardStep === "preface" && prefaceQuestion && (
            <View>
              <Text style={s.stepPillMuted}>
                Quick context ({prefaceIndex + 1}/{prefaceCount})
              </Text>
              <View style={s.card}>
                <Text style={s.qTitle}>{prefaceQuestion.text}</Text>
                {prefaceQuestion.type === "boolean" && (
                  <View style={s.boolRow}>
                    {(["Yes", "No"] as const).map((opt) => (
                      <Pressable
                        key={opt}
                        style={[
                          s.boolBtn,
                          answers[prefaceQuestion.id] === (opt === "Yes") && (opt === "Yes" ? s.boolYes : s.boolNo),
                        ]}
                        onPress={() => handlePrefaceAnswer(opt === "Yes")}
                      >
                        <Text
                          style={[
                            s.boolBtnText,
                            answers[prefaceQuestion.id] === (opt === "Yes") && s.boolBtnTextOn,
                          ]}
                        >
                          {opt}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
                {prefaceQuestion.type === "select" && prefaceQuestion.options && (
                  <View style={s.optionsBlock}>
                    {prefaceQuestion.options.map((opt) => {
                      const selected = answers[prefaceQuestion.id] === opt;
                      return (
                        <Pressable
                          key={opt}
                          style={[s.optionRow, selected && s.optionRowOn]}
                          onPress={() => setAnswers({ ...answers, [prefaceQuestion.id]: opt })}
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
                {error ? <Text style={s.errorInline}>{error}</Text> : null}
                {prefaceQuestion.type !== "boolean" && (
                  <View style={s.mt6}>
                    <Pressable style={s.primaryBtn} onPress={advancePrefaceManual}>
                      <Text style={s.primaryBtnText}>
                        {prefaceIndex === prefaceCount - 1 ? "Continue to clinical questions" : "Next"}
                      </Text>
                      <MaterialCommunityIcons name="chevron-right" size={22} color="#fff" />
                    </Pressable>
                    {!prefaceQuestion.required ? (
                      <Text style={s.hintCenter}>Optional — you can tap Next to skip.</Text>
                    ) : null}
                  </View>
                )}
              </View>
            </View>
          )}

          {wizardStep === "clinical" && clinicalSchemaLoading && (
            <View style={s.loadingBox}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={s.loadingText}>Loading clinical pathway…</Text>
            </View>
          )}

          {wizardStep === "clinical" && !clinicalSchemaLoading && clinicalQuestion && (
            <View>
              {pathwayCodes.length > 1 ? (
                <Pressable style={s.skipBtn} onPress={skipCurrentCondition}>
                  <Text style={s.skipBtnText}>Skip this condition</Text>
                </Pressable>
              ) : null}
              {clinicalQuestion.redFlagHint ? (
                <View style={s.dangerBanner}>
                  <Text style={s.dangerTitle}>Safety question — please answer honestly.</Text>
                  <Text style={s.dangerBody}>
                    These checks detect urgent risk factors and may escalate your outcome immediately when needed.
                  </Text>
                </View>
              ) : null}
              {!useServerFlow ? (
                <View style={s.warnBanner}>
                  <Text style={s.warnTitle}>Offline pathway mode</Text>
                  <Text style={s.warnBody}>{MOCK_DATA_DISCLOSURE}</Text>
                </View>
              ) : null}
              <Text style={s.stepPillMuted}>
                Clinical pathway ({Math.min(clinicalHistory.length + 1, clinicalProgressMax)}/
                {clinicalProgressMax})
              </Text>
              <Text style={s.modeBadge}>{useServerFlow ? "NHS Pathway Logic" : "Offline Fallback Order"}</Text>

              <View style={s.card}>
                <Text style={s.qTitle}>{clinicalQuestion.text}</Text>
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
                            {selected ? <MaterialCommunityIcons name="check" size={14} color="#fff" /> : null}
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
                    placeholderTextColor="#94a3b8"
                    value={typeof answers[clinicalQuestion.id] === "string" ? (answers[clinicalQuestion.id] as string) : ""}
                    onChangeText={(t) => setAnswers({ ...answers, [clinicalQuestion.id]: t })}
                  />
                )}
                {error ? <Text style={s.errorInline}>{error}</Text> : null}
                {clinicalQuestion.type !== "boolean" && (
                  <View style={s.mt6}>
                    <Pressable style={s.primaryBtn} onPress={advanceClinicalManual}>
                      <Text style={s.primaryBtnText}>Next</Text>
                      <MaterialCommunityIcons name="chevron-right" size={22} color="#fff" />
                    </Pressable>
                    {!clinicalQuestion.required ? (
                      <Text style={s.hintCenter}>
                        Optional — you can tap Next without selecting if you prefer.
                      </Text>
                    ) : null}
                  </View>
                )}
              </View>
            </View>
          )}

          {wizardStep === "submitting" && (
            <View style={s.loadingBox}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={s.submitTitle}>Analysing your responses…</Text>
              <Text style={s.submitBody}>
                Our clinical decision engine is evaluating your answers using the selected pathway rules.
              </Text>
            </View>
          )}
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
    paddingHorizontal: SPACING.screenInset,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitles: { flex: 1, minWidth: 0 },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  headerSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
  scrollContent: { paddingBottom: 32, flexGrow: 1 },
  stepPill: {
    alignSelf: "flex-start",
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    fontSize: 11,
    fontWeight: "600",
    color: "#2563eb",
    overflow: "hidden",
  },
  stepPillMuted: {
    alignSelf: "flex-start",
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
  },
  screenTitle: { fontSize: 26, fontWeight: "800", color: "#0f172a" },
  screenBody: { marginTop: 8, fontSize: 14, lineHeight: 21, color: "#475569" },
  infoRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18, color: "#64748b" },
  infoBold: { fontWeight: "700", color: "#0f172a" },
  card: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  fieldLabelSpaced: { marginTop: 14 },
  optional: { fontWeight: "400", color: "#64748b" },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0f172a",
    backgroundColor: "#fff",
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  genderRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  genderChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
  },
  genderChipOn: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  genderChipText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  genderChipTextOn: { color: "#1d4ed8" },
  errorBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  errorText: { fontSize: 14, color: "#b91c1c" },
  errorInline: { marginTop: 12, fontSize: 14, fontWeight: "600", color: "#b91c1c" },
  primaryBtn: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 14,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  qTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", lineHeight: 24 },
  boolRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  boolBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#bae6fd",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  boolYes: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  boolNo: { borderColor: "#94a3b8", backgroundColor: "#f1f5f9" },
  boolBtnText: { fontSize: 16, fontWeight: "700", color: "#64748b" },
  boolBtnTextOn: { color: "#0f172a" },
  optionsBlock: { marginTop: 14, gap: 8 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  optionRowOn: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#94a3b8",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterOn: { borderColor: "#2563eb" },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#2563eb" },
  optionText: { flex: 1, fontSize: 15, color: "#1e293b", lineHeight: 21 },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#94a3b8",
    alignItems: "center",
    justifyContent: "center",
  },
  checkBoxOn: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  mt6: { marginTop: 16 },
  hintCenter: { marginTop: 8, textAlign: "center", fontSize: 12, color: "#64748b" },
  loadingBox: { paddingVertical: 40, alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: "#64748b" },
  skipBtn: {
    alignSelf: "flex-end",
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: "#fff",
  },
  skipBtnText: { fontSize: 12, fontWeight: "600", color: "#475569" },
  dangerBanner: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  dangerTitle: { fontSize: 13, fontWeight: "700", color: "#991b1b" },
  dangerBody: { marginTop: 6, fontSize: 12, lineHeight: 18, color: "#7f1d1d" },
  warnBanner: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
    backgroundColor: "#fffbeb",
  },
  warnTitle: { fontSize: 13, fontWeight: "700", color: "#92400e" },
  warnBody: { marginTop: 6, fontSize: 12, lineHeight: 18, color: "#78350f" },
  modeBadge: {
    alignSelf: "flex-start",
    marginBottom: 8,
    fontSize: 10,
    fontWeight: "700",
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  submitTitle: { marginTop: 16, fontSize: 20, fontWeight: "700", color: "#0f172a" },
  submitBody: { marginTop: 8, fontSize: 14, color: "#64748b", textAlign: "center", paddingHorizontal: 16 },
  centerText: { fontSize: 15, color: "#64748b", textAlign: "center" },
  centerTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", textAlign: "center", marginBottom: 8 },
  linkBtn: { marginTop: 16, alignSelf: "center", paddingVertical: 8 },
  linkBtnText: { fontSize: 15, fontWeight: "600", color: "#2563eb", textDecorationLine: "underline" },
});
