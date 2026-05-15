import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Dimensions, InteractionManager, Platform, Pressable, StyleSheet, Text, View } from "react-native";
// Android map tiles require GOOGLE_MAPS_API_KEY in android/local.properties (see app build.gradle).
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../App";
import { SPACING } from "../../lib/spacing";
import { BACK_NAV_ICON } from "../../lib/iconPolicy";
import { COLORS, TYPOGRAPHY } from "../../lib/theme";

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

const MAP_MIN_HEIGHT = Math.round(Dimensions.get("window").height * 0.42);

export default function FindPharmacyPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tab, setTab] = useState<ViewTab>("list");
  const [mapMountReady, setMapMountReady] = useState(false);

  useEffect(() => {
    if (tab !== "map") {
      setMapMountReady(false);
      return;
    }
    const task = InteractionManager.runAfterInteractions(() => {
      setMapMountReady(true);
    });
    return () => task.cancel();
  }, [tab]);

  const tabUnderlineLeft = useMemo(() => (tab === "list" ? "0%" : "50%"), [tab]);

  return (
    <SafeAreaView style={s.root}>
      <View style={s.container}>
        <View style={s.header}>
          <Pressable style={s.back} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name={BACK_NAV_ICON} size={20} color={COLORS.textMuted} />
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
            <Text style={s.infoText}>Showing pharmacies offering support for your symptoms.</Text>

            {PHARMACIES.map((p) => (
              <View key={p.name} style={s.card}>
                <Text style={s.cardName}>{p.name}</Text>
                <Text style={s.cardDistance}>{p.distance}</Text>
                <Text style={s.cardHours}>{p.hours}</Text>
                <Text style={s.cardAddress}>{p.address}</Text>
                <Text style={s.serviceMeta}>Pharmacy First · Walk-in</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={s.mapWrap}>
            {mapMountReady ? (
              <View
                style={[s.mapClip, Platform.OS === "android" && s.mapClipAndroid]}
                collapsable={false}
                renderToHardwareTextureAndroid={false}
              >
                <MapView
                  style={s.mapFill}
                  initialRegion={{
                    latitude: 51.5014,
                    longitude: -0.1419,
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03,
                  }}
                  toolbarEnabled={Platform.OS === "android" ? false : undefined}
                  loadingEnabled={Platform.OS !== "android"}
                  removeClippedSubviews={false}
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
              </View>
            ) : (
              <View style={[s.mapClip, s.mapPlaceholder]}>
                <Text style={s.mapPlaceholderText}>Loading map…</Text>
              </View>
            )}
            <Text style={s.mapHintText}>Tap any pin to view pharmacy details.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm },
  // Avoid overflow:hidden here: on Android it wraps MapView and commonly crashes the maps surface (API 31+ / MIUI).
  container: { flex: 1, borderRadius: 4, backgroundColor: COLORS.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 10, paddingTop: 4 },
  back: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  title: { ...TYPOGRAPHY.heading },
  tabs: { marginTop: 8, flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border, position: "relative" },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: COLORS.nhsBlue },
  tabUnderline: { position: "absolute", bottom: -1, width: "50%", height: 2, backgroundColor: COLORS.nhsBlue },
  content: { padding: 12, gap: 10 },
  infoText: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary },
  card: { backgroundColor: COLORS.surface, borderRadius: 4, borderWidth: 1, borderColor: COLORS.border, padding: 12, gap: 4 },
  cardName: { ...TYPOGRAPHY.heading, fontSize: 16 },
  cardDistance: { ...TYPOGRAPHY.caption, marginTop: 2 },
  cardHours: { marginTop: 4, color: COLORS.success, fontSize: 14, fontWeight: "600" },
  cardAddress: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary, marginTop: 2 },
  serviceMeta: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 6 },
  mapWrap: { flex: 1, padding: 12, gap: 10 },
  mapClip: {
    flex: 1,
    minHeight: MAP_MIN_HEIGHT,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    overflow: Platform.OS === "ios" ? "hidden" : "visible",
  },
  mapClipAndroid: { borderRadius: 0 },
  mapFill: { flex: 1, width: "100%" },
  mapPlaceholder: { alignItems: "center", justifyContent: "center" },
  mapPlaceholderText: { color: "#64748b", fontSize: 15 },
  mapHintText: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary },
});
