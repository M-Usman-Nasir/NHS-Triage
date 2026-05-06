import Link from 'next/link';
import { Activity, ArrowLeft, ArrowRight, ClipboardCheck, ShieldCheck, Stethoscope, Users } from 'lucide-react';
import ProviderLayout from '../../components/ProviderLayout';
import { formatUtcLabel, PROVIDER_AUDIT_LOG, PROVIDER_CASES, PROVIDER_OVERRIDES } from '../../lib/providerPortalData';

export default function ProvidersDashboardPage() {
  const totalCases = PROVIDER_CASES.length;
  const pharmacyCases = PROVIDER_CASES.filter((c) => c.referral.type === 'pharmacy').length;
  const overrides = PROVIDER_OVERRIDES.length;
  const auditEvents = PROVIDER_AUDIT_LOG.length;

  return (
    <ProviderLayout title="Provider Dashboard" subtitle="Clinical workflow and triage operations">
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          Back to Home
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Patients', value: totalCases, Icon: Users, href: '/providers/patients' },
          { label: 'Clinical Cases', value: totalCases, Icon: ClipboardCheck, href: '/providers/cases' },
          { label: 'Pharmacy Referrals', value: pharmacyCases, Icon: Stethoscope, href: '/providers/pharmacy_referrals' },
          { label: 'Auditable Events', value: auditEvents, Icon: ShieldCheck, href: '/providers/audit' },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between">
              <item.Icon className="h-5 w-5 text-primary" strokeWidth={1.75} aria-hidden />
              <span className="text-2xl font-bold text-foreground">{item.value}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{item.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-foreground mb-3">Recent Cases</h3>
          <div className="space-y-2">
            {PROVIDER_CASES.map((c) => (
              <div key={c.id} className="border border-border rounded-lg px-3 py-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.patient.fullName}</p>
                  <p className="text-xs text-muted-foreground">{c.pathwayLabel} · {c.triageOutcome}</p>
                </div>
                <span className="text-xs text-muted-foreground">{formatUtcLabel(c.createdAt, false)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Quick Links</h3>
          <div className="space-y-2">
            {[
              { label: 'Review system decisioning', href: '/providers/decisioning', Icon: Activity },
              { label: 'Apply clinical override', href: '/providers/overrides', Icon: ClipboardCheck },
              { label: 'View full audit timeline', href: '/providers/audit', Icon: ShieldCheck },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 hover:border-primary/30">
                <span className="inline-flex items-center gap-2 text-sm text-foreground">
                  <item.Icon className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
                  {item.label}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden />
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">{overrides} override event(s) captured and auditable.</p>
        </div>
      </div>
    </ProviderLayout>
  );
}
