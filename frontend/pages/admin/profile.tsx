import Link from 'next/link';
import { ArrowLeft, Mail, Shield, Stethoscope, UserRound } from 'lucide-react';

export default function AdminProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-sidebar-border bg-sidebar px-6 py-4 text-sidebar-foreground shadow-sm">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-foreground">Admin Profile</h1>
            <p className="text-xs text-sidebar-muted">Aegis Health AI administration</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8">
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
      </main>
    </div>
  );
}
