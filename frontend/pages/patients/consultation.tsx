import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Activity,
  ArrowLeft,
  Check,
  ChevronRight,
  ListChecks,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import { apiFetch, apiUrl } from '../../lib/api';
import { augmentAnswersForPathway } from '../../lib/augmentConsultationAnswers';
import {
  CONSULTATION_PREFACE_QUESTIONS,
  contextAnswersToSymptomHints,
  stripContextAnswers,
} from '../../lib/consultationPrefaceQuestions';
import { PATHWAY_LABELS } from '../../lib/patientPathways';
import {
  isKnownPathwayQuestions,
  PATHWAY_QUESTIONS,
  pathwayClinicalQuestionsForPatient,
  type PathwayQuestion,
} from '../../lib/pathwayQuestions';
import type { AnswerValue, ConsultationSubmitPayload } from '../../types/consultation';
import { useMultiConditionFlow } from '../../hooks/useMultiConditionFlow';
import InlineNotice from '../../components/InlineNotice';
import { MOCK_DATA_DISCLOSURE } from '../../lib/complianceContent';
import SafetyPanel from '../../components/SafetyPanel';
import ClinicalQuestionCard from '../../components/consultation/ClinicalQuestionCard';
import ConsultationHeader from '../../components/consultation/ConsultationHeader';

interface PatientInfo {
  fullName: string;
  age: string;
  gender: string;
}

function PatientsShellFallbackHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-sky-200/70 bg-white/80 text-foreground shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/65">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-2 px-3 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:gap-3 sm:px-4 sm:pb-3 sm:pt-3">
        <Link
          href="/patients"
          aria-label="Back to triage"
          className="touch-manipulation inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-primary/25 bg-white/90 text-primary shadow-sm transition active:scale-95 hover:border-primary/40 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.2} aria-hidden />
        </Link>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground shadow-md ring-2 ring-primary/20 sm:h-11 sm:w-11"
          aria-hidden
        >
          A
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold leading-tight tracking-tight text-slate-900 sm:text-base">
            Aegis Health AI
          </p>
          <p className="truncate text-[11px] font-medium leading-tight text-slate-500 sm:text-xs">Consultation</p>
        </div>
      </div>
    </header>
  );
}

function PatientsMobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-300 via-slate-200 to-slate-400 px-2 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-4 md:px-6 md:py-6">
      <div className="relative flex h-[min(52rem,calc(100dvh-1rem))] w-full max-w-[min(calc(100vw-1rem),24rem)] flex-col overflow-hidden rounded-2xl border-[5px] border-slate-900 bg-gradient-to-b from-sky-50 via-[#e8f2ff] to-slate-50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)] ring-1 ring-white/10 sm:rounded-[1.75rem] sm:border-[6px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.55)] sm:ring-white/15 md:max-w-[24rem] md:rounded-[1.875rem]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cg fill='%232563eb' fill-opacity='0.06'%3E%3Cpath d='M22 10h4v12h12v4H26v12h-4V26H10v-4h12V10z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[min(52vh,28rem)] bg-[radial-gradient(ellipse_85%_70%_at_50%_-5%,rgba(37,99,235,0.14),transparent_65%)]"
          aria-hidden
        />
        <div className="relative z-0 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg focus:ring-2 focus:ring-primary"
          >
            Skip to main content
          </a>
          {children}
        </div>
      </div>
    </div>
  );
}

function isAnswerEmpty(question: PathwayQuestion, value: AnswerValue | undefined): boolean {
  if (value === undefined) {
    if (question.type === 'text' && question.required === false) return false;
    return question.required;
  }
  if (question.type === 'multiselect') {
    return !Array.isArray(value) || value.length === 0;
  }
  if (question.type === 'text' && question.required === false) {
    return false;
  }
  if (question.type === 'text' && typeof value === 'string' && value.trim() === '') {
    return question.required;
  }
  return false;
}

export default function ConsultationPage() {
  const router = useRouter();
  const {
    pathwayCodes,
    pathwayIndex,
    activePathwayCode,
    hasMorePathways,
    moveToNextPathway,
    completedConsultationIds,
    setCompletedConsultationIds,
  } = useMultiConditionFlow(router.query.pathways, router.query.pathway);

  const [wizardStep, setWizardStep] = useState<'demographics' | 'preface' | 'clinical' | 'submitting'>('demographics');
  const [prefaceIndex, setPrefaceIndex] = useState(0);
  const [patient, setPatient] = useState<PatientInfo>({ fullName: '', age: '', gender: '' });
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [symptoms, setSymptoms] = useState('');
  const [error, setError] = useState('');

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

  useEffect(() => {
    if (!activePathwayCode) return;
    setAnswers((existing) => {
      const prefaceIds = new Set(CONSULTATION_PREFACE_QUESTIONS.map((q) => q.id));
      const preserved = Object.fromEntries(Object.entries(existing).filter(([key]) => prefaceIds.has(key)));
      return preserved;
    });
    setError('');
    setQuestionsById({});
    setClinicalCurrentId(null);
    setClinicalHistory([]);
    setClinicalProgressMax(1);
    setUseServerFlow(true);
    setClinicalSchemaLoading(false);
  }, [activePathwayCode]);

  useEffect(() => {
    if (wizardStep !== 'clinical' || !activePathwayCode) return;
    let cancelled = false;
    setClinicalSchemaLoading(true);
    (async () => {
      try {
        const genderParam = patient.gender ? `?gender=${encodeURIComponent(patient.gender)}` : '';
        const r = await apiFetch(
          apiUrl(`/api/consultation/definitions/${encodeURIComponent(activePathwayCode)}${genderParam}`),
        );
        if (!r.ok) throw new Error('definitions');
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
        const qs = pathwayClinicalQuestionsForPatient(activePathwayCode, PATHWAY_QUESTIONS[activePathwayCode], patient.gender);
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
      setError('Please complete all fields before continuing.');
      return;
    }
    setError('');
    setWizardStep('preface');
    setPrefaceIndex(0);
  };

  const patientPayload = () => ({
    fullName: patient.fullName,
    age: parseInt(patient.age, 10),
    gender: patient.gender,
  });

  const advancePreface = (merged: Record<string, AnswerValue>) => {
    const q = prefaceQuestion;
    if (!q) return;
    const currentAnswer = merged[q.id];
    if (q.required && isAnswerEmpty(q, currentAnswer)) {
      setError('Please answer this question to continue.');
      return;
    }
    setError('');
    if (prefaceIndex < prefaceCount - 1) {
      setPrefaceIndex((i) => i + 1);
    } else {
      setWizardStep('clinical');
    }
  };

  const resolveNextLinear = (fromId: string, list: PathwayQuestion[]): string | null => {
    const idx = list.findIndex((x) => x.id === fromId);
    if (idx < 0 || idx >= list.length - 1) return null;
    return list[idx + 1].id;
  };

  const proceedClinicalAfterAnswer = async (merged: Record<string, AnswerValue>) => {
    if (!activePathwayCode || !clinicalCurrentId) return;
    const clinicalOnly = stripContextAnswers(merged as Record<string, unknown>) as Record<string, AnswerValue>;
    const augmented = augmentAnswersForPathway(activePathwayCode, clinicalOnly as Record<string, unknown>) as Record<
      string,
      AnswerValue
    >;

    try {
      if (useServerFlow) {
        const res = await apiFetch(apiUrl('/api/consultation/question/next'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pathwayCode: activePathwayCode,
            answers: augmented,
            patient: patientPayload(),
            currentQuestionId: clinicalCurrentId,
          }),
        });
        const data = (await res.json()) as { isComplete?: boolean; nextQuestionId?: string | null; error?: string };
        if (!res.ok) {
          throw new Error(typeof data.error === 'string' ? data.error : 'Could not load next question.');
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
        const list = pathwayClinicalQuestionsForPatient(activePathwayCode, PATHWAY_QUESTIONS[activePathwayCode], patient.gender);
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
      const msg = e instanceof Error ? e.message : 'Could not continue.';
      setError(msg);
    }
  };

  const handlePrefaceAnswer = (value: string | boolean) => {
    if (!prefaceQuestion) return;
    const qId = prefaceQuestion.id;
    const merged = { ...answers, [qId]: value };
    setAnswers(merged);
    if (prefaceQuestion.type === 'boolean') {
      setTimeout(() => advancePreface(merged), 250);
    }
  };

  const handleClinicalAnswer = (value: string | boolean) => {
    if (!clinicalQuestion) return;
    const qId = clinicalQuestion.id;
    const merged = { ...answers, [qId]: value };
    setAnswers(merged);
    if (clinicalQuestion.type === 'boolean') {
      setTimeout(() => void proceedClinicalAfterAnswer(merged), 250);
    }
  };

  const toggleClinicalMultiselect = (option: string) => {
    if (!clinicalQuestion || clinicalQuestion.type !== 'multiselect') return;
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
        clinicalQuestion.type === 'multiselect'
          ? 'Please select at least one option.'
          : 'Please answer this question to continue.',
      );
      return;
    }
    setError('');
    void proceedClinicalAfterAnswer(answers);
  };

  const goBack = () => {
    if (wizardStep === 'clinical') {
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
        setError('');
        return;
      }
      setWizardStep('preface');
      setPrefaceIndex(prefaceCount - 1);
      setError('');
      return;
    }
    if (wizardStep === 'preface') {
      if (prefaceIndex > 0) {
        setPrefaceIndex((i) => i - 1);
        setError('');
        return;
      }
      setWizardStep('demographics');
      setError('');
      return;
    }
    if (wizardStep === 'demographics') {
      router.back();
      return;
    }
    router.back();
  };

  const skipCurrentCondition = () => {
    if (hasMorePathways) {
      moveToNextPathway();
      setWizardStep('clinical');
      setError('');
      return;
    }
    if (completedConsultationIds.length > 0) {
      const allIds = completedConsultationIds.join(',');
      void router.push(`/patients/result?ids=${encodeURIComponent(allIds)}&id=${encodeURIComponent(completedConsultationIds[0])}`);
      return;
    }
    void router.push('/');
  };

  const submitConsultation = async (finalAnswers: Record<string, AnswerValue>) => {
    if (!activePathwayCode) return;
    setWizardStep('submitting');
    const clinicalOnly = stripContextAnswers(finalAnswers as Record<string, unknown>) as Record<string, AnswerValue>;
    const answersForApi = augmentAnswersForPathway(activePathwayCode, clinicalOnly as Record<string, unknown>) as Record<
      string,
      AnswerValue
    >;
    const baseSymptoms = symptoms.split(',').map((s) => s.trim()).filter(Boolean);
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
      const res = await apiFetch(apiUrl('/api/consultation'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      let data: { consultationId?: string; error?: string; outcome?: string } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Submission failed');
      }
      if (!data.consultationId) {
        throw new Error('Invalid response from server.');
      }
      const nextIds = [...completedConsultationIds, data.consultationId];
      if (hasMorePathways) {
        setCompletedConsultationIds(nextIds);
        moveToNextPathway();
        setWizardStep('clinical');
        return;
      }
      const allIds = nextIds.join(',');
      router.push(`/patients/result?ids=${encodeURIComponent(allIds)}&id=${encodeURIComponent(nextIds[0])}&outcome=${data.outcome ?? ''}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      setWizardStep('clinical');
      const apiHint =
        message.includes('Failed to fetch') || message.includes('backend')
          ? ' For a real backend, set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_USE_API_MOCKS=false in frontend/.env.local.'
          : '';
      setError(
        `${message} You can try again or go back and check your answers.${apiHint}`,
      );
    }
  };

  const prefaceProgressPct = prefaceCount ? Math.round(((prefaceIndex + 1) / prefaceCount) * 100) : 0;
  const clinicalProgressPct =
    clinicalProgressMax > 0
      ? Math.round((Math.min(clinicalHistory.length + 1, clinicalProgressMax) / clinicalProgressMax) * 100)
      : 0;
  const clinicalProgressLabel = `${Math.min(clinicalHistory.length + 1, clinicalProgressMax)}/${clinicalProgressMax}`;
  const headerPathwayText = pathwayCodes.map((code) => PATHWAY_LABELS[code] || code).join(' + ');

  if (!router.isReady) {
    return (
      <PatientsMobileShell>
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
          <div
            className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent motion-safe:animate-spin"
            aria-hidden
          />
          <p className="mt-4 text-sm font-semibold text-slate-900">Loading consultation</p>
          <p className="mt-1 text-center text-xs text-slate-600">Preparing your selected pathways.</p>
        </main>
      </PatientsMobileShell>
    );
  }

  if (pathwayCodes.length === 0) {
    return (
      <PatientsMobileShell>
        <PatientsShellFallbackHeader />
        <main
          id="main-content"
          className="relative mx-auto w-full min-w-0 max-w-5xl flex-1 px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-4 sm:py-8"
        >
          <div className="rounded-2xl border border-sky-200/60 bg-white/90 p-5 text-center shadow-xl shadow-sky-900/10 backdrop-blur-sm sm:p-6">
            <p className="text-sm text-slate-600">No clinical pathway was selected.</p>
            <Link
              href="/patients"
              className="mt-4 inline-block text-sm font-semibold text-primary underline underline-offset-2"
            >
              Return to triage
            </Link>
          </div>
        </main>
      </PatientsMobileShell>
    );
  }

  if (pathwayCodes.some((code) => !isKnownPathwayQuestions(code))) {
    const unknownCode = pathwayCodes.find((code) => !isKnownPathwayQuestions(code));
    return (
      <PatientsMobileShell>
        <PatientsShellFallbackHeader />
        <main
          id="main-content"
          className="relative mx-auto w-full min-w-0 max-w-5xl flex-1 px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-4 sm:py-8"
        >
          <div className="rounded-2xl border border-sky-200/60 bg-white/90 p-5 text-center shadow-xl shadow-sky-900/10 backdrop-blur-sm sm:p-6">
            <p className="font-semibold text-slate-900">Unknown pathway</p>
            <p className="mt-2 text-sm text-slate-600">
              &quot;{unknownCode}&quot; is not a recognised pathway. Choose a symptom from triage.
            </p>
            <Link
              href="/patients"
              className="mt-4 inline-block text-sm font-semibold text-primary underline underline-offset-2"
            >
              Return to triage
            </Link>
          </div>
        </main>
      </PatientsMobileShell>
    );
  }

  return (
    <PatientsMobileShell>
      <ConsultationHeader
        titlePathwayText={headerPathwayText}
        pathwayIndex={pathwayIndex}
        pathwayCount={pathwayCodes.length}
        wizardStep={wizardStep}
        prefaceIndex={prefaceIndex}
        prefaceCount={prefaceCount}
        clinicalCurrentId={clinicalCurrentId}
        clinicalSchemaLoading={clinicalSchemaLoading}
        clinicalProgressLabel={clinicalProgressLabel}
        prefaceProgressPct={prefaceProgressPct}
        clinicalProgressPct={clinicalProgressPct}
        onGoBack={goBack}
      />

      <main
        id="main-content"
        className="relative mx-auto w-full min-w-0 max-w-5xl flex-1 px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:px-4 sm:py-6 lg:py-6"
      >
        {!useServerFlow && wizardStep === 'clinical' && !clinicalSchemaLoading ? (
          <InlineNotice title="Offline pathway mode" tone="warning" className="mb-4">
            {MOCK_DATA_DISCLOSURE}
          </InlineNotice>
        ) : null}
        {wizardStep === 'demographics' && (
          <div>
            <div className="mb-5 text-center sm:mb-6 sm:text-left">
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-sky-200/80 bg-white/80 px-3 py-1 text-[11px] font-semibold text-primary shadow-sm backdrop-blur-md sm:text-xs">
                <Sparkles className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                Step 1 — About you
              </p>
              <h2 className="text-balance text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Before we begin
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                A few details so we can tailor safety checks and your summary. Clinical questions follow a{' '}
                <span className="font-medium text-slate-900">server-driven pathway</span> (including any branching
                rules) so the same logic is used in the app and the triage engine.
              </p>
            </div>

            <div className="mb-4 flex items-start gap-3 rounded-2xl border border-sky-200/70 bg-white/80 px-4 py-3 text-left shadow-sm backdrop-blur-sm">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
              <p className="text-xs leading-relaxed text-slate-600">
                <span className="font-semibold text-slate-900">Rules-based triage</span>
                {' — '}
                your answers are checked against NHS-aligned pathway rules, not a free-text chatbot.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-4 rounded-2xl border border-sky-200/60 bg-white/90 p-4 shadow-xl shadow-sky-900/10 backdrop-blur-sm sm:rounded-3xl sm:p-6">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-900">Full name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Mitchell"
                    value={patient.fullName}
                    onChange={(e) => setPatient({ ...patient, fullName: e.target.value })}
                    className="w-full rounded-2xl border border-sky-200/90 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-900">Age</label>
                    <input
                      type="number"
                      placeholder="e.g. 34"
                      min={1}
                      max={120}
                      inputMode="numeric"
                      value={patient.age}
                      onChange={(e) => setPatient({ ...patient, age: e.target.value })}
                      className="w-full rounded-2xl border border-sky-200/90 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-900">Gender</label>
                    <select
                      value={patient.gender}
                      onChange={(e) => setPatient({ ...patient, gender: e.target.value })}
                      className="w-full rounded-2xl border border-sky-200/90 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="">Select</option>
                      <option>Female</option>
                      <option>Male</option>
                      <option>Other</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-900">
                    Describe your symptoms <span className="font-normal text-slate-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. burning when passing urine, fever"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full rounded-2xl border border-sky-200/90 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200/90 bg-rose-50/95 px-4 py-3 text-sm text-red-800 shadow-sm" role="alert">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleDemographicsSubmit}
                className="touch-manipulation group flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 ring-offset-white transition-all hover:bg-primary/90 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                Continue to questions
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>
        )}

        {wizardStep === 'preface' && prefaceQuestion && (
          <div>
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-sky-200/80 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600 shadow-sm backdrop-blur-md sm:text-[11px]">
              <Activity className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
              Quick context ({prefaceIndex + 1}/{prefaceCount})
            </p>

            <div className="rounded-2xl border border-sky-200/60 bg-white/90 p-4 shadow-xl shadow-sky-900/10 backdrop-blur-sm sm:rounded-3xl sm:p-7">
              <h2 className="text-balance text-lg font-bold leading-snug text-slate-900 sm:text-xl">
                {prefaceQuestion.text}
              </h2>

              <div className="mt-6">
                {prefaceQuestion.type === 'boolean' && (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {['Yes', 'No'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handlePrefaceAnswer(opt === 'Yes')}
                        className={`touch-manipulation rounded-2xl border-2 py-4 text-base font-bold transition-all active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 sm:py-5 ${
                          answers[prefaceQuestion.id] === (opt === 'Yes')
                            ? opt === 'Yes'
                              ? 'border-primary bg-primary/12 text-primary shadow-md shadow-primary/10'
                              : 'border-slate-300 bg-slate-100 text-slate-800 shadow-inner'
                            : 'border-sky-200/80 bg-white/70 text-slate-500 hover:border-primary/35 hover:bg-sky-50/80'
                        }`}
                      >
                        {opt === 'Yes' ? (
                          <span className="inline-flex items-center justify-center gap-2">
                            <Check className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center gap-2">
                            <X className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden />
                            No
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {prefaceQuestion.type === 'select' && (
                  <div className="space-y-2.5">
                    {prefaceQuestion.options?.map((opt) => {
                      const selected = answers[prefaceQuestion.id] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswers({ ...answers, [prefaceQuestion.id]: opt })}
                          className={`touch-manipulation flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-all active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100 sm:py-4 ${
                            selected
                              ? 'border-primary bg-primary/10 text-primary shadow-sm'
                              : 'border-sky-200/80 bg-white/80 text-slate-800 hover:border-primary/30 hover:bg-sky-50/80'
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                              selected ? 'border-primary bg-primary text-primary-foreground' : 'border-slate-300 text-slate-500'
                            }`}
                          >
                            {selected ? '✓' : ''}
                          </span>
                          <span className="flex-1 leading-snug">{opt}</span>
                          <ChevronRight className={`h-4 w-4 shrink-0 ${selected ? 'text-primary' : 'text-slate-400'}`} strokeWidth={2} aria-hidden />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {error && (
                <p className="mt-4 text-sm font-medium text-red-700" role="alert">
                  {error}
                </p>
              )}

              {prefaceQuestion.type !== 'boolean' && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={advancePrefaceManual}
                    className="touch-manipulation flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:active:scale-100"
                  >
                    {prefaceIndex === prefaceCount - 1 ? 'Continue to clinical questions' : 'Next'}
                    <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </button>
                  {!prefaceQuestion.required && (
                    <p className="mt-2 text-center text-xs text-slate-500">Optional — you can tap Next to skip.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {wizardStep === 'clinical' && clinicalSchemaLoading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-sky-200/60 bg-white/90 py-16 shadow-inner backdrop-blur-sm">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent motion-safe:animate-spin" aria-hidden />
            <p className="mt-4 text-sm text-slate-600">Loading clinical pathway…</p>
          </div>
        )}

        {wizardStep === 'clinical' && !clinicalSchemaLoading && clinicalQuestion && (
          <div>
            {pathwayCodes.length > 1 && (
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={skipCurrentCondition}
                  className="touch-manipulation rounded-xl border-2 border-sky-200/80 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-primary/30 hover:bg-sky-50 hover:text-slate-900"
                >
                  Skip this condition
                </button>
              </div>
            )}
            {clinicalQuestion.redFlagHint && (
              <SafetyPanel title="Safety question — please answer honestly." level="danger">
                These checks detect urgent risk factors and may escalate your outcome immediately when needed.
              </SafetyPanel>
            )}

            <p className="mb-3 inline-flex flex-wrap items-center gap-1.5 rounded-full border border-sky-200/80 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary shadow-sm backdrop-blur-md sm:text-[11px]">
              <ListChecks className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
              Clinical pathway ({Math.min(clinicalHistory.length + 1, clinicalProgressMax)}/{clinicalProgressMax})
              {!useServerFlow ? (
                <span className="font-normal normal-case text-slate-500">(offline order)</span>
              ) : null}
            </p>

            <ClinicalQuestionCard
              question={clinicalQuestion}
              answers={answers}
              error={error}
              onBooleanAnswer={handleClinicalAnswer}
              onSelectAnswer={(opt) => setAnswers({ ...answers, [clinicalQuestion.id]: opt })}
              onMultiselectToggle={toggleClinicalMultiselect}
              onTextAnswer={(value) => setAnswers({ ...answers, [clinicalQuestion.id]: value })}
              onNext={advanceClinicalManual}
            />
          </div>
        )}

        {wizardStep === 'submitting' && (
          <div className="rounded-2xl border border-sky-200/60 bg-white/90 p-8 text-center shadow-xl shadow-sky-900/10 backdrop-blur-sm sm:rounded-3xl sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent motion-safe:animate-spin" aria-hidden />
            </div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Analysing your responses…</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
              Our clinical decision engine is evaluating your answers using the selected pathway rules.
            </p>
          </div>
        )}
      </main>
    </PatientsMobileShell>
  );
}
