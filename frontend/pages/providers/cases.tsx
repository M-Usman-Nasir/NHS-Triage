import { useState } from 'react';
import ProviderLayout from '../../components/ProviderLayout';
import { PROVIDER_CASES } from '../../lib/providerPortalData';

export default function ProviderCasesPage() {
  const [selectedCaseId, setSelectedCaseId] = useState(PROVIDER_CASES[0]?.id || '');
  const selected = PROVIDER_CASES.find((c) => c.id === selectedCaseId) || PROVIDER_CASES[0];

  if (!selected) {
    return (
      <ProviderLayout title="Symptoms & Responses">
        <p className="text-sm text-muted-foreground">No cases available.</p>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout title="Symptoms & Questionnaire Responses" subtitle="Case-level symptom capture and question answers">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-3 space-y-2">
          {PROVIDER_CASES.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setSelectedCaseId(c.id)}
              className={`w-full text-left rounded-lg border px-3 py-2 transition-all ${
                selected.id === c.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
              }`}
            >
              <p className="text-sm font-semibold text-foreground">{c.patient.fullName}</p>
              <p className="text-xs text-muted-foreground">{c.pathwayLabel} · {c.id}</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="text-sm font-bold text-foreground mb-2">Symptoms</h3>
            <div className="flex flex-wrap gap-2">
              {selected.symptoms.map((symptom) => (
                <span key={symptom} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{symptom}</span>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="text-sm font-bold text-foreground mb-2">Questionnaire Responses</h3>
            <div className="space-y-2">
              {selected.questionnaireResponses.map((response) => (
                <div key={response.questionId} className="border border-border rounded-lg px-3 py-2">
                  <p className="text-xs text-muted-foreground">{response.questionText}</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{response.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
