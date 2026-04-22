import { useState } from 'react';
import { useRouter } from 'next/router';
import { Check, TriangleAlert, X } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'boolean' | 'select' | 'text' | 'multiselect';
  options?: string[];
  required: boolean;
  redFlagHint?: boolean;
}

interface PatientInfo {
  fullName: string;
  age: string;
  gender: string;
}

const PATHWAY_QUESTIONS: Record<string, Question[]> = {
  uti: [
    { id: 'q1', text: 'How long have you had these symptoms?', type: 'select', options: ['Less than 24 hours', '1–3 days', '4–7 days', 'More than 7 days'], required: true },
    { id: 'q2', text: 'Do you have blood in your urine?', type: 'boolean', required: true },
    { id: 'q3', text: 'Do you have a fever (temperature above 38°C)?', type: 'boolean', required: true },
    { id: 'q4', text: 'Do you have pain in your back or side (loin pain)?', type: 'boolean', required: true },
    { id: 'q5', text: 'Are you pregnant or could you be pregnant?', type: 'boolean', required: true },
    { id: 'q6', text: 'Do you have a urinary catheter?', type: 'boolean', required: true },
    { id: 'q7', text: 'Have you taken antibiotics for a UTI in the last 3 months?', type: 'boolean', required: true },
    { id: 'q8', text: 'Do you have any known kidney problems or recurring UTIs (3+ per year)?', type: 'boolean', required: true },
    { id: 'q9', text: 'Do you have any drug allergies?', type: 'text', required: false },
  ],
  sore_throat: [
    { id: 'q1', text: 'How long have you had a sore throat?', type: 'select', options: ['Less than 3 days', '3–7 days', 'More than 7 days'], required: true },
    { id: 'q2', text: 'Do you have difficulty swallowing?', type: 'boolean', required: true },
    { id: 'q3', text: 'Do you have difficulty breathing or opening your mouth fully?', type: 'boolean', required: true, redFlagHint: true },
    { id: 'q4', text: 'Do you have a fever (temperature above 38°C)?', type: 'boolean', required: true },
    { id: 'q5', text: 'Have you noticed a skin rash?', type: 'boolean', required: true },
    { id: 'q6', text: 'Do you have swollen glands in your neck?', type: 'boolean', required: true },
    { id: 'q7', text: 'Have you coughed in the last 24 hours?', type: 'boolean', required: true },
    { id: 'q8', text: 'Can you see any white patches or pus on your tonsils?', type: 'boolean', required: true },
  ],
  sinusitis: [
    { id: 'q1', text: 'How long have you had sinus symptoms?', type: 'select', options: ['Less than 10 days', '10 days to 12 weeks', 'More than 12 weeks'], required: true },
    { id: 'q2', text: 'Do you have facial pain or pressure?', type: 'boolean', required: true },
    { id: 'q3', text: 'Do you have a blocked or runny nose?', type: 'boolean', required: true },
    { id: 'q4', text: 'Do you have a fever (temperature above 38°C)?', type: 'boolean', required: true },
    { id: 'q5', text: 'Do you have a severe or worsening headache?', type: 'boolean', required: true },
    { id: 'q6', text: 'Do you have any visual changes or eye swelling?', type: 'boolean', required: true, redFlagHint: true },
    { id: 'q7', text: 'Do you have neck stiffness or sensitivity to light?', type: 'boolean', required: true, redFlagHint: true },
  ],
  shingles: [
    { id: 'q1', text: 'When did the rash first appear?', type: 'select', options: ['Today (within 24 hours)', '1–2 days ago', '3 days ago', 'More than 3 days ago'], required: true },
    { id: 'q2', text: 'Is the rash only on ONE side of your body?', type: 'boolean', required: true },
    { id: 'q3', text: 'Where is the rash?', type: 'select', options: ['Torso / chest / back', 'Face or forehead', 'Around one eye', 'Scalp', 'Arm or leg'], required: true },
    { id: 'q4', text: 'Do you have pain, burning, or tingling in the rash area?', type: 'boolean', required: true },
    { id: 'q5', text: 'Do you have any eye pain or vision changes?', type: 'boolean', required: true, redFlagHint: true },
    { id: 'q6', text: 'Do you have ear pain or hearing problems?', type: 'boolean', required: true },
    { id: 'q7', text: 'Are you immunocompromised (e.g. HIV, cancer treatment)?', type: 'boolean', required: true },
    { id: 'q8', text: 'Are you pregnant?', type: 'boolean', required: true },
  ],
};

const DEFAULT_QUESTIONS: Question[] = [
  { id: 'q1', text: 'How long have you had your symptoms?', type: 'select', options: ['Less than 3 days', '3–7 days', 'More than 7 days'], required: true },
  { id: 'q2', text: 'Do you have a fever (temperature above 38°C)?', type: 'boolean', required: true },
  { id: 'q3', text: 'Are your symptoms getting worse?', type: 'boolean', required: true },
  { id: 'q4', text: 'Do you have any drug allergies?', type: 'text', required: false },
];

const PATHWAY_LABELS: Record<string, string> = {
  uti: 'UTI',
  sore_throat: 'Sore Throat',
  sinusitis: 'Sinusitis',
  otitis_media: 'Ear Infection',
  insect_bites: 'Insect Bite',
  impetigo: 'Impetigo',
  shingles: 'Shingles',
};

export default function ConsultationPage() {
  const router = useRouter();
  const { pathway } = router.query as { pathway: string };

  const [step, setStep] = useState<'demographics' | 'questions' | 'submitting'>('demographics');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [patient, setPatient] = useState<PatientInfo>({ fullName: '', age: '', gender: '' });
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [symptoms, setSymptoms] = useState('');
  const [error, setError] = useState('');

  const questions = PATHWAY_QUESTIONS[pathway] || DEFAULT_QUESTIONS;
  const currentQuestion = questions[currentQuestionIndex];
  const progressPct = Math.round((currentQuestionIndex / questions.length) * 100);

  const handleDemographicsSubmit = () => {
    if (!patient.fullName || !patient.age || !patient.gender) {
      setError('Please complete all fields before continuing.');
      return;
    }
    setError('');
    setStep('questions');
  };

  const handleAnswer = (value: string | boolean) => {
    const qId = currentQuestion.id;
    setAnswers((prev) => ({ ...prev, [qId]: value }));
    if (currentQuestion.type === 'boolean') {
      setTimeout(() => advanceQuestion(qId, value), 250);
    }
  };

  const advanceQuestion = (qId?: string, value?: string | boolean) => {
    const updatedAnswers = qId ? { ...answers, [qId]: value } : answers;
    const currentAnswer = updatedAnswers[currentQuestion.id];
    if (currentQuestion.required && currentAnswer === undefined) {
      setError('Please answer this question to continue.');
      return;
    }
    setError('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      submitConsultation(updatedAnswers);
    }
  };

  const submitConsultation = async (finalAnswers: Record<string, string | boolean>) => {
    setStep('submitting');
    const payload = {
      pathwayCode: pathway,
      answers: finalAnswers,
      patient: { fullName: patient.fullName, age: parseInt(patient.age, 10), gender: patient.gender },
      symptoms: symptoms.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      const res = await fetch('http://localhost:4000/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      router.push(`/result?id=${data.consultationId}&outcome=${data.outcome}`);
    } catch {
      router.push(`/result?id=c0000001-0000-0000-0000-000000000001&outcome=pharmacy&demo=true`);
    }
  };

  if (!pathway) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" aria-hidden />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <header className="bg-brand-header text-primary-foreground sticky top-0 z-30 shadow-card-md">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => step === 'questions' && currentQuestionIndex > 0
              ? setCurrentQuestionIndex((i) => i - 1)
              : router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary-foreground/15 flex-shrink-0"
            aria-label="Go back"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight truncate">Aegis Health AI</p>
            <p className="text-brand-header-subtle text-xs truncate">{PATHWAY_LABELS[pathway] || pathway} Consultation</p>
          </div>
          {step === 'questions' && (
            <span className="text-brand-header-subtle text-xs flex-shrink-0">
              {currentQuestionIndex + 1}/{questions.length}
            </span>
          )}
        </div>
        {step === 'questions' && (
          <div className="h-1 bg-primary-foreground/20">
            <div
              className="h-1 bg-primary-foreground/80 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">

        {step === 'demographics' && (
          <div>
            <div className="mb-6">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Step 1 of 2</p>
              <h2 className="text-xl font-bold text-foreground">Before we begin</h2>
              <p className="text-muted-foreground text-sm mt-1">A few details to personalise your consultation.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-card rounded-2xl shadow-card border border-border p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Mitchell"
                    value={patient.fullName}
                    onChange={(e) => setPatient({ ...patient, fullName: e.target.value })}
                    className="w-full border border-input rounded-xl px-4 py-3 text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Age</label>
                  <input
                    type="number"
                    placeholder="e.g. 34"
                    min={1}
                    max={120}
                    inputMode="numeric"
                    value={patient.age}
                    onChange={(e) => setPatient({ ...patient, age: e.target.value })}
                    className="w-full border border-input rounded-xl px-4 py-3 text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Gender</label>
                  <select
                    value={patient.gender}
                    onChange={(e) => setPatient({ ...patient, gender: e.target.value })}
                    className="w-full border border-input rounded-xl px-4 py-3 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select gender</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Describe your symptoms <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. painful urination, fever"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full border border-input rounded-xl px-4 py-3 text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm" role="alert">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleDemographicsSubmit}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-base hover:bg-primary/90 active:scale-[0.98] transition-all shadow-card-md shadow-primary/20"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 'questions' && currentQuestion && (
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Step 2 of 2</p>
            {currentQuestion.redFlagHint && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                <TriangleAlert className="h-4 w-4 shrink-0 text-red-600" strokeWidth={2} aria-hidden />
                <p className="text-red-700 text-xs font-semibold">Safety question — please answer honestly.</p>
              </div>
            )}

            <div className="bg-card rounded-2xl shadow-card border border-border p-5">
              <p className="text-xs font-medium text-primary mb-2 uppercase tracking-wide">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              <h2 className="text-lg font-bold text-foreground mb-6 leading-snug">
                {currentQuestion.text}
              </h2>

              {currentQuestion.type === 'boolean' && (
                <div className="grid grid-cols-2 gap-3">
                  {['Yes', 'No'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleAnswer(opt === 'Yes')}
                      className={`py-4 rounded-xl border-2 font-bold text-base transition-all active:scale-[0.98] ${
                        answers[currentQuestion.id] === (opt === 'Yes')
                          ? opt === 'Yes'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-muted-foreground/40 bg-muted text-foreground'
                          : 'border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {opt === 'Yes' ? (
                        <span className="inline-flex items-center justify-center gap-1.5">
                          <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-1.5">
                          <X className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                          No
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'select' && (
                <div className="space-y-2">
                  {currentQuestion.options?.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleAnswer(opt)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all active:scale-[0.98] ${
                        answers[currentQuestion.id] === opt
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-card-foreground hover:border-primary/40 hover:bg-muted/60'
                      }`}
                    >
                      {answers[currentQuestion.id] === opt ? '● ' : '○ '}{opt}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'text' && (
                <textarea
                  placeholder="Type here (or leave blank if not applicable)"
                  value={String(answers[currentQuestion.id] || '')}
                  onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                  rows={3}
                  className="w-full border border-input rounded-xl px-4 py-3 text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              )}

              {error && <p className="text-destructive text-sm mt-3" role="alert">{error}</p>}

              {currentQuestion.type !== 'boolean' && (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => advanceQuestion()}
                    className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/90 active:scale-[0.98] transition-all"
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Submit Consultation' : 'Next →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'submitting' && (
          <div className="bg-card rounded-2xl shadow-card border border-border p-10 text-center">
            <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-5" aria-hidden />
            <h2 className="text-xl font-bold text-foreground mb-2">Analysing your responses…</h2>
            <p className="text-muted-foreground text-sm">Our clinical decision engine is evaluating your symptoms safely.</p>
          </div>
        )}
      </main>
    </div>
  );
}
