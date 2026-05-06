import ProviderLayout from '../../components/ProviderLayout';
import { PROVIDER_CASES } from '../../lib/providerPortalData';

export default function ProviderPatientsPage() {
  return (
    <ProviderLayout title="Patient Demographics" subtitle="Demographics linked to active provider cases">
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="grid grid-cols-6 bg-muted/60 px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
          <span>Name</span>
          <span>Age/Gender</span>
          <span>NHS Number</span>
          <span>Phone</span>
          <span>Pathway</span>
          <span>Case</span>
        </div>
        {PROVIDER_CASES.map((c) => (
          <div key={c.id} className="grid grid-cols-6 px-4 py-3 text-sm border-t border-border">
            <span className="font-semibold text-foreground">{c.patient.fullName}</span>
            <span className="text-muted-foreground">{c.patient.age} · {c.patient.gender}</span>
            <span className="text-muted-foreground">{c.patient.nhsNumber}</span>
            <span className="text-muted-foreground">{c.patient.phone}</span>
            <span className="text-muted-foreground">{c.pathwayLabel}</span>
            <span className="text-muted-foreground">{c.id}</span>
          </div>
        ))}
      </div>
    </ProviderLayout>
  );
}
