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
              <MaterialCommunityIcons name="shield-check-outline" size={16} color="#2563eb" />
              <Text style={s.featureText}>NHS-aligned pathways</Text>
            </View>
            <View style={s.featureRow}>
              <MaterialCommunityIcons name="shield-check-outline" size={16} color="#2563eb" />
              <Text style={s.featureText}>Clinically reviewed workflows</Text>
            </View>
            <View style={s.featureRow}>
              <MaterialCommunityIcons name="shield-check-outline" size={16} color="#2563eb" />
              <Text style={s.featureText}>Your data is private and secure</Text>
            </View>
          </View>

          <View style={s.bottomArea}>
            <View style={s.infoCard}>
              <MaterialCommunityIcons name="lock-outline" size={15} color="#2563eb" />
              <Text style={s.infoText}>Your data is encrypted and handled in line with UK GDPR.</Text>
            </View>

            <Pressable style={s.cta} onPress={() => navigation.replace("MainTabs")}>
              <Text style={s.ctaText}>Tap to continue</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.lg,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  contentWrap: { width: "100%", maxWidth: 360, alignSelf: "center" },
  brand: { fontSize: 34, lineHeight: 38, fontWeight: "800", color: "#0f2258" },
  subtitle: { marginTop: 6, fontSize: 22, lineHeight: 28, color: "#1e325f", fontWeight: "500" },
  accentLine: { marginTop: 12, width: 44, height: 3, borderRadius: 999, backgroundColor: "#2563eb" },
  lead: { marginTop: 20, fontSize: 24, lineHeight: 30, color: "#1e325f", fontWeight: "500" },
  featureList: { marginTop: SPACING.xl, gap: SPACING.md },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingRight: SPACING.xxl,
  },
  featureText: { flex: 1, color: "#163264", fontSize: 16, lineHeight: 22, fontWeight: "500" },
  bottomArea: { width: "100%", marginTop: SPACING.xl, gap: SPACING.md },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: "#c6d4f7",
    backgroundColor: "#eaf1ff",
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  infoText: { flex: 1, fontSize: 14, lineHeight: 19, color: "#163264", fontWeight: "600" },
  cta: { backgroundColor: "#2563eb", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  ctaText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
});
