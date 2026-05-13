import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../App";
import { SPACING } from "../../lib/spacing";

export default function EmergencySymptomsPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "Emergency">>();
  const question =
    typeof route.params?.question === "string" ? route.params.question : "an emergency symptom";

  return (
    <SafeAreaView style={s.root}>
      <View style={s.pageInset}>
        <View style={s.badge}>
          <MaterialCommunityIcons name="alert" size={16} color="#b91c1c" />
          <Text style={s.badgeText}>Emergency symptoms check</Text>
        </View>
        <Text style={s.title}>Call 999 now</Text>
        <Text style={s.body}>
          Your answer suggests possible emergency symptoms ({question}). Do not continue this online consultation.
        </Text>
        <Pressable style={s.primaryCta} onPress={() => void Linking.openURL("tel:999")}>
          <MaterialCommunityIcons name="phone" size={20} color="#fff" />
          <Text style={s.primaryCtaText}>Call 999</Text>
        </Pressable>
        <Pressable style={s.secondaryCta} onPress={() => navigation.navigate("Patients")}>
          <MaterialCommunityIcons name="arrow-left" size={18} color="#334155" />
          <Text style={s.secondaryCtaText}>Back to symptom checker</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  pageInset: {
    flex: 1,
    paddingHorizontal: SPACING.screenInset,
    paddingTop: SPACING.screenInset,
    paddingBottom: SPACING.screenInset,
    justifyContent: "center",
    maxWidth: 440,
    alignSelf: "center",
    width: "100%",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    marginBottom: 12,
  },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#b91c1c" },
  title: { fontSize: 26, fontWeight: "700", color: "#0f172a" },
  body: { marginTop: 10, fontSize: 15, lineHeight: 22, color: "#334155" },
  primaryCta: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#b91c1c",
    paddingVertical: 14,
  },
  primaryCtaText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  secondaryCta: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 12,
  },
  secondaryCtaText: { fontSize: 15, fontWeight: "600", color: "#334155" },
});
