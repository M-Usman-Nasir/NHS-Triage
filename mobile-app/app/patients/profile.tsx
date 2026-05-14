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
import { Screen } from "../../components/Screen";
import { PATIENT_PROFILE_MOCK } from "../../lib/patientProfileMock";
import { SPACING } from "../../lib/spacing";

export default function ProfilePage() {
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
        <Text style={s.subtitle}>
          Your details, consultation history, and NHS connection readiness in one place.
        </Text>

        <View style={s.card}>
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
            color="#64748b"
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
            color="#64748b"
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
            color="#64748b"
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
            color="#64748b"
          />
        </Pressable>
        {nhsConnectionsExpanded ? (
          <>
            <Pressable style={s.cta} onPress={() => setOpen(true)}><Text style={s.ctaText}>Connect NHS services</Text></Pressable>
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
                    {connected ? (
                      <MaterialCommunityIcons name="check-circle" size={28} color="#16a34a" accessibilityLabel="Connected" />
                    ) : null}
                  </View>
                </View>
              );
            })}
          </>
        ) : null}
        </View>
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
                    <MaterialCommunityIcons name="close" size={26} color="#64748b" />
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
                  <Pressable
                    style={s.cta}
                    onPress={() => {
                      setConnections((cur) => cur.map((c) => ({ ...c, status: "connected" })));
                      setOpen(false);
                    }}
                  >
                    <Text style={s.ctaText}>Continue</Text>
                  </Pressable>
                  <Pressable style={s.secondary} onPress={() => setOpen(false)}>
                    <Text style={s.secondaryText}>Cancel</Text>
                  </Pressable>
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
  modalSafe: { flex: 1, backgroundColor: "#f8fafc" },
  modalScrollView: { flex: 1 },
  modalScroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
  modalTitle: { flex: 1, fontSize: 20, fontWeight: "700", color: "#0f172a", lineHeight: 26 },
  modalClose: { padding: 4, marginTop: -2 },
  modalIntro: { fontSize: 14, color: "#64748b", lineHeight: 20, marginBottom: SPACING.sm },
  fieldBlock: { marginBottom: SPACING.sm },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: "#0f172a", marginBottom: SPACING.xs },
  fieldHint: { fontSize: 12, color: "#64748b", lineHeight: 16, marginBottom: SPACING.sm },
  modalActions: { marginTop: SPACING.md, gap: SPACING.sm },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a", marginBottom: SPACING.xs },
  subtitle: { fontSize: 14, color: "#64748b", lineHeight: 20, marginBottom: SPACING.xs },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    paddingVertical: SPACING.xs,
  },
  sectionRowPressed: { opacity: 0.7 },
  sectionRowLabel: { flex: 1, fontSize: 16, fontWeight: "700", color: "#0f172a", paddingRight: SPACING.sm },
  body: { fontSize: 14, color: "#334155", lineHeight: 20 },
  box: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    padding: SPACING.md,
  },
  boxConnected: { borderColor: "#bbf7d0", backgroundColor: "#f0fdf4" },
  connectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: SPACING.md },
  connectionText: { flex: 1, minWidth: 0 },
  connectedBody: { fontSize: 14, color: "#15803d", fontWeight: "600", lineHeight: 20 },
  boxTitle: { fontWeight: "700", color: "#0f172a" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0f172a",
    minHeight: 48,
  },
  cta: {
    borderRadius: 12,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondary: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: "#fff",
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: { color: "#1d4ed8", fontWeight: "700", fontSize: 15 },
});
