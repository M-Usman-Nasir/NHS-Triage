import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import type { RootStackParamList } from "../App";
import { Screen } from "./Screen";
import { Card } from "./Card";
import { BACK_NAV_ICON } from "../lib/iconPolicy";
import { COLORS, TYPOGRAPHY } from "../lib/theme";

export function LegalScreen({ title, description, children }: PropsWithChildren<{ title: string; description: string }>) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Screen>
      <Pressable
        style={s.backRow}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <MaterialCommunityIcons name={BACK_NAV_ICON} size={20} color={COLORS.textMuted} />
        <Text style={s.backText}>Back</Text>
      </Pressable>
      <Card>
        <Text style={s.title}>{title}</Text>
        <Text style={s.desc}>{description}</Text>
        <View style={s.body}>{children}</View>
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  backRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12, paddingVertical: 4 },
  backText: { fontSize: 16, fontWeight: "600", color: COLORS.textPrimary },
  title: { ...TYPOGRAPHY.title },
  desc: { ...TYPOGRAPHY.caption, marginTop: 4 },
  body: { marginTop: 8, gap: 8 },
});
