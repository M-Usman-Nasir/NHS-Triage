/**
 * crm/communications.tsx — Communications Log
 * Aegis Health AI CRM
 *
 * Full communication history across all patients with:
 * - Inbox/Outbox view
 * - Filter by channel (email, SMS, note)
 * - Compose new message modal
 * - Inbound replies highlighted in green
 */

import { useState } from 'react';
import CRMLayout from '../../components/CRMLayout';

const MOCK_COMMS = [
  { id:'COMM-001', patientId:'PAT-001', patientName:'Sarah Mitchell',  caseId:'CASE-001', channel:'email', direction:'outbound', subject:'Your pharmacy consultation summary — UTI',          body:'Dear Sarah, please find attached your consultation summary. Your pharmacist Priya Sharma dispensed Nitrofurantoin 100mg MR. Take twice daily for 5 days. Return if no improvement within 48 hours.',                           status:'delivered', sentAt:'2026-04-19T14:35:00Z', sentBy:'system' },
  { id:'COMM-005', patientId:'PAT-001', patientName:'Sarah Mitchell',  caseId:'CASE-001', channel:'email', direction:'inbound',  subject:'Re: Your pharmacy consultation summary — UTI',      body:'Hi, thanks for the message. I collected my prescription this afternoon and feeling a bit better already. Will update if symptoms return.',                                                                                         status:'received',  sentAt:'2026-04-19T18:22:00Z', sentBy:'patient' },
  { id:'COMM-002', patientId:'PAT-002', patientName:'James Parker',    caseId:'CASE-002', channel:'sms',   direction:'outbound', subject:null,                                                 body:'URGENT: Aegis Health AI — Based on your symptoms, we advised calling 999. Please ensure you or a carer confirms this was actioned.',                                                                                           status:'delivered', sentAt:'2026-04-16T14:08:00Z', sentBy:'system' },
  { id:'COMM-003', patientId:'PAT-003', patientName:'Aisha Patel',     caseId:'CASE-003', channel:'email', direction:'outbound', subject:'GP Referral — Sore Throat Consultation',             body:'Dear Aisha, your consultation has been reviewed. We have referred you to your GP, Dr. Mark Osei, at Brindleyplace Health Centre. An appointment has been requested for 22 April 2026.',                                       status:'delivered', sentAt:'2026-04-20T11:40:00Z', sentBy:'system' },
  { id:'COMM-004', patientId:'PAT-009', patientName:'Chloe Davies',    caseId:'CASE-005', channel:'email', direction:'outbound', subject:'Urgent: Shingles Treatment — Action Required Today', body:'Dear Chloe, your consultation identified shingles within the 72-hour treatment window. Antiviral treatment is most effective when started immediately. Please visit your nearest pharmacy today.',                               status:'delivered', sentAt:'2026-04-21T08:55:00Z', sentBy:'system' },
  { id:'COMM-006', patientId:'PAT-006', patientName:'David Chen',      caseId:'CASE-006', channel:'sms',   direction:'outbound', subject:null,                                                 body:'Aegis Health AI: Your consultation has been reviewed. Due to your medical history, we have referred you to your GP, Dr. Leila Thompson. Please contact Bristol Central Surgery to book an urgent appointment.',                 status:'delivered', sentAt:'2026-04-21T13:05:00Z', sentBy:'system' },
];

const CHANNEL_ICONS: Record<string, string> = { email: '📧', sms: '📱', note: '📝', phone: '📞' };

export default function CommunicationsPage() {
  const [comms, setComms] = useState(MOCK_COMMS);
  const [channelFilter, setChannelFilter] = useState('');
  const [dirFilter, setDirFilter] = useState('');
  const [selected, setSelected] = useState<typeof MOCK_COMMS[0] | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [compose, setCompose] = useState({ patientName:'', channel:'email', subject:'', body:'' });
  const [sent, setSent] = useState(false);

  const filtered = comms
    .filter((c) => !channelFilter || c.channel === channelFilter)
    .filter((c) => !dirFilter || c.direction === dirFilter)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  const handleSend = async () => {
    const newComm = {
      id: `COMM-${String(comms.length + 1).padStart(3, '0')}`,
      patientId: 'PAT-NEW', patientName: compose.patientName,
      caseId: null, channel: compose.channel, direction: 'outbound' as const,
      subject: compose.subject || null, body: compose.body,
      status: 'delivered', sentAt: new Date().toISOString(), sentBy: 'user',
    };
    setComms((prev) => [newComm, ...prev]);
    setSent(true);
    setTimeout(() => { setSent(false); setShowCompose(false); setCompose({ patientName:'', channel:'email', subject:'', body:'' }); }, 1500);

    await fetch('http://localhost:4000/api/crm/communications', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: 'PAT-NEW', ...compose }),
    }).catch(() => {});
  };

  return (
    <CRMLayout title="Communications" subtitle="Patient message history and outreach log">

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">All channels</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="note">Note</option>
        </select>
        <select value={dirFilter} onChange={(e) => setDirFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">Inbox + Outbox</option>
          <option value="outbound">Outbox</option>
          <option value="inbound">Inbox (Replies)</option>
        </select>
        <button onClick={() => setShowCompose(true)}
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
          + New Message
        </button>
      </div>

      <div className="flex gap-6">

        {/* List */}
        <div className="flex-1 space-y-2">
          {filtered.length === 0 && <p className="text-center text-gray-400 py-12">No communications found.</p>}
          {filtered.map((c) => (
            <div key={c.id} onClick={() => setSelected(c)}
              className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
                selected?.id === c.id ? 'border-blue-400 shadow-sm' :
                c.direction === 'inbound' ? 'border-green-200 hover:border-green-300' :
                'border-gray-100 hover:border-blue-200'
              }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{CHANNEL_ICONS[c.channel] || '•'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-gray-800">{c.patientName}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.direction === 'inbound' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>{c.direction === 'inbound' ? '← Reply' : '→ Sent'}</span>
                      <span className="text-xs text-gray-400">{new Date(c.sentAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {c.subject && <p className="text-sm font-medium text-gray-700 mt-0.5">{c.subject}</p>}
                  <p className="text-xs text-gray-500 truncate mt-0.5">{c.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        {selected && (
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-0">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{CHANNEL_ICONS[selected.channel]}</span>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">×</button>
              </div>
              <h3 className="font-bold text-gray-800 text-sm">{selected.subject || `${selected.channel.toUpperCase()} message`}</h3>
              <p className="text-xs text-gray-400 mt-1">{selected.patientName} · {new Date(selected.sentAt).toLocaleString()}</p>
              <div className="flex gap-2 mt-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selected.direction === 'inbound' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {selected.direction}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{selected.channel}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selected.status === 'delivered' || selected.status === 'received' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {selected.status}
                </span>
              </div>
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selected.body}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compose modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800">New Message</h3>
              <button onClick={() => setShowCompose(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Patient Name</label>
                <input value={compose.patientName} onChange={(e) => setCompose({ ...compose, patientName: e.target.value })}
                  placeholder="e.g. Sarah Mitchell" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Channel</label>
                <select value={compose.channel} onChange={(e) => setCompose({ ...compose, channel: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="note">Internal Note</option>
                </select>
              </div>
              {compose.channel === 'email' && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Subject</label>
                  <input value={compose.subject} onChange={(e) => setCompose({ ...compose, subject: e.target.value })}
                    placeholder="Subject line..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Message</label>
                <textarea value={compose.body} onChange={(e) => setCompose({ ...compose, body: e.target.value })}
                  placeholder="Type your message..." rows={5}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCompose(false)}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSend} disabled={!compose.body || !compose.patientName}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  sent ? 'bg-green-500 text-white' :
                  compose.body && compose.patientName ? 'bg-blue-600 text-white hover:bg-blue-700' :
                  'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}>
                {sent ? '✓ Sent!' : `Send ${CHANNEL_ICONS[compose.channel]}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
