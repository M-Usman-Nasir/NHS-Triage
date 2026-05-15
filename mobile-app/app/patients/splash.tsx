import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "../../components/PrimaryButton";
import { BRAND_NAME } from "../../lib/patientCopy";
import { SPACING } from "../../lib/spacing";
import { COLORS, TYPOGRAPHY } from "../../lib/theme";

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
          <Text style={s.brand}>{BRAND_NAME}</Text>
          <Text style={s.subtitle}>NHS-aligned symptom checking</Text>
          <Text style={s.lead}>Helping you find the right care, in the right place.</Text>
          <Text style={s.compliance}>
            Your information is handled in line with UK GDPR. This app does not replace emergency care — call 999 if
            you are seriously unwell.
          </Text>
          <PrimaryButton label="Continue" onPress={() => navigation.replace("MainTabs")} style={s.cta} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  brand: { ...TYPOGRAPHY.title, fontSize: 22 },
  subtitle: { ...TYPOGRAPHY.bodySecondary, marginTop: 8 },
  lead: { ...TYPOGRAPHY.bodySecondary, marginTop: SPACING.lg, fontSize: 18, lineHeight: 24 },
  compliance: { ...TYPOGRAPHY.caption, marginTop: SPACING.xl, color: COLORS.textPrimary, lineHeight: 20 },
  cta: { marginTop: SPACING.xl },
});
