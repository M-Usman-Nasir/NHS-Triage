import { Shield, Sparkles, X } from 'lucide-react';

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

interface NhsIntegrationModalProps {
  open: boolean;
  submitting: boolean;
  form: NhsIntegrationForm;
  errors: NhsIntegrationErrors;
  onClose: () => void;
  onChange: (field: keyof NhsIntegrationForm, value: string | boolean) => void;
  onSubmit: () => void;
}

const inputClass =
  'w-full rounded-xl border border-sky-200/90 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30';

const sectionClass = 'rounded-2xl border border-sky-200/60 bg-white/90 p-3 shadow-sm backdrop-blur-sm sm:p-4';

export default function NhsIntegrationModal({
  open,
  submitting,
  form,
  errors,
  onClose,
  onChange,
  onSubmit,
}: NhsIntegrationModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:p-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nhs-modal-title"
        className="relative flex max-h-[min(calc(100dvh-1rem),46rem)] w-full max-w-[min(calc(100vw-1rem),24rem)] flex-col overflow-hidden rounded-2xl border-[5px] border-slate-900 bg-gradient-to-b from-sky-50 via-[#e8f2ff] to-slate-50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/10 sm:rounded-[1.75rem] sm:border-[6px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.4]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cg fill='%232563eb' fill-opacity='0.06'%3E%3Cpath d='M22 10h4v12h12v4H26v12h-4V26H10v-4h12V10z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />

        <div className="relative z-10 flex shrink-0 flex-col border-b border-sky-200/50 bg-[#1e40af] text-white">
          <div
            className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.07)_40%,transparent_72%)]"
            aria-hidden
          />
          <div className="relative flex items-start justify-between gap-2 px-3 pb-3 pt-3 sm:px-5 sm:pb-4 sm:pt-4">
            <div className="min-w-0 flex-1 pr-2">
              <p className="mb-1.5 inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/95 backdrop-blur-sm sm:text-xs">
                <Sparkles className="h-3 w-3 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                NHS services
              </p>
              <h2 id="nhs-modal-title" className="text-lg font-bold leading-tight tracking-tight sm:text-xl">
                Connect NHS services
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-blue-100/95 sm:text-sm">
                Verify your details and choose what to connect. Demo flow only.
              </p>
            </div>
            <button
              type="button"
              onClick={() => !submitting && onClose()}
              disabled={submitting}
              aria-label="Close"
              className="touch-manipulation inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white/25 bg-white/10 text-white shadow-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:opacity-50"
            >
              <X className="h-5 w-5" strokeWidth={2.2} aria-hidden />
            </button>
          </div>
          <div className="relative flex items-center gap-1.5 border-t border-white/15 px-3 py-2 sm:px-5">
            <Shield className="h-3.5 w-3.5 shrink-0 text-white/90" strokeWidth={2} aria-hidden />
            <p className="text-[10px] font-medium text-blue-100/95 sm:text-xs">UK GDPR — placeholder integration</p>
          </div>
        </div>

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3 sm:px-4 sm:py-4">
          <div className="space-y-3 sm:space-y-4">
            <section className={sectionClass}>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Basic verification</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block min-w-0 text-sm">
                  <span className="mb-1 block text-[11px] font-medium text-slate-600 sm:text-xs">NHS number</span>
                  <input
                    type="text"
                    value={form.nhsNumber}
                    onChange={(e) => onChange('nhsNumber', e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 485 777 3456"
                    autoComplete="off"
                  />
                  {errors.nhsNumber ? <p className="mt-1 text-xs font-medium text-red-600">{errors.nhsNumber}</p> : null}
                </label>

                <label className="block min-w-0 text-sm">
                  <span className="mb-1 block text-[11px] font-medium text-slate-600 sm:text-xs">Date of birth</span>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => onChange('dob', e.target.value)}
                    className={inputClass}
                  />
                  {errors.dob ? <p className="mt-1 text-xs font-medium text-red-600">{errors.dob}</p> : null}
                </label>

                <label className="block min-w-0 text-sm sm:col-span-2">
                  <span className="mb-1 block text-[11px] font-medium text-slate-600 sm:text-xs">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => onChange('email', e.target.value)}
                    className={inputClass}
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                  {errors.email ? <p className="mt-1 text-xs font-medium text-red-600">{errors.email}</p> : null}
                </label>

                <label className="block min-w-0 text-sm sm:col-span-2">
                  <span className="mb-1 block text-[11px] font-medium text-slate-600 sm:text-xs">Phone number</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => onChange('phone', e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 07700900001"
                    autoComplete="tel"
                  />
                  {errors.phone ? <p className="mt-1 text-xs font-medium text-red-600">{errors.phone}</p> : null}
                </label>
              </div>
            </section>

            <section className={sectionClass}>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Connection options</h3>
              <div className="space-y-1 text-sm">
                <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-sky-100/80 bg-sky-50/50 px-3 py-2 touch-manipulation">
                  <input
                    type="checkbox"
                    checked={form.connectGp}
                    onChange={(e) => onChange('connectGp', e.target.checked)}
                    className="h-5 w-5 shrink-0 rounded border-sky-300 accent-primary"
                  />
                  <span className="font-medium text-slate-800">Connect GP services</span>
                </label>
                <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-sky-100/80 bg-sky-50/50 px-3 py-2 touch-manipulation">
                  <input
                    type="checkbox"
                    checked={form.connectPharmacy}
                    onChange={(e) => onChange('connectPharmacy', e.target.checked)}
                    className="h-5 w-5 shrink-0 rounded border-sky-300 accent-primary"
                  />
                  <span className="font-medium text-slate-800">Connect pharmacy services</span>
                </label>
                <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-sky-100/80 bg-sky-50/50 px-3 py-2 touch-manipulation">
                  <input
                    type="checkbox"
                    checked={form.connectHistory}
                    onChange={(e) => onChange('connectHistory', e.target.checked)}
                    className="h-5 w-5 shrink-0 rounded border-sky-300 accent-primary"
                  />
                  <span className="font-medium text-slate-800">Connect consultation history</span>
                </label>
              </div>
              {errors.connectGp ? <p className="mt-2 text-xs font-medium text-red-600">{errors.connectGp}</p> : null}
            </section>

            <section className={sectionClass}>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Consent</h3>
              <label className="flex min-h-[48px] cursor-pointer items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/60 px-3 py-2.5 touch-manipulation">
                <input
                  type="checkbox"
                  checked={form.consentDataSharing}
                  onChange={(e) => onChange('consentDataSharing', e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-amber-300 accent-primary"
                />
                <span className="text-xs font-medium leading-relaxed text-amber-950 sm:text-sm">
                  I consent to securely share my data for this demo connection flow.
                </span>
              </label>
              {errors.consentDataSharing ? (
                <p className="mt-2 text-xs font-medium text-red-600">{errors.consentDataSharing}</p>
              ) : null}
            </section>
          </div>
        </div>

        <div className="relative z-10 shrink-0 border-t border-sky-200/80 bg-white/95 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="touch-manipulation min-h-[48px] rounded-2xl border-2 border-primary/25 bg-white px-4 py-3 text-sm font-bold text-primary shadow-sm transition active:scale-[0.99] hover:border-primary/40 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 sm:min-h-0 sm:px-5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className="touch-manipulation min-h-[52px] rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition active:scale-[0.99] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60 sm:min-h-0 sm:min-w-[10rem]"
            >
              {submitting ? 'Saving…' : 'Connect NHS services'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
