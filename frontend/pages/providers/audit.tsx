import ProviderLayout from '../../components/ProviderLayout';
import { formatUtcLabel, PROVIDER_AUDIT_LOG } from '../../lib/providerPortalData';

export default function ProviderAuditPage() {
  return (
    <ProviderLayout title="Audit Log" subtitle="All override and referral actions are timestamped and auditable">
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="grid grid-cols-5 bg-muted/60 px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
          <span>Timestamp</span>
          <span>Case</span>
          <span>Event Type</span>
          <span>Actor</span>
          <span>Details</span>
        </div>
        {PROVIDER_AUDIT_LOG.map((e) => (
          <div key={e.id} className="grid grid-cols-5 px-4 py-3 text-sm border-t border-border">
            <span className="text-muted-foreground">{formatUtcLabel(e.timestamp)}</span>
            <span className="text-foreground">{e.caseId}</span>
            <span className="text-muted-foreground">{e.type}</span>
            <span className="text-muted-foreground">{e.actor}</span>
            <span className="text-foreground">{e.details}</span>
          </div>
        ))}
      </div>
    </ProviderLayout>
  );
}
