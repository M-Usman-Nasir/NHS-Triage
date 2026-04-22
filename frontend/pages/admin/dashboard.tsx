/**
 * admin/dashboard.tsx — Admin Dashboard
 * Aegis Health AI
 *
 * Platform administration and analytics dashboard.
 *
 * Sections:
 * - Summary stats (total consultations, outcomes, red flag rate)
 * - Daily consultation volume chart (text-based for demo)
 * - Clinical pathway status overview
 * - Red flag rules viewer
 *
 * Mock data: mirrors analytics seed data from seed.sql
 * In production: fetches from GET /api/admin/analytics and /api/admin/pathways
 */

import { useState } from 'react';

// ─── Mock analytics data ──────────────────────────────────────────────────────

const ANALYTICS = {
  period: 'Last 7 days',
  summary: {
    totalConsultations: 334,
    redFlagRate: '5.4%',
    pharmacyReferralRate: '40.4%',
    outcomeBreakdown: {
      selfCare:   104,
      pharmacy:   135,
      gp:          66,
      urgentCare:  15,
      emergency:   14,
    },
    totalRedFlagsTriggered: 18,
  },
  dailyTrend: [
    { date: '14 Apr', total: 42 },
    { date: '15 Apr', total: 38 },
    { date: '16 Apr', total: 55 },
    { date: '17 Apr', total: 61 },
    { date: '18 Apr', total: 47 },
    { date: '19 Apr', total: 33 },
    { date: '20 Apr', total: 58 },
  ],
};

const PATHWAYS = [
  { code: 'uti',          label: 'Uncomplicated UTI',      questions: 9, redFlags: 3, active: true },
  { code: 'sore_throat',  label: 'Sore Throat',            questions: 8, redFlags: 3, active: true },
  { code: 'sinusitis',    label: 'Sinusitis',              questions: 9, redFlags: 3, active: true },
  { code: 'otitis_media', label: 'Acute Otitis Media',     questions: 8, redFlags: 3, active: true },
  { code: 'insect_bites', label: 'Infected Insect Bites',  questions: 8, redFlags: 4, active: true },
  { code: 'impetigo',     label: 'Impetigo',               questions: 8, redFlags: 2, active: true },
  { code: 'shingles',     label: 'Shingles',               questions: 8, redFlags: 4, active: true },
];

const RED_FLAG_SAMPLES = [
  { pathway: 'Sore Throat',   code: 'RF_ST_001', condition: 'Difficulty breathing', outcome: '999',         active: true },
  { pathway: 'UTI',           code: 'RF_UTI_001', condition: 'Fever + loin pain',   outcome: 'Urgent Care', active: true },
  { pathway: 'Sinusitis',     code: 'RF_SIN_001', condition: 'Eye swelling',         outcome: '999',         active: true },
  { pathway: 'Insect Bites',  code: 'RF_IB_001', condition: 'Anaphylaxis signs',    outcome: '999',         active: true },
  { pathway: 'Shingles',      code: 'RF_SHG_001', condition: 'Eye involvement',     outcome: '999',         active: true },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'pathways' | 'rules'>('overview');

  const { summary, dailyTrend } = ANALYTICS;
  const maxDaily = Math.max(...dailyTrend.map((d) => d.total));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Aegis Health AI</h1>
            <p className="text-gray-400 text-xs">Admin Dashboard — Dr. Admin User</p>
          </div>
          <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
            System Online
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Tab navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {(['overview', 'pathways', 'rules'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium capitalize border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'overview' ? '📊 Overview' : tab === 'pathways' ? '🗺️ Pathways' : '⚠️ Rules'}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Consultations',   value: summary.totalConsultations.toLocaleString(), colour: 'text-blue-600',  bg: 'bg-blue-50' },
                { label: 'Pharmacy Referral Rate', value: summary.pharmacyReferralRate,                colour: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Red Flag Rate',          value: summary.redFlagRate,                         colour: 'text-red-600',   bg: 'bg-red-50' },
                { label: 'Red Flags Triggered',    value: summary.totalRedFlagsTriggered.toString(),   colour: 'text-orange-600',bg: 'bg-orange-50' },
              ].map((kpi) => (
                <div key={kpi.label} className={`${kpi.bg} rounded-xl p-5 border border-white shadow-sm`}>
                  <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${kpi.colour}`}>{kpi.value}</p>
                  <p className="text-xs text-gray-400 mt-1">Last 7 days</p>
                </div>
              ))}
            </div>

            {/* Outcome breakdown */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-4">Outcome Distribution</h3>
              <div className="space-y-3">
                {[
                  { label: 'Self-Care',   value: summary.outcomeBreakdown.selfCare,   colour: 'bg-green-400' },
                  { label: 'Pharmacy',    value: summary.outcomeBreakdown.pharmacy,   colour: 'bg-blue-400' },
                  { label: 'GP',          value: summary.outcomeBreakdown.gp,         colour: 'bg-yellow-400' },
                  { label: 'Urgent Care', value: summary.outcomeBreakdown.urgentCare, colour: 'bg-orange-400' },
                  { label: 'Emergency',   value: summary.outcomeBreakdown.emergency,  colour: 'bg-red-400' },
                ].map((item) => {
                  const pct = ((item.value / summary.totalConsultations) * 100).toFixed(1);
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-24">{item.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3">
                        <div
                          className={`${item.colour} h-3 rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-16 text-right">{item.value} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily volume chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-4">Daily Consultation Volume</h3>
              <div className="flex items-end gap-3 h-32">
                {dailyTrend.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500">{day.total}</span>
                    <div
                      className="w-full bg-blue-500 rounded-t-sm"
                      style={{ height: `${(day.total / maxDaily) * 100}px` }}
                    />
                    <span className="text-xs text-gray-400">{day.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Pathways Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'pathways' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Pathway', 'Code', 'Questions', 'Red Flags', 'Status'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {PATHWAYS.map((p) => (
                  <tr key={p.code} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-800 text-sm">{p.label}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs font-mono">{p.code}</td>
                    <td className="px-5 py-4 text-gray-600 text-sm">{p.questions}</td>
                    <td className="px-5 py-4 text-sm">
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">{p.redFlags} flags</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Rules Tab ─────────────────────────────────────────────────────── */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
              ⚠️ Rules displayed here are read-only in this view. Editing clinical rules requires a full release process and clinical sign-off.
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Pathway', 'Rule Code', 'Trigger Condition', 'Escalation', 'Active'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {RED_FLAG_SAMPLES.map((r) => (
                    <tr key={r.code} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-gray-800 text-sm font-medium">{r.pathway}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs font-mono">{r.code}</td>
                      <td className="px-5 py-4 text-gray-600 text-sm">{r.condition}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.outcome === '999' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {r.outcome}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Yes</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
