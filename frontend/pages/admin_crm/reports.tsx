/**
 * crm/reports.tsx — CRM Analytics & Reports
 * Care Path CRM
 *
 * Comprehensive reporting page with:
 * - Consultation volume trends
 * - Outcome distribution
 * - Red flag rate
 * - Pathway performance
 * - Provider performance table
 * - Monthly summary export (placeholder)
 */

import { FileDown, Sheet, TrendingDown, TrendingUp } from 'lucide-react';
import CRMLayout from '../../components/CRMLayout';
import { TriageOutcomeIcon } from '../../lib/triageOutcomeIcons';
import InlineNotice from '../../components/InlineNotice';
import { MOCK_DATA_DISCLOSURE } from '../../lib/complianceContent';

const DAILY_TREND = [
  { date: '14 Apr', total: 42, pharmacy: 18, gp: 8, selfCare: 12, emergency: 2, redFlags: 3 },
  { date: '15 Apr', total: 38, pharmacy: 15, gp: 9, selfCare: 10, emergency: 2, redFlags: 2 },
  { date: '16 Apr', total: 55, pharmacy: 22, gp: 10, selfCare: 18, emergency: 2, redFlags: 4 },
  { date: '17 Apr', total: 61, pharmacy: 25, gp: 12, selfCare: 20, emergency: 2, redFlags: 3 },
  { date: '18 Apr', total: 47, pharmacy: 19, gp: 9, selfCare: 15, emergency: 2, redFlags: 2 },
  { date: '19 Apr', total: 33, pharmacy: 12, gp: 7, selfCare: 10, emergency: 2, redFlags: 1 },
  { date: '20 Apr', total: 58, pharmacy: 24, gp: 11, selfCare: 19, emergency: 2, redFlags: 3 },
];

const PATHWAY_STATS = [
  { pathway: 'UTI',              consultations: 98, pharmacyRate: '78%', redFlagRate: '2%',  avgDuration: '7 min' },
  { pathway: 'Sore Throat',      consultations: 72, pharmacyRate: '45%', redFlagRate: '5%',  avgDuration: '8 min' },
  { pathway: 'Sinusitis',        consultations: 61, pharmacyRate: '52%', redFlagRate: '3%',  avgDuration: '6 min' },
  { pathway: 'Shingles',         consultations: 34, pharmacyRate: '61%', redFlagRate: '8%',  avgDuration: '9 min' },
  { pathway: 'Otitis Media',     consultations: 28, pharmacyRate: '57%', redFlagRate: '4%',  avgDuration: '7 min' },
  { pathway: 'Impetigo',         consultations: 22, pharmacyRate: '54%', redFlagRate: '2%',  avgDuration: '8 min' },
  { pathway: 'Insect Bites',     consultations: 19, pharmacyRate: '63%', redFlagRate: '11%', avgDuration: '7 min' },
];

const PROVIDER_STATS = [
  { name: 'Priya Sharma',     role: 'Pharmacist', casesHandled: 28, avgResponse: '45 min', completionRate: '96%', satisfaction: '4.8/5' },
  { name: 'James Okafor',     role: 'Pharmacist', casesHandled: 15, avgResponse: '1.2 hrs', completionRate: '93%', satisfaction: '4.6/5' },
  { name: 'Dr. Mark Osei',    role: 'GP',         casesHandled: 7,  avgResponse: '24 hrs', completionRate: '100%', satisfaction: '4.9/5' },
  { name: 'Dr. Helena Cross', role: 'GP',         casesHandled: 4,  avgResponse: '48 hrs', completionRate: '100%', satisfaction: '4.7/5' },
];

const OUTCOME_SUMMARY = [
  { label: 'Self-Care',     outcome: 'self_care',     value: 104, pct: 31, colour: 'bg-green-400' },
  { label: 'Pharmacy',      outcome: 'pharmacy',      value: 135, pct: 40, colour: 'bg-primary' },
  { label: 'GP',            outcome: 'gp',            value: 66,  pct: 20, colour: 'bg-yellow-400' },
  { label: 'Urgent Care',   outcome: 'urgent_care',   value: 15,  pct: 4,  colour: 'bg-orange-400' },
  { label: 'Emergency 999', outcome: 'emergency_999', value: 14,  pct: 4,  colour: 'bg-red-400' },
];

const maxTotal = Math.max(...DAILY_TREND.map((d) => d.total));

export default function ReportsPage() {
  return (
    <CRMLayout title="Reports & Analytics" subtitle="Last 7 days — 334 total consultations">
      <InlineNotice title="Demo/offline transparency" tone="warning" className="mb-4">
        {MOCK_DATA_DISCLOSURE} Report totals shown on this screen currently use seeded sample analytics.
      </InlineNotice>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Consultations', value: '334',  change: '+12%', up: true,  colour: 'text-primary' },
          { label: 'Pharmacy Rate',        value: '40.4%', change: '+3%',  up: true,  colour: 'text-green-600' },
          { label: 'Red Flag Rate',        value: '5.4%',  change: '-1%',  up: false, colour: 'text-red-600' },
          { label: 'Avg Session Time',     value: '7.4 min', change: '-0.5m', up: false, colour: 'text-purple-600' },
        ].map((k) => (
          <div key={k.label} className="bg-card rounded-xl border border-border shadow-card p-4">
            <p className="text-xs text-muted-foreground font-medium">{k.label}</p>
            <p className={`text-2xl font-bold mt-1 ${k.colour}`}>{k.value}</p>
            <p className={`text-xs mt-1 font-medium inline-flex items-center gap-1 ${k.up ? 'text-green-500' : 'text-orange-500'}`}>
              {k.up ? <TrendingUp className="h-3.5 w-3.5 shrink-0" aria-hidden /> : <TrendingDown className="h-3.5 w-3.5 shrink-0" aria-hidden />}
              {k.change} vs last week
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <div className="bg-card rounded-2xl shadow-card border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Daily Consultation Volume</h3>
          <div className="flex items-end gap-2 h-36">
            {DAILY_TREND.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground font-medium">{d.total}</span>
                <div className="w-full flex flex-col-reverse rounded-t-sm overflow-hidden" style={{ height: `${(d.total / maxTotal) * 120}px` }}>
                  <div className="w-full bg-primary" style={{ height: `${(d.pharmacy / d.total) * 100}%` }} />
                  <div className="w-full bg-yellow-400" style={{ height: `${(d.gp / d.total) * 100}%` }} />
                  <div className="w-full bg-green-400" style={{ height: `${(d.selfCare / d.total) * 100}%` }} />
                  <div className="w-full bg-red-500"  style={{ height: `${(d.emergency / d.total) * 100}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{d.date}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3">
            {[['bg-green-400','Self-Care'], ['bg-primary','Pharmacy'], ['bg-yellow-400','GP'], ['bg-red-500','Emergency']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${c}`} />
                <span className="text-xs text-muted-foreground">{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-card border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Outcome Distribution (7 days)</h3>
          <div className="space-y-4">
            {OUTCOME_SUMMARY.map((o) => (
              <div key={o.label} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center text-primary">
                  <TriageOutcomeIcon outcome={o.outcome} className="h-5 w-5" />
                </span>
                <span className="text-sm text-muted-foreground w-24">{o.label}</span>
                <div className="flex-1 bg-muted rounded-full h-3">
                  <div className={`${o.colour} h-3 rounded-full`} style={{ width: `${o.pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right">{o.value} ({o.pct}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Pathway Performance</h3>
          <span className="text-xs text-muted-foreground">7-day period</span>
        </div>
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              {['Pathway', 'Consultations', 'Pharmacy Rate', 'Red Flag Rate', 'Avg Duration'].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {PATHWAY_STATS.map((p) => (
              <tr key={p.pathway} className="hover:bg-muted/50">
                <td className="px-5 py-3 font-medium text-foreground text-sm">{p.pathway}</td>
                <td className="px-5 py-3 text-muted-foreground text-sm">{p.consultations}</td>
                <td className="px-5 py-3">
                  <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">{p.pharmacyRate}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    parseInt(p.redFlagRate) >= 8 ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'
                  }`}>{p.redFlagRate}</span>
                </td>
                <td className="px-5 py-3 text-muted-foreground text-sm">{p.avgDuration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Provider Performance</h3>
        </div>
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              {['Provider', 'Role', 'Cases Handled', 'Avg Response', 'Completion Rate', 'Satisfaction'].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {PROVIDER_STATS.map((p) => (
              <tr key={p.name} className="hover:bg-muted/50">
                <td className="px-5 py-3 font-medium text-foreground text-sm">{p.name}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.role === 'Pharmacist' ? 'bg-primary/10 text-primary' : 'bg-yellow-100 text-yellow-700'}`}>{p.role}</span>
                </td>
                <td className="px-5 py-3 text-muted-foreground text-sm font-semibold">{p.casesHandled}</td>
                <td className="px-5 py-3 text-muted-foreground text-sm">{p.avgResponse}</td>
                <td className="px-5 py-3">
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">{p.completionRate}</span>
                </td>
                <td className="px-5 py-3 text-muted-foreground text-sm font-semibold">{p.satisfaction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gradient-to-r from-primary to-brand-header rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-primary-foreground">
        <div>
          <h3 className="font-bold">Export Monthly Report</h3>
          <p className="text-brand-header-subtle text-sm mt-0.5">Download full April 2026 CRM report as PDF or CSV</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="inline-flex items-center justify-center gap-2 bg-card text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-card/90 transition">
            <FileDown className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            Export PDF
          </button>
          <button type="button" className="inline-flex items-center justify-center gap-2 bg-primary-foreground/15 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-foreground/25 transition border border-primary-foreground/30">
            <Sheet className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            Export CSV
          </button>
        </div>
      </div>
    </CRMLayout>
  );
}
