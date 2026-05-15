import { useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  CONSENT_CHECKBOX_LABEL,
  CONSENT_COPY_VERSION,
  DATA_MINIMISATION_POINTS,
  DATA_PROCESSING_PURPOSE,
  DATA_SECURITY_POINTS,
  PRIVACY_LINK_LABEL,
  TERMS_LINK_LABEL,
} from "../lib/complianceContent";
import { COLORS, TYPOGRAPHY } from "../lib/theme";

type Props = {
  consentGiven: boolean;
  onConsentChange: (value: boolean) => void;
  onPrivacyPress: () => void;
  onTermsPress: () => void;
};

export function GdprConsentPanel({ consentGiven, onConsentChange, onPrivacyPress, onTermsPress }: Props) {
  const [securityOpen, setSecurityOpen] = useState(false);

  return (
    <View style={s.panel}>
      <Text style={s.sectionLabel}>Purpose</Text>
      <Text style={s.body}>{DATA_PROCESSING_PURPOSE}</Text>

      <Text style={[s.sectionLabel, s.sectionSpaced]}>What we collect (data minimisation)</Text>
      {DATA_MINIMISATION_POINTS.map((point) => (
        <Text key={point} style={s.bullet}>
          {"\u2022"} {point}
        </Text>
      ))}

      <Pressable
        style={s.securityToggle}
        onPress={() => setSecurityOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: securityOpen }}
      >
        <Text style={s.securityToggleText}>How we protect your data</Text>
        <MaterialCommunityIcons
          name={securityOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={COLORS.textMuted}
        />
      </Pressable>
      {securityOpen
        ? DATA_SECURITY_POINTS.map((point) => (
            <Text key={point} style={s.bullet}>
              {"\u2022"} {point}
            </Text>
          ))
        : null}

      <Text style={s.emergency}>
        Life-threatening emergency? Call <Text style={s.emergencyBold}>999</Text> immediately.
      </Text>

      <Pressable
        style={s.checkboxRow}
        onPress={() => onConsentChange(!consentGiven)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: consentGiven }}
      >
        <View style={[s.checkboxOuter, consentGiven && s.checkboxOuterOn]}>
          {consentGiven ? (
            <MaterialCommunityIcons name="check" size={16} color={COLORS.textPrimary} />
          ) : null}
        </View>
        <Text style={s.checkboxLabel}>{CONSENT_CHECKBOX_LABEL}</Text>
      </Pressable>

      <Text style={s.footer}>
        Read our{" "}
        <Text style={s.link} onPress={onPrivacyPress}>
          {PRIVACY_LINK_LABEL}
        </Text>{" "}
        and{" "}
        <Text style={s.link} onPress={onTermsPress}>
          {TERMS_LINK_LABEL}
        </Text>
        . Consent version: {CONSENT_COPY_VERSION}.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  panel: {
    marginTop: 14,
    padding: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.warningBg,
  },
  sectionLabel: { ...TYPOGRAPHY.label, color: COLORS.textPrimary },
  sectionSpaced: { marginTop: 12 },
  body: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary, marginTop: 4, lineHeight: 20 },
  bullet: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary, marginTop: 4, lineHeight: 20 },
  securityToggle: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  securityToggleText: { ...TYPOGRAPHY.caption, fontWeight: "700", color: COLORS.textPrimary, flex: 1 },
  emergency: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary, marginTop: 12, lineHeight: 20 },
  emergencyBold: { fontWeight: "700" },
  checkboxRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginTop: 12 },
  checkboxOuter: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
  },
  checkboxOuterOn: { borderColor: COLORS.selectedBorder },
  checkboxLabel: { flex: 1, ...TYPOGRAPHY.caption, fontWeight: "600", color: COLORS.textPrimary },
  footer: { ...TYPOGRAPHY.caption, marginTop: 10, lineHeight: 20 },
  link: { fontWeight: "600", textDecorationLine: "underline", color: COLORS.textPrimary },
});
