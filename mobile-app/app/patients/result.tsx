import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "../../App";
import { SafeAreaView } from "react-native-safe-area-context";
import { SPACING } from "../../lib/spacing";

export default function ResultPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={s.root}>
      <View style={s.pageInset}>
      <View style={s.container}>
        <View style={s.statusSpacer}>
          <View style={s.iconWrap}>
            <MaterialCommunityIcons name="check" size={28} color="#16a34a" />
          </View>
        </View>

        <Text style={s.heroTitle}>Pharmacy consultation recommended</Text>
        <Text style={s.heroBody}>
          Your symptoms suggest this is likely suitable for treatment at a pharmacy.
        </Text>

        <View style={s.card}>
          <Text style={s.cardTitle}>Why this recommendation?</Text>
          <Text style={s.cardSubtle}>Based on your answers:</Text>
          <View style={s.bulletList}>
            <View style={s.bulletRow}>
              <MaterialCommunityIcons name="check" size={14} color="#16a34a" />
              <Text style={s.bullet}>Symptoms present for 1-3 days</Text>
            </View>
            <View style={s.bulletRow}>
              <MaterialCommunityIcons name="check" size={14} color="#16a34a" />
              <Text style={s.bullet}>No red flag symptoms</Text>
            </View>
            <View style={s.bulletRow}>
              <MaterialCommunityIcons name="check" size={14} color="#16a34a" />
              <Text style={s.bullet}>You are 18+ and otherwise well</Text>
            </View>
          </View>
        </View>

        <View style={s.card}>
          <View style={s.findRow}>
            <MaterialCommunityIcons name="storefront-outline" size={24} color="#2563eb" />
            <View style={s.findCopy}>
              <Text style={s.cardTitle}>What to do next</Text>
              <Text style={s.cardSubtle}>Visit a local pharmacy for advice and treatment.</Text>
            </View>
          </View>
          <Pressable style={s.cta} onPress={() => navigation.push("FindPharmacy")}>
            <Text style={s.ctaText}>Find a pharmacy</Text>
          </Pressable>
        </View>

        <Text style={s.important}>Important</Text>
        <Text style={s.importantBody}>
          If your symptoms worsen or you develop new symptoms, seek medical help.
        </Text>

        <Pressable style={s.linkButton} onPress={() => navigation.push("Patients")}>
          <Text style={s.linkButtonText}>Start a new consultation</Text>
        </Pressable>
      </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  pageInset: {
    flex: 1,
    paddingTop: SPACING.screenInset,
    paddingBottom: SPACING.screenInset,
    paddingLeft: SPACING.screenInset,
    paddingRight: SPACING.screenInset,
  },
  container: { flex: 1 },
  statusSpacer: { alignItems: "center", marginTop: 2, marginBottom: 8 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ecfdf3",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { color: "#0f172a", fontSize: 28, lineHeight: 34, fontWeight: "800" },
  heroBody: { marginTop: 8, color: "#475569", fontSize: 15, lineHeight: 21 },
  card: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#ffffff",
    padding: 10,
    gap: 6,
  },
  cardTitle: { color: "#0f172a", fontSize: 16, fontWeight: "700" },
  cardSubtle: { color: "#64748b", fontSize: 13, lineHeight: 18 },
  bulletList: { gap: 5, marginTop: 2 },
  bulletRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  bullet: { color: "#334155", fontSize: 13, lineHeight: 17 },
  findRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  findCopy: { flex: 1, gap: 2 },
  cta: {
    borderRadius: 10,
    backgroundColor: "#2563eb",
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 6,
  },
  ctaText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  important: { marginTop: 12, color: "#1e293b", fontWeight: "700", fontSize: 14 },
  importantBody: { marginTop: 4, color: "#475569", fontSize: 13, lineHeight: 18 },
  linkButton: {
    marginTop: "auto",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    paddingVertical: 11,
    alignItems: "center",
  },
  linkButtonText: { color: "#1d4ed8", fontSize: 14, fontWeight: "700" },
});
