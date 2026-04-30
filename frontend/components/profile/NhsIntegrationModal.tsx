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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">Connect NHS Services</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete verification and choose which NHS services to connect.
          </p>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Basic verification</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block text-muted-foreground">NHS Number</span>
                <input
                  type="text"
                  value={form.nhsNumber}
                  onChange={(e) => onChange('nhsNumber', e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g. 485 777 3456"
                />
                {errors.nhsNumber ? <p className="mt-1 text-xs text-red-600">{errors.nhsNumber}</p> : null}
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-muted-foreground">Date of Birth</span>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => onChange('dob', e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.dob ? <p className="mt-1 text-xs text-red-600">{errors.dob}</p> : null}
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-muted-foreground">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => onChange('email', e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="name@example.com"
                />
                {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-muted-foreground">Phone Number</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => onChange('phone', e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g. 07700900001"
                />
                {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone}</p> : null}
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Connection options</h3>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.connectGp} onChange={(e) => onChange('connectGp', e.target.checked)} />
                Connect GP Services
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.connectPharmacy}
                  onChange={(e) => onChange('connectPharmacy', e.target.checked)}
                />
                Connect Pharmacy Services
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.connectHistory}
                  onChange={(e) => onChange('connectHistory', e.target.checked)}
                />
                Connect Consultation History
              </label>
            </div>
            {errors.connectGp ? <p className="mt-2 text-xs text-red-600">{errors.connectGp}</p> : null}
          </section>

          <section className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Consent</h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.consentDataSharing}
                onChange={(e) => onChange('consentDataSharing', e.target.checked)}
              />
              I consent to securely share my data
            </label>
            {errors.consentDataSharing ? <p className="mt-2 text-xs text-red-600">{errors.consentDataSharing}</p> : null}
          </section>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-input px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Connect NHS Services'}
          </button>
        </div>
      </div>
    </div>
  );
}
