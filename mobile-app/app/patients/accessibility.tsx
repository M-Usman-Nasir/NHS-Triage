import { Text, StyleSheet } from "react-native";
import { LegalScreen } from "../../components/LegalScreen";

export default function AccessibilityPage() {
  return (
    <LegalScreen title="Accessibility statement" description="WCAG-aligned patient journey (continuous improvement)">
      <Text style={s.small}>Last updated: 23 April 2026.</Text>
      <Text style={s.h}>Our commitment</Text>
      <Text style={s.p}>
        We aim for the patient-facing consultation flow to meet WCAG 2.2 Level AA where practicable: keyboard use, visible focus, sufficient contrast, skip links, and descriptive labels for controls.
      </Text>
      <Text style={s.h}>Known limitations</Text>
      <Text style={s.p}>
        Some staff CRM and admin screens are demonstration interfaces and may not yet meet the same standard as the patient journey.
      </Text>
      <Text style={s.h}>Feedback</Text>
      <Text style={s.p}>
        If you cannot use part of this site, contact the organisation operating the deployment.
      </Text>
    </LegalScreen>
  );
}

const s = StyleSheet.create({
  small: { fontSize: 12, color: "#64748b" },
  h: { fontSize: 16, fontWeight: "700", color: "#0f172a", marginTop: 8 },
  p: { fontSize: 14, color: "#334155", lineHeight: 20 },
});
