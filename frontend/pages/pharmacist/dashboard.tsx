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

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Clock, ListChecks, Pill, Printer, Stethoscope } from 'lucide-react';

// ─── Mock data (in production: fetch from GET /api/summary) ──────────────────

const MOCK_CASES = [
  {
    id: 'c0000001-0000-0000-0000-000000000001',
    patient: { fullName: 'Sarah Mitchell', age: 33, gender: 'Female' },
    pathway: 'UTI',
    outcome: 'pharmacy',
    urgency: 'standard',
    referredAt: '2026-04-19 09:19',
    status: 'pending',
    summaryText: 'Sarah Mitchell (F, 33). 3-day history of painful urination, frequency, lower abdominal pain. No red flags. Pharmacy First eligible.',
    treatmentOptions: ['Trimethoprim 200mg BD x 7 days', 'Nitrofurantoin MR 100mg BD x 5 days'],
  },
  {
    id: 'c0000001-0000-0000-0000-000000000005',
    patient: { fullName: 'Chloe Davies', age: 30, gender: 'Female' },
    pathway: 'Shingles',
    outcome: 'pharmacy',
    urgency: 'urgent',
    referredAt: '2026-04-21 08:53',
    status: 'pending',
    summaryText: 'Chloe Davies (F, 30). Same-day onset unilateral rash left torso, blistering, burning/nerve pain. Within 72-hour antiviral window. Initiate antivirals urgently.',
    treatmentOptions: ['Aciclovir 800mg 5x daily x 7 days', 'Valaciclovir 1g TDS x 7 days'],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PharmacistDashboard() {
  const [cases, setCases] = useState(MOCK_CASES);
  const [selectedCase, setSelectedCase] = useState<typeof MOCK_CASES[0] | null>(null);

  const updateStatus = (id: string, newStatus: string) => {
    setCases((prev) => prev.map((c) => c.id === id ? { ...c, status: newStatus } : c));
    if (selectedCase?.id === id) {
      setSelectedCase((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const STATUS_META: Record<string, { Icon: LucideIcon; label: string }> = {
    pending:  { Icon: Clock, label: 'Pending Review' },
    reviewed: { Icon: CheckCircle2, label: 'Reviewed' },
    treated:  { Icon: Pill, label: 'Treated' },
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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-brand-header text-primary-foreground py-4 px-6 shadow-card-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Aegis Health AI</h1>
            <p className="text-brand-header-subtle text-xs">Pharmacist Dashboard — Priya Sharma</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Lloyds Pharmacy, London</p>
            <p className="text-brand-header-subtle text-xs">21 April 2026</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6">

        {/* Case List */}
        <div className="w-1/2 space-y-3">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Pharmacy Referrals <span className="text-sm font-normal text-muted-foreground ml-1">({cases.length} cases)</span>
          </h2>

          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className={`bg-card rounded-xl p-4 border-2 cursor-pointer transition-all shadow-card ${
                selectedCase?.id === c.id
                  ? 'border-primary'
                  : c.urgency === 'urgent'
                    ? 'border-orange-300 hover:border-orange-400'
                    : 'border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{c.patient.fullName}</span>
                    {c.urgency === 'urgent' && (
                      <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">URGENT</span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs mt-0.5">{c.patient.age}y {c.patient.gender} · {c.pathway}</p>
                  <p className="text-muted-foreground text-xs mt-1">Referred: {c.referredAt}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  c.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                  c.status === 'treated'  ? 'bg-green-100 text-green-700' :
                  c.status === 'referred' ? 'bg-primary/10 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {statusChip(c.status)}
                </span>
              </div>
            </div>
          ))}

          {cases.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500/80" strokeWidth={1.5} aria-hidden />
              <p>No pending referrals</p>
            </div>
          )}
        </div>

        {/* Case Detail Panel */}
        <div className="w-1/2">
          {selectedCase ? (
            <div className="bg-card rounded-2xl shadow-card-md border border-border p-6 sticky top-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedCase.patient.fullName}</h3>
                  <p className="text-muted-foreground text-sm">{selectedCase.patient.age}y · {selectedCase.patient.gender} · {selectedCase.pathway}</p>
                </div>
                {selectedCase.urgency === 'urgent' && (
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">URGENT</span>
                )}
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Consultation Summary</h4>
                <p className="text-sm text-foreground bg-muted p-3 rounded-lg">{selectedCase.summaryText}</p>
              </div>

              {/* Treatment options */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Suggested Treatments</h4>
                <ul className="space-y-1">
                  {selectedCase.treatmentOptions.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-primary mt-0.5">•</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-1">Subject to clinical assessment by pharmacist.</p>
              </div>

              {/* Action buttons */}
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
    </div>
  );
}
