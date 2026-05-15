import { StyleSheet, Text, View } from "react-native";
import { TYPOGRAPHY } from "../lib/theme";

export type LegalSection = {
  title: string;
  body: string;
};

type Props = {
  sections: readonly LegalSection[];
  preamble?: string;
};

export function LegalSections({ sections, preamble }: Props) {
  return (
    <View>
      {preamble ? <Text style={s.preamble}>{preamble}</Text> : null}
      {sections.map((section) => (
        <View key={section.title} style={s.block}>
          <Text style={s.heading}>{section.title}</Text>
          <Text style={s.body}>{section.body}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  preamble: { ...TYPOGRAPHY.caption, marginBottom: 12 },
  block: { marginTop: 12 },
  heading: { ...TYPOGRAPHY.heading, fontSize: 16 },
  body: { ...TYPOGRAPHY.bodySecondary, marginTop: 6, lineHeight: 22 },
});
