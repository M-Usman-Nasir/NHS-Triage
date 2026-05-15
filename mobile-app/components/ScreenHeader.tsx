import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BACK_NAV_ICON } from "../lib/iconPolicy";
import { COLORS, TYPOGRAPHY } from "../lib/theme";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

export function ScreenHeader({ title, subtitle, onBack }: Props) {
  return (
    <View style={s.wrap}>
      {onBack ? (
        <Pressable style={s.backBtn} onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back">
          <MaterialCommunityIcons name={BACK_NAV_ICON} size={20} color={COLORS.textMuted} />
          <Text style={s.backText}>Back</Text>
        </Pressable>
      ) : null}
      <Text style={s.title}>{title}</Text>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: 16 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12, alignSelf: "flex-start" },
  backText: { fontSize: 16, color: COLORS.textPrimary, fontWeight: "600" },
  title: { ...TYPOGRAPHY.title },
  subtitle: { ...TYPOGRAPHY.bodySecondary, marginTop: 4 },
});
