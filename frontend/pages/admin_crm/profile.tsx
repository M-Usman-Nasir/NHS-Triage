import { Mail, Shield, Stethoscope, UserRound } from 'lucide-react';
import CRMLayout from '../../components/CRMLayout';

export default function AdminProfilePage() {
  return (
    <CRMLayout title="Admin Profile" subtitle="Aegis Health AI administration">
      <div className="mx-auto max-w-4xl">

        <section className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
              <UserRound className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-foreground">Dr. Admin User</h2>
              <p className="text-xs text-muted-foreground">System administrator</p>
            </div>
          </div>

          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
              <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</dt>
              <dd className="inline-flex items-center gap-1.5 text-foreground">
                <Mail className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
                admin@aegishealth.local
              </dd>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
              <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</dt>
              <dd className="inline-flex items-center gap-1.5 text-foreground">
                <Shield className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
                Clinical platform administrator
              </dd>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/30 p-3 sm:col-span-2">
              <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Scope</dt>
              <dd className="inline-flex items-start gap-1.5 text-foreground">
                <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
                Responsible for clinical pathway oversight, escalation rule governance, and operational reporting.
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </CRMLayout>
  );
}
