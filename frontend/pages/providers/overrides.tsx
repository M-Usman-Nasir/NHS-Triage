import { useState } from 'react';
import ProviderLayout from '../../components/ProviderLayout';
import { formatUtcLabel, PROVIDER_CASES, PROVIDER_OVERRIDES } from '../../lib/providerPortalData';

export default function ProviderOverridesPage() {
  const [caseId, setCaseId] = useState(PROVIDER_CASES[0]?.id || '');
  const [decision, setDecision] = useState('gp');
  const [reason, setReason] = useState('');
  const [localOverrides, setLocalOverrides] = useState(PROVIDER_OVERRIDES);

  const submitOverride = () => {
    if (!reason.trim() || !caseId) return;
    const current = PROVIDER_CASES.find((c) => c.id === caseId);
    if (!current) return;
    setLocalOverrides((prev) => [
      {
        id: `OVR-${String(prev.length + 1).padStart(3, '0')}`,
        caseId,
        originalDecision: current.triageOutcome,
        overriddenDecision: decision,
        reason: reason.trim(),
        clinician: 'Dr. Provider User',
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
    setReason('');
  };

  return (
    <ProviderLayout title="Clinical Overrides" subtitle="Override system outcomes with a documented reason">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-bold text-foreground">Apply Override</h3>
          <div>
            <label className="text-xs text-muted-foreground">Case</label>
            <select value={caseId} onChange={(e) => setCaseId(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm">
              {PROVIDER_CASES.map((c) => (
                <option key={c.id} value={c.id}>{c.id} · {c.patient.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Override to</label>
            <select value={decision} onChange={(e) => setDecision(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm">
              <option value="pharmacy">pharmacy</option>
              <option value="gp">gp</option>
              <option value="urgent_care">urgent_care</option>
              <option value="self_care">self_care</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Clinical reason</label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm resize-none"
              placeholder="Clinical reason for override"
            />
          </div>
          <button
            type="button"
            onClick={submitOverride}
            disabled={!reason.trim()}
            className="w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-semibold disabled:opacity-50"
          >
            Save override
          </button>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Override History</h3>
          <div className="space-y-2">
            {localOverrides.map((o) => (
              <div key={o.id} className="border border-border rounded-lg p-3">
                <p className="text-sm font-semibold text-foreground">{o.caseId}</p>
                <p className="text-xs text-muted-foreground mt-1">{o.originalDecision} → {o.overriddenDecision}</p>
                <p className="text-xs text-foreground mt-2">{o.reason}</p>
                <p className="text-xs text-muted-foreground mt-2">{o.clinician} · {formatUtcLabel(o.timestamp)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
