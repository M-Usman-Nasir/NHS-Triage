/**
 * crm/patients/index.tsx — Patient List
 * Care Path CRM
 *
 * Full patient management list with:
 * - Live search by name, email, NHS number
 * - Filter by risk flag and status
 * - Risk badge colouring
 * - Tag chips
 * - Click to open patient profile
 */

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/router';
import CRMLayout from '../../components/CRMLayout';
import { apiUrl, safeFetchJson } from '../../lib/api';

interface Patient {
  id: string; fullName: string; dateOfBirth: string; age: number; gender: string;
  postcode: string; phone: string; email: string; gpName: string; gpSurgery: string;
  nhsNumber: string; tags: string[]; riskFlag: string | null; status: string;
  totalConsultations: number; lastContactDate: string | null; notes: string; createdAt: string;
}

const MOCK_PATIENTS: Patient[] = [
  { id:'PAT-001', fullName:'Sarah Mitchell',   dateOfBirth:'1992-03-14', age:33, gender:'Female', postcode:'SW1A 1AA', phone:'07700900001', email:'sarah.mitchell@example.com',  gpName:'Dr. Helena Cross',   gpSurgery:'Pimlico Medical Centre',        nhsNumber:'485 777 3456', tags:['pharmacy_regular','uti_recurring'], riskFlag:null,     status:'active', totalConsultations:3, lastContactDate:'2026-04-19', notes:'3 UTI consultations in 12 months.', createdAt:'2025-11-12' },
  { id:'PAT-002', fullName:'James Parker',     dateOfBirth:'1951-11-22', age:74, gender:'Male',   postcode:'M1 1AE',  phone:'07700900002', email:'james.parker@example.com',    gpName:'Dr. Arjun Mehta',    gpSurgery:'Manchester Central Practice',   nhsNumber:'312 445 9876', tags:['high_risk','cardiac_history','red_flag_triggered'], riskFlag:'HIGH', status:'active', totalConsultations:1, lastContactDate:'2026-04-16', notes:'999 referral 16 Apr. Cardiac.', createdAt:'2026-04-16' },
  { id:'PAT-003', fullName:'Aisha Patel',      dateOfBirth:'1988-07-05', age:37, gender:'Female', postcode:'B1 1BB',  phone:'07700900003', email:'aisha.patel@example.com',     gpName:'Dr. Mark Osei',      gpSurgery:'Brindleyplace Health Centre',   nhsNumber:'621 334 0011', tags:['gp_referred','sore_throat'],       riskFlag:null,     status:'active', totalConsultations:2, lastContactDate:'2026-04-20', notes:'GP referral possible scarlet fever.', createdAt:'2026-01-08' },
  { id:'PAT-004', fullName:'Tom Henderson',    dateOfBirth:'1975-01-30', age:51, gender:'Male',   postcode:'LS1 1AB', phone:'07700900004', email:'tom.henderson@example.com',   gpName:'Dr. Fatima Nkosi',   gpSurgery:'Leeds City Health Centre',      nhsNumber:'789 102 3344', tags:['new_patient'],                     riskFlag:null,     status:'active', totalConsultations:0, lastContactDate:null, notes:'', createdAt:'2026-04-21' },
  { id:'PAT-005', fullName:'Fatima Al-Hassan', dateOfBirth:'2000-09-18', age:25, gender:'Female', postcode:'E1 6AN',  phone:'07700900005', email:'fatima.alhassan@example.com', gpName:'Dr. Chen Wei',       gpSurgery:'Tower Hamlets GP Practice',     nhsNumber:'543 221 8899', tags:[],                                  riskFlag:null,     status:'active', totalConsultations:1, lastContactDate:'2026-03-15', notes:'Single sinusitis consultation.', createdAt:'2026-03-15' },
  { id:'PAT-006', fullName:'David Chen',       dateOfBirth:'1965-06-12', age:60, gender:'Male',   postcode:'BS1 4DJ', phone:'07700900006', email:'david.chen@example.com',      gpName:'Dr. Leila Thompson', gpSurgery:'Bristol Central Surgery',       nhsNumber:'876 543 2100', tags:['diabetic','high_risk'],            riskFlag:'MEDIUM', status:'active', totalConsultations:2, lastContactDate:'2026-04-10', notes:'Type 2 diabetic. Impetigo GP referral.', createdAt:'2025-09-01' },
  { id:'PAT-007', fullName:'Emma Wilson',      dateOfBirth:'2001-04-25', age:24, gender:'Female', postcode:'OX1 1NP', phone:'07700900007', email:'emma.wilson@example.com',     gpName:'Dr. Singh Preethi',  gpSurgery:'Oxford Road Surgery',           nhsNumber:'234 567 8901', tags:[],                                  riskFlag:null,     status:'active', totalConsultations:1, lastContactDate:'2026-04-18', notes:'Mild sinusitis self-care.', createdAt:'2026-04-18' },
  { id:'PAT-008', fullName:'Robert Okafor',    dateOfBirth:'1983-12-03', age:42, gender:'Male',   postcode:'NE1 7RU', phone:'07700900008', email:'robert.okafor@example.com',   gpName:'Dr. Anna Reid',      gpSurgery:'Newcastle Quayside Practice',   nhsNumber:'111 222 3334', tags:[],                                  riskFlag:null,     status:'active', totalConsultations:0, lastContactDate:null, notes:'', createdAt:'2026-04-21' },
  { id:'PAT-009', fullName:'Chloe Davies',     dateOfBirth:'1995-08-17', age:30, gender:'Female', postcode:'CF10 1EP',phone:'07700900009', email:'chloe.davies@example.com',    gpName:'Dr. Evans Morgan',   gpSurgery:'Cardiff Bay Health Centre',     nhsNumber:'999 888 7776', tags:['urgent_treated','shingles'],       riskFlag:null,     status:'active', totalConsultations:1, lastContactDate:'2026-04-21', notes:'Shingles antiviral dispensed. Follow-up 28 Apr.', createdAt:'2026-04-21' },
  { id:'PAT-010', fullName:'Mohammed Iqbal',   dateOfBirth:'1970-02-08', age:56, gender:'Male',   postcode:'BB1 1AA', phone:'07700900010', email:'mohammed.iqbal@example.com',  gpName:'Dr. Kavita Shah',    gpSurgery:'Blackburn Medical Practice',    nhsNumber:'445 667 8890', tags:['hypertensive'],                    riskFlag:'MEDIUM', status:'active', totalConsultations:2, lastContactDate:'2026-04-05', notes:'Hypertensive. Monitor antibiotic interactions.', createdAt:'2025-12-20' },
];

const RISK_CONFIG: Record<string, string> = {
  HIGH:   'bg-red-100 text-red-700 border border-red-200',
  MEDIUM: 'bg-orange-100 text-orange-700 border border-orange-200',
  LOW:    'bg-yellow-100 text-yellow-700 border border-yellow-200',
};

const TAG_COLOUR: Record<string, string> = {
  high_risk: 'bg-red-50 text-red-600', cardiac_history: 'bg-red-50 text-red-600',
  red_flag_triggered: 'bg-red-50 text-red-600', diabetic: 'bg-orange-50 text-orange-600',
  hypertensive: 'bg-orange-50 text-orange-600', uti_recurring: 'bg-primary/10 text-primary',
  pharmacy_regular: 'bg-primary/10 text-primary', shingles: 'bg-purple-50 text-purple-600',
  urgent_treated: 'bg-green-50 text-green-600', new_patient: 'bg-muted text-muted-foreground',
  gp_referred: 'bg-yellow-50 text-yellow-600', sore_throat: 'bg-yellow-50 text-yellow-600',
};

export default function PatientsListPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      p.fullName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.nhsNumber.replace(/ /g, '').includes(q.replace(/ /g, ''));
    const matchRisk = !riskFilter || p.riskFlag === riskFilter || (riskFilter === 'NONE' && !p.riskFlag);
    return matchSearch && matchRisk;
  });

  useEffect(() => {
    void (async () => {
      const d = await safeFetchJson<{ items?: Patient[] }>(apiUrl('/api/crm/patients'), { items: [] });
      if (d.items?.length) setPatients(d.items);
    })();
  }, []);

  return (
    <CRMLayout title="Patients" subtitle={`${filtered.length} of ${patients.length} patients`}>
      <div className="min-w-0 max-w-full">
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name, email or NHS number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-60 flex-1 rounded-lg border border-input bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All risk levels</option>
          <option value="HIGH">High risk</option>
          <option value="MEDIUM">Medium risk</option>
          <option value="NONE">No flag</option>
        </select>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div
          className="touch-pan-x overflow-x-auto overflow-y-visible overscroll-x-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
        <table className="w-full min-w-[52rem] text-left lg:min-w-0">
          <thead className="border-b border-border bg-muted">
            <tr>
              {['Patient', 'NHS No.', 'Age / Gender', 'GP Surgery', 'Consultations', 'Last Contact', 'Risk', 'Tags'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.map((p) => (
              <tr
                key={p.id}
                onClick={() => router.push(`/patients/${p.id}`)}
                className="cursor-pointer transition-colors hover:bg-primary/5"
              >
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-foreground">{p.fullName}</div>
                  <div className="text-xs text-muted-foreground">{p.email}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.nhsNumber}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{p.age}y · {p.gender}</td>
                <td className="px-4 py-3">
                  <div className="text-sm text-foreground">{p.gpName}</div>
                  <div className="text-xs text-muted-foreground">{p.gpSurgery}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-sm font-semibold ${p.totalConsultations > 0 ? 'text-primary' : 'text-muted-foreground/40'}`}>
                    {p.totalConsultations}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {p.lastContactDate ?? <span className="text-muted-foreground/40">—</span>}
                </td>
                <td className="px-4 py-3">
                  {p.riskFlag ? (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${RISK_CONFIG[p.riskFlag]}`}>
                      {p.riskFlag}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className={`rounded px-1.5 py-0.5 text-xs ${TAG_COLOUR[tag] || 'bg-muted text-muted-foreground'}`}>
                        {tag.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {p.tags.length > 2 && <span className="text-xs text-muted-foreground">+{p.tags.length - 2}</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Search className="mx-auto mb-2 h-10 w-10 opacity-40" strokeWidth={1.5} aria-hidden />
            <p>No patients found matching your search.</p>
          </div>
        )}
      </div>
      </div>
    </CRMLayout>
  );
}
