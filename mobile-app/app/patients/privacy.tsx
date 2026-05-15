import { LegalScreen } from "../../components/LegalScreen";
import { LegalSections } from "../../components/LegalSections";
import { CONSENT_COPY_VERSION, PRIVACY_NOTICE_SECTIONS } from "../../lib/complianceContent";

export default function PrivacyPage() {
  return (
    <LegalScreen title="Privacy notice" description="UK GDPR — transparency for patients using the triage demo">
      <LegalSections
        preamble={`Last updated: 23 April 2026. Consent copy reference in this build: ${CONSENT_COPY_VERSION}.`}
        sections={PRIVACY_NOTICE_SECTIONS}
      />
    </LegalScreen>
  );
}
