import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DM_Serif_Display } from 'next/font/google';
import { ArrowLeft, Shield, Sparkles, Stethoscope, User } from 'lucide-react';
import { PATIENT_PROFILE_MOCK, type NhsConnectionItem } from '../../lib/patientProfileMock';
import NhsIntegrationModal from '../../components/profile/NhsIntegrationModal';

const fontDisplay = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

type NhsIntegrationForm = {
  nhsNumber: string;
  dob: string;
  email: string;
  phone: string;
  connectGp: boolean;
  connectPharmacy: boolean;
  connectHistory: boolean;
  consentDataSharing: boolean;
};

type NhsIntegrationErrors = Partial<Record<keyof NhsIntegrationForm, string>>;

function ConnectionStatusBadge({ status }: { status: NhsConnectionItem['status'] }) {
  const statusClasses: Record<NhsConnectionItem['status'], string> = {
    connected: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    not_connected: 'bg-slate-100 text-slate-600',
  };

  const statusLabel =
    status === 'not_connected' ? 'Not connected' : `${status.charAt(0).toUpperCase()}${status.slice(1)}`;

  return (
    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold sm:text-xs ${statusClasses[status]}`}>
      {statusLabel}
    </span>
  );
}

export default function PatientsProfilePage() {
  const [connections, setConnections] = useState(PATIENT_PROFILE_MOCK.nhsConnections);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<NhsIntegrationForm>({
    nhsNumber: '',
    dob: '',
    email: '',
    phone: '',
    connectGp: true,
    connectPharmacy: true,
    connectHistory: true,
    consentDataSharing: false,
  });
  const [errors, setErrors] = useState<NhsIntegrationErrors>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!isModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2200);
  };

  const setFormField = (field: keyof NhsIntegrationForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateForm = (): NhsIntegrationErrors => {
    const nextErrors: NhsIntegrationErrors = {};
    const nhsDigits = form.nhsNumber.replace(/\s+/g, '');
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    const phoneDigits = form.phone.replace(/\D+/g, '');
    const hasConnectionChoice = form.connectGp || form.connectPharmacy || form.connectHistory;

    if (!nhsDigits || nhsDigits.length !== 10 || !/^\d{10}$/.test(nhsDigits)) {
      nextErrors.nhsNumber = 'Enter a valid 10-digit NHS number.';
    }
    if (!form.dob) {
      nextErrors.dob = 'Date of birth is required.';
    }
    if (!form.email || !emailOk) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!form.phone || phoneDigits.length < 10) {
      nextErrors.phone = 'Enter a valid phone number.';
    }
    if (!hasConnectionChoice) {
      nextErrors.connectGp = 'Select at least one connection option.';
    }
    if (!form.consentDataSharing) {
      nextErrors.consentDataSharing = 'Consent is required to continue.';
    }

    return nextErrors;
  };

  const applyConnectionState = (key: NhsConnectionItem['key']) => {
    setConnections((current) =>
      current.map((item) =>
        item.key === key ? { ...item, status: 'connected', lastUpdated: new Date().toISOString() } : item,
      ),
    );
  };

  const handleConnectServices = async () => {
    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      showToast('error', 'Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1200));

    if (form.connectGp) applyConnectionState('gp_connection');
    if (form.connectPharmacy) applyConnectionState('pharmacy_connection');
    if (form.connectHistory) applyConnectionState('nhs_login');

    setIsSubmitting(false);
    setIsModalOpen(false);
    showToast('success', 'NHS profile connected successfully');
  };

  return (
    <div
      className="flex min-h-[100dvh] min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-300 via-slate-200 to-slate-400 px-2 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-4 md:px-6 md:py-6"
    >
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[60] max-w-[min(calc(100vw-1.5rem),20rem)] rounded-xl px-3 py-2.5 text-xs font-semibold shadow-lg sm:right-4 sm:px-4 sm:py-3 sm:text-sm ${
            toast.type === 'success'
              ? 'border border-green-200 bg-green-50 text-green-700'
              : 'border border-amber-200 bg-amber-50 text-amber-900'
          }`}
        >
          {toast.message}
        </div>
      ) : null}

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

          <header className="sticky top-0 z-30 border-b border-sky-200/70 bg-white/80 text-foreground shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/65">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-3 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:gap-3 sm:px-4 sm:pb-3 sm:pt-3">
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
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
                  <p className="truncate text-[11px] font-medium leading-tight text-slate-500 sm:text-xs">My profile</p>
                </div>
              </div>
              <Link
                href="/patients"
                className="touch-manipulation inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-primary/25 bg-white/90 px-3 py-2 text-xs font-semibold text-primary shadow-sm transition active:scale-95 hover:border-primary/40 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-4 sm:text-sm"
              >
                <Stethoscope className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden />
                Triage
              </Link>
            </div>
          </header>

          <main
            id="main-content"
            className="relative mx-auto w-full min-w-0 max-w-5xl flex-1 space-y-4 px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:space-y-5 sm:px-4 sm:pb-8 sm:pt-5"
          >
            <div className="overflow-hidden rounded-2xl border border-sky-200/60 bg-white/90 shadow-2xl shadow-sky-900/10 backdrop-blur-sm sm:rounded-3xl">
              <div className="relative bg-[#1e40af] px-4 py-4 sm:px-6 sm:py-5">
                <div
                  className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.07)_40%,transparent_72%)]"
                  aria-hidden
                />
                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0">
                    <p className="mb-2 inline-flex max-w-full items-center gap-2 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/95 shadow-sm backdrop-blur-sm sm:text-xs">
                      <Sparkles className="h-3 w-3 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                      NHS integration ready
                    </p>
                    <h1
                      className={`text-balance text-[clamp(1.25rem,3.5vw+0.5rem,1.85rem)] font-normal leading-tight tracking-tight text-white sm:text-3xl ${fontDisplay.className}`}
                    >
                      My profile
                    </h1>
                    <p className="mt-1.5 max-w-xl text-[11px] leading-relaxed text-blue-100/95 sm:text-sm">
                      Your details, consultation history, and NHS connection readiness in one place.
                    </p>
                  </div>
                  <p className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-[10px] font-semibold text-white sm:self-auto sm:text-xs">
                    <Shield className="h-3.5 w-3.5 shrink-0 opacity-95" strokeWidth={2} aria-hidden />
                    UK GDPR
                  </p>
                </div>
              </div>

              <div className="border-t border-sky-100/80 bg-white/95 p-3 sm:p-5">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500 sm:text-sm">
                  Personal information
                </h2>
                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-xl border border-sky-100/80 bg-sky-50/40 p-3">
                    <p className="text-[11px] text-slate-500 sm:text-xs">Name</p>
                    <p className="mt-0.5 font-semibold text-slate-900">{PATIENT_PROFILE_MOCK.name}</p>
                  </div>
                  <div className="rounded-xl border border-sky-100/80 bg-sky-50/40 p-3">
                    <p className="text-[11px] text-slate-500 sm:text-xs">Age</p>
                    <p className="mt-0.5 font-semibold text-slate-900">{PATIENT_PROFILE_MOCK.age}</p>
                  </div>
                  <div className="rounded-xl border border-sky-100/80 bg-sky-50/40 p-3 sm:col-span-1">
                    <p className="text-[11px] text-slate-500 sm:text-xs">DOB</p>
                    <p className="mt-0.5 font-semibold text-slate-900">{PATIENT_PROFILE_MOCK.dob}</p>
                  </div>
                </div>
              </div>
            </div>

            <section className="overflow-hidden rounded-2xl border border-sky-200/60 bg-white/90 p-3 shadow-xl shadow-sky-900/10 backdrop-blur-sm sm:rounded-3xl sm:p-5">
              <h2 className="mb-3 text-xs font-bold text-slate-900 sm:text-sm">Consultation history</h2>
              <ul className="space-y-2">
                {PATIENT_PROFILE_MOCK.consultationHistory.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-sky-100/80 bg-white/80 p-3 shadow-sm backdrop-blur-sm"
                  >
                    <p className="text-sm font-semibold text-slate-900">{item.condition}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600 sm:text-xs">
                      {item.date} · {item.outcome}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="overflow-hidden rounded-2xl border border-sky-200/60 bg-white/90 p-3 shadow-xl shadow-sky-900/10 backdrop-blur-sm sm:rounded-3xl sm:p-5">
              <h2 className="mb-3 text-xs font-bold text-slate-900 sm:text-sm">Manage health details</h2>
              <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-800 sm:text-sm">
                {PATIENT_PROFILE_MOCK.healthDetails.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </section>

            <section className="overflow-hidden rounded-2xl border border-sky-200/60 bg-white/90 p-3 shadow-xl shadow-sky-900/10 backdrop-blur-sm sm:rounded-3xl sm:p-5">
              <h2 className="mb-3 text-xs font-bold text-slate-900 sm:text-sm">NHS connections</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="touch-manipulation mb-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition active:scale-[0.99] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:min-h-0 sm:w-auto sm:px-5"
              >
                <User className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                Connect NHS services
              </button>
              <div className="space-y-2 sm:space-y-3">
                {connections.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-2 rounded-xl border border-sky-100/80 bg-white/80 p-3 shadow-sm backdrop-blur-sm"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="text-[11px] text-slate-500 sm:text-xs">Placeholder connection flow (demo)</p>
                    </div>
                    <ConnectionStatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      <NhsIntegrationModal
        open={isModalOpen}
        submitting={isSubmitting}
        form={form}
        errors={errors}
        onClose={() => setIsModalOpen(false)}
        onChange={setFormField}
        onSubmit={() => void handleConnectServices()}
      />
    </div>
  );
}
