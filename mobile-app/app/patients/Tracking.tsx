import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { SPACING } from "../../lib/spacing";

const PRIMARY = "#2563eb";

const THROAT_LABELS = ["Mild", "Mild", "Moderate", "Severe", "Very severe"];
const FEVER_LABELS = ["None", "Mild", "Moderate", "Severe", "Very severe"];

function formatTodayLong(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

type RatingScaleProps = {
  label: string;
  value: number;
  onChange: (n: number) => void;
  labels: readonly string[];
};

function RatingScale({ label, value, onChange, labels }: RatingScaleProps) {
  const caption = labels[Math.max(0, Math.min(4, value - 1))] ?? "";
  return (
    <View style={s.scaleBlock}>
      <Text style={s.scaleTitle}>{label}</Text>
      <View style={s.ratingTrack}>
        {[1, 2, 3, 4, 5].map((n) => {
          const on = value === n;
          return (
            <Pressable
              key={n}
              style={[s.ratingCell, on && s.ratingCellOn]}
              onPress={() => onChange(n)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${label} level ${n}`}
            >
              <Text style={[s.ratingDigit, on && s.ratingDigitOn]}>{n}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={s.scaleCaption}>{caption}</Text>
    </View>
  );
}

export default function TrackingScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [soreThroat, setSoreThroat] = useState(3);
  const [fever, setFever] = useState(1);
  const [notes, setNotes] = useState(
    "Feeling a bit better than yesterday. Still painful when swallowing.",
  );

  const todayLine = useMemo(() => formatTodayLong(new Date()), []);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const onShow = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height));
    const onHide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  /** Avoid double offset: iOS KeyboardAvoidingView shrinks layout; Android needs scroll padding = keyboard. */
  const scrollBottomPad =
    keyboardHeight > 0
      ? (Platform.OS === "android" ? keyboardHeight + SPACING.md : SPACING.md) + insets.bottom
      : tabBarHeight + SPACING.lg + insets.bottom;

  const nudgeNotesAboveKeyboard = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), Platform.OS === "ios" ? 280 : 120);
  };

  return (
    <SafeAreaView style={s.safeRoot} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={s.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        enabled={Platform.OS === "ios"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={s.scroll}
          contentContainerStyle={[
            s.scrollInner,
            { paddingBottom: scrollBottomPad },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.title}>Track your symptoms</Text>
          <Text style={s.subtitle}>
            Log how you feel today (demo — not saved to your NHS record). Use this to spot changes over time.
          </Text>

          <View style={s.card}>
            <View style={s.dateRow}>
              <Text style={s.todayLabel}>Today</Text>
              <Text style={s.dateValue}>{todayLine}</Text>
            </View>
            <Text style={s.prompt}>How are you feeling today?</Text>
            <RatingScale label="Sore throat" value={soreThroat} onChange={setSoreThroat} labels={THROAT_LABELS} />
            <RatingScale label="Fever" value={fever} onChange={setFever} labels={FEVER_LABELS} />
          </View>

          <View style={s.card}>
            <Text style={s.notesLabel}>Notes (optional)</Text>
            <TextInput
              style={s.notesInput}
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="Add any extra detail…"
              placeholderTextColor="#94a3b8"
              textAlignVertical="top"
              accessibilityLabel="Optional notes"
              onFocus={nudgeNotesAboveKeyboard}
            />
          </View>

          <Text style={s.disclaimer}>
            This is not monitored in real time. If you feel worse, seek medical help.
          </Text>

          <Pressable
            style={({ pressed }) => [s.primaryCta, pressed && s.primaryCtaPressed]}
            onPress={() => {}}
            accessibilityRole="button"
          >
            <Text style={s.primaryCtaText}>Save</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeRoot: { flex: 1, backgroundColor: "#f8fafc", paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm },
  keyboardAvoid: { flex: 1 },
  scroll: { flex: 1 },
  scrollInner: { flexGrow: 1, paddingHorizontal: SPACING.xs, paddingTop: SPACING.xs },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a", marginBottom: SPACING.xs },
  subtitle: { fontSize: 14, color: "#64748b", lineHeight: 20, marginBottom: SPACING.xs },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: SPACING.lg,
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  todayLabel: { fontSize: 13, fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 },
  dateValue: { fontSize: 14, color: "#0f172a", fontWeight: "600" },
  prompt: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: SPACING.xs,
  },
  scaleBlock: { marginTop: SPACING.xs },
  scaleTitle: { fontSize: 14, fontWeight: "600", color: "#0f172a", marginBottom: SPACING.sm },
  ratingTrack: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 999,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  ratingCell: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingCellOn: { backgroundColor: PRIMARY },
  ratingDigit: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  ratingDigitOn: { color: "#ffffff" },
  scaleCaption: {
    marginTop: SPACING.sm,
    textAlign: "center",
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  notesLabel: { fontSize: 14, fontWeight: "600", color: "#0f172a", marginBottom: SPACING.xs },
  notesInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 120,
    fontSize: 16,
    color: "#0f172a",
    lineHeight: 22,
    backgroundColor: "#fff",
  },
  disclaimer: {
    fontSize: 13,
    lineHeight: 18,
    color: "#64748b",
    marginTop: SPACING.md,
  },
  primaryCta: {
    marginTop: SPACING.sm,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryCtaPressed: { opacity: 0.92 },
  primaryCtaText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
