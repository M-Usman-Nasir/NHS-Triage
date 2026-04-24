import Head from 'next/head';
import Link from 'next/link';
import { LegalLayout } from '../components/LegalLayout';

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy — Aegis Health AI</title>
      </Head>
      <LegalLayout
        title="Privacy notice"
        description="UK GDPR — transparency for patients using the triage demo"
      >
        <article className="prose prose-sm max-w-none text-card-foreground prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
          <p className="text-xs text-muted-foreground">
            Last updated: 23 April 2026. Deploying organisations must adopt and sign off their own privacy notice and DPIA
            before production processing of health data.
          </p>

          <h2 className="mt-8 text-base">Who we are</h2>
          <p>
            <strong className="text-foreground">Aegis Health AI</strong> provides this website as a demonstration of
            structured, rule-based clinical triage (clinical decision support). The data controller for any live deployment
            will be the commissioning organisation — this notice describes the <em>intended</em> processing pattern.
          </p>

          <h2 className="mt-8 text-base">What we process</h2>
          <ul className="list-disc space-y-1 pl-4">
            <li>Pathway selection (which symptom questionnaire you open)</li>
            <li>Your answers to clinical questions required by that pathway</li>
            <li>Optional demographics (for example age and gender) where the rules require them for safe routing</li>
            <li>Optional free-text symptom keywords if you enter them</li>
            <li>Technical metadata (timestamps, consultation reference ID) for audit and support</li>
          </ul>

          <h2 className="mt-8 text-base">Why we process it (lawful basis)</h2>
          <p>
            For this demo, processing is based on <strong className="text-foreground">your consent</strong> when you tick
            the information box on the landing page and start a consultation, and on{' '}
            <strong className="text-foreground">legitimate interests</strong> in operating a safe, auditable triage demo.
            Health data are <strong className="text-foreground">special category data</strong>: a production deployment
            must document the Article 9 condition (typically NHS care delivery with appropriate policy) in a DPIA.
          </p>

          <h2 className="mt-8 text-base">How long we keep it</h2>
          <p>
            Retention is configured by the deploying organisation. The demo backend may store consultations in memory for
            the lifetime of the server process. Erasure for a known consultation ID can be requested via the documented API
            in development environments — see{' '}
            <Link href="/terms" className="font-medium text-primary underline-offset-4 hover:underline">
              Terms of Use
            </Link>
            .
          </p>

          <h2 className="mt-8 text-base">Who receives your data</h2>
          <p>
            Outputs are designed to be shared only with appropriate care settings you choose in the real world (for example
            a pharmacist or GP). This demo does not send data to the NHS Spine or third-party advertising networks.
          </p>

          <h2 className="mt-8 text-base">Your rights (UK GDPR)</h2>
          <ul className="list-disc space-y-1 pl-4">
            <li>Right of access — export of the consultation record where identity can be verified</li>
            <li>Right to rectification — via the care organisation holding the record</li>
            <li>Right to erasure — subject to clinical and legal retention requirements</li>
            <li>Right to object / restrict processing — contact the data controller</li>
            <li>Right to lodge a complaint with the ICO (ico.org.uk)</li>
          </ul>

          <h2 className="mt-8 text-base">International transfers</h2>
          <p>
            Production systems should be hosted in the UK or EEA with appropriate safeguards. Configure hosting and
            subprocessors per organisational policy.
          </p>

          <h2 className="mt-8 text-base">Security measures (this site)</h2>
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <strong className="text-foreground">In transit:</strong> use HTTPS in any environment where real patient
              data are processed. The browser talks to your configured API origin (<code className="text-xs">NEXT_PUBLIC_API_URL</code>); TLS
              is typically provided by your hosting provider or reverse proxy.
            </li>
            <li>
              <strong className="text-foreground">In the browser:</strong> this app does not store completed consultation
              answers in local or session storage by default; answers exist in memory until you submit or leave the page.
            </li>
            <li>
              <strong className="text-foreground">Baseline headers:</strong> the deployed Next.js app sends standard browser
              security headers (for example frame and MIME-type protection, referrer policy). A full penetration test,
              Content-Security-Policy tuning, and authenticated staff access are still required for production healthcare
              deployments — see the repository governance document for the programme checklist.
            </li>
          </ul>

          <h2 className="mt-8 text-base">Clinical safety &amp; regulatory boundaries</h2>
          <p>
            This software does not diagnose disease, does not prescribe, and does not replace a regulated clinician or
            pharmacist. See the stakeholder governance document in the repository:{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">docs/CLINICAL-GOVERNANCE.md</code>.
          </p>
        </article>
      </LegalLayout>
    </>
  );
}
