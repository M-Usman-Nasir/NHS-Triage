import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "./Card";
import { PrimaryButton } from "./PrimaryButton";
import {
  getUrgentTopNotice,
  normalizeOutcome,
  outcomePresentation,
  type ConsultationOutcome,
} from "../lib/outcomePresentation";
import { COLORS, TYPOGRAPHY } from "../lib/theme";

export type OutcomeViewProps = {
  headline: string;
  reasoningLine: string;
  actionLine: string;
  outcome?: ConsultationOutcome;
  onFindPharmacy?: () => void;
  referenceId?: string;
  referenceIds?: string;
  footer?: React.ReactNode;
};

function ActionSection({
  actionLine,
  outcome,
  onFindPharmacy,
}: {
  actionLine: string;
  outcome: ConsultationOutcome;
  onFindPharmacy?: () => void;
}) {
  const pres = outcomePresentation(outcome);
  const displayAction = actionLine || pres.actionLine;

  if (pres.actionVariant === "pharmacy") {
    return (
      <>
        <View style={s.pharmacyHighlight}>
          <Text style={s.highlightLabelPharmacy}>{pres.actionHighlightLabel}</Text>
          <Text style={s.actionBody}>{displayAction}</Text>
        </View>
        {onFindPharmacy ? (
          <PrimaryButton label="Find a pharmacy" onPress={onFindPharmacy} style={s.cta} />
        ) : null}
      </>
    );
  }

  if (pres.actionVariant === "gp") {
    return (
      <View style={s.gpHighlight}>
        <Text style={s.highlightLabelGp}>{pres.actionHighlightLabel}</Text>
        <Text style={s.actionBody}>{displayAction}</Text>
      </View>
    );
  }

  if (pres.actionVariant === "emergency") {
    const body = pres.emergencyCopy ?? displayAction;
    return (
      <View style={s.emergencyHighlight}>
        <Text style={s.highlightLabelEmergency}>{pres.actionHighlightLabel}</Text>
        <Text style={s.actionBody}>{body}</Text>
        <Pressable
          style={s.call999Cta}
          onPress={() => void Linking.openURL("tel:999")}
          accessibilityRole="button"
          accessibilityLabel="Call 999"
        >
          <MaterialCommunityIcons name="phone" size={20} color={COLORS.surface} />
          <Text style={s.call999CtaText}>Call 999 now</Text>
        </Pressable>
        {outcome === "urgent_care" ? (
          <Pressable
            style={s.call111Link}
            onPress={() => void Linking.openURL("tel:111")}
            accessibilityRole="link"
            accessibilityLabel="Call NHS 111"
          >
            <Text style={s.call111LinkText}>Call NHS 111</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return <Text style={s.actionBody}>{displayAction}</Text>;
}

export function OutcomeView({
  headline,
  reasoningLine,
  actionLine,
  outcome: outcomeProp,
  onFindPharmacy,
  referenceId,
  referenceIds,
  footer,
}: OutcomeViewProps) {
  const ref = referenceIds ?? referenceId;
  const outcome = normalizeOutcome(outcomeProp);
  const urgentNotice = getUrgentTopNotice(outcome);

  return (
    <View style={s.root}>
      {urgentNotice ? (
        <View style={s.urgentNotice} accessibilityRole="alert">
          <Text style={s.urgentNoticeTitle}>{urgentNotice.title}</Text>
          <Text style={s.urgentNoticeBody}>{urgentNotice.body}</Text>
        </View>
      ) : null}

      <Card style={s.section}>
        <Text style={s.sectionLabel}>Outcome</Text>
        <Text style={s.headline}>{headline}</Text>
      </Card>

      <Card style={s.section}>
        <Text style={s.sectionLabel}>Reasoning</Text>
        <Text style={s.reasoningPrefix}>Based on your symptoms:</Text>
        <Text style={s.reasoningBody}>{reasoningLine}</Text>
      </Card>

      <Card style={s.section}>
        <Text style={s.sectionLabel}>Action</Text>
        <ActionSection actionLine={actionLine} outcome={outcome} onFindPharmacy={onFindPharmacy} />
      </Card>

      {ref ? (
        <Text style={s.refLine} accessibilityLabel="Consultation reference">
          Reference: {ref}
        </Text>
      ) : null}

      <Text style={s.important}>Important</Text>
      <Text style={s.importantBody}>
        If your symptoms worsen or you develop new symptoms, seek medical help.
      </Text>

      {footer}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  urgentNotice: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.errorBg,
  },
  urgentNoticeTitle: { fontSize: 14, fontWeight: "700", color: COLORS.error, lineHeight: 20 },
  urgentNoticeBody: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20, marginTop: 4 },
  section: { marginTop: 12 },
  sectionLabel: { ...TYPOGRAPHY.label, marginBottom: 8 },
  headline: { ...TYPOGRAPHY.title, fontSize: 20 },
  reasoningPrefix: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: 4 },
  reasoningBody: { ...TYPOGRAPHY.body, lineHeight: 22 },
  actionBody: { ...TYPOGRAPHY.body, lineHeight: 22 },
  pharmacyHighlight: {
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.pharmacyHighlightBorder,
    backgroundColor: COLORS.pharmacyHighlightBg,
  },
  gpHighlight: {
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.gpHighlightBorder,
    backgroundColor: COLORS.gpHighlightBg,
  },
  emergencyHighlight: {
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.errorBg,
  },
  highlightLabelPharmacy: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.nhsBlue,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  highlightLabelGp: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.warning,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  highlightLabelEmergency: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.error,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  call999Cta: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 52,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    paddingVertical: 14,
  },
  call999CtaText: { color: COLORS.surface, fontSize: 17, fontWeight: "600" },
  call111Link: { marginTop: 10, alignSelf: "center", paddingVertical: 8 },
  call111LinkText: { fontSize: 15, fontWeight: "600", color: COLORS.textPrimary, textDecorationLine: "underline" },
  cta: { marginTop: 14 },
  refLine: { ...TYPOGRAPHY.caption, marginTop: 16 },
  important: { ...TYPOGRAPHY.label, marginTop: 20 },
  importantBody: { ...TYPOGRAPHY.caption, marginTop: 4 },
});
