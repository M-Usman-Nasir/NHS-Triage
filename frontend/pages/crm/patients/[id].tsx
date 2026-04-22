/**
 * crm/patients/[id].tsx — Patient Profile Page
 * Aegis Health AI CRM
 *
 * Full patient profile with:
 * - Demographics and contact info
 * - Risk flags and tags
 * - Consultation history timeline
 * - Communication history
 * - Open tasks
 * - Editable notes
 */

import { useState, useEffect } from 'react';
import { Check, ListChecks, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/router';
import CRMLayout from '../../../components/CRMLayout';
import Link from 'next/link';
import { ChannelIcon } from '../../../lib/channelIcons';

const MOCK_PROFILES: Record<string, any> = {
  'PAT-001': {
    id:'PAT-001', fullName:'Sarah Mitchell', dateOfBirth:'1992-03-14', age:33, gender:'Female',
    postcode:'SW1A 1AA', phone:'07700900001', email:'sarah.mitchell@example.com',
    gpName:'Dr. Helena Cross', gpSurgery:'Pimlico Medical Centre', nhsNumber:'485 777 3456',
    preferredContact:'email', tags:['pharmacy_regular','uti_recurring'], riskFlag:null,
    status:'active', totalConsultations:3, lastContactDate:'2026-04-19', createdAt:'2025-11-12',
    notes:'Patient has had 3 UTI consultations in the past 12 months. Responded well to Nitrofurantoin. GP aware of recurrence pattern.',
    cases:[{ id:'CASE-001', title:'UTI — Pharmacy Referral', stage:'treated', priority:'medium', openedAt:'2026-04-19', outcome:'pharmacy' }],
    communications:[
      { id:'COMM-001', channel:'email', direction:'outbound', subject:'Your pharmacy consultation summary — UTI', sentAt:'2026-04-19T14:35:00Z', status:'delivered' },
      { id:'COMM-005', channel:'email', direction:'inbound',  subject:'Re: Your pharmacy consultation summary — UTI', sentAt:'2026-04-19T18:22:00Z', status:'received' },
    ],
    tasks:[{ id:'TASK-001', title:'Follow up — Sarah Mitchell UTI treatment response', dueDate:'2026-04-21', status:'overdue', priority:'medium' }],
  },
  'PAT-002': {
    id:'PAT-002', fullName:'James Parker', dateOfBirth:'1951-11-22', age:74, gender:'Male',
    postcode:'M1 1AE', phone:'07700900002', email:'james.parker@example.com',
    gpName:'Dr. Arjun Mehta', gpSurgery:'Manchester Central Practice', nhsNumber:'312 445 9876',
    preferredContact:'phone', tags:['high_risk','cardiac_history','red_flag_triggered'], riskFlag:'HIGH',
    status:'active', totalConsultations:1, lastContactDate:'2026-04-16', createdAt:'2026-04-16',
    notes:'Referred to 999 via red flag on 16 Apr 2026. Cardiac symptoms. Ensure GP follow-up after hospital discharge.',
    cases:[{ id:'CASE-002', title:'Cardiac Emergency — 999 Escalation', stage:'escalated', priority:'critical', openedAt:'2026-04-16', outcome:'emergency_999' }],
    communications:[{ id:'COMM-002', channel:'sms', direction:'outbound', subject:null, sentAt:'2026-04-16T14:08:00Z', status:'delivered' }],
    tasks:[{ id:'TASK-002', title:'Hospital discharge follow-up — James Parker', dueDate:'2026-04-22', status:'pending', priority:'critical' }],
  },
};

const OUTCOME_CONFIG: Record<string, { label: string; colour: string }> = {
  pharmacy:      { label: 'Pharmacy',  colour: 'bg-primary/10 text-primary' },
  gp:            { label: 'GP',        colour: 'bg-yellow-100 text-yellow-700' },
  self_care:     { label: 'Self-Care', colour: 'bg-green-100 text-green-700' },
  urgent_care:   { label: 'Urgent',    colour: 'bg-orange-100 text-orange-700' },
  emergency_999: { label: '999',       colour: 'bg-red-100 text-red-700' },
};

const STAGE_COLOURS: Record<string, string> = {
  new: 'bg-muted text-muted-foreground', in_review: 'bg-primary/10 text-primary',
  treated: 'bg-green-100 text-green-700', escalated: 'bg-red-100 text-red-700', closed: 'bg-muted text-muted-foreground/70',
};

const TASK_PRIORITY: Record<string, string> = {
  critical: 'text-red-600', high: 'text-orange-500', medium: 'text-yellow-600', low: 'text-muted-foreground',
};

export default function PatientProfile() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [patient, setPatient] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'comms' | 'tasks'>('overview');

  useEffect(() => {
    if (!id) return;
    const mock = MOCK_PROFILES[id];
    if (mock) { setPatient(mock); setNotes(mock.notes); return; }

    fetch(`http://localhost:4000/api/crm/patients/${id}`)
      .then((r) => r.json())
      .then((d) => { setPatient(d); setNotes(d.notes || ''); })
      .catch(() => {});
  }, [id]);

  const handleSaveNotes = async () => {
    await fetch(`http://localhost:4000/api/crm/patients/${id}/notes`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    }).catch(() => {});
    setSavedNotes(true);
    setTimeout(() => setSavedNotes(false), 2000);
  };

  if (!patient) return <CRMLayout title="Loading..."><div className="text-muted-foreground text-center py-20">Loading patient profile...</div></CRMLayout>;

  return (
    <CRMLayout title={patient.fullName} subtitle={`NHS: ${patient.nhsNumber} · ${patient.gpSurgery}`}>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: profile card */}
        <div className="space-y-4">

          {/* Demographics */}
          <div className="bg-card rounded-2xl shadow-card border border-border p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-xl">
                  {patient.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="font-bold text-foreground">{patient.fullName}</h2>
                <p className="text-muted-foreground text-sm">{patient.age}y · {patient.gender}</p>
                {patient.riskFlag && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block ${
                    patient.riskFlag === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>{patient.riskFlag} RISK</span>
                )}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: 'NHS Number',  value: patient.nhsNumber },
                { label: 'DOB',         value: patient.dateOfBirth },
                { label: 'Email',       value: patient.email },
                { label: 'Phone',       value: patient.phone },
                { label: 'Postcode',    value: patient.postcode },
                { label: 'GP',          value: patient.gpName },
                { label: 'Surgery',     value: patient.gpSurgery },
                { label: 'Contact Pref',value: patient.preferredContact },
              ].map((f) => (
                <div key={f.label} className="flex justify-between gap-2">
                  <span className="text-muted-foreground text-xs">{f.label}</span>
                  <span className="text-foreground text-xs font-medium text-right">{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {patient.tags.length > 0 && (
            <div className="bg-card rounded-2xl shadow-card border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Tags</p>
              <div className="flex flex-wrap gap-1">
                {patient.tags.map((t: string) => (
                  <span key={t} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                    {t.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-card rounded-2xl shadow-card border border-border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Clinical Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm text-foreground border border-input rounded-lg p-2 min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Add clinical notes..."
            />
            <button
              onClick={handleSaveNotes}
              className={`mt-2 w-full py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5 ${
                savedNotes ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {savedNotes ? (
                <>
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  Saved
                </>
              ) : (
                'Save Notes'
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="bg-card rounded-2xl shadow-card border border-border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Stats</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Consultations', value: patient.totalConsultations },
                { label: 'Open Cases',    value: patient.cases?.filter((c: any) => c.stage !== 'closed').length || 0 },
                { label: 'Tasks',         value: patient.tasks?.length || 0 },
                { label: 'Comms',         value: patient.communications?.length || 0 },
              ].map((s) => (
                <div key={s.label} className="text-center bg-muted rounded-lg p-2">
                  <p className="text-lg font-bold text-primary">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: tabbed detail */}
        <div className="lg:col-span-2 space-y-4">

          {/* Tabs */}
          <div className="flex gap-1 bg-card rounded-xl border border-border p-1 shadow-card">
            {(['overview', 'cases', 'comms', 'tasks'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  activeTab === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'comms' ? 'Comms' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="bg-card rounded-2xl shadow-card border border-border p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Patient Overview</h3>
              <div className="prose prose-sm text-muted-foreground max-w-none">
                <p>{patient.notes || 'No notes recorded for this patient.'}</p>
              </div>
              {patient.lastContactDate && (
                <p className="text-xs text-muted-foreground">Last contact: {patient.lastContactDate}</p>
              )}
              <div className="flex gap-3 pt-2">
                <Link href={`/crm/communications?patientId=${patient.id}`}>
                  <span className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium cursor-pointer hover:bg-primary/15">
                    <MessageSquare className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    Message Patient
                  </span>
                </Link>
                <Link href={`/crm/tasks?patientId=${patient.id}`}>
                  <span className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium cursor-pointer hover:bg-green-100">
                    <ListChecks className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    Add Task
                  </span>
                </Link>
              </div>
            </div>
          )}

          {/* Cases */}
          {activeTab === 'cases' && (
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border/60">
                <h3 className="font-semibold text-foreground">Cases ({patient.cases?.length || 0})</h3>
              </div>
              {(patient.cases || []).length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No cases found.</p>
              ) : (
                <div className="divide-y divide-border/60">
                  {patient.cases.map((c: any) => (
                    <div key={c.id} className="px-5 py-4 flex items-center justify-between hover:bg-muted">
                      <div>
                        <p className="font-medium text-foreground text-sm">{c.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.id} · Opened {c.openedAt}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.outcome && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${OUTCOME_CONFIG[c.outcome]?.colour || 'bg-muted text-muted-foreground'}`}>
                            {OUTCOME_CONFIG[c.outcome]?.label || c.outcome}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_COLOURS[c.stage] || 'bg-muted text-muted-foreground'}`}>
                          {c.stage.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Communications */}
          {activeTab === 'comms' && (
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border/60">
                <h3 className="font-semibold text-foreground">Communications ({patient.communications?.length || 0})</h3>
              </div>
              {(patient.communications || []).length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No communications recorded.</p>
              ) : (
                <div className="divide-y divide-border/60">
                  {patient.communications.map((c: any) => (
                    <div key={c.id} className={`px-5 py-4 flex items-start gap-4 ${c.direction === 'inbound' ? 'bg-green-50' : ''}`}>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <ChannelIcon channel={c.channel} className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        {c.subject && <p className="font-medium text-sm text-foreground">{c.subject}</p>}
                        <p className="text-xs text-muted-foreground mt-0.5">{c.direction === 'inbound' ? '← Patient' : '→ Sent'} · {c.channel} · {new Date(c.sentAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                        c.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        c.status === 'received'  ? 'bg-primary/10 text-primary' :
                        'bg-muted text-muted-foreground'
                      }`}>{c.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tasks */}
          {activeTab === 'tasks' && (
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border/60">
                <h3 className="font-semibold text-foreground">Tasks ({patient.tasks?.length || 0})</h3>
              </div>
              {(patient.tasks || []).length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No tasks for this patient.</p>
              ) : (
                <div className="divide-y divide-border/60">
                  {patient.tasks.map((t: any) => (
                    <div key={t.id} className="px-5 py-4 flex items-center justify-between hover:bg-muted">
                      <div>
                        <p className="font-medium text-sm text-foreground">{t.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Due: {t.dueDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${TASK_PRIORITY[t.priority] || 'text-muted-foreground'}`}>
                          {t.priority.toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          t.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          t.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{t.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </CRMLayout>
  );
}
