import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "./Card";
import { ListRow } from "./ListRow";
import { PrimaryButton } from "./PrimaryButton";
import { RED_FLAG_NONE_ID } from "../lib/redFlagRouting";
import type { RedFlagChecklistItem } from "../lib/pathwayTypes";
import { SPACING } from "../lib/spacing";
import { COLORS, TYPOGRAPHY } from "../lib/theme";

type Props = {
  items: RedFlagChecklistItem[];
  onContinue: (selectedIds: string[], noneSelected: boolean) => void;
  error?: string;
};

export function RedFlagChecklist({ items, onContinue, error }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [noneSelected, setNoneSelected] = useState(false);
  const singleItem = items.length === 1 ? items[0] : null;

  const toggle = (id: string) => {
    if (id === RED_FLAG_NONE_ID) {
      setNoneSelected(true);
      setSelectedIds([]);
      return;
    }
    if (singleItem) {
      setNoneSelected(false);
      setSelectedIds([id]);
      return;
    }
    setNoneSelected(false);
    setSelectedIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const canContinue = noneSelected || selectedIds.length > 0;

  return (
    <View>
      <Text style={s.title}>
        {singleItem ? "Do you have this symptom?" : "Do you have any of these symptoms?"}
      </Text>
      <Text style={s.subtitle}>
        {singleItem
          ? "Select the option that applies to you."
          : "Tick all that apply. If you are unsure, choose the closest option."}
      </Text>

      <Card style={s.card}>
        {singleItem ? (
          <>
            <ListRow
              title={singleItem.label}
              selected={selectedIds.includes(singleItem.id)}
              showChevron={false}
              last={false}
              onPress={() => toggle(singleItem.id)}
            />
            <ListRow
              title="No, I don't have this"
              selected={noneSelected}
              showChevron={false}
              last
              onPress={() => toggle(RED_FLAG_NONE_ID)}
            />
          </>
        ) : (
          <>
            {items.map((item) => (
              <ListRow
                key={item.id}
                title={item.label}
                selected={selectedIds.includes(item.id)}
                showChevron={false}
                last={false}
                onPress={() => toggle(item.id)}
              />
            ))}
            <ListRow
              title="None of these"
              selected={noneSelected}
              showChevron={false}
              last
              onPress={() => toggle(RED_FLAG_NONE_ID)}
            />
          </>
        )}
      </Card>

      {error ? <Text style={s.error}>{error}</Text> : null}

      <PrimaryButton
        label="Continue"
        disabled={!canContinue}
        onPress={() => onContinue(selectedIds, noneSelected)}
        style={s.cta}
      />
    </View>
  );
}

const s = StyleSheet.create({
  title: { ...TYPOGRAPHY.title, marginTop: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.bodySecondary, marginTop: 6, marginBottom: SPACING.md },
  card: { padding: 0, overflow: "hidden" },
  error: { marginTop: SPACING.sm, fontSize: 14, fontWeight: "600", color: COLORS.error },
  cta: { marginTop: SPACING.xl },
});
