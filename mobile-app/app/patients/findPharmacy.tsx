import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../App";
import { SPACING } from "../../lib/spacing";

type ViewTab = "list" | "map";

const PHARMACIES = [
  {
    name: "WellCare Pharmacy",
    distance: "0.2 miles away",
    hours: "Open - Closes 6:00pm",
    address: "123 High Street, London SW1A 1AA",
    latitude: 51.5073,
    longitude: -0.1274,
  },
  {
    name: "HealthPlus Pharmacy",
    distance: "0.4 miles away",
    hours: "Open - Closes 8:00pm",
    address: "20 King's Road, London SW3 4QQ",
    latitude: 51.4922,
    longitude: -0.1647,
  },
  {
    name: "City Pharmacy",
    distance: "0.6 miles away",
    hours: "Open - Closes 6:30pm",
    address: "88 Victoria Street, London SW1E 5JL",
    latitude: 51.4974,
    longitude: -0.1357,
  },
];

export default function FindPharmacyPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tab, setTab] = useState<ViewTab>("list");

  const tabUnderlineLeft = useMemo(() => (tab === "list" ? "0%" : "50%"), [tab]);

  return (
    <SafeAreaView style={s.root}>
      <View style={s.container}>
        <View style={s.header}>
          <Pressable style={s.back} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#2563eb" />
          </Pressable>
          <Text style={s.title}>Find a pharmacy</Text>
          <View style={s.back} />
        </View>

        <View style={s.tabs}>
          <Pressable style={s.tab} onPress={() => setTab("list")}>
            <Text style={[s.tabText, tab === "list" && s.tabTextActive]}>List view</Text>
          </Pressable>
          <Pressable style={s.tab} onPress={() => setTab("map")}>
            <Text style={[s.tabText, tab === "map" && s.tabTextActive]}>Map view</Text>
          </Pressable>
          <View style={[s.tabUnderline, { left: tabUnderlineLeft }]} />
        </View>

        {tab === "list" ? (
          <View style={s.content}>
            <View style={s.infoBanner}>
              <MaterialCommunityIcons name="information-outline" size={16} color="#2563eb" />
              <Text style={s.infoText}>Showing pharmacies offering support for your symptoms.</Text>
            </View>

            {PHARMACIES.map((p) => (
              <View key={p.name} style={s.card}>
                <View style={s.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardName}>{p.name}</Text>
                    <Text style={s.cardDistance}>{p.distance}</Text>
                    <Text style={s.cardHours}>{p.hours}</Text>
                    <Text style={s.cardAddress}>{p.address}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#2563eb" />
                </View>
                <View style={s.badges}>
                  <View style={s.badge}>
                    <Text style={s.badgeText}>Pharmacy First</Text>
                  </View>
                  <View style={s.badge}>
                    <Text style={s.badgeText}>Walk-in</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={s.mapWrap}>
            <MapView
              style={s.map}
              initialRegion={{
                latitude: 51.5014,
                longitude: -0.1419,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              }}
            >
              {PHARMACIES.map((p) => (
                <Marker
                  key={p.name}
                  coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                  title={p.name}
                  description={`${p.hours} • ${p.address}`}
                />
              ))}
            </MapView>
            <View style={s.mapHint}>
              <MaterialCommunityIcons name="information-outline" size={15} color="#2563eb" />
              <Text style={s.mapHintText}>Tap any pin to view pharmacy details.</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc", paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm },
  container: { flex: 1, borderRadius: 12, overflow: "hidden", backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 10, paddingTop: 4 },
  back: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, color: "#0f172a", fontWeight: "700" },
  tabs: { marginTop: 8, flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#dbe3ef", position: "relative" },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { color: "#64748b", fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: "#2563eb" },
  tabUnderline: { position: "absolute", bottom: -1, width: "50%", height: 2, backgroundColor: "#2563eb" },
  content: { padding: 12, gap: 10 },
  infoBanner: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#eef4ff",
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: { flex: 1, color: "#1e3a8a", fontSize: 13, lineHeight: 17 },
  card: { backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "#dbe3ef", padding: 10, gap: 8 },
  cardTop: { flexDirection: "row", gap: 8 },
  cardName: { color: "#0f172a", fontSize: 20, lineHeight: 24, fontWeight: "700" },
  cardDistance: { marginTop: 2, color: "#64748b", fontSize: 13 },
  cardHours: { marginTop: 4, color: "#16a34a", fontSize: 14, fontWeight: "700" },
  cardAddress: { marginTop: 2, color: "#334155", fontSize: 14, lineHeight: 18 },
  badges: { flexDirection: "row", gap: 8 },
  badge: { borderRadius: 6, backgroundColor: "#eff6ff", paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: "#2563eb", fontSize: 12, fontWeight: "600" },
  mapWrap: { flex: 1, padding: 12, gap: 10 },
  map: { flex: 1, borderRadius: 12 },
  mapHint: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#eef4ff",
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mapHintText: { color: "#1e3a8a", fontSize: 13, lineHeight: 17 },
});
