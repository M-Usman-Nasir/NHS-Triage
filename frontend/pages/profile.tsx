import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { PATIENT_PROFILE_MOCK, type NhsConnectionItem } from '../lib/patientProfileMock';
import NhsIntegrationModal from '../components/profile/NhsIntegrationModal';

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
    not_connected: 'bg-slate-100 text-slate-700',
  };

  const statusLabel =
    status === 'not_connected' ? 'Not connected' : `${status.charAt(0).toUpperCase()}${status.slice(1)}`;

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClasses[status]}`}>{statusLabel}</span>
  );
}

export default function ProfilePage() {
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
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6 sm:px-5 sm:py-8">
        {toast ? (
          <div
            role="status"
            aria-live="polite"
            className={`fixed right-4 top-4 z-50 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.type === 'success'
                ? 'border border-green-200 bg-green-50 text-green-700'
                : 'border border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            {toast.message}
          </div>
        ) : null}

        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          Back to home
        </Link>

        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-card">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">NHS Integration Ready</p>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">My Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View your details, consultation history, and NHS connection readiness in one place.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Personal information</h2>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-semibold text-foreground">{PATIENT_PROFILE_MOCK.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Age</p>
              <p className="font-semibold text-foreground">{PATIENT_PROFILE_MOCK.age}</p>
            </div>
            <div>
              <p className="text-muted-foreground">DOB</p>
              <p className="font-semibold text-foreground">{PATIENT_PROFILE_MOCK.dob}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Consultation history
          </h2>
          <ul className="space-y-2">
            {PATIENT_PROFILE_MOCK.consultationHistory.map((item) => (
              <li key={item.id} className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <p className="text-sm font-semibold text-foreground">{item.condition}</p>
                <p className="text-xs text-muted-foreground">
                  {item.date} · {item.outcome}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Manage health details
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
            {PATIENT_PROFILE_MOCK.healthDetails.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">NHS connections</h2>
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Connect NHS Services
            </button>
          </div>
          <div className="space-y-3">
            {connections.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-2 rounded-xl border border-border/70 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">Frontend placeholder connection flow only</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ConnectionStatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <NhsIntegrationModal
          open={isModalOpen}
          submitting={isSubmitting}
          form={form}
          errors={errors}
          onClose={() => setIsModalOpen(false)}
          onChange={setFormField}
          onSubmit={() => void handleConnectServices()}
        />
      </main>
    </div>
  );
}
