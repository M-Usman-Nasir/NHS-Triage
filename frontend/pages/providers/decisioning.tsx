import ProviderLayout from '../../components/ProviderLayout';
import { PROVIDER_CASES } from '../../lib/providerPortalData';

export default function ProviderDecisioningPage() {
  return (
    <ProviderLayout title="System Triage Decisioning" subtitle="Outcome, reasoning, and recommended care pathway">
      <div className="space-y-3">
        {PROVIDER_CASES.map((c) => (
          <div key={c.id} className="bg-card rounded-2xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <p className="text-sm font-bold text-foreground">{c.patient.fullName}</p>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{c.pathwayLabel}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground uppercase">System Triage Outcome</p>
                <p className="text-sm font-semibold text-foreground mt-1">{c.triageOutcome}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground uppercase">Reasoning</p>
                <p className="text-sm text-foreground mt-1">{c.reasoning}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground uppercase">Recommended Care Pathway</p>
                <p className="text-sm font-semibold text-foreground mt-1">{c.recommendedPathway}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ProviderLayout>
  );
}
