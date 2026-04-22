import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Mail, Phone, Pill, Printer, TriangleAlert, User } from 'lucide-react';
import { TriageOutcomeIcon } from '../lib/triageOutcomeIcons';

interface TriageResult {
  consultationId: string;
  patient?: { fullName: string; age: number; gender: string };
  pathway?: string;
  pathwayLabel?: string;
  outcome: string;
  outcomeLabel: string;
  outcomeReason: string;
  redFlagTriggered: boolean;
  redFlags?: Array<{ code: string; description: string; message: string }>;
  pharmacyEligible: boolean;
  summaryText: string;
  safetyNetAdvice?: string;
  pharmacyTreatmentOptions?: string[];
  selfCareAdvice?: string;
}

const OUTCOME_CONFIG: Record<string, {
  gradient: string;
  border: string;
  text: string;
  badge: string;
  title: string;
  instructions: string;
}> = {
  self_care: {
    gradient: 'from-green-500 to-emerald-600',
    border: 'border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700',
    title: 'Self-Care at Home',
    instructions: 'Based on your symptoms, you can manage this at home. Follow the advice below.',
  },
  pharmacy: {
    gradient: 'from-primary to-brand-header',
    border: 'border-primary/30',
    text: 'text-primary',
    badge: 'bg-primary/10 text-primary',
    title: 'Visit Your Pharmacy',
    instructions: 'Visit a pharmacy today — they can assess and treat you without a GP appointment.',
  },
  gp: {
    gradient: 'from-amber-500 to-yellow-600',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-700',
    title: 'See Your GP',
    instructions: 'Your symptoms need GP assessment. Contact your GP surgery or use the NHS App.',
  },
  urgent_care: {
    gradient: 'from-orange-500 to-orange-600',
    border: 'border-orange-200',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700',
    title: 'Seek Urgent Care Today',
    instructions: 'Same-day medical attention needed. Visit an Urgent Treatment Centre or call NHS 111.',
  },
  emergency_999: {
    gradient: 'from-red-600 to-red-700',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    title: 'Call 999 — Emergency',
    instructions: 'Your symptoms may be life-threatening. Call 999 immediately. Do not drive yourself.',
  },
};

const MOCK_RESULT: TriageResult = {
  consultationId: 'c0000001-0000-0000-0000-000000000001',
  patient: { fullName: 'Sarah Mitchell', age: 33, gender: 'Female' },
  pathway: 'uti',
  pathwayLabel: 'Uncomplicated UTI',
  outcome: 'pharmacy',
  outcomeLabel: 'Pharmacy Referral',
  outcomeReason: 'Symptoms consistent with uncomplicated UTI. Patient meets all pharmacy eligibility criteria. No red flags identified.',
  redFlagTriggered: false,
  redFlags: [],
  pharmacyEligible: true,
  summaryText: 'Patient Sarah Mitchell (Female, 33) presents with a 3-day history of painful urination, increased urinary frequency, and lower abdominal discomfort. No fever, no loin/back pain, not pregnant. OUTCOME: Pharmacy referral under Pharmacy First.',
  safetyNetAdvice: 'Return if symptoms worsen, fever develops, or no improvement within 48 hours of treatment.',
  pharmacyTreatmentOptions: [
    'Trimethoprim 200mg twice daily for 7 days',
    'Nitrofurantoin MR 100mg twice daily for 5 days',
  ],
};

export default function ResultPage() {
  const router = useRouter();
  const { id, demo } = router.query;

  const [result, setResult] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    if (demo === 'true' || !id) {
      setResult(MOCK_RESULT);
      setLoading(false);
      return;
    }
    fetch(`http://localhost:4000/api/summary/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setResult({
          consultationId: data.id,
          patient: data.patient,
          pathway: data.pathway,
          pathwayLabel: data.pathwayLabel,
          outcome: data.outcome,
          outcomeLabel: data.outcomeLabel,
          outcomeReason: data.outcomeReason,
          redFlagTriggered: data.redFlagTriggered,
          redFlags: data.redFlagReasons,
          pharmacyEligible: data.pharmacyEligible,
          summaryText: data.summaryText,
          safetyNetAdvice: data.safetyNetAdvice,
          pharmacyTreatmentOptions: data.pharmacyTreatmentOptions,
          selfCareAdvice: data.selfCareAdvice,
        });
        setLoading(false);
      })
      .catch(() => {
        setResult(MOCK_RESULT);
        setLoading(false);
      });
  }, [router.isReady, id, demo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden />
          <p className="text-muted-foreground text-sm">Loading your results…</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const config = OUTCOME_CONFIG[result.outcome] || OUTCOME_CONFIG.gp;

  return (
    <div className="min-h-screen bg-background">

      <header className="bg-brand-header text-primary-foreground shadow-card-md sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-card rounded-xl flex items-center justify-center flex-shrink-0 shadow-card">
            <span className="text-primary font-black text-sm">A</span>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Aegis Health AI</p>
            <p className="text-brand-header-subtle text-xs">Consultation Complete</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 pb-10">

        {/* Outcome hero card */}
        <div className="rounded-2xl overflow-hidden shadow-card-md">
          <div className={`bg-gradient-to-br ${config.gradient} p-5 text-white`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25">
                <TriageOutcomeIcon outcome={result.outcome} className="h-8 w-8" strokeWidth={1.6} />
              </span>
              <div>
                <p className="text-sm font-medium text-white/80 uppercase tracking-wide">Your Result</p>
                <h2 className="text-xl font-extrabold leading-tight">{config.title}</h2>
              </div>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">{config.instructions}</p>
          </div>
          {result.patient && (
            <div className="bg-card px-5 py-3 flex items-center gap-3 border-b border-border">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground flex-shrink-0" aria-hidden>
                <User className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-semibold text-card-foreground">{result.patient.fullName}</p>
                <p className="text-xs text-muted-foreground">{result.patient.gender}, {result.patient.age} yrs · {result.pathwayLabel || result.pathway}</p>
              </div>
            </div>
          )}
        </div>

        {/* Emergency 999 call button */}
        {result.outcome === 'emergency_999' && (
          <a
            href="tel:999"
            className="flex items-center justify-center gap-2 w-full bg-destructive text-destructive-foreground py-4 rounded-2xl font-bold text-lg shadow-card-md active:scale-[0.98] transition-all"
          >
            <Phone className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
            Call 999 Now
          </a>
        )}

        {/* Red flag warning */}
        {result.redFlagTriggered && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4">
            <h3 className="font-bold text-red-800 text-sm mb-2 flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 shrink-0 text-red-600" strokeWidth={2} aria-hidden />
              Safety Alert Triggered
            </h3>
            {result.redFlags?.map((flag) => (
              <p key={flag.code} className="text-red-700 text-xs leading-relaxed">{flag.message}</p>
            ))}
          </div>
        )}

        {/* Clinical reasoning */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Clinical Reasoning</p>
          <p className="text-card-foreground text-sm leading-relaxed">{result.outcomeReason}</p>
        </div>

        {/* Pharmacy treatment options */}
        {result.pharmacyEligible && result.pharmacyTreatmentOptions && (
          <div className="bg-card rounded-2xl shadow-card border border-border p-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Possible Treatments</p>
            <p className="text-xs text-muted-foreground mb-3">Subject to pharmacist assessment — suggestions only.</p>
            <ul className="space-y-2">
              {result.pharmacyTreatmentOptions.map((opt) => (
                <li key={opt} className="flex items-start gap-2 text-sm text-card-foreground">
                  <Pill className="text-primary mt-1 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  <span>{opt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Self-care advice */}
        {result.selfCareAdvice && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Self-Care Advice</p>
            <p className="text-green-800 text-sm leading-relaxed">{result.selfCareAdvice}</p>
          </div>
        )}

        {/* Safety net */}
        {result.safetyNetAdvice && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">When to Seek Further Help</p>
            <p className="text-amber-800 text-sm leading-relaxed">{result.safetyNetAdvice}</p>
          </div>
        )}

        {/* Consultation summary */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Consultation Summary</p>
          <div className="bg-muted rounded-xl p-4">
            <p className="text-muted-foreground text-xs leading-relaxed font-mono">{result.summaryText}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 border border-input text-muted-foreground py-3 rounded-xl text-sm font-medium hover:bg-muted active:scale-[0.98] transition-all"
            >
              <Printer className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              Print
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 border border-primary/30 text-primary py-3 rounded-xl text-sm font-medium hover:bg-primary/10 active:scale-[0.98] transition-all"
            >
              <Mail className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              Email
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex w-full items-center justify-center gap-2 bg-muted text-muted-foreground py-4 rounded-2xl font-semibold hover:bg-secondary active:scale-[0.98] transition-all text-sm"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          Start a New Consultation
        </button>

        <p className="text-xs text-muted-foreground text-center pb-4">
          Clinical decision support only. Always follow advice from a qualified healthcare professional.
        </p>
      </main>
    </div>
  );
}
