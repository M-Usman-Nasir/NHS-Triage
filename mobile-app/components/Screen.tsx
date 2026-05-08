import { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, View } from "react-native";
import { SPACING } from "../lib/spacing";

export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc", paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm },
  content: { paddingHorizontal: SPACING.xs, paddingVertical: SPACING.xs },
});
