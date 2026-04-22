/**
 * crm/cases.tsx — Cases Pipeline (Kanban Board)
 * Aegis Health AI CRM
 *
 * Visual Kanban board with 5 columns:
 *   New → In Review → Treated → Escalated → Closed
 *
 * Features:
 * - Drag-and-drop stage movement (via buttons — no external library needed)
 * - Priority colour coding (critical / high / medium / low)
 * - Filter by priority, pathway, assignee
 * - Case count per column
 */

import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Pill, Search, Siren, Sparkles } from 'lucide-react';
import CRMLayout from '../../components/CRMLayout';
import { TriageOutcomeIcon } from '../../lib/triageOutcomeIcons';

interface Case {
  id: string; patientId: string; patientName: string; title: string;
  pathway: string; outcome: string; stage: string; priority: string;
  assignedTo: string | null; openedAt: string; closedAt: string | null;
  notes: string; followUpDate: string | null;
}

const MOCK_CASES: Case[] = [
  { id:'CASE-001', patientId:'PAT-001', patientName:'Sarah Mitchell',  title:'UTI — Pharmacy Referral',                        pathway:'UTI',                  outcome:'pharmacy',      stage:'treated',    priority:'medium',   assignedTo:'Priya Sharma',     openedAt:'2026-04-19', closedAt:null,         notes:'Nitrofurantoin dispensed.',                               followUpDate:'2026-04-21' },
  { id:'CASE-002', patientId:'PAT-002', patientName:'James Parker',    title:'Cardiac Emergency — 999 Escalation',             pathway:'Emergency',            outcome:'emergency_999', stage:'escalated',  priority:'critical', assignedTo:'Dr. Admin User',   openedAt:'2026-04-16', closedAt:null,         notes:'999 called. Hospital admission.',                         followUpDate:'2026-04-22' },
  { id:'CASE-003', patientId:'PAT-003', patientName:'Aisha Patel',     title:'Sore Throat — GP Referral (Possible Scarlet Fever)', pathway:'Sore Throat',       outcome:'gp',            stage:'in_review',  priority:'high',     assignedTo:'Dr. Mark Osei',    openedAt:'2026-04-20', closedAt:null,         notes:'GP appointment 22 Apr.',                                  followUpDate:'2026-04-22' },
  { id:'CASE-004', patientId:'PAT-007', patientName:'Emma Wilson',     title:'Sinusitis — Self-Care',                          pathway:'Sinusitis',            outcome:'self_care',     stage:'closed',     priority:'low',      assignedTo:null,               openedAt:'2026-04-18', closedAt:'2026-04-18', notes:'Self-care advice provided.',                              followUpDate:null },
  { id:'CASE-005', patientId:'PAT-009', patientName:'Chloe Davies',    title:'Shingles — Urgent Pharmacy (72hr Window)',       pathway:'Shingles',             outcome:'pharmacy',      stage:'treated',    priority:'high',     assignedTo:'Priya Sharma',     openedAt:'2026-04-21', closedAt:null,         notes:'Aciclovir dispensed. Follow-up 28 Apr.',                  followUpDate:'2026-04-28' },
  { id:'CASE-006', patientId:'PAT-006', patientName:'David Chen',      title:'Impetigo — GP Referral (Diabetic)',              pathway:'Impetigo',             outcome:'gp',            stage:'new',        priority:'high',     assignedTo:'Dr. Leila Thompson', openedAt:'2026-04-21', closedAt:null,        notes:'Diabetic patient. Urgent GP appointment needed.',         followUpDate:'2026-04-23' },
];

const COLUMNS: Array<{
  id: string;
  label: string;
  Icon: LucideIcon;
  colour: string;
  headerBg: string;
}> = [
  { id: 'new',       label: 'New',       Icon: Sparkles,   colour: 'border-t-gray-400',   headerBg: 'bg-muted' },
  { id: 'in_review', label: 'In Review', Icon: Search,     colour: 'border-t-primary',   headerBg: 'bg-primary/10' },
  { id: 'treated',   label: 'Treated',   Icon: Pill,       colour: 'border-t-green-400',  headerBg: 'bg-green-50' },
  { id: 'escalated', label: 'Escalated', Icon: Siren,      colour: 'border-t-red-400',    headerBg: 'bg-red-50' },
  { id: 'closed',    label: 'Closed',    Icon: CheckCircle2, colour: 'border-t-gray-300',   headerBg: 'bg-muted/80' },
];

const PRIORITY_CONFIG: Record<string, { label: string; colour: string; dot: string }> = {
  critical: { label: 'Critical', colour: 'bg-red-100 text-red-700',    dot: 'bg-red-500' },
  high:     { label: 'High',     colour: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  medium:   { label: 'Medium',   colour: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  low:      { label: 'Low',      colour: 'bg-muted text-muted-foreground',   dot: 'bg-gray-300' },
};

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const filtered = cases.filter((c) => !priorityFilter || c.priority === priorityFilter);

  const moveCase = async (caseId: string, newStage: string) => {
    setCases((prev) => prev.map((c) => c.id === caseId ? { ...c, stage: newStage } : c));
    setSelectedCase((prev) => prev?.id === caseId ? { ...prev, stage: newStage } : prev);

    await fetch(`http://localhost:4000/api/crm/cases/${caseId}/stage`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    }).catch(() => {});
  };

  const STAGE_ORDER = ['new', 'in_review', 'treated', 'escalated', 'closed'];

  return (
    <CRMLayout title="Cases Pipeline" subtitle="Drag cases across stages to track progress">

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border border-input rounded-lg px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <span className="text-sm text-muted-foreground self-center">{filtered.length} cases total</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colCases = filtered.filter((c) => c.stage === col.id);
          const ColIcon = col.Icon;
          return (
            <div key={col.id} className="flex-shrink-0 w-64">
              <div className={`${col.headerBg} rounded-t-xl px-3 py-2 flex items-center justify-between border border-b-0 border-border`}>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-card/80 text-foreground shadow-sm">
                    <ColIcon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="font-semibold text-sm text-foreground">{col.label}</span>
                </div>
                <span className="bg-card text-muted-foreground text-xs font-bold px-2 py-0.5 rounded-full border border-border">
                  {colCases.length}
                </span>
              </div>

              {/* Cards */}
              <div className={`bg-card border border-border rounded-b-xl min-h-64 p-2 space-y-2 border-t-4 ${col.colour}`}>
                {colCases.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground/50 text-xs">No cases</div>
                )}
                {colCases.map((c) => {
                  const pCfg = PRIORITY_CONFIG[c.priority] || PRIORITY_CONFIG.medium;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCase(c)}
                      className={`bg-card rounded-xl border-2 p-3 cursor-pointer hover:shadow-md transition-all ${
                        selectedCase?.id === c.id ? 'border-primary/50 shadow-md' : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-xs font-semibold text-foreground leading-tight">{c.title}</span>
                        <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-1 ${pCfg.dot}`} />
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{c.patientName}</p>
                      <div className="flex items-center justify-between">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <TriageOutcomeIcon outcome={c.outcome} className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${pCfg.colour}`}>{pCfg.label}</span>
                      </div>
                      {c.followUpDate && (
                        <p className="text-xs text-muted-foreground mt-1">Follow-up: {c.followUpDate}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Case detail panel */}
      {selectedCase && (
        <div className="fixed right-0 top-0 h-full w-80 bg-card shadow-2xl border-l border-border z-50 flex flex-col">
          <div className="p-5 border-b border-border flex items-start justify-between">
            <div>
              <h3 className="font-bold text-foreground text-sm leading-tight">{selectedCase.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{selectedCase.id} · {selectedCase.patientName}</p>
            </div>
            <button type="button" onClick={() => setSelectedCase(null)} className="text-muted-foreground hover:text-foreground text-xl leading-none flex-shrink-0">×</button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Stage',    value: selectedCase.stage.replace('_', ' ') },
                { label: 'Priority', value: selectedCase.priority },
                { label: 'Pathway',  value: selectedCase.pathway },
                { label: 'Outcome',  value: selectedCase.outcome.replace('_', ' ') },
                { label: 'Assigned', value: selectedCase.assignedTo || '—' },
                { label: 'Opened',   value: selectedCase.openedAt },
              ].map((f) => (
                <div key={f.label} className="bg-muted rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">{f.label}</p>
                  <p className="text-xs font-semibold text-foreground capitalize">{f.value}</p>
                </div>
              ))}
            </div>

            {selectedCase.notes && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Notes</p>
                <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3">{selectedCase.notes}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Move to Stage</p>
              <div className="grid grid-cols-1 gap-1">
                {COLUMNS.map((col) => {
                  const MoveIcon = col.Icon;
                  return (
                  <button
                    key={col.id}
                    onClick={() => moveCase(selectedCase.id, col.id)}
                    disabled={selectedCase.stage === col.id}
                    className={`py-2 px-3 rounded-lg text-xs font-medium text-left transition-all inline-flex items-center gap-2 ${
                      selectedCase.stage === col.id
                        ? 'bg-primary text-primary-foreground cursor-default'
                        : 'bg-muted text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <MoveIcon className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
                    {col.label}
                  </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
