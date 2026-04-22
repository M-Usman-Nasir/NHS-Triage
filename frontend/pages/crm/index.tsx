import { useState, useEffect } from 'react';
import CRMLayout from '../../components/CRMLayout';
import Link from 'next/link';

interface DashboardData {
  kpis: {
    totalPatients: number;
    openCases: number;
    criticalCases: number;
    overdueTasks: number;
    pendingTasks: number;
    highRiskPatients: number;
    totalProviders: number;
    totalCommunications: number;
  };
  casesByStage: Record<string, number>;
  outcomeBreakdown: Record<string, number>;
  recentActivity: Array<{ id: number; time: string; type: string; text: string; icon: string; colour: string }>;
}

const MOCK: DashboardData = {
  kpis: { totalPatients: 10, openCases: 4, criticalCases: 1, overdueTasks: 1, pendingTasks: 5, highRiskPatients: 1, totalProviders: 4, totalCommunications: 6 },
  casesByStage: { new: 1, in_review: 1, treated: 2, escalated: 1, closed: 1 },
  outcomeBreakdown: { self_care: 1, pharmacy: 2, gp: 2, urgent_care: 0, emergency_999: 1 },
  recentActivity: [
    { id: 1, time: '2026-04-21T13:05:00Z', type: 'case_opened',   text: 'New case: David Chen — Impetigo GP Referral',      icon: '📋', colour: 'blue' },
    { id: 2, time: '2026-04-21T10:15:00Z', type: 'case_treated',  text: 'Chloe Davies shingles case marked as Treated',     icon: '✅', colour: 'green' },
    { id: 3, time: '2026-04-21T08:55:00Z', type: 'comm_sent',     text: 'Urgent email sent to Chloe Davies — shingles',     icon: '📧', colour: 'blue' },
    { id: 4, time: '2026-04-20T11:38:00Z', type: 'consultation',  text: 'Consultation: Aisha Patel — Sore Throat (GP)',     icon: '🩺', colour: 'yellow' },
    { id: 5, time: '2026-04-19T18:22:00Z', type: 'comm_received', text: 'Reply from Sarah Mitchell — UTI improving',        icon: '📩', colour: 'green' },
    { id: 6, time: '2026-04-16T14:08:00Z', type: 'red_flag',      text: 'RED FLAG: James Parker — 999 emergency triggered', icon: '🚨', colour: 'red' },
  ],
};

const STAGE_CONFIG: Record<string, { label: string; colour: string }> = {
  new:       { label: 'New',       colour: 'bg-gray-400' },
  in_review: { label: 'In Review', colour: 'bg-blue-500' },
  treated:   { label: 'Treated',   colour: 'bg-green-500' },
  escalated: { label: 'Escalated', colour: 'bg-red-500' },
  closed:    { label: 'Closed',    colour: 'bg-gray-300' },
};

const OUTCOME_CONFIG: Record<string, { label: string; colour: string; icon: string }> = {
  self_care:     { label: 'Self-Care',   colour: 'bg-green-500',  icon: '🏠' },
  pharmacy:      { label: 'Pharmacy',    colour: 'bg-blue-500',   icon: '💊' },
  gp:            { label: 'GP',          colour: 'bg-yellow-400', icon: '🩺' },
  urgent_care:   { label: 'Urgent',      colour: 'bg-orange-500', icon: '⚠️' },
  emergency_999: { label: 'Emergency',   colour: 'bg-red-500',    icon: '🚨' },
};

const ACTIVITY_COLOUR: Record<string, string> = {
  red:    'bg-red-100 text-red-700',
  green:  'bg-green-100 text-green-700',
  blue:   'bg-blue-100 text-blue-700',
  yellow: 'bg-amber-100 text-amber-700',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CRMDashboard() {
  const [data, setData] = useState<DashboardData>(MOCK);

  useEffect(() => {
    fetch('http://localhost:4000/api/crm/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(MOCK));
  }, []);

  const { kpis, casesByStage, outcomeBreakdown, recentActivity } = data;

  const KPI_CARDS = [
    { label: 'Patients',      value: kpis.totalPatients,       icon: '👥', bg: 'bg-blue-600',   href: '/crm/patients' },
    { label: 'Open Cases',    value: kpis.openCases,           icon: '📋', bg: 'bg-amber-500',  href: '/crm/cases' },
    { label: 'Critical',      value: kpis.criticalCases,       icon: '🚨', bg: 'bg-red-600',    href: '/crm/cases' },
    { label: 'Overdue',       value: kpis.overdueTasks,        icon: '⏰', bg: 'bg-orange-500', href: '/crm/tasks' },
    { label: 'Tasks',         value: kpis.pendingTasks,        icon: '✅', bg: 'bg-green-600',  href: '/crm/tasks' },
    { label: 'High Risk',     value: kpis.highRiskPatients,    icon: '⚠️', bg: 'bg-red-500',    href: '/crm/patients' },
    { label: 'Providers',     value: kpis.totalProviders,      icon: '🏥', bg: 'bg-purple-600', href: '/crm/providers' },
    { label: 'Comms',         value: kpis.totalCommunications, icon: '💬', bg: 'bg-indigo-600', href: '/crm/communications' },
  ];

  const totalCases    = Object.values(casesByStage).reduce((a, b) => a + b, 0) || 1;
  const totalOutcomes = Object.values(outcomeBreakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <CRMLayout title="Dashboard" subtitle="Patient & Case Management Overview">

      {/* KPI grid — 4 cols on mobile, 8 on lg */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 mb-5">
        {KPI_CARDS.map((k) => (
          <Link key={k.label} href={k.href}>
            <div className={`${k.bg} rounded-xl p-2.5 sm:p-3 cursor-pointer hover:opacity-90 active:scale-95 transition-all text-center`}>
              <div className="text-xl sm:text-2xl leading-none mb-1">{k.icon}</div>
              <div className="text-white font-black text-lg sm:text-2xl leading-none">{k.value}</div>
              <div className="text-white/80 text-xs mt-0.5 font-medium truncate">{k.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Alert strip */}
      {kpis.criticalCases > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
          <span className="text-xl flex-shrink-0">🚨</span>
          <div className="flex-1 min-w-0">
            <p className="text-red-700 font-bold text-sm">
              {kpis.criticalCases} critical case{kpis.criticalCases > 1 ? 's' : ''} require immediate attention
            </p>
          </div>
          <Link href="/crm/cases">
            <span className="text-red-600 text-xs font-semibold cursor-pointer flex-shrink-0 hover:underline">Review →</span>
          </Link>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Case pipeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-700 text-sm">Cases by Stage</h3>
            <Link href="/crm/cases">
              <span className="text-blue-500 text-xs cursor-pointer hover:underline">View all →</span>
            </Link>
          </div>
          <div className="space-y-2.5">
            {Object.entries(casesByStage).map(([stage, count]) => {
              const cfg = STAGE_CONFIG[stage] || { label: stage, colour: 'bg-gray-400' };
              const pct = Math.round((count / totalCases) * 100);
              return (
                <div key={stage} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-16 flex-shrink-0">{cfg.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className={`${cfg.colour} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-600 w-5 text-right flex-shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Triage outcomes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-bold text-gray-700 text-sm mb-3">Triage Outcomes</h3>
          <div className="space-y-2.5">
            {Object.entries(outcomeBreakdown).map(([outcome, count]) => {
              const cfg = OUTCOME_CONFIG[outcome] || { label: outcome, colour: 'bg-gray-400', icon: '•' };
              const pct = Math.round((count / totalOutcomes) * 100);
              return (
                <div key={outcome} className="flex items-center gap-2">
                  <span className="text-sm w-5 flex-shrink-0">{cfg.icon}</span>
                  <span className="text-xs text-gray-500 w-14 flex-shrink-0">{cfg.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className={`${cfg.colour} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-600 w-5 text-right flex-shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-bold text-gray-700 text-sm mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Open Cases',    href: '/crm/cases',          icon: '📋', cls: 'bg-blue-50 text-blue-700' },
              { label: 'High Risk',     href: '/crm/patients',       icon: '⚠️', cls: 'bg-red-50 text-red-700' },
              { label: 'Tasks',         href: '/crm/tasks',          icon: '✅', cls: 'bg-green-50 text-green-700' },
              { label: 'Comms',         href: '/crm/communications', icon: '💬', cls: 'bg-indigo-50 text-indigo-700' },
              { label: 'Providers',     href: '/crm/providers',      icon: '🏥', cls: 'bg-purple-50 text-purple-700' },
              { label: 'Reports',       href: '/crm/reports',        icon: '📈', cls: 'bg-emerald-50 text-emerald-700' },
            ].map((a) => (
              <Link key={a.label} href={a.href}>
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-95 ${a.cls}`}>
                  <span>{a.icon}</span>
                  {a.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-700 text-sm">Recent Activity</h3>
          <span className="text-xs text-gray-400">Latest events</span>
        </div>
        <div className="space-y-1">
          {recentActivity.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm flex-shrink-0 ${ACTIVITY_COLOUR[a.colour] || 'bg-gray-100'}`}>
                {a.icon}
              </span>
              <p className="flex-1 text-xs text-gray-700 truncate min-w-0">{a.text}</p>
              <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{timeAgo(a.time)}</span>
            </div>
          ))}
        </div>
      </div>
    </CRMLayout>
  );
}
