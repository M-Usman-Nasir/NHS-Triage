import { PropsWithChildren } from "react";
import { Text, StyleSheet, View } from "react-native";
import { Screen } from "./Screen";

export function LegalScreen({ title, description, children }: PropsWithChildren<{ title: string; description: string }>) {
  return (
    <Screen>
      <View style={s.card}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.desc}>{description}</Text>
        <View style={{ marginTop: 8, gap: 8 }}>{children}</View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: "#f8fafc", borderRadius: 20, padding: 16 },
  title: { fontSize: 24, fontWeight: "800", color: "#0f172a" },
  desc: { fontSize: 13, color: "#64748b", marginTop: 4 },
});
