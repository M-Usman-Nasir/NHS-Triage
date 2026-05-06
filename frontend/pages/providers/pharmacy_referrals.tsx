/**
 * pharmacist/dashboard.tsx — Pharmacist Review Panel
 * Aegis Health AI
 *
 * Shows pharmacists a list of patients referred to pharmacy.
 * Each row links to the full consultation summary.
 *
 * Features:
 * - List of pharmacy-referred consultations
 * - Colour-coded urgency (shingles = urgent, UTI = standard)
 * - Click to view full patient summary
 * - Mark as reviewed / treated / referred to GP
 *
 * Mock data: 5 consultations from mock_consultations.json
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, CheckCircle2, Clock, ListChecks, Pill, Printer, Stethoscope } from 'lucide-react';
import { apiFetch, apiUrl } from '../../lib/api';
import ProviderLayout from '../../components/ProviderLayout';
import { formatUtcLabel, PROVIDER_CASES } from '../../lib/providerPortalData';

type PharmacistSummary = {
  id: string;
  patient?: { fullName: string; age: number; gender: string };
  pathway?: string;
  pathwayLabel?: string;
  outcome: string;
  outcomeLabel?: string;
  outcomeReason?: string;
  explanation?: {
    decision: string;
    reason: string;
    source?: string;
  };
  redFlagTriggered?: boolean;
  createdAt?: string;
  status?: string;
  symptoms?: string[];
  answers?: Record<string, unknown>;
  summaryText?: string;
  pharmacyTreatmentOptions?: string[] | null;
  pharmacistOverride?: {
    original_decision: string;
    overridden_decision: string;
    pharmacist_id: string;
    reason: string;
    timestamp: string;
  } | null;
};

const MOCK_CASES: PharmacistSummary[] = [
  {
    id: 'c0000001-0000-0000-0000-000000000001',
    patient: { fullName: 'Sarah Mitchell', age: 33, gender: 'Female' },
    pathway: 'uti',
    pathwayLabel: 'UTI',
    outcome: 'pharmacy',
    outcomeLabel: 'Pharmacy Referral',
    outcomeReason: 'Symptoms consistent with uncomplicated UTI and no red flags.',
    explanation: {
      decision: 'pharmacy',
      reason: 'Symptoms consistent with uncomplicated UTI and no red flags.',
      source: 'rule_engine',
    },
    createdAt: '2026-04-19T09:19:00Z',
    status: 'pending',
    symptoms: ['painful urination', 'frequency', 'lower abdominal pain'],
    answers: { q1_duration: '3 days', q2_blood_in_urine: false },
    summaryText: 'Sarah Mitchell (F, 33). 3-day history of painful urination, frequency, lower abdominal pain. No red flags. Pharmacy First eligible.',
    pharmacyTreatmentOptions: ['Trimethoprim 200mg BD x 7 days', 'Nitrofurantoin MR 100mg BD x 5 days'],
  },
  {
    id: 'c0000001-0000-0000-0000-000000000005',
    patient: { fullName: 'Chloe Davies', age: 30, gender: 'Female' },
    pathway: 'shingles',
    pathwayLabel: 'Shingles',
    outcome: 'pharmacy',
    outcomeLabel: 'Urgent Pharmacy Referral',
    outcomeReason: 'Within 72-hour treatment window and no exclusion red flags.',
    explanation: {
      decision: 'pharmacy',
      reason: 'Within 72-hour treatment window and no exclusion red flags.',
      source: 'rule_engine',
    },
    createdAt: '2026-04-21T08:53:00Z',
    status: 'pending',
    symptoms: ['unilateral rash', 'blistering', 'burning pain'],
    answers: { q1_rash_onset: 'today', q4_eye_involvement: false },
    summaryText: 'Chloe Davies (F, 30). Same-day onset unilateral rash left torso, blistering, burning/nerve pain. Within 72-hour antiviral window. Initiate antivirals urgently.',
    pharmacyTreatmentOptions: ['Aciclovir 800mg 5x daily x 7 days', 'Valaciclovir 1g TDS x 7 days'],
  },
];

export default function PharmacistDashboard() {
  const [cases, setCases] = useState<PharmacistSummary[]>(MOCK_CASES);
  const [selectedCase, setSelectedCase] = useState<PharmacistSummary | null>(null);
  const [loadError, setLoadError] = useState('');
  const [overrideDecision, setOverrideDecision] = useState('gp');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideSaving, setOverrideSaving] = useState(false);

  const sourceLabel = (source?: string) => {
    if (source === 'rule_engine') return 'Rule engine';
    if (source === 'red_flag_engine') return 'Safety engine';
    if (source === 'pharmacist_override') return 'Pharmacist override';
    return source || 'Unknown source';
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiFetch(apiUrl('/api/summary'));
        if (!res.ok) throw new Error('summary-list');
        const data = (await res.json()) as { summaries?: PharmacistSummary[] };
        if (cancelled) return;
        const summaries = Array.isArray(data.summaries) ? data.summaries : [];
        const pharmacyOnly = summaries.filter((s) => s.outcome === 'pharmacy');
        if (pharmacyOnly.length > 0) {
          setCases(pharmacyOnly);
        }
      } catch {
        if (!cancelled) {
          setCases(MOCK_CASES);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const urgencyForCase = (c: PharmacistSummary) =>
    c.pathway === 'shingles' || c.outcome === 'urgent_care' ? 'urgent' : 'standard';

  const referredAtLabel = (c: PharmacistSummary) => {
    const raw = c.createdAt;
    if (!raw) return 'Unknown';
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toISOString().replace('T', ' ').replace('.000Z', ' UTC');
  };

  const updateStatus = (id: string, newStatus: string) => {
    setCases((prev) => prev.map((c) => c.id === id ? { ...c, status: newStatus } : c));
    if (selectedCase?.id === id) {
      setSelectedCase((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const openCase = async (c: PharmacistSummary) => {
    setSelectedCase(c);
    try {
      const res = await apiFetch(apiUrl(`/api/summary/${encodeURIComponent(c.id)}`));
      if (!res.ok) return;
      const detail = (await res.json()) as PharmacistSummary;
      setSelectedCase(detail);
      setCases((prev) => prev.map((item) => (item.id === c.id ? { ...item, ...detail } : item)));
    } catch {
      // Keep selected from list if detail fetch fails.
    }
  };

  const applyOverride = async () => {
    if (!selectedCase) return;
    if (!overrideReason.trim()) return;
    setOverrideSaving(true);
    try {
      const res = await apiFetch(apiUrl(`/api/summary/${encodeURIComponent(selectedCase.id)}/override`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_decision: selectedCase.outcome,
          overridden_decision: overrideDecision,
          pharmacist_id: 'pharm_priya_sharma',
          reason: overrideReason.trim(),
        }),
      });
      if (!res.ok) throw new Error('override');
      const data = (await res.json()) as { summary?: PharmacistSummary };
      if (data.summary) {
        setSelectedCase(data.summary);
        setCases((prev) => prev.map((item) => (item.id === data.summary?.id ? { ...item, ...data.summary } : item)));
      }
      setOverrideReason('');
    } catch {
      setLoadError('Could not save override right now.');
    } finally {
      setOverrideSaving(false);
    }
  };

  const answerEntries = useMemo(
    () => (selectedCase?.answers && typeof selectedCase.answers === 'object' ? Object.entries(selectedCase.answers) : []),
    [selectedCase?.answers],
  );

  const STATUS_META: Record<string, { Icon: LucideIcon; label: string }> = {
    pending: { Icon: Clock, label: 'Pending Review' },
    reviewed: { Icon: CheckCircle2, label: 'Reviewed' },
    treated: { Icon: Pill, label: 'Treated' },
    referred: { Icon: Stethoscope, label: 'Referred to GP' },
  };

  const statusChip = (status: string) => {
    const m = STATUS_META[status];
    if (!m) return <span>{status}</span>;
    const I = m.Icon;
    return (
      <span className="inline-flex items-center gap-1">
        <I className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
        {m.label}
      </span>
    );
  };

  const routedPharmacyCases = PROVIDER_CASES.filter((c) => c.referral.type === 'pharmacy');

  return (
    <ProviderLayout title="Pharmacist Referrals" subtitle="Review pharmacy-routed triage referrals">
      <div className="max-w-6xl mx-auto flex gap-6">
        <div className="w-1/2 space-y-3">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Pharmacy Referrals <span className="text-sm font-normal text-muted-foreground ml-1">({cases.length} cases)</span>
          </h2>

          {loadError ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-lg px-3 py-2">{loadError}</div>
          ) : null}

          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => void openCase(c)}
              className={`bg-card rounded-xl p-4 border-2 cursor-pointer transition-all shadow-card ${
                selectedCase?.id === c.id
                  ? 'border-primary'
                  : urgencyForCase(c) === 'urgent'
                    ? 'border-orange-300 hover:border-orange-400'
                    : 'border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{c.patient.fullName}</span>
                    {urgencyForCase(c) === 'urgent' ? (
                      <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">URGENT</span>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground text-xs mt-0.5">{c.patient?.age}y {c.patient?.gender} · {c.pathwayLabel || c.pathway}</p>
                  <p className="text-muted-foreground text-xs mt-1">Referred: {referredAtLabel(c)}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  c.status === 'treated' ? 'bg-green-100 text-green-700' :
                  c.status === 'referred' ? 'bg-primary/10 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {statusChip(c.status)}
                </span>
              </div>
            </div>
          ))}

          {cases.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500/80" strokeWidth={1.5} aria-hidden />
              <p>No pending referrals</p>
            </div>
          ) : null}
        </div>

        <div className="w-1/2">
          {selectedCase ? (
            <div className="bg-card rounded-2xl shadow-card-md border border-border p-6 sticky top-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedCase.patient?.fullName || 'Unknown patient'}</h3>
                  <p className="text-muted-foreground text-sm">{selectedCase.patient?.age}y · {selectedCase.patient?.gender} · {selectedCase.pathwayLabel || selectedCase.pathway}</p>
                </div>
                {urgencyForCase(selectedCase) === 'urgent' ? (
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">URGENT</span>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">System Decision</p>
                  <p className="font-semibold text-foreground">{selectedCase.outcomeLabel || selectedCase.outcome}</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Referred At</p>
                  <p className="font-semibold text-foreground">{referredAtLabel(selectedCase)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">System Reasoning</h4>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Explanation</span>
                    {selectedCase.explanation?.source ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        {sourceLabel(selectedCase.explanation.source)}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-foreground">{selectedCase.explanation?.reason || selectedCase.outcomeReason || 'No reasoning provided.'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Consultation Summary</h4>
                <p className="text-sm text-foreground bg-muted p-3 rounded-lg">{selectedCase.summaryText}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Symptoms</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedCase.symptoms || []).map((symptom) => (
                    <span key={symptom} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{symptom}</span>
                  ))}
                  {(selectedCase.symptoms || []).length === 0 ? <span className="text-xs text-muted-foreground">No symptom list available.</span> : null}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Answers</h4>
                {answerEntries.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-border divide-y divide-border/50">
                    {answerEntries.map(([key, value]) => (
                      <div key={key} className="px-3 py-2 text-xs flex items-start justify-between gap-3">
                        <span className="text-muted-foreground font-mono">{key}</span>
                        <span className="text-foreground text-right break-all">{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No detailed answers available.</p>
                )}
              </div>

              {selectedCase.pharmacyTreatmentOptions && selectedCase.pharmacyTreatmentOptions.length > 0 ? (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Suggested Treatments</h4>
                  <ul className="space-y-1">
                    {selectedCase.pharmacyTreatmentOptions.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-primary mt-0.5">•</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-1">Subject to clinical assessment by pharmacist.</p>
                </div>
              ) : null}

              <div className="border border-border rounded-xl p-3 space-y-3 bg-muted/40">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Override System Decision</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Original decision</label>
                    <input
                      value={selectedCase.pharmacistOverride?.original_decision || selectedCase.outcome}
                      disabled
                      className="mt-1 w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Override to</label>
                    <select
                      value={overrideDecision}
                      onChange={(e) => setOverrideDecision(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-foreground"
                    >
                      <option value="gp">GP</option>
                      <option value="urgent_care">Urgent Care</option>
                      <option value="emergency_999">Emergency 999</option>
                      <option value="self_care">Self-care</option>
                      <option value="pharmacy">Pharmacy</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Reason</label>
                  <textarea
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    rows={3}
                    placeholder="Clinical reason for override"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-foreground resize-none"
                  />
                </div>
                <button
                  type="button"
                  disabled={overrideSaving || !overrideReason.trim()}
                  onClick={() => void applyOverride()}
                  className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {overrideSaving ? 'Saving override...' : 'Save override'}
                </button>
                {selectedCase.pharmacistOverride ? (
                  <p className="text-[11px] text-muted-foreground">
                    Last override: {selectedCase.pharmacistOverride.original_decision} → {selectedCase.pharmacistOverride.overridden_decision}
                    {' '}by {selectedCase.pharmacistOverride.pharmacist_id}
                  </p>
                ) : null}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Update Status</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(['reviewed', 'treated', 'referred'] as const).map((status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => updateStatus(selectedCase.id, status)}
                      className={`py-2 rounded-lg text-sm font-medium border transition-all inline-flex items-center justify-center gap-1.5 ${
                        selectedCase.status === status
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-input text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {statusChip(status)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="py-2 rounded-lg text-sm font-medium border border-input text-muted-foreground hover:bg-muted inline-flex items-center justify-center gap-1.5"
                  >
                    <Printer className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    Print
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-2xl shadow-card p-12 text-center text-muted-foreground border border-border">
              <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-35" strokeWidth={1.25} aria-hidden />
              <p>Select a case to view details</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-5">
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Pharmacy Referral Routing</h3>
          <div className="space-y-2">
            {routedPharmacyCases.map((c) => (
              <div key={c.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.patient.fullName}</p>
                    <p className="text-xs text-muted-foreground">{c.id} · {c.pathwayLabel}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    c.referral.status === 'routed' ? 'bg-primary/10 text-primary' :
                    c.referral.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {c.referral.status}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="bg-muted rounded-lg p-2">
                    <p className="text-muted-foreground">System triage</p>
                    <p className="font-semibold text-foreground mt-1">{c.triageOutcome}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-2">
                    <p className="text-muted-foreground">Routed to</p>
                    <p className="font-semibold text-foreground mt-1">{c.referral.routedTo}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-2">
                    <p className="text-muted-foreground">Routed at</p>
                    <p className="font-semibold text-foreground mt-1">{formatUtcLabel(c.referral.routedAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
