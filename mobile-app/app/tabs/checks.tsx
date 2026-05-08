import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";

export default function ChecksPage() {
  return (
    <Screen>
      <View style={s.card}>
        <Text style={s.title}>Checks</Text>
        <Text style={s.body}>
          Track completed symptom checks and view follow-up actions here.
        </Text>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#e2e8f0", padding: 16, gap: 8 },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a" },
  body: { fontSize: 14, color: "#334155", lineHeight: 20 },
});
