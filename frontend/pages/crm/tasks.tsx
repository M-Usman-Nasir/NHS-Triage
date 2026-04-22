/**
 * crm/tasks.tsx — Tasks & Follow-ups
 * Aegis Health AI CRM
 *
 * Task management page with:
 * - Priority-sorted task list
 * - Overdue alerts highlighted
 * - Status filters (pending / overdue / completed)
 * - Mark complete inline
 * - Create new task modal
 */

import { useState } from 'react';
import CRMLayout from '../../components/CRMLayout';

const MOCK_TASKS = [
  { id:'TASK-001', title:'Follow up — Sarah Mitchell UTI treatment response',      description:'Check if patient improved after Nitrofurantoin. Advise if symptoms persist.',           patientName:'Sarah Mitchell', caseId:'CASE-001', assignedTo:'Priya Sharma',   dueDate:'2026-04-21', priority:'medium',   status:'overdue',   type:'follow_up', createdAt:'2026-04-19' },
  { id:'TASK-002', title:'Hospital discharge follow-up — James Parker',            description:'Contact Manchester Royal Infirmary for discharge summary. Update patient record.',         patientName:'James Parker',   caseId:'CASE-002', assignedTo:'Dr. Admin User', dueDate:'2026-04-22', priority:'critical', status:'pending',   type:'clinical',  createdAt:'2026-04-16' },
  { id:'TASK-003', title:'GP feedback — Aisha Patel (Scarlet Fever?)',             description:'Await GP feedback after appointment on 22 Apr. Update case outcome.',                     patientName:'Aisha Patel',    caseId:'CASE-003', assignedTo:'Dr. Admin User', dueDate:'2026-04-23', priority:'high',     status:'pending',   type:'follow_up', createdAt:'2026-04-20' },
  { id:'TASK-004', title:'7-day shingles follow-up — Chloe Davies',               description:'Check Aciclovir course completion. Ask about nerve pain, eye symptoms.',                   patientName:'Chloe Davies',   caseId:'CASE-005', assignedTo:'Priya Sharma',   dueDate:'2026-04-28', priority:'medium',   status:'pending',   type:'follow_up', createdAt:'2026-04-21' },
  { id:'TASK-005', title:'Review monthly analytics report',                        description:'Compile April 2026 consultation outcomes, red flag rate, and pharmacy referral stats.',    patientName:null,             caseId:null,       assignedTo:'Dr. Admin User', dueDate:'2026-04-30', priority:'low',      status:'pending',   type:'admin',     createdAt:'2026-04-01' },
  { id:'TASK-006', title:'Impetigo GP referral confirmation — David Chen',         description:'Confirm GP appointment booked at Bristol Central Surgery.',                                patientName:'David Chen',     caseId:'CASE-006', assignedTo:'Dr. Admin User', dueDate:'2026-04-22', priority:'high',     status:'pending',   type:'follow_up', createdAt:'2026-04-21' },
];

const PRIORITY_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  critical: { label: 'Critical', bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500' },
  high:     { label: 'High',     bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-400' },
  medium:   { label: 'Medium',   bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-400' },
  low:      { label: 'Low',      bg: 'bg-gray-50',   text: 'text-gray-500',   border: 'border-gray-200',   dot: 'bg-gray-300' },
};

const TYPE_ICONS: Record<string, string> = {
  follow_up: '📞', clinical: '🩺', admin: '📋', reminder: '⏰',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', patientName: '', assignedTo: '', dueDate: '', priority: 'medium', type: 'follow_up' });
  const [created, setCreated] = useState(false);

  const filtered = tasks
    .filter((t) => !statusFilter || t.status === statusFilter)
    .sort((a, b) => {
      const p: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (b.status === 'overdue' && a.status !== 'overdue') return 1;
      return (p[a.priority] ?? 9) - (p[b.priority] ?? 9);
    });

  const markComplete = async (id: string) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: 'completed' } : t));
    await fetch(`http://localhost:4000/api/crm/tasks/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    }).catch(() => {});
  };

  const handleCreate = async () => {
    if (!form.title) return;
    const newTask = {
      id: `TASK-${String(tasks.length + 1).padStart(3, '0')}`,
      ...form, status: 'pending', createdAt: new Date().toISOString().split('T')[0],
      caseId: null, patientName: form.patientName || null,
    };
    setTasks((prev) => [newTask, ...prev]);
    setCreated(true);
    await fetch('http://localhost:4000/api/crm/tasks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).catch(() => {});
    setTimeout(() => { setCreated(false); setShowCreate(false); setForm({ title:'', description:'', patientName:'', assignedTo:'', dueDate:'', priority:'medium', type:'follow_up' }); }, 1500);
  };

  const overdueCnt = tasks.filter((t) => t.status === 'overdue').length;
  const pendingCnt = tasks.filter((t) => t.status === 'pending').length;
  const completedCnt = tasks.filter((t) => t.status === 'completed').length;

  return (
    <CRMLayout title="Tasks & Follow-ups" subtitle="Track clinical follow-ups, reminders, and admin tasks">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Overdue',   value: overdueCnt,   bg: 'bg-red-50',    text: 'text-red-600',   filter: 'overdue' },
          { label: 'Pending',   value: pendingCnt,   bg: 'bg-yellow-50', text: 'text-yellow-600', filter: 'pending' },
          { label: 'Completed', value: completedCnt, bg: 'bg-green-50',  text: 'text-green-600',  filter: 'completed' },
        ].map((s) => (
          <button key={s.label} onClick={() => setStatusFilter(statusFilter === s.filter ? '' : s.filter)}
            className={`${s.bg} rounded-xl p-4 text-left border-2 transition-all ${statusFilter === s.filter ? 'border-blue-400' : 'border-transparent'}`}>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 mb-5">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">All statuses</option>
          <option value="overdue">Overdue</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <button onClick={() => setShowCreate(true)}
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
          + New Task
        </button>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-center text-gray-400 py-12">No tasks found.</p>}
        {filtered.map((t) => {
          const pCfg = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.medium;
          const isCompleted = t.status === 'completed';
          return (
            <div key={t.id} className={`bg-white rounded-2xl border-2 p-4 transition-all ${
              t.status === 'overdue' ? 'border-red-200 bg-red-50' :
              isCompleted ? 'border-gray-100 opacity-60' : 'border-gray-100 hover:border-blue-200'
            }`}>
              <div className="flex items-start gap-4">
                {/* Complete checkbox */}
                <button onClick={() => !isCompleted && markComplete(t.id)}
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'
                  }`}>
                  {isCompleted && <span className="text-white text-xs">✓</span>}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold text-sm ${isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>{t.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {t.status === 'overdue' && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">OVERDUE</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pCfg.bg} ${pCfg.text}`}>{pCfg.label}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{TYPE_ICONS[t.type]} {t.type.replace('_', ' ')}</span>
                    {t.patientName && <span>👤 {t.patientName}</span>}
                    {t.assignedTo && <span>→ {t.assignedTo}</span>}
                    <span className={t.status === 'overdue' ? 'text-red-600 font-semibold' : ''}>📅 {t.dueDate}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create task modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800">New Task</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Task Title *', key: 'title', type: 'text', placeholder: 'e.g. Follow up with patient...' },
                { label: 'Description', key: 'description', type: 'text', placeholder: 'Details...' },
                { label: 'Patient Name', key: 'patientName', type: 'text', placeholder: 'Optional' },
                { label: 'Assign To', key: 'assignedTo', type: 'text', placeholder: 'e.g. Priya Sharma' },
                { label: 'Due Date', key: 'dueDate', type: 'date', placeholder: '' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} placeholder={f.placeholder}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="follow_up">Follow-up</option>
                    <option value="clinical">Clinical</option>
                    <option value="admin">Admin</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreate(false)}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} disabled={!form.title}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  created ? 'bg-green-500 text-white' :
                  form.title ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}>
                {created ? '✓ Created!' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
