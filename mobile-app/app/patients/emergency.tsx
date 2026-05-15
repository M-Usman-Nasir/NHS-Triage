import { CommonActions, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../App";
import { SecondaryButton } from "../../components/SecondaryButton";
import { SPACING } from "../../lib/spacing";
import { COLORS, TYPOGRAPHY } from "../../lib/theme";

export default function EmergencySymptomsPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "Emergency">>();
  const question =
    typeof route.params?.question === "string" ? route.params.question : "an emergency symptom";
  const flags = Array.isArray(route.params?.flags) ? route.params.flags : [];

  return (
    <SafeAreaView style={s.root}>
      <View style={s.pageInset}>
        <View style={s.badge}>
          <MaterialCommunityIcons name="alert" size={16} color={COLORS.error} />
          <Text style={s.badgeText}>Emergency symptoms check</Text>
        </View>
        <Text style={s.title}>Call 999 now</Text>
        <Text style={s.body}>
          Based on your answers, you may need emergency care. Do not continue this online consultation.
        </Text>
        {flags.length > 0 ? (
          <View style={s.flagList}>
            <Text style={s.flagListTitle}>You reported:</Text>
            {flags.map((label) => (
              <Text key={label} style={s.flagItem}>
                {"\u2022"} {label}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={s.bodyDetail}>{question}</Text>
        )}
        <Pressable style={s.primaryCta} onPress={() => void Linking.openURL("tel:999")}>
          <MaterialCommunityIcons name="phone" size={20} color={COLORS.surface} />
          <Text style={s.primaryCtaText}>Call 999</Text>
        </Pressable>
        <SecondaryButton
          label="Back to symptom checker"
          onPress={() =>
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Patients" }],
              }),
            )
          }
          style={s.secondaryCta}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
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
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.errorBg,
    marginBottom: 12,
  },
  badgeText: { fontSize: 12, fontWeight: "600", color: COLORS.error },
  title: { ...TYPOGRAPHY.title },
  body: { ...TYPOGRAPHY.bodySecondary, marginTop: 10 },
  bodyDetail: { ...TYPOGRAPHY.caption, marginTop: 8, color: COLORS.textPrimary },
  flagList: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
  },
  flagListTitle: { ...TYPOGRAPHY.label, marginBottom: 8, color: COLORS.textPrimary },
  flagItem: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary, marginBottom: 4 },
  primaryCta: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 52,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    paddingVertical: 14,
  },
  primaryCtaText: { color: COLORS.surface, fontSize: 17, fontWeight: "600" },
  secondaryCta: { marginTop: 12 },
});
