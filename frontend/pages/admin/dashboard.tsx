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
import { LayoutDashboard, Map, TriangleAlert } from 'lucide-react';

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
    <div className="min-h-screen bg-background">
      <header className="border-b border-sidebar-border bg-sidebar py-4 px-6 text-sidebar-foreground shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg text-foreground">Aegis Health AI</h1>
            <p className="text-xs text-sidebar-muted">Admin Dashboard — Dr. Admin User</p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            System Online
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Tab navigation */}
        <div className="flex gap-4 mb-8 border-b border-border">
          {(
            [
              { id: 'overview' as const, label: 'Overview', Icon: LayoutDashboard },
              { id: 'pathways' as const, label: 'Pathways', Icon: Map },
              { id: 'rules' as const, label: 'Rules', Icon: TriangleAlert },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveTab(id)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-all inline-flex items-center gap-2 ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              {label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Consultations',   value: summary.totalConsultations.toLocaleString(), colour: 'text-primary',  bg: 'bg-primary/10' },
                { label: 'Pharmacy Referral Rate', value: summary.pharmacyReferralRate,                colour: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Red Flag Rate',          value: summary.redFlagRate,                         colour: 'text-red-600',   bg: 'bg-red-50' },
                { label: 'Red Flags Triggered',    value: summary.totalRedFlagsTriggered.toString(),   colour: 'text-orange-600',bg: 'bg-orange-50' },
              ].map((kpi) => (
                <div key={kpi.label} className={`${kpi.bg} rounded-xl p-5 border border-border shadow-card`}>
                  <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${kpi.colour}`}>{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                </div>
              ))}
            </div>

            {/* Outcome breakdown */}
            <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Outcome Distribution</h3>
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
                      <span className="text-sm text-muted-foreground w-24">{item.label}</span>
                      <div className="flex-1 bg-muted rounded-full h-3">
                        <div
                          className={`${item.colour} h-3 rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-16 text-right">{item.value} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily volume chart */}
            <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Daily Consultation Volume</h3>
              <div className="flex items-end gap-3 h-32">
                {dailyTrend.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">{day.total}</span>
                    <div
                      className="w-full bg-primary rounded-t-sm"
                      style={{ height: `${(day.total / maxDaily) * 100}px` }}
                    />
                    <span className="text-xs text-muted-foreground">{day.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Pathways Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'pathways' && (
          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  {['Pathway', 'Code', 'Questions', 'Red Flags', 'Status'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {PATHWAYS.map((p) => (
                  <tr key={p.code} className="hover:bg-muted/50">
                    <td className="px-5 py-4 font-medium text-foreground text-sm">{p.label}</td>
                    <td className="px-5 py-4 text-muted-foreground text-xs font-mono">{p.code}</td>
                    <td className="px-5 py-4 text-muted-foreground text-sm">{p.questions}</td>
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
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 flex gap-3">
              <TriangleAlert className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" strokeWidth={1.75} aria-hidden />
              <p>
                Rules displayed here are read-only in this view. Editing clinical rules requires a full release process and clinical sign-off.
              </p>
            </div>
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    {['Pathway', 'Rule Code', 'Trigger Condition', 'Escalation', 'Active'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {RED_FLAG_SAMPLES.map((r) => (
                    <tr key={r.code} className="hover:bg-muted/50">
                      <td className="px-5 py-4 text-foreground text-sm font-medium">{r.pathway}</td>
                      <td className="px-5 py-4 text-muted-foreground text-xs font-mono">{r.code}</td>
                      <td className="px-5 py-4 text-muted-foreground text-sm">{r.condition}</td>
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
