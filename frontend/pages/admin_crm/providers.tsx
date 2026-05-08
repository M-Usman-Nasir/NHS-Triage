/**
 * crm/providers.tsx — Provider Directory
 * Care Path CRM
 *
 * Lists all healthcare providers (pharmacists, GPs) with:
 * - Performance metrics (cases, response time)
 * - Contact info and NHS codes
 * - Filter by role
 * - Detail panel on click
 */

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CircleHelp, Mail, Phone, Pill, Stethoscope, X } from 'lucide-react';
import CRMLayout from '../../components/CRMLayout';

const MOCK_PROVIDERS = [
  { id:'PROV-001', name:'Priya Sharma',     role:'pharmacist', organisation:'Lloyds Pharmacy — Victoria',      address:'12 Victoria Street, London, SW1H 0NB', phone:'020 7000 1234', email:'priya.sharma@lloydspharmacy.nhs.uk',  nhsCode:'FKC12', activePatients:12, casesThisMonth:28, avgResponseTime:'45 min', status:'active', specialties:['Pharmacy First','UTI','Shingles','Sinusitis'], lastLogin:'2026-04-21T09:00:00Z' },
  { id:'PROV-002', name:'James Okafor',     role:'pharmacist', organisation:'Boots Pharmacy — Oxford Street',   address:'361 Oxford Street, London, W1C 2JQ',   phone:'020 7000 5678', email:'james.okafor@boots.nhs.uk',           nhsCode:'FKC34', activePatients:8,  casesThisMonth:15, avgResponseTime:'1.2 hrs', status:'active', specialties:['Pharmacy First','Impetigo','Insect Bites'],   lastLogin:'2026-04-20T16:30:00Z' },
  { id:'PROV-003', name:'Dr. Mark Osei',    role:'gp',         organisation:'Brindleyplace Health Centre',      address:'1 Brindleyplace, Birmingham, B1 2JB',  phone:'0121 600 1234', email:'mark.osei@brindleyplace.nhs.uk',      nhsCode:'M12345', activePatients:5, casesThisMonth:7,  avgResponseTime:'24 hrs',  status:'active', specialties:['General Practice','Dermatology'],            lastLogin:'2026-04-21T08:00:00Z' },
  { id:'PROV-004', name:'Dr. Helena Cross', role:'gp',         organisation:'Pimlico Medical Centre',           address:'4 Warwick Way, London, SW1V 1RX',     phone:'020 7834 1234', email:'helena.cross@pimlico-medical.nhs.uk', nhsCode:'G98765', activePatients:3, casesThisMonth:4,  avgResponseTime:'48 hrs',  status:'active', specialties:['General Practice','Women\'s Health'],        lastLogin:'2026-04-19T17:00:00Z' },
];

const ROLE_CONFIG: Record<string, { label: string; colour: string; Icon: LucideIcon }> = {
  pharmacist: { label: 'Pharmacist', colour: 'bg-primary/10 text-primary',   Icon: Pill },
  gp:         { label: 'GP',         colour: 'bg-yellow-100 text-yellow-700', Icon: Stethoscope },
};

export default function ProvidersPage() {
  const [roleFilter, setRoleFilter] = useState('');
  const [selected, setSelected] = useState<typeof MOCK_PROVIDERS[0] | null>(null);

  const filtered = MOCK_PROVIDERS.filter((p) => !roleFilter || p.role === roleFilter);

  return (
    <CRMLayout title="Provider Directory" subtitle="Pharmacists and GPs in the Aegis Health network">

      <div className="flex gap-3 mb-5">
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-input rounded-lg px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All roles</option>
          <option value="pharmacist">Pharmacists</option>
          <option value="gp">GPs</option>
        </select>
        <span className="text-sm text-muted-foreground self-center">{filtered.length} providers</span>
      </div>

      <div className="flex gap-6">

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => {
            const roleCfg = ROLE_CONFIG[p.role] || { label: p.role, colour: 'bg-muted text-muted-foreground', Icon: CircleHelp };
            const RoleIcon = roleCfg.Icon;
            return (
              <div key={p.id} onClick={() => setSelected(p)}
                className={`bg-card rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                  selected?.id === p.id ? 'border-primary/50 shadow-md' : 'border-border hover:border-primary/30'
                }`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    p.role === 'pharmacist' ? 'bg-primary/10 text-primary' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <RoleIcon className="h-6 w-6" strokeWidth={1.65} aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground">{p.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{p.organisation}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleCfg.colour}`}>{roleCfg.label}</span>
                      <span className="text-xs text-muted-foreground font-mono">{p.nhsCode}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Active Patients', value: p.activePatients },
                    { label: 'Cases/Month',     value: p.casesThisMonth },
                    { label: 'Avg Response',    value: p.avgResponseTime },
                  ].map((s) => (
                    <div key={s.label} className="bg-muted rounded-lg p-2">
                      <p className="font-bold text-foreground text-sm">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {p.specialties.map((s) => (
                    <span key={s} className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {selected && (() => {
          const DetailIcon = ROLE_CONFIG[selected.role]?.Icon || CircleHelp;
          return (
          <div className="w-72 flex-shrink-0">
            <div className="bg-card rounded-2xl shadow-card border border-border p-5 sticky top-0 space-y-4">
              <div className="flex items-start justify-between">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${selected.role === 'pharmacist' ? 'bg-primary/10 text-primary' : 'bg-yellow-100 text-yellow-800'}`}>
                  <DetailIcon className="h-7 w-7" strokeWidth={1.65} aria-hidden />
                </div>
                <button type="button" onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Close panel">
                  <X className="h-5 w-5" strokeWidth={2} aria-hidden />
                </button>
              </div>
              <div>
                <h3 className="font-bold text-foreground">{selected.name}</h3>
                <p className="text-sm text-muted-foreground">{selected.organisation}</p>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Address',  value: selected.address },
                  { label: 'Phone',    value: selected.phone },
                  { label: 'Email',    value: selected.email },
                  { label: 'NHS Code', value: selected.nhsCode },
                  { label: 'Status',   value: selected.status },
                  { label: 'Last Login', value: new Date(selected.lastLogin).toLocaleString() },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="text-xs font-medium text-foreground">{f.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <a href={`mailto:${selected.email}`}
                  className="flex items-center justify-center gap-2 bg-primary/10 text-primary py-2 rounded-lg text-sm font-medium hover:bg-primary/15 transition">
                  <Mail className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  Send Email
                </a>
                <a href={`tel:${selected.phone}`}
                  className="flex items-center justify-center gap-2 bg-muted text-muted-foreground py-2 rounded-lg text-sm font-medium hover:bg-secondary transition">
                  <Phone className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  Call
                </a>
              </div>
            </div>
          </div>
          );
        })()}
      </div>
    </CRMLayout>
  );
}
