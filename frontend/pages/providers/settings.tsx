import { useState } from 'react';
import ProviderLayout from '../../components/ProviderLayout';

export default function ProviderSettingsPage() {
  const [allowOverrides, setAllowOverrides] = useState(true);
  const [auditAlerts, setAuditAlerts] = useState(true);

  return (
    <ProviderLayout title="Provider Settings" subtitle="Operational settings for provider portal">
      <div className="bg-card rounded-2xl border border-border p-5 max-w-xl space-y-4">
        <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
          <span className="text-sm text-foreground">Allow clinical overrides</span>
          <input type="checkbox" checked={allowOverrides} onChange={(e) => setAllowOverrides(e.target.checked)} />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
          <span className="text-sm text-foreground">Audit alerts for every override</span>
          <input type="checkbox" checked={auditAlerts} onChange={(e) => setAuditAlerts(e.target.checked)} />
        </label>
      </div>
    </ProviderLayout>
  );
}
