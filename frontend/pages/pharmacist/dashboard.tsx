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

  const STATUS_LABELS: Record<string, string> = {
    pending:  '⏳ Pending Review',
    reviewed: '✅ Reviewed',
    treated:  '💊 Treated',
    referred: '🩺 Referred to GP',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-800 text-white py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Aegis Health AI</h1>
            <p className="text-blue-200 text-xs">Pharmacist Dashboard — Priya Sharma</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Lloyds Pharmacy, London</p>
            <p className="text-blue-200 text-xs">21 April 2026</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6">

        {/* Case List */}
        <div className="w-1/2 space-y-3">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Pharmacy Referrals <span className="text-sm font-normal text-gray-500 ml-1">({cases.length} cases)</span>
          </h2>

          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all shadow-sm ${
                selectedCase?.id === c.id
                  ? 'border-blue-500'
                  : c.urgency === 'urgent'
                    ? 'border-orange-300 hover:border-orange-400'
                    : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{c.patient.fullName}</span>
                    {c.urgency === 'urgent' && (
                      <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">URGENT</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5">{c.patient.age}y {c.patient.gender} · {c.pathway}</p>
                  <p className="text-gray-400 text-xs mt-1">Referred: {c.referredAt}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  c.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                  c.status === 'treated'  ? 'bg-green-100 text-green-700' :
                  c.status === 'referred' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {STATUS_LABELS[c.status]}
                </span>
              </div>
            </div>
          ))}

          {cases.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">✓</p>
              <p>No pending referrals</p>
            </div>
          )}
        </div>

        {/* Case Detail Panel */}
        <div className="w-1/2">
          {selectedCase ? (
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedCase.patient.fullName}</h3>
                  <p className="text-gray-500 text-sm">{selectedCase.patient.age}y · {selectedCase.patient.gender} · {selectedCase.pathway}</p>
                </div>
                {selectedCase.urgency === 'urgent' && (
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">URGENT</span>
                )}
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Consultation Summary</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedCase.summaryText}</p>
              </div>

              {/* Treatment options */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Suggested Treatments</h4>
                <ul className="space-y-1">
                  {selectedCase.treatmentOptions.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-400 mt-0.5">•</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-400 mt-1">Subject to clinical assessment by pharmacist.</p>
              </div>

              {/* Action buttons */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Update Status</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['reviewed', 'treated', 'referred'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedCase.id, status)}
                      className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                        selectedCase.status === status
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {STATUS_LABELS[status]}
                    </button>
                  ))}
                  <button
                    onClick={() => window.print()}
                    className="py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    🖨️ Print
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400 border border-gray-100">
              <p className="text-4xl mb-3">👈</p>
              <p>Select a case to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
