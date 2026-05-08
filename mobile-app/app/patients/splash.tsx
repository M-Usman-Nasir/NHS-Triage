import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SPACING } from "../../lib/spacing";
type RootAppStackParamList = {
  Splash: undefined;
  MainTabs: undefined;
};

export default function SplashPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootAppStackParamList>>();

  return (
    <SafeAreaView style={s.root}>
      <View style={s.container}>
        <View style={s.contentWrap}>
          <Text style={s.brand}>CarePath</Text>
          <Text style={s.subtitle}>NHS-aligned clinical{"\n"}triage</Text>
          <View style={s.accentLine} />

          <Text style={s.lead}>Helping you get the{"\n"}right care, in the{"\n"}right place.</Text>

          <View style={s.featureList}>
            <View style={s.featureRow}>
              <MaterialCommunityIcons name="shield-check-outline" size={18} color="#2563eb" />
              <Text style={s.featureText}>NHS-aligned pathways</Text>
            </View>
            <View style={s.featureRow}>
              <MaterialCommunityIcons name="shield-check-outline" size={18} color="#2563eb" />
              <Text style={s.featureText}>Clinically reviewed workflows</Text>
            </View>
            <View style={s.featureRow}>
              <MaterialCommunityIcons name="shield-check-outline" size={18} color="#2563eb" />
              <Text style={s.featureText}>Your data is private and secure</Text>
            </View>
          </View>
        </View>

        <View style={s.bottomArea}>
          <View style={s.infoCard}>
            <MaterialCommunityIcons name="lock-outline" size={17} color="#2563eb" />
            <Text style={s.infoText}>Your data is encrypted and handled in line with UK GDPR.</Text>
          </View>

          <Pressable style={s.cta} onPress={() => navigation.replace("MainTabs")}>
            <Text style={s.ctaText}>Tap to continue</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f1f5f9", paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm },
  container: { flex: 1, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, justifyContent: "center" },
  contentWrap: { width: "100%", maxWidth: 360, alignSelf: "center" },
  brand: { fontSize: 44, lineHeight: 48, fontWeight: "800", color: "#0f2258" },
  subtitle: { marginTop: 8, fontSize: 36, lineHeight: 41, color: "#1e325f", fontWeight: "500" },
  accentLine: { marginTop: 16, width: 52, height: 4, borderRadius: 999, backgroundColor: "#2563eb" },
  lead: { marginTop: 28, fontSize: 34, lineHeight: 40, color: "#1e325f", fontWeight: "500" },
  featureList: { marginTop: 26, gap: 16 },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingRight: 28 },
  featureText: { flex: 1, color: "#163264", fontSize: 20, lineHeight: 26, fontWeight: "500" },
  bottomArea: { gap: 14, marginTop: 28 },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderColor: "#c6d4f7",
    backgroundColor: "#eaf1ff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoText: { flex: 1, fontSize: 16, lineHeight: 21, color: "#163264", fontWeight: "600" },
  cta: { backgroundColor: "#2563eb", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  ctaText: { color: "#ffffff", fontSize: 17, fontWeight: "700" },
});
