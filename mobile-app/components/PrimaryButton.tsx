import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { COLORS, COMPONENTS } from "../lib/theme";

type Props = PressableProps & {
  label: string;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ label, style, disabled, ...rest }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        COMPONENTS.buttonPrimary,
        pressed && s.pressed,
        disabled && s.disabled,
        style,
      ]}
      disabled={disabled}
      accessibilityRole="button"
      {...rest}
    >
      <Text style={COMPONENTS.buttonPrimaryText}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.5 },
});
