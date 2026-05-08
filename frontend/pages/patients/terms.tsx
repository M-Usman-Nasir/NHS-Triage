import Head from 'next/head';
import Link from 'next/link';
import { LegalLayout } from '../../components/LegalLayout';
import { PRIVACY_LINK_LABEL } from '../../lib/complianceContent';

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Use — Care Path</title>
      </Head>
      <LegalLayout
        title="Terms of Use"
        description="Demo triage tool — not emergency care"
      >
        <article className="prose prose-sm max-w-none text-card-foreground prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
          <p className="text-xs text-muted-foreground">Last updated: 23 April 2026.</p>

          <h2 className="mt-8 text-base">Nature of the service</h2>
          <p>
            Care Path provides <strong className="text-foreground">clinical decision support</strong> only: structured
            questions and deterministic rules to suggest an appropriate <em>next step</em> (self-care, pharmacy, GP, urgent
            care, or 999). It is not a medical device diagnosis and not a prescribing service.
          </p>

          <h2 className="mt-8 text-base">Emergencies</h2>
          <p>
            If you or someone else may be seriously ill or injured, call <strong className="text-foreground">999</strong>{' '}
            or visit an emergency department. Do not rely on this tool for emergencies.
          </p>

          <h2 className="mt-8 text-base">Acceptable use</h2>
          <ul className="list-disc space-y-1 pl-4">
            <li>Provide accurate information to the best of your knowledge.</li>
            <li>Do not attempt to probe or break the service, or to access data belonging to others.</li>
            <li>Do not use automated scraping of personal health data from the demo.</li>
          </ul>

          <h2 className="mt-8 text-base">No warranty</h2>
          <p>
            The demo is provided &quot;as is&quot; for evaluation. No warranty is given that outputs are complete or
            error-free. Always follow in-person clinical advice when it differs from this tool.
          </p>

          <h2 className="mt-8 text-base">Pharmacy First &amp; medicines</h2>
          <p>
            Where the tool suggests pharmacy assessment, any supply of prescription-only or pharmacy medicines under a PGD
            is performed solely by an accountable pharmacist under applicable governance — not by this software.
          </p>

          <h2 className="mt-8 text-base">Data erasure (demo API)</h2>
          <p>
            Developers may call <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">POST /api/gdpr/erasure-request</code> with a consultation UUID to remove that record from the in-memory demo store and log the request.
            Immutable audit logs in a production database may still be retained per policy.
          </p>

          <p className="mt-10 text-sm">
            <Link href="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
              {PRIVACY_LINK_LABEL}
            </Link>
          </p>
        </article>
      </LegalLayout>
    </>
  );
}
