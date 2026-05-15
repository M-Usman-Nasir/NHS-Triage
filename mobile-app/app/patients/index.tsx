import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList, RootTabParamList } from "../../App";
import { Card } from "../../components/Card";
import { HowItWorksSteps } from "../../components/HowItWorksSteps";
import { ListRow } from "../../components/ListRow";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SPACING } from "../../lib/spacing";
import { pathwayIconName } from "../../lib/pathwayIcons";
import { pathwaysGroupedByCategory } from "../../lib/patientPathways";
import { BRAND_NAME, HOME } from "../../lib/patientCopy";
import { COLORS, TYPOGRAPHY } from "../../lib/theme";

export default function PatientsLanding() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const grouped = pathwaysGroupedByCategory();

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.centerWrap}>
          <View style={s.topRow}>
            <Text style={s.appName}>{BRAND_NAME}</Text>
            <Pressable
              style={s.profileLink}
              onPress={() => {
                navigation.getParent<BottomTabNavigationProp<RootTabParamList>>()?.navigate("Profile");
              }}
              accessibilityRole="link"
            >
              <Text style={s.profileText}>Profile</Text>
            </Pressable>
          </View>

          <Text style={s.title}>Check your symptoms</Text>
          <Text style={s.body}>What problem are you having?</Text>
          <Text style={s.durationHint}>{HOME.durationHint}</Text>
          <HowItWorksSteps hint="This usually takes a few minutes." />
          <PrimaryButton
            label="Start a check"
            onPress={() => navigation.push("SymptomSelection", {})}
            style={s.cta}
          />

          <Text style={s.section}>Common checks</Text>
          {grouped.map(({ category, pathways }) => (
            <View key={category.id} style={s.categoryBlock}>
              <Text style={s.categoryLabel}>{category.title.toUpperCase()}</Text>
              <Card style={s.listCard}>
                {pathways.map((item, index) => (
                  <ListRow
                    key={item.code}
                    leadingIcon={pathwayIconName(item.code)}
                    title={item.fullLabel}
                    subtitle={item.description}
                    last={index === pathways.length - 1}
                    onPress={() => navigation.push("SymptomSelection", { initialCodes: item.code })}
                  />
                ))}
              </Card>
            </View>
          ))}

          <Text style={s.disclaimer}>{HOME.emergencyLine}</Text>
          <Text style={s.disclaimerSecondary}>
            Guidance only. Not a substitute for professional medical advice.
          </Text>
          <View style={s.legalRow}>
            <Pressable onPress={() => navigation.push("Privacy")} accessibilityRole="link">
              <Text style={s.legalLink}>Privacy</Text>
            </Pressable>
            <Text style={s.legalSep}>·</Text>
            <Pressable onPress={() => navigation.push("Terms")} accessibilityRole="link">
              <Text style={s.legalLink}>Terms</Text>
            </Pressable>
            <Text style={s.legalSep}>·</Text>
            <Pressable onPress={() => navigation.push("DataPrivacy", {})} accessibilityRole="link">
              <Text style={s.legalLink}>Your data</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm },
  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xs,
    paddingTop: SPACING.md,
    paddingBottom: 100,
  },
  centerWrap: { width: "100%", maxWidth: 360, alignSelf: "center" },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  appName: { ...TYPOGRAPHY.heading, fontSize: 20 },
  profileLink: { paddingVertical: 4, paddingHorizontal: 4 },
  profileText: { fontSize: 16, color: COLORS.textPrimary, fontWeight: "600" },
  title: { ...TYPOGRAPHY.title, marginTop: SPACING.lg },
  body: { ...TYPOGRAPHY.bodySecondary, marginTop: 8 },
  durationHint: { ...TYPOGRAPHY.caption, marginTop: 4 },
  cta: { marginTop: SPACING.md },
  section: { ...TYPOGRAPHY.label, marginTop: 22, marginBottom: SPACING.sm },
  categoryBlock: { marginBottom: SPACING.md },
  categoryLabel: { ...TYPOGRAPHY.label, marginBottom: SPACING.xs },
  listCard: {
    padding: 0,
    overflow: "hidden",
  },
  disclaimer: {
    ...TYPOGRAPHY.caption,
    marginTop: SPACING.lg,
    textAlign: "center",
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  disclaimerSecondary: {
    ...TYPOGRAPHY.caption,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  legalRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  legalLink: { ...TYPOGRAPHY.caption, fontWeight: "600", textDecorationLine: "underline" },
  legalSep: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
});
