import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CHEVRON_ICON } from "../lib/iconPolicy";
import { COLORS, RADII, TYPOGRAPHY } from "../lib/theme";

type Props = {
  title: string;
  subtitle?: string;
  leadingIcon?: string;
  onPress?: () => void;
  showChevron?: boolean;
  selected?: boolean;
  last?: boolean;
};

export function ListRow({
  title,
  subtitle,
  leadingIcon,
  onPress,
  showChevron = true,
  selected,
  last,
}: Props) {
  const accessibilityLabel = subtitle ? `${title}. ${subtitle}` : title;

  const content = (
    <>
      {leadingIcon ? (
        <View style={s.iconBox} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <MaterialCommunityIcons name={leadingIcon} size={22} color={COLORS.textMuted} />
        </View>
      ) : null}
      <View style={s.copy}>
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>
      {selected ? (
        <View style={s.checkBox}>
          <MaterialCommunityIcons name="check" size={14} color={COLORS.textPrimary} />
        </View>
      ) : showChevron && onPress ? (
        <View style={s.chevronWrap}>
          <MaterialCommunityIcons name={CHEVRON_ICON} size={20} color={COLORS.textMuted} />
        </View>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={[s.row, selected && s.rowSelected, last && s.rowLast]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected: !!selected }}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      style={[s.row, selected && s.rowSelected, last && s.rowLast]}
      accessibilityLabel={accessibilityLabel}
    >
      {content}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    gap: 12,
    backgroundColor: COLORS.surface,
  },
  rowSelected: {
    borderWidth: 2,
    borderColor: COLORS.selectedBorder,
    borderBottomWidth: 2,
    marginHorizontal: -1,
  },
  rowLast: { borderBottomWidth: 0 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  copy: { flex: 1, minWidth: 0, paddingRight: 4 },
  title: { ...TYPOGRAPHY.body, fontWeight: "600", flexShrink: 1 },
  subtitle: { ...TYPOGRAPHY.caption, marginTop: 2 },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: RADII.sm,
    borderWidth: 2,
    borderColor: COLORS.selectedBorder,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 9,
  },
  chevronWrap: {
    marginTop: 9,
    justifyContent: "center",
  },
});
