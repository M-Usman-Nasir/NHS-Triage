import Head from 'next/head';
import { LegalLayout } from '../../components/LegalLayout';

export default function AccessibilityPage() {
  return (
    <>
      <Head>
        <title>Accessibility — Aegis Health AI</title>
      </Head>
      <LegalLayout
        title="Accessibility statement"
        description="WCAG-aligned patient journey (continuous improvement)"
      >
        <article className="prose prose-sm max-w-none text-card-foreground prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
          <p className="text-xs text-muted-foreground">Last updated: 23 April 2026.</p>

          <h2 className="mt-8 text-base">Our commitment</h2>
          <p>
            We aim for the patient-facing consultation flow to meet{' '}
            <strong className="text-foreground">WCAG 2.2 Level AA</strong> where practicable: keyboard use, visible focus,
            sufficient contrast, skip links, and descriptive labels for controls.
          </p>

          <h2 className="mt-8 text-base">Known limitations</h2>
          <p>
            Some staff CRM and admin screens are demonstration interfaces and may not yet meet the same standard as the
            patient journey. A formal WCAG audit is tracked as a pre-pilot programme item — see{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">docs/CLINICAL-GOVERNANCE.md</code>.
          </p>

          <h2 className="mt-8 text-base">Feedback</h2>
          <p>
            If you cannot use part of this site, contact the organisation operating the deployment. For the open-source
            demo, use repository issues with the label <strong className="text-foreground">accessibility</strong>.
          </p>
        </article>
      </LegalLayout>
    </>
  );
}