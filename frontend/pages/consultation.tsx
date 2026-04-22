import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Activity,
  ArrowLeft,
  Check,
  ChevronRight,
  ClipboardList,
  ListChecks,
  Shield,
  Sparkles,
  Stethoscope,
  TriangleAlert,
  X,
} from 'lucide-react';
import { apiUrl } from '../lib/api';
import { augmentAnswersForPathway } from '../lib/augmentConsultationAnswers';
import {
  CONSULTATION_PREFACE_QUESTIONS,
  contextAnswersToSymptomHints,
  isContextQuestionId,
  stripContextAnswers,
} from '../lib/consultationPrefaceQuestions';
import { PATHWAY_LABELS } from '../lib/patientPathways';
import { isKnownPathwayQuestions, PATHWAY_QUESTIONS, type PathwayQuestion } from '../lib/pathwayQuestions';
import type { AnswerValue, ConsultationSubmitPayload } from '../types/consultation';

interface PatientInfo {
  fullName: string;
  age: string;
  gender: string;
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
  const pathwayParam = router.query.pathway;
  const pathwayCode =
    typeof pathwayParam === 'string' ? pathwayParam : Array.isArray(pathwayParam) ? pathwayParam[0] : undefined;

  const [step, setStep] = useState<'demographics' | 'questions' | 'submitting'>('demographics');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [patient, setPatient] = useState<PatientInfo>({ fullName: '', age: '', gender: '' });
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [symptoms, setSymptoms] = useState('');
  const [error, setError] = useState('');

  const questions = useMemo(() => {
    if (!pathwayCode || !isKnownPathwayQuestions(pathwayCode)) return [];
    return [...CONSULTATION_PREFACE_QUESTIONS, ...PATHWAY_QUESTIONS[pathwayCode]];
  }, [pathwayCode]);

  const prefaceCount = CONSULTATION_PREFACE_QUESTIONS.length;

  useEffect(() => {
    if (!pathwayCode) return;
    setStep('demographics');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSymptoms('');
    setError('');
  }, [pathwayCode]);

  const currentQuestion = questions[currentQuestionIndex];
  const isPrefaceQuestion = Boolean(currentQuestion && isContextQuestionId(currentQuestion.id));
  const progressPct = questions.length
    ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100)
    : 0;

  const handleDemographicsSubmit = () => {
    if (!patient.fullName || !patient.age || !patient.gender) {
      setError('Please complete all fields before continuing.');
      return;
    }
    setError('');
    setStep('questions');
  };

  const handleAnswer = (value: string | boolean) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    setAnswers((prev) => ({ ...prev, [qId]: value }));
    if (currentQuestion.type === 'boolean') {
      setTimeout(() => advanceQuestion({ ...answers, [qId]: value }), 250);
    }
  };

  const toggleMultiselect = (option: string) => {
    if (!currentQuestion || currentQuestion.type !== 'multiselect') return;
    const qId = currentQuestion.id;
    setAnswers((prev) => {
      const cur = Array.isArray(prev[qId]) ? (prev[qId] as string[]) : [];
      const has = cur.includes(option);
      const next = has ? cur.filter((o) => o !== option) : [...cur, option];
      return { ...prev, [qId]: next };
    });
  };

  const advanceQuestion = (answersOverride?: Record<string, AnswerValue>) => {
    if (!currentQuestion) return;
    const merged = answersOverride ?? answers;
    const currentAnswer = merged[currentQuestion.id];
    if (currentQuestion.required && isAnswerEmpty(currentQuestion, currentAnswer)) {
      setError(
        currentQuestion.type === 'multiselect'
          ? 'Please select at least one option.'
          : 'Please answer this question to continue.',
      );
      return;
    }
    setError('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      submitConsultation(merged);
    }
  };

  const goBack = () => {
    if (step === 'questions') {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex((i) => i - 1);
        setError('');
        return;
      }
      setStep('demographics');
      setError('');
      return;
    }
    router.back();
  };

  const submitConsultation = async (finalAnswers: Record<string, AnswerValue>) => {
    if (!pathwayCode) return;
    setStep('submitting');
    const clinicalOnly = stripContextAnswers(finalAnswers as Record<string, unknown>) as Record<string, AnswerValue>;
    const answersForApi = augmentAnswersForPathway(pathwayCode, clinicalOnly as Record<string, unknown>) as Record<
      string,
      AnswerValue
    >;
    const baseSymptoms = symptoms.split(',').map((s) => s.trim()).filter(Boolean);
    const contextHints = contextAnswersToSymptomHints(finalAnswers as Record<string, unknown>);
    const payload: ConsultationSubmitPayload = {
      pathwayCode,
      answers: answersForApi,
      patient: {
        fullName: patient.fullName,
        age: parseInt(patient.age, 10),
        gender: patient.gender,
      },
      symptoms: [...baseSymptoms, ...contextHints],
    };
    try {
      const res = await fetch(apiUrl('/api/consultation'), {
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
      router.push(`/result?id=${data.consultationId}&outcome=${data.outcome ?? ''}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      setStep('questions');
      setError(
        `${message} You can try again, or go back and check your answers. If the problem persists, confirm the API is running (see README).`,
      );
    }
  };

  if (!router.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin motion-reduce:animate-none" aria-hidden />
      </div>
    );
  }

  if (!pathwayCode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <p className="text-muted-foreground text-sm mb-4 text-center">No clinical pathway was selected.</p>
        <Link href="/" className="text-primary font-semibold underline">
          Return to start
        </Link>
      </div>
    );
  }

  if (!isKnownPathwayQuestions(pathwayCode)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <p className="text-foreground font-semibold mb-2">Unknown pathway</p>
        <p className="text-muted-foreground text-sm mb-4 text-center max-w-md">
          &quot;{pathwayCode}&quot; is not a recognised pathway. Choose a symptom from the home page.
        </p>
        <Link href="/" className="text-primary font-semibold underline">
          Return to start
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-b from-primary/[0.07] via-background to-muted/40">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 max-h-[40vh] bg-[radial-gradient(ellipse_70%_50%_at_50%_-15%,hsl(var(--primary)/0.12),transparent)]"
        aria-hidden
      />

      <header className="relative z-30 border-b border-primary-foreground/10 bg-brand-header/95 text-primary-foreground shadow-card-md backdrop-blur-md supports-[backdrop-filter]:bg-brand-header/90">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={goBack}
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground shadow-sm transition-all hover:border-primary-foreground/35 hover:bg-primary-foreground/20 hover:shadow-md active:scale-95 motion-reduce:transition-colors motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-brand-header sm:h-11 sm:w-11"
            aria-label="Go back"
          >
            <ArrowLeft
              className="h-5 w-5 transition-transform group-hover:-translate-x-0.5 motion-reduce:transform-none"
              strokeWidth={2.25}
              aria-hidden
            />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold leading-tight">Aegis Health AI</p>
            <p className="truncate text-xs text-brand-header-subtle">
              {PATHWAY_LABELS[pathwayCode] || pathwayCode}
            </p>
          </div>
          {step === 'questions' && (
            <span className="shrink-0 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-primary-foreground/95">
              {currentQuestionIndex + 1}/{questions.length}
            </span>
          )}
        </div>

        <div className="mx-auto max-w-xl px-4 pb-2.5 sm:px-5">
          <div className="flex gap-2">
            <div
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-semibold transition-colors sm:text-xs ${
                step === 'demographics'
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-primary-foreground/10 text-primary-foreground/80'
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
              <span className="truncate">About you</span>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 self-center text-primary-foreground/50" aria-hidden />
            <div
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-semibold transition-colors sm:text-xs ${
                step === 'questions' || step === 'submitting'
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-primary-foreground/10 text-primary-foreground/70'
              }`}
            >
              <Stethoscope className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
              <span className="truncate">Clinical questions</span>
            </div>
          </div>
        </div>

        {step === 'questions' && (
          <div className="h-1 bg-primary-foreground/15">
            <div
              className="h-1 rounded-r-full bg-primary-foreground transition-[width] duration-500 ease-out motion-reduce:transition-none"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </header>

      <main className="relative mx-auto w-full max-w-xl flex-1 px-4 py-6 sm:px-5 sm:py-8">

        {step === 'demographics' && (
          <div>
            <div className="mb-6 text-center sm:text-left">
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Step 1 — About you
              </p>
              <h2 className="text-balance text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Before we begin
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                A few details so we can tailor safety checks and your summary. A conversational assistant is planned for a later release; today you follow a structured clinical questionnaire.
              </p>
            </div>

            <div className="mb-4 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/[0.04] px-4 py-3 text-left">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Rules-based triage</span>
                {' — '}
                your answers are checked against NHS-aligned pathway rules, not a free-text chatbot.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-4 rounded-3xl border border-border/80 bg-card/90 p-5 shadow-card-md shadow-primary/[0.06] ring-1 ring-border/50 backdrop-blur-sm sm:p-6">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">Full name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Mitchell"
                    value={patient.fullName}
                    onChange={(e) => setPatient({ ...patient, fullName: e.target.value })}
                    className="w-full rounded-2xl border border-input bg-background/80 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Age</label>
                    <input
                      type="number"
                      placeholder="e.g. 34"
                      min={1}
                      max={120}
                      inputMode="numeric"
                      value={patient.age}
                      onChange={(e) => setPatient({ ...patient, age: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background/80 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Gender</label>
                    <select
                      value={patient.gender}
                      onChange={(e) => setPatient({ ...patient, gender: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background/80 px-4 py-3.5 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
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
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Describe your symptoms <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. burning when passing urine, fever"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background/80 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleDemographicsSubmit}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/92 active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                Continue to questions
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>
        )}

        {step === 'questions' && currentQuestion && (
          <div>
            {currentQuestion.redFlagHint && (
              <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200/90 bg-red-50/95 p-4 shadow-sm">
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" strokeWidth={2} aria-hidden />
                <p className="text-sm font-semibold leading-snug text-red-800">Safety question — please answer honestly.</p>
              </div>
            )}

            {isPrefaceQuestion && (
              <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/20 bg-muted/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Activity className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Quick context ({currentQuestionIndex + 1}/{prefaceCount})
              </p>
            )}

            {!isPrefaceQuestion && (
              <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                <ListChecks className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Clinical pathway ({currentQuestionIndex + 1 - prefaceCount}/{questions.length - prefaceCount})
              </p>
            )}

            <div className="rounded-3xl border border-primary/10 bg-card/95 p-5 shadow-card-md shadow-primary/[0.08] ring-1 ring-border/60 backdrop-blur-sm sm:p-7">
              <h2 className="text-balance text-lg font-bold leading-snug text-foreground sm:text-xl">
                {currentQuestion.text}
              </h2>

              <div className="mt-6">
                {currentQuestion.type === 'boolean' && (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {['Yes', 'No'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAnswer(opt === 'Yes')}
                        className={`rounded-2xl border-2 py-4 text-base font-bold transition-all active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 sm:py-5 ${
                          answers[currentQuestion.id] === (opt === 'Yes')
                            ? opt === 'Yes'
                              ? 'border-primary bg-primary/12 text-primary shadow-md shadow-primary/10'
                              : 'border-muted-foreground/35 bg-muted text-foreground shadow-inner'
                            : 'border-border text-muted-foreground hover:border-primary/35 hover:bg-muted/40'
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

                {currentQuestion.type === 'select' && (
                  <div className="space-y-2.5">
                    {currentQuestion.options?.map((opt) => {
                      const selected = answers[currentQuestion.id] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleAnswer(opt)}
                          className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-all active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100 sm:py-4 ${
                            selected
                              ? 'border-primary bg-primary/10 text-primary shadow-sm'
                              : 'border-border text-card-foreground hover:border-primary/30 hover:bg-muted/50'
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                              selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/25 text-muted-foreground'
                            }`}
                          >
                            {selected ? '✓' : ''}
                          </span>
                          <span className="flex-1 leading-snug">{opt}</span>
                          <ChevronRight className={`h-4 w-4 shrink-0 ${selected ? 'text-primary' : 'text-muted-foreground/40'}`} strokeWidth={2} aria-hidden />
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.type === 'multiselect' && currentQuestion.options && (
                  <div className="space-y-2.5">
                    {currentQuestion.options.map((opt) => {
                      const selected = Array.isArray(answers[currentQuestion.id]) && (answers[currentQuestion.id] as string[]).includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleMultiselect(opt)}
                          className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-all active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100 sm:py-4 ${
                            selected
                              ? 'border-primary bg-primary/10 text-primary shadow-sm'
                              : 'border-border text-card-foreground hover:border-primary/30 hover:bg-muted/50'
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-xs ${
                              selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/25 text-muted-foreground'
                            }`}
                          >
                            {selected ? '✓' : ''}
                          </span>
                          <span className="flex-1 leading-snug">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.type === 'text' && (
                  <textarea
                    placeholder="Type here (or leave blank if not applicable)"
                    value={typeof answers[currentQuestion.id] === 'string' ? (answers[currentQuestion.id] as string) : ''}
                    onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-input bg-background/80 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                )}
              </div>

              {error && (
                <p className="mt-4 text-sm font-medium text-destructive" role="alert">
                  {error}
                </p>
              )}

              {currentQuestion.type !== 'boolean' && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => advanceQuestion()}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/92 active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100"
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Submit consultation' : 'Next'}
                    <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </button>
                  {!currentQuestion.required && (
                    <p className="mt-2 text-center text-xs text-muted-foreground">Optional — you can tap Next without selecting if you prefer.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'submitting' && (
          <div className="rounded-3xl border border-border bg-card/95 p-10 text-center shadow-card-md ring-1 ring-border/60 backdrop-blur-sm sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent motion-safe:animate-spin" aria-hidden />
            </div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">Analysing your responses…</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Our clinical decision engine is evaluating your answers using the selected pathway rules.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
