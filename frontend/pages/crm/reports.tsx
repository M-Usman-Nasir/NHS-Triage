/**
 * crm/reports.tsx — CRM Analytics & Reports
 * Aegis Health AI CRM
 *
 * Comprehensive reporting page with:
 * - Consultation volume trends
 * - Outcome distribution
 * - Red flag rate
 * - Pathway performance
 * - Provider performance table
 * - Monthly summary export (placeholder)
 */

import CRMLayout from '../../components/CRMLayout';

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
  { label: 'Self-Care',     value: 104, pct: 31, colour: 'bg-green-400',  icon: '🏠' },
  { label: 'Pharmacy',      value: 135, pct: 40, colour: 'bg-blue-400',   icon: '💊' },
  { label: 'GP',            value: 66,  pct: 20, colour: 'bg-yellow-400', icon: '🩺' },
  { label: 'Urgent Care',   value: 15,  pct: 4,  colour: 'bg-orange-400', icon: '⚠️' },
  { label: 'Emergency 999', value: 14,  pct: 4,  colour: 'bg-red-400',    icon: '🚨' },
];

const maxTotal = Math.max(...DAILY_TREND.map((d) => d.total));

export default function ReportsPage() {
  return (
    <CRMLayout title="Reports & Analytics" subtitle="Last 7 days — 334 total consultations">

      {/* Top KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Consultations', value: '334',  change: '+12%', up: true,  colour: 'text-blue-600' },
          { label: 'Pharmacy Rate',        value: '40.4%', change: '+3%',  up: true,  colour: 'text-green-600' },
          { label: 'Red Flag Rate',        value: '5.4%',  change: '-1%',  up: false, colour: 'text-red-600' },
          { label: 'Avg Session Time',     value: '7.4 min', change: '-0.5m', up: false, colour: 'text-purple-600' },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 font-medium">{k.label}</p>
            <p className={`text-2xl font-bold mt-1 ${k.colour}`}>{k.value}</p>
            <p className={`text-xs mt-1 font-medium ${k.up ? 'text-green-500' : 'text-orange-500'}`}>
              {k.up ? '↑' : '↓'} {k.change} vs last week
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Daily volume bar chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Daily Consultation Volume</h3>
          <div className="flex items-end gap-2 h-36">
            {DAILY_TREND.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">{d.total}</span>
                <div className="w-full flex flex-col-reverse rounded-t-sm overflow-hidden" style={{ height: `${(d.total / maxTotal) * 120}px` }}>
                  <div className="w-full bg-blue-500" style={{ height: `${(d.pharmacy / d.total) * 100}%` }} />
                  <div className="w-full bg-yellow-400" style={{ height: `${(d.gp / d.total) * 100}%` }} />
                  <div className="w-full bg-green-400" style={{ height: `${(d.selfCare / d.total) * 100}%` }} />
                  <div className="w-full bg-red-500"  style={{ height: `${(d.emergency / d.total) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-400">{d.date}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3">
            {[['bg-green-400','Self-Care'], ['bg-blue-500','Pharmacy'], ['bg-yellow-400','GP'], ['bg-red-500','Emergency']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${c}`} />
                <span className="text-xs text-gray-400">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Outcome distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Outcome Distribution (7 days)</h3>
          <div className="space-y-4">
            {OUTCOME_SUMMARY.map((o) => (
              <div key={o.label} className="flex items-center gap-3">
                <span className="text-lg w-6">{o.icon}</span>
                <span className="text-sm text-gray-600 w-24">{o.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3">
                  <div className={`${o.colour} h-3 rounded-full`} style={{ width: `${o.pct}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-16 text-right">{o.value} ({o.pct}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pathway performance */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">Pathway Performance</h3>
          <span className="text-xs text-gray-400">7-day period</span>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {['Pathway', 'Consultations', 'Pharmacy Rate', 'Red Flag Rate', 'Avg Duration'].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {PATHWAY_STATS.map((p) => (
              <tr key={p.pathway} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800 text-sm">{p.pathway}</td>
                <td className="px-5 py-3 text-gray-600 text-sm">{p.consultations}</td>
                <td className="px-5 py-3">
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{p.pharmacyRate}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    parseInt(p.redFlagRate) >= 8 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}>{p.redFlagRate}</span>
                </td>
                <td className="px-5 py-3 text-gray-500 text-sm">{p.avgDuration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Provider performance */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">Provider Performance</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {['Provider', 'Role', 'Cases Handled', 'Avg Response', 'Completion Rate', 'Satisfaction'].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {PROVIDER_STATS.map((p) => (
              <tr key={p.name} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800 text-sm">{p.name}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.role === 'Pharmacist' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.role}</span>
                </td>
                <td className="px-5 py-3 text-gray-600 text-sm font-semibold">{p.casesHandled}</td>
                <td className="px-5 py-3 text-gray-500 text-sm">{p.avgResponse}</td>
                <td className="px-5 py-3">
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">{p.completionRate}</span>
                </td>
                <td className="px-5 py-3 text-gray-600 text-sm font-semibold">{p.satisfaction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 flex items-center justify-between text-white">
        <div>
          <h3 className="font-bold">Export Monthly Report</h3>
          <p className="text-blue-200 text-sm mt-0.5">Download full April 2026 CRM report as PDF or CSV</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition">
            📄 Export PDF
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-400 transition border border-blue-400">
            📊 Export CSV
          </button>
        </div>
      </div>
    </CRMLayout>
  );
}
