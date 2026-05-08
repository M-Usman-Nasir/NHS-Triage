import Link from 'next/link';
import { useRouter } from 'next/router';
import { AlertTriangle, ArrowLeft, Phone } from 'lucide-react';

export default function EmergencySymptomsPage() {
  const router = useRouter();
  const question = typeof router.query.question === 'string' ? router.query.question : 'an emergency symptom';

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-3 py-4">
      <main className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-5">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
          Emergency symptoms check
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Call 999 now</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          Your answer suggests possible emergency symptoms ({question}). Do not continue this online consultation.
        </p>
        <a
          href="tel:999"
          className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-red-700 px-4 py-3 text-base font-bold text-white"
        >
          <Phone className="h-4 w-4" aria-hidden />
          Call 999
        </a>
        <Link
          href="/patients"
          className="mt-3 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to symptom checker
        </Link>
      </main>
    </div>
  );
}
