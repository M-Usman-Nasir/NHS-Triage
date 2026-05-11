import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "../../components/Screen";
import { SPACING } from "../../lib/spacing";

const PRIMARY = "#2563eb";
const RATING_TRACK = "#f2f2f7";
const BORDER = "#e5e5ea";

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
  const [soreThroat, setSoreThroat] = useState(3);
  const [fever, setFever] = useState(1);
  const [notes, setNotes] = useState(
    "Feeling a bit better than yesterday. Still painful when swallowing."
  );

  const todayLine = useMemo(() => formatTodayLong(new Date()), []);

  return (
    <Screen>
      <View style={s.wrap}>
        <Text style={s.pageTitle}>Track your symptoms</Text>

        <View style={s.dateRow}>
          <Text style={s.todayLabel}>Today</Text>
          <Text style={s.dateValue}>{todayLine}</Text>
        </View>

        <Text style={s.prompt}>How are you feeling today?</Text>

        <RatingScale label="Sore throat" value={soreThroat} onChange={setSoreThroat} labels={THROAT_LABELS} />
        <RatingScale label="Fever" value={fever} onChange={setFever} labels={FEVER_LABELS} />

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
        />

        <Text style={s.disclaimer}>
          This is not monitored in real time. If you feel worse, seek medical help.
        </Text>

        <Pressable style={({ pressed }) => [s.saveBtn, pressed && s.saveBtnPressed]} onPress={() => {}} accessibilityRole="button">
          <Text style={s.saveBtnText}>Save</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.screenInset,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  todayLabel: { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  dateValue: { fontSize: 15, color: "#64748b", fontWeight: "400" },
  prompt: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: SPACING.lg,
  },
  scaleBlock: { marginBottom: SPACING.xl },
  scaleTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a", marginBottom: SPACING.sm },
  ratingTrack: {
    flexDirection: "row",
    backgroundColor: RATING_TRACK,
    borderRadius: 999,
    padding: 4,
    gap: 4,
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
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  notesLabel: { fontSize: 16, fontWeight: "700", color: "#0f172a", marginBottom: SPACING.sm },
  notesInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 120,
    fontSize: 16,
    color: "#0f172a",
    lineHeight: 22,
    marginBottom: SPACING.lg,
    backgroundColor: "#fff",
  },
  disclaimer: {
    fontSize: 13,
    lineHeight: 18,
    color: "#64748b",
    marginBottom: SPACING.lg,
  },
  saveBtn: {
    borderRadius: 12,
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnPressed: { opacity: 0.9 },
  saveBtnText: { color: "#ffffff", fontSize: 17, fontWeight: "700" },
});
