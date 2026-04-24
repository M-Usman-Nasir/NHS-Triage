import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  ChartColumn,
  Clock,
  FolderKanban,
  Hospital,
  Inbox,
  ListTodo,
  Mail,
  MessageSquare,
  Siren,
  Stethoscope,
  TriangleAlert,
  Users,
} from 'lucide-react';
import CRMLayout from '../../components/CRMLayout';
import Link from 'next/link';
import { apiUrl, safeFetchJson } from '../../lib/api';
import { TriageOutcomeIcon } from '../../lib/triageOutcomeIcons';

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
  recentActivity: Array<{ id: number; time: string; type: string; text: string; colour: string }>;
}

const MOCK: DashboardData = {
  kpis: { totalPatients: 10, openCases: 4, criticalCases: 1, overdueTasks: 1, pendingTasks: 5, highRiskPatients: 1, totalProviders: 4, totalCommunications: 6 },
  casesByStage: { new: 1, in_review: 1, treated: 2, escalated: 1, closed: 1 },
  outcomeBreakdown: { self_care: 1, pharmacy: 2, gp: 2, urgent_care: 0, emergency_999: 1 },
  recentActivity: [
    { id: 1, time: '2026-04-21T13:05:00Z', type: 'case_opened',   text: 'New case: David Chen — Impetigo GP Referral',      colour: 'blue' },
    { id: 2, time: '2026-04-21T10:15:00Z', type: 'case_treated',  text: 'Chloe Davies shingles case marked as Treated',     colour: 'green' },
    { id: 3, time: '2026-04-21T08:55:00Z', type: 'comm_sent',     text: 'Urgent email sent to Chloe Davies — shingles',     colour: 'blue' },
    { id: 4, time: '2026-04-20T11:38:00Z', type: 'consultation',  text: 'Consultation: Aisha Patel — Sore Throat (GP)',     colour: 'yellow' },
    { id: 5, time: '2026-04-19T18:22:00Z', type: 'comm_received', text: 'Reply from Sarah Mitchell — UTI improving',        colour: 'green' },
    { id: 6, time: '2026-04-16T14:08:00Z', type: 'red_flag',      text: 'RED FLAG: James Parker — 999 emergency triggered', colour: 'red' },
  ],
};

const STAGE_CONFIG: Record<string, { label: string; colour: string }> = {
  new:       { label: 'New',       colour: 'bg-gray-400' },
  in_review: { label: 'In Review', colour: 'bg-primary' },
  treated:   { label: 'Treated',   colour: 'bg-green-500' },
  escalated: { label: 'Escalated', colour: 'bg-red-500' },
  closed:    { label: 'Closed',    colour: 'bg-gray-300' },
};

const OUTCOME_CONFIG: Record<string, { label: string; colour: string }> = {
  self_care:     { label: 'Self-Care',   colour: 'bg-green-500' },
  pharmacy:      { label: 'Pharmacy',    colour: 'bg-primary' },
  gp:            { label: 'GP',          colour: 'bg-yellow-400' },
  urgent_care:   { label: 'Urgent',      colour: 'bg-orange-500' },
  emergency_999: { label: 'Emergency',   colour: 'bg-red-500' },
};

const ACTIVITY_TYPE_ICON: Record<string, LucideIcon> = {
  case_opened: FolderKanban,
  case_treated: BadgeCheck,
  comm_sent: Mail,
  consultation: Stethoscope,
  comm_received: Inbox,
  red_flag: Siren,
};

const ACTIVITY_COLOUR: Record<string, string> = {
  red:    'bg-red-100 text-red-700',
  green:  'bg-green-100 text-green-700',
  blue:   'bg-primary/10 text-primary',
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
    void (async () => {
      const d = await safeFetchJson<DashboardData>(apiUrl('/api/crm/dashboard'), MOCK);
      setData(d);
    })();
  }, []);

  const { kpis, casesByStage, outcomeBreakdown, recentActivity } = data;

  const KPI_CARDS: Array<{
    label: string;
    value: number;
    href: string;
    Icon: LucideIcon;
    /** Tinted icon chip + hover ring (cards stay light) */
    accent: string;
  }> = [
    { label: 'Patients',      value: kpis.totalPatients,       Icon: Users,         accent: 'bg-primary/12 text-primary ring-primary/15', href: '/crm/patients' },
    { label: 'Open Cases',    value: kpis.openCases,           Icon: FolderKanban,   accent: 'bg-amber-50 text-amber-700 ring-amber-200/80', href: '/crm/cases' },
    { label: 'Critical',      value: kpis.criticalCases,       Icon: Siren,         accent: 'bg-red-50 text-red-600 ring-red-200/80', href: '/crm/cases' },
    { label: 'Overdue',       value: kpis.overdueTasks,        Icon: Clock,         accent: 'bg-orange-50 text-orange-700 ring-orange-200/80', href: '/crm/tasks' },
    { label: 'Tasks',         value: kpis.pendingTasks,        Icon: BadgeCheck,    accent: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80', href: '/crm/tasks' },
    { label: 'High Risk',     value: kpis.highRiskPatients,    Icon: TriangleAlert, accent: 'bg-rose-50 text-rose-600 ring-rose-200/80', href: '/crm/patients' },
    { label: 'Providers',     value: kpis.totalProviders,      Icon: Hospital,      accent: 'bg-violet-50 text-violet-700 ring-violet-200/80', href: '/crm/providers' },
    { label: 'Comms',         value: kpis.totalCommunications, Icon: MessageSquare, accent: 'bg-sky-50 text-sky-700 ring-sky-200/80', href: '/crm/communications' },
  ];

  const totalCases    = Object.values(casesByStage).reduce((a, b) => a + b, 0) || 1;
  const totalOutcomes = Object.values(outcomeBreakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <CRMLayout title="Dashboard" subtitle="Patient & Case Management Overview">

      {/* KPI grid — 4 cols on mobile, 8 on lg */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 mb-5">
        {KPI_CARDS.map(({ label, value, href, Icon, accent }) => (
          <Link key={label} href={href}>
            <div className="group rounded-xl border border-border bg-card p-2.5 sm:p-3 text-center shadow-card cursor-pointer transition-all hover:shadow-card-md hover:border-primary/25 active:scale-[0.98] ring-0 hover:ring-1 hover:ring-inset">
              <div className={`mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9 ring-1 ring-inset transition group-hover:ring-2 ${accent}`}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="font-black text-lg sm:text-2xl leading-none text-foreground tabular-nums">{value}</div>
              <div className="mt-0.5 truncate text-xs font-medium text-muted-foreground">{label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Alert strip */}
      {kpis.criticalCases > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <Siren className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
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
        <div className="bg-card rounded-2xl shadow-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground text-sm">Cases by Stage</h3>
            <Link href="/crm/cases">
              <span className="text-primary text-xs cursor-pointer hover:underline">View all →</span>
            </Link>
          </div>
          <div className="space-y-2.5">
            {Object.entries(casesByStage).map(([stage, count]) => {
              const cfg = STAGE_CONFIG[stage] || { label: stage, colour: 'bg-gray-400' };
              const pct = Math.round((count / totalCases) * 100);
              return (
                <div key={stage} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16 flex-shrink-0">{cfg.label}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className={`${cfg.colour} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground w-5 text-right flex-shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Triage outcomes */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-4">
          <h3 className="font-bold text-foreground text-sm mb-3">Triage Outcomes</h3>
          <div className="space-y-2.5">
            {Object.entries(outcomeBreakdown).map(([outcome, count]) => {
              const cfg = OUTCOME_CONFIG[outcome] || { label: outcome, colour: 'bg-gray-400' };
              const pct = Math.round((count / totalOutcomes) * 100);
              return (
                <div key={outcome} className="flex items-center gap-2">
                  <span className="flex w-6 shrink-0 items-center justify-center text-muted-foreground">
                    <TriageOutcomeIcon outcome={outcome} className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span className="text-xs text-muted-foreground w-14 flex-shrink-0">{cfg.label}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className={`${cfg.colour} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground w-5 text-right flex-shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-4">
          <h3 className="font-bold text-foreground text-sm mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Open Cases',    href: '/crm/cases',          Icon: FolderKanban,   cls: 'bg-primary/10 text-primary' },
              { label: 'High Risk',     href: '/crm/patients',       Icon: TriangleAlert, cls: 'bg-red-50 text-red-700' },
              { label: 'Tasks',         href: '/crm/tasks',          Icon: ListTodo,      cls: 'bg-green-50 text-green-700' },
              { label: 'Comms',         href: '/crm/communications', Icon: MessageSquare, cls: 'bg-indigo-50 text-indigo-700' },
              { label: 'Providers',     href: '/crm/providers',      Icon: Hospital,      cls: 'bg-purple-50 text-purple-700' },
              { label: 'Reports',       href: '/crm/reports',        Icon: ChartColumn,   cls: 'bg-emerald-50 text-emerald-700' },
            ].map(({ label, href, Icon, cls }) => (
              <Link key={label} href={href}>
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-95 ${cls}`}>
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  {label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="bg-card rounded-2xl shadow-card border border-border p-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground text-sm">Recent Activity</h3>
          <span className="text-xs text-muted-foreground">Latest events</span>
        </div>
        <div className="space-y-1">
          {recentActivity.map((a) => {
            const ActIcon = ACTIVITY_TYPE_ICON[a.type] || FolderKanban;
            return (
            <div key={a.id} className="flex items-center gap-3 py-2 border-b border-border/60 last:border-0">
              <span className={`w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 ${ACTIVITY_COLOUR[a.colour] || 'bg-muted'}`}>
                <ActIcon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </span>
              <p className="flex-1 text-xs text-foreground truncate min-w-0">{a.text}</p>
              <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">{timeAgo(a.time)}</span>
            </div>
            );
          })}
        </div>
      </div>
    </CRMLayout>
  );
}
