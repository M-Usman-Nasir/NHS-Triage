import { Text, StyleSheet } from "react-native";
import { LegalScreen } from "../../components/LegalScreen";
import { CONSENT_COPY_VERSION } from "../../lib/complianceContent";

export default function PrivacyPage() {
  return (
    <LegalScreen title="Privacy notice" description="UK GDPR - transparency for patients using the triage demo">
      <Text style={s.small}>Last updated: 23 April 2026. Consent copy reference in this build: {CONSENT_COPY_VERSION}.</Text>
      <Text style={s.h}>Who we are</Text>
      <Text style={s.p}>
        Care Path provides this app as a demonstration of structured, rule-based clinical triage (clinical decision support).
      </Text>
      <Text style={s.h}>What we process</Text>
      <Text style={s.p}>Pathway selection, clinical answers, optional demographics, optional free-text symptoms, and technical metadata.</Text>
      <Text style={s.h}>Your rights (UK GDPR)</Text>
      <Text style={s.p}>Right of access, rectification, erasure, objection/restriction, and right to lodge a complaint with the ICO.</Text>
    </LegalScreen>
  );
}

const s = StyleSheet.create({
  small: { fontSize: 12, color: "#64748b" },
  h: { fontSize: 16, fontWeight: "700", color: "#0f172a", marginTop: 8 },
  p: { fontSize: 14, color: "#334155", lineHeight: 20 },
});
