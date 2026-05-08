import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../App";
import { SPACING } from "../../lib/spacing";
import { PATIENT_PATHWAYS } from "../../lib/patientPathways";

export default function PatientsLanding() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const iconNameByCode: Record<string, string> = {
    uti: "water-outline",
    sore_throat: "thermometer",
    sinusitis: "weather-windy",
    otitis_media: "ear-hearing",
    insect_bites: "ladybug",
    impetigo: "bandage",
    shingles: "flash-outline",
  };

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.centerWrap}>
          <View style={s.topRow}>
            <View />
            <Pressable style={s.profileLink} onPress={() => navigation.push("Profile")}>
              <View style={s.profileIcon}>
                <MaterialCommunityIcons name="account-outline" size={16} color="#2563eb" />
              </View>
              <Text style={s.profileText}>Profile</Text>
            </Pressable>
          </View>

          <Text style={s.title}>Check your symptoms</Text>
          <Text style={s.body}>Answer a few questions to find the right care.</Text>
          <Pressable
            style={s.cta}
            onPress={() => navigation.push("SymptomSelection")}
          >
            <Text style={s.ctaText}>Start a check</Text>
          </Pressable>

          <Text style={s.section}>Common checks</Text>
          <View style={s.list}>
            {PATIENT_PATHWAYS.map((item) => (
              <Pressable
                key={item.code}
                style={s.listItem}
                onPress={() => navigation.push("Consultation", { pathways: item.code })}
              >
                <View style={s.leadingIcon}>
                  <MaterialCommunityIcons
                    name={iconNameByCode[item.code] ?? "stethoscope"}
                    size={17}
                    color="#2563eb"
                  />
                </View>
                <View style={s.itemCopy}>
                  <Text style={s.itemTitle}>{item.fullLabel}</Text>
                  <Text style={s.itemSubtitle}>{item.description}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#94a3b8" />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc", paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: SPACING.xs, paddingVertical: SPACING.md },
  centerWrap: { width: "100%", maxWidth: 360, alignSelf: "center" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  profileLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
  },
  profileIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: { fontSize: 15, color: "#2563eb", fontWeight: "700" },
  title: { marginTop: 24, fontSize: 42, lineHeight: 44, letterSpacing: -0.8, fontWeight: "800", color: "#0f172a" },
  body: { marginTop: 12, fontSize: 22, lineHeight: 28, color: "#475569", maxWidth: 320 },
  cta: { marginTop: 24, backgroundColor: "#2563eb", borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  ctaText: { color: "#ffffff", fontSize: 18, fontWeight: "700" },
  section: { marginTop: 28, marginBottom: 12, fontSize: 16, fontWeight: "700", color: "#1e293b" },
  list: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f7",
  },
  leadingIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemCopy: { flex: 1, gap: 3 },
  itemTitle: { fontSize: 17, color: "#0f172a", fontWeight: "700" },
  itemSubtitle: { fontSize: 13, color: "#64748b", lineHeight: 18 },
});
