import { Text, StyleSheet } from "react-native";
import { LegalScreen } from "../../components/LegalScreen";

export default function TermsPage() {
  return (
    <LegalScreen title="Terms of Use" description="Demo triage tool - not emergency care">
      <Text style={s.small}>Last updated: 23 April 2026.</Text>
      <Text style={s.h}>Nature of the service</Text>
      <Text style={s.p}>
        Care Path provides clinical decision support only: structured questions and deterministic rules to suggest an appropriate next step (self-care, pharmacy, GP, urgent care, or 999).
      </Text>
      <Text style={s.h}>Emergencies</Text>
      <Text style={s.p}>
        If you or someone else may be seriously ill or injured, call 999 or visit an emergency department. Do not rely on this tool for emergencies.
      </Text>
      <Text style={s.h}>No warranty</Text>
      <Text style={s.p}>The demo is provided &quot;as is&quot; for evaluation.</Text>
    </LegalScreen>
  );
}

const s = StyleSheet.create({
  small: { fontSize: 12, color: "#64748b" },
  h: { fontSize: 16, fontWeight: "700", color: "#0f172a", marginTop: 8 },
  p: { fontSize: 14, color: "#334155", lineHeight: 20 },
});
