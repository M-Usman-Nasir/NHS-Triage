import { forwardRef, type PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SPACING } from "../lib/spacing";
import { COLORS } from "../lib/theme";

export type ScreenProps = PropsWithChildren<{
  contentContainerStyle?: StyleProp<ViewStyle>;
}>;

export const Screen = forwardRef<ScrollView, ScreenProps>(function Screen(
  { children, contentContainerStyle },
  ref,
) {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        ref={ref}
        style={styles.scroll}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        <View>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.xs, paddingVertical: SPACING.xs },
});
