import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList, RootTabParamList } from "../../App";
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
            <Pressable
              style={s.profileLink}
              onPress={() => {
                navigation.getParent<BottomTabNavigationProp<RootTabParamList>>()?.navigate("Profile");
              }}
            >
              <View style={s.profileIcon}>
                <MaterialCommunityIcons name="account-outline" size={14} color="#2563eb" />
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
          <ScrollView
            style={s.list}
            contentContainerStyle={s.listContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
          >
            {PATIENT_PATHWAYS.map((item, index) => (
              <Pressable
                key={item.code}
                style={[s.listItem, index === PATIENT_PATHWAYS.length - 1 && s.listItemLast]}
                onPress={() => navigation.push("Consultation", { pathways: item.code })}
              >
                <View style={s.leadingIcon}>
                  <MaterialCommunityIcons
                    name={iconNameByCode[item.code] ?? "stethoscope"}
                    size={18}
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
          </ScrollView>
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
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
  },
  profileIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: { fontSize: 13, color: "#2563eb", fontWeight: "700" },
  title: {
    marginTop: 18,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
    fontWeight: "800",
    color: "#0f172a",
  },
  body: { marginTop: 10, fontSize: 17, lineHeight: 24, color: "#475569", maxWidth: 320 },
  cta: { marginTop: 18, backgroundColor: "#2563eb", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  ctaText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  section: { marginTop: 22, marginBottom: SPACING.sm, fontSize: 16, fontWeight: "700", color: "#1e293b" },
  list: {
    maxHeight: Math.round(Dimensions.get("window").height * 0.42),
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  listContent: { flexGrow: 0 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f7",
  },
  listItemLast: { borderBottomWidth: 0 },
  leadingIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  itemCopy: { flex: 1, gap: SPACING.xs },
  itemTitle: { fontSize: 16, color: "#0f172a", fontWeight: "700" },
  itemSubtitle: { fontSize: 14, color: "#64748b", lineHeight: 20 },
});
