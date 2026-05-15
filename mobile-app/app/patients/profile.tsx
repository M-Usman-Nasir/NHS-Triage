import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/Card";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SecondaryButton } from "../../components/SecondaryButton";
import { Screen } from "../../components/Screen";
import { PATIENT_PROFILE_MOCK } from "../../lib/patientProfileMock";
import { SPACING } from "../../lib/spacing";
import type { RootStackParamList, RootTabParamList } from "../../App";
import { COLORS, TYPOGRAPHY } from "../../lib/theme";

export default function ProfilePage() {
  const tabNavigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  const openHomeScreen = (screen: keyof RootStackParamList, params?: object) => {
    tabNavigation.navigate("Home", {
      screen,
      params,
    } as never);
  };
  const [open, setOpen] = useState(false);
  const [personalExpanded, setPersonalExpanded] = useState(false);
  const [consultationExpanded, setConsultationExpanded] = useState(false);
  const [healthDetailsExpanded, setHealthDetailsExpanded] = useState(false);
  const [nhsConnectionsExpanded, setNhsConnectionsExpanded] = useState(true);
  const [connections, setConnections] = useState(PATIENT_PROFILE_MOCK.nhsConnections);
  const [nhsNumber, setNhsNumber] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const nhsRef = useRef<TextInput>(null);
  const dobRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const onNhsChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) {
      setNhsNumber(digits);
      return;
    }
    if (digits.length <= 6) {
      setNhsNumber(`${digits.slice(0, 3)} ${digits.slice(3)}`);
      return;
    }
    setNhsNumber(`${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`);
  };

  return (
    <Screen contentContainerStyle={s.scrollContent}>
      <View style={s.bottomPad}>
        <Text style={s.title}>My profile</Text>

        <Card style={s.card}>
        <Pressable
          style={({ pressed }) => [s.sectionRow, pressed && s.sectionRowPressed]}
          onPress={() => setPersonalExpanded((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded: personalExpanded }}
          accessibilityLabel="Personal information"
        >
          <Text style={s.sectionRowLabel}>Personal information</Text>
          <MaterialCommunityIcons
            name={personalExpanded ? "chevron-up" : "chevron-down"}
            size={22}
            color={COLORS.textMuted}
          />
        </Pressable>
        {personalExpanded ? (
          <>
            <View style={s.box}><Text style={s.body}>Name: {PATIENT_PROFILE_MOCK.name}</Text></View>
            <View style={s.box}><Text style={s.body}>Age: {PATIENT_PROFILE_MOCK.age}</Text></View>
            <View style={s.box}><Text style={s.body}>Date of birth: {PATIENT_PROFILE_MOCK.dob}</Text></View>
          </>
        ) : null}

        <Pressable
          style={({ pressed }) => [s.sectionRow, pressed && s.sectionRowPressed]}
          onPress={() => setConsultationExpanded((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded: consultationExpanded }}
          accessibilityLabel="Consultation history"
        >
          <Text style={s.sectionRowLabel}>Consultation history</Text>
          <MaterialCommunityIcons
            name={consultationExpanded ? "chevron-up" : "chevron-down"}
            size={22}
            color={COLORS.textMuted}
          />
        </Pressable>
        {consultationExpanded
          ? PATIENT_PROFILE_MOCK.consultationHistory.map((item) => (
              <View key={item.id} style={s.box}>
                <Text style={s.boxTitle}>{item.condition}</Text>
                <Text style={s.body}>{item.date} - {item.outcome}</Text>
              </View>
            ))
          : null}

        <Pressable
          style={({ pressed }) => [s.sectionRow, pressed && s.sectionRowPressed]}
          onPress={() => setHealthDetailsExpanded((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded: healthDetailsExpanded }}
          accessibilityLabel="Manage health details"
        >
          <Text style={s.sectionRowLabel}>Manage health details</Text>
          <MaterialCommunityIcons
            name={healthDetailsExpanded ? "chevron-up" : "chevron-down"}
            size={22}
            color={COLORS.textMuted}
          />
        </Pressable>
        {healthDetailsExpanded
          ? PATIENT_PROFILE_MOCK.healthDetails.map((d) => <Text key={d} style={s.body}>- {d}</Text>)
          : null}

        <Pressable
          style={({ pressed }) => [s.sectionRow, pressed && s.sectionRowPressed]}
          onPress={() => setNhsConnectionsExpanded((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded: nhsConnectionsExpanded }}
          accessibilityLabel="NHS connections"
        >
          <Text style={s.sectionRowLabel}>NHS connections</Text>
          <MaterialCommunityIcons
            name={nhsConnectionsExpanded ? "chevron-up" : "chevron-down"}
            size={22}
            color={COLORS.textMuted}
          />
        </Pressable>
        {nhsConnectionsExpanded ? (
          <>
            <SecondaryButton label="Connect NHS services" onPress={() => setOpen(true)} style={s.connectBtn} />
            {connections.map((c) => {
              const connected = c.status !== "not_connected";
              return (
                <View key={c.key} style={[s.box, connected && s.boxConnected]}>
                  <View style={s.connectionRow}>
                    <View style={s.connectionText}>
                      <Text style={s.boxTitle}>{c.label}</Text>
                      <Text style={connected ? s.connectedBody : s.body}>
                        {connected ? "Connected" : "Not connected"}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        ) : null}
        </Card>

        <Pressable
          style={s.legalLink}
          onPress={() => openHomeScreen("DataPrivacy", {})}
          accessibilityRole="link"
        >
          <Text style={s.legalLinkText}>Your data & privacy</Text>
        </Pressable>
        <Pressable
          style={s.legalLink}
          onPress={() => openHomeScreen("Privacy")}
          accessibilityRole="link"
        >
          <Text style={s.legalLinkText}>Privacy notice</Text>
        </Pressable>
        <Pressable
          style={s.legalLink}
          onPress={() => openHomeScreen("Terms")}
          accessibilityRole="link"
        >
          <Text style={s.legalLinkText}>Terms</Text>
        </Pressable>
        <Pressable
          style={s.legalLink}
          onPress={() => openHomeScreen("Accessibility")}
          accessibilityRole="link"
        >
          <Text style={s.legalLinkText}>Accessibility statement</Text>
        </Pressable>
      </View>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView
          style={s.modalRoot}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <SafeAreaView style={s.modalSafe} edges={["top", "left", "right", "bottom"]}>
            <ScrollView
              style={s.modalScrollView}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={s.modalScroll}
              showsVerticalScrollIndicator
            >
              <View style={s.modalCard}>
                <View style={s.modalHeader}>
                  <Text style={s.modalTitle} accessibilityRole="header">
                    Connect NHS services
                  </Text>
                  <Pressable
                    style={({ pressed }) => [s.modalClose, pressed && s.sectionRowPressed]}
                    onPress={() => setOpen(false)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel="Close form"
                  >
                    <MaterialCommunityIcons name="close" size={26} color={COLORS.textMuted} />
                  </Pressable>
                </View>
                <Text style={s.modalIntro}>
                  Enter the details we can use to verify you. All fields are optional in this demo — tap continue when
                  you are ready.
                </Text>

                <View style={s.fieldBlock}>
                  <Text style={s.fieldLabel}>NHS number</Text>
                  <Text style={s.fieldHint}>10 digits, usually shown as three groups (e.g. 485 777 3456)</Text>
                  <TextInput
                    ref={nhsRef}
                    style={s.input}
                    value={nhsNumber}
                    onChangeText={onNhsChange}
                    placeholder="000 000 0000"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    maxLength={12}
                    autoCorrect={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => dobRef.current?.focus()}
                    textContentType="none"
                    accessibilityLabel="NHS number"
                  />
                </View>

                <View style={s.fieldBlock}>
                  <Text style={s.fieldLabel}>Date of birth</Text>
                  <Text style={s.fieldHint}>Use the format you use for NHS records (e.g. 15/03/1990)</Text>
                  <TextInput
                    ref={dobRef}
                    style={s.input}
                    value={dob}
                    onChangeText={setDob}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numbers-and-punctuation"
                    autoCorrect={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => emailRef.current?.focus()}
                    textContentType="birthdate"
                    accessibilityLabel="Date of birth"
                  />
                </View>

                <View style={s.fieldBlock}>
                  <Text style={s.fieldLabel}>Email</Text>
                  <Text style={s.fieldHint}>We will only use this for NHS-related updates in a real app</Text>
                  <TextInput
                    ref={emailRef}
                    style={s.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => phoneRef.current?.focus()}
                    textContentType="emailAddress"
                    autoComplete="email"
                    accessibilityLabel="Email address"
                  />
                </View>

                <View style={s.fieldBlock}>
                  <Text style={s.fieldLabel}>Mobile number</Text>
                  <Text style={s.fieldHint}>UK mobile, including the leading 0</Text>
                  <TextInput
                    ref={phoneRef}
                    style={s.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="07XXX XXXXXX"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={() => phoneRef.current?.blur()}
                    textContentType="telephoneNumber"
                    autoComplete="tel"
                    accessibilityLabel="Mobile phone number"
                  />
                </View>

                <View style={s.modalActions}>
                  <PrimaryButton
                    label="Continue"
                    onPress={() => {
                      setConnections((cur) => cur.map((c) => ({ ...c, status: "connected" })));
                      setOpen(false);
                    }}
                  />
                  <SecondaryButton label="Cancel" onPress={() => setOpen(false)} />
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const s = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  bottomPad: {
    paddingBottom: 96,
    gap: SPACING.sm,
  },
  modalRoot: { flex: 1 },
  modalSafe: { flex: 1, backgroundColor: COLORS.background },
  modalScrollView: { flex: 1 },
  modalScroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: SPACING.md,
    marginBottom: SPACING.xs,
  },
  modalTitle: { flex: 1, ...TYPOGRAPHY.heading, lineHeight: 26 },
  modalClose: { padding: 4, marginTop: -2 },
  modalIntro: { ...TYPOGRAPHY.caption, marginBottom: SPACING.sm },
  fieldBlock: { marginBottom: SPACING.sm },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, marginBottom: SPACING.xs },
  fieldHint: { fontSize: 12, color: COLORS.textMuted, lineHeight: 16, marginBottom: SPACING.sm },
  modalActions: { marginTop: SPACING.md, gap: SPACING.sm },
  card: { gap: SPACING.sm },
  connectBtn: { marginBottom: SPACING.sm },
  title: { ...TYPOGRAPHY.title, marginBottom: SPACING.xs },
  legalLink: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.xs },
  legalLinkText: { fontSize: 15, fontWeight: "600", color: COLORS.textPrimary, textDecorationLine: "underline" },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    paddingVertical: SPACING.xs,
  },
  sectionRowPressed: { opacity: 0.7 },
  sectionRowLabel: { flex: 1, fontSize: 16, fontWeight: "700", color: COLORS.textPrimary, paddingRight: SPACING.sm },
  body: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  box: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
  },
  boxConnected: { borderColor: COLORS.selectedBorder },
  connectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: SPACING.md },
  connectionText: { flex: 1, minWidth: 0 },
  connectedBody: { fontSize: 14, color: COLORS.success, fontWeight: "600", lineHeight: 20 },
  boxTitle: { fontWeight: "700", color: COLORS.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    minHeight: 48,
  },
});
