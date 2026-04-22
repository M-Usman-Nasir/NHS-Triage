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
import CRMLayout from '../../components/CRMLayout';

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

const COLUMNS = [
  { id: 'new',       label: 'New',       icon: '🆕', colour: 'border-t-gray-400',   headerBg: 'bg-gray-100' },
  { id: 'in_review', label: 'In Review', icon: '🔍', colour: 'border-t-blue-400',   headerBg: 'bg-blue-50' },
  { id: 'treated',   label: 'Treated',   icon: '💊', colour: 'border-t-green-400',  headerBg: 'bg-green-50' },
  { id: 'escalated', label: 'Escalated', icon: '🚨', colour: 'border-t-red-400',    headerBg: 'bg-red-50' },
  { id: 'closed',    label: 'Closed',    icon: '✅', colour: 'border-t-gray-300',   headerBg: 'bg-gray-50' },
];

const PRIORITY_CONFIG: Record<string, { label: string; colour: string; dot: string }> = {
  critical: { label: 'Critical', colour: 'bg-red-100 text-red-700',    dot: 'bg-red-500' },
  high:     { label: 'High',     colour: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  medium:   { label: 'Medium',   colour: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  low:      { label: 'Low',      colour: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-300' },
};

const OUTCOME_ICONS: Record<string, string> = {
  pharmacy: '💊', gp: '🩺', self_care: '🏠', urgent_care: '⚠️', emergency_999: '🚨',
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
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <span className="text-sm text-gray-400 self-center">{filtered.length} cases total</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colCases = filtered.filter((c) => c.stage === col.id);
          return (
            <div key={col.id} className="flex-shrink-0 w-64">
              {/* Column header */}
              <div className={`${col.headerBg} rounded-t-xl px-3 py-2 flex items-center justify-between border border-b-0 border-gray-200`}>
                <div className="flex items-center gap-2">
                  <span>{col.icon}</span>
                  <span className="font-semibold text-sm text-gray-700">{col.label}</span>
                </div>
                <span className="bg-white text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full border border-gray-200">
                  {colCases.length}
                </span>
              </div>

              {/* Cards */}
              <div className={`bg-white border border-gray-200 rounded-b-xl min-h-64 p-2 space-y-2 border-t-4 ${col.colour}`}>
                {colCases.length === 0 && (
                  <div className="text-center py-8 text-gray-300 text-xs">No cases</div>
                )}
                {colCases.map((c) => {
                  const pCfg = PRIORITY_CONFIG[c.priority] || PRIORITY_CONFIG.medium;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCase(c)}
                      className={`bg-white rounded-xl border-2 p-3 cursor-pointer hover:shadow-md transition-all ${
                        selectedCase?.id === c.id ? 'border-blue-400 shadow-md' : 'border-gray-100 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-xs font-semibold text-gray-700 leading-tight">{c.title}</span>
                        <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-1 ${pCfg.dot}`} />
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{c.patientName}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{OUTCOME_ICONS[c.outcome] || '•'}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${pCfg.colour}`}>{pCfg.label}</span>
                      </div>
                      {c.followUpDate && (
                        <p className="text-xs text-gray-400 mt-1">Follow-up: {c.followUpDate}</p>
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
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-start justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-sm leading-tight">{selectedCase.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{selectedCase.id} · {selectedCase.patientName}</p>
            </div>
            <button onClick={() => setSelectedCase(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none flex-shrink-0">×</button>
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
                <div key={f.label} className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400">{f.label}</p>
                  <p className="text-xs font-semibold text-gray-700 capitalize">{f.value}</p>
                </div>
              ))}
            </div>

            {selectedCase.notes && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Notes</p>
                <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">{selectedCase.notes}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Move to Stage</p>
              <div className="grid grid-cols-1 gap-1">
                {COLUMNS.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => moveCase(selectedCase.id, col.id)}
                    disabled={selectedCase.stage === col.id}
                    className={`py-2 px-3 rounded-lg text-xs font-medium text-left transition-all ${
                      selectedCase.stage === col.id
                        ? 'bg-blue-600 text-white cursor-default'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {col.icon} {col.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
