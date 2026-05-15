import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { COMPONENTS } from "../lib/theme";

type Props = ViewProps & {
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style, ...rest }: Props) {
  return (
    <View style={[COMPONENTS.card, style]} {...rest}>
      {children}
    </View>
  );
}
