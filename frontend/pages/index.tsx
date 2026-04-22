import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const PATHWAYS = [
  { code: 'uti',          label: 'UTI',                  fullLabel: 'Urinary Tract Infection',  icon: '💧', description: 'Painful or frequent urination' },
  { code: 'sore_throat',  label: 'Sore Throat',          fullLabel: 'Sore Throat',              icon: '🤒', description: 'Throat pain, difficulty swallowing' },
  { code: 'sinusitis',    label: 'Sinusitis',             fullLabel: 'Sinusitis',                icon: '🤧', description: 'Blocked nose, facial pressure' },
  { code: 'otitis_media', label: 'Ear Infection',         fullLabel: 'Ear Infection',            icon: '👂', description: 'Ear pain, discharge' },
  { code: 'insect_bites', label: 'Insect Bite',           fullLabel: 'Infected Insect Bite',     icon: '🐛', description: 'Redness, swelling at bite site' },
  { code: 'impetigo',     label: 'Impetigo',              fullLabel: 'Impetigo',                 icon: '🩹', description: 'Crusty, golden sores on skin' },
  { code: 'shingles',     label: 'Shingles',              fullLabel: 'Shingles',                 icon: '⚡', description: 'Painful rash on one side' },
];

export default function LandingPage() {
  const router = useRouter();
  const [consentGiven, setConsentGiven] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState('');

  const handleStart = () => {
    if (!consentGiven || !selectedPathway) return;
    router.push(`/consultation?pathway=${selectedPathway}`);
  };

  const selected = PATHWAYS.find((p) => p.code === selectedPathway);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">

      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-blue-700 font-black text-sm">A</span>
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Aegis Health AI</h1>
              <p className="text-blue-200 text-xs leading-tight hidden sm:block">NHS-aligned Clinical Triage</p>
            </div>
          </div>
          <Link href="/crm">
            <span className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg cursor-pointer transition-all font-medium">
              Staff CRM →
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-10">

        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2 leading-tight">
            Get the right care, right now
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            Answer a few questions and we'll guide you to the best care —
            pharmacy, GP, or emergency services.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { step: '1', title: 'Choose symptom',   icon: '🩺' },
            { step: '2', title: 'Answer questions',  icon: '📋' },
            { step: '3', title: 'Get advice',        icon: '✅' },
          ].map((item) => (
            <div key={item.step} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs mx-auto mb-1">
                {item.step}
              </div>
              <p className="font-medium text-gray-700 text-xs sm:text-sm leading-tight">{item.title}</p>
            </div>
          ))}
        </div>

        {/* Main consultation card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          {/* Card header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
            <h3 className="text-white font-bold text-lg">Start a Consultation</h3>
            <p className="text-blue-200 text-xs mt-0.5">Free, confidential, NHS-aligned guidance</p>
          </div>

          <div className="p-4 sm:p-6">
            {/* Condition selector */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What are your main symptoms?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {PATHWAYS.map((p) => (
                  <button
                    key={p.code}
                    onClick={() => setSelectedPathway(p.code)}
                    className={`flex flex-col items-center text-center p-3 rounded-xl border-2 transition-all active:scale-95 ${
                      selectedPathway === p.code
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl mb-1">{p.icon}</span>
                    <span className="text-xs font-semibold text-gray-700 leading-tight">{p.label}</span>
                    <span className="text-xs text-gray-400 mt-0.5 leading-tight hidden sm:block">{p.description}</span>
                  </button>
                ))}
              </div>
              {selected && (
                <div className="mt-2 px-3 py-2 bg-blue-50 rounded-lg text-xs text-blue-700 font-medium">
                  Selected: {selected.fullLabel}
                </div>
              )}
            </div>

            {/* Consent */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg">⚠️</span>
                <h4 className="font-semibold text-amber-800 text-sm">Important — Please Read</h4>
              </div>
              <ul className="text-amber-700 text-xs space-y-1 list-disc list-inside mb-3">
                <li>Guidance only — not a substitute for professional advice.</li>
                <li>Life-threatening emergency? Call <strong>999</strong> immediately.</li>
                <li>Your data is processed under UK GDPR.</li>
              </ul>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                  />
                </div>
                <span className="text-amber-800 text-xs font-medium leading-relaxed">
                  I understand and consent to proceeding with this consultation.
                </span>
              </label>
            </div>

            {/* CTA button */}
            <button
              onClick={handleStart}
              disabled={!consentGiven || !selectedPathway}
              className={`w-full py-4 px-6 rounded-xl font-bold text-white text-base transition-all active:scale-95 ${
                consentGiven && selectedPathway
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {selectedPathway
                ? `Begin ${selected?.label} Consultation →`
                : 'Select a condition to begin'}
            </button>
          </div>
        </div>

        {/* Emergency banner */}
        <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🚨</span>
          <div>
            <p className="text-red-700 font-bold text-sm">Life-threatening emergency?</p>
            <p className="text-red-600 text-xs mt-0.5">
              Do not use this tool. Call <strong>999</strong> immediately or go to your nearest A&E.
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 pb-6">
          {['Privacy Policy', 'Terms of Use', 'Accessibility', 'NHS 111 Online'].map((link) => (
            <span key={link} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">
              {link}
            </span>
          ))}
        </div>
      </main>
    </div>
  );
}
