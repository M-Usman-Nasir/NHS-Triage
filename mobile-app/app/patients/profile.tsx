import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "../../components/Screen";
import { PATIENT_PROFILE_MOCK } from "../../lib/patientProfileMock";

export default function ProfilePage() {
  const [open, setOpen] = useState(false);
  const [connections, setConnections] = useState(PATIENT_PROFILE_MOCK.nhsConnections);
  const [nhsNumber, setNhsNumber] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <Screen>
      <View style={s.card}>
        <Text style={s.brand}>Care Path</Text>
        <Text style={s.subtitle}>My profile</Text>
        <Text style={s.title}>My profile</Text>
        <Text style={s.body}>Your details, consultation history, and NHS connection readiness in one place.</Text>

        <Text style={s.section}>Personal information</Text>
        <View style={s.box}><Text style={s.body}>Name: {PATIENT_PROFILE_MOCK.name}</Text></View>
        <View style={s.box}><Text style={s.body}>Age: {PATIENT_PROFILE_MOCK.age}</Text></View>
        <View style={s.box}><Text style={s.body}>DOB: {PATIENT_PROFILE_MOCK.dob}</Text></View>

        <Text style={s.section}>Consultation history</Text>
        {PATIENT_PROFILE_MOCK.consultationHistory.map((item) => (
          <View key={item.id} style={s.box}>
            <Text style={s.boxTitle}>{item.condition}</Text>
            <Text style={s.body}>{item.date} - {item.outcome}</Text>
          </View>
        ))}

        <Text style={s.section}>Manage health details</Text>
        {PATIENT_PROFILE_MOCK.healthDetails.map((d) => <Text key={d} style={s.body}>- {d}</Text>)}

        <Text style={s.section}>NHS connections</Text>
        <Pressable style={s.cta} onPress={() => setOpen(true)}><Text style={s.ctaText}>Connect NHS services</Text></Pressable>
        {connections.map((c) => (
          <View key={c.key} style={s.box}>
            <Text style={s.boxTitle}>{c.label}</Text>
            <Text style={s.body}>{c.status === "not_connected" ? "Not connected" : c.status}</Text>
          </View>
        ))}
      </View>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <Screen>
          <View style={s.card}>
            <Text style={s.title}>Connect NHS services</Text>
            <Text style={s.body}>Verify your details and choose what to connect. Demo flow only.</Text>
            <TextInput style={s.input} value={nhsNumber} onChangeText={setNhsNumber} placeholder="NHS number" />
            <TextInput style={s.input} value={dob} onChangeText={setDob} placeholder="Date of birth" />
            <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="Email" />
            <TextInput style={s.input} value={phone} onChangeText={setPhone} placeholder="Phone number" />
            <Pressable
              style={s.cta}
              onPress={() => {
                setConnections((cur) => cur.map((c) => ({ ...c, status: "connected" })));
                setOpen(false);
              }}
            >
              <Text style={s.ctaText}>Connect NHS services</Text>
            </Pressable>
            <Pressable style={s.secondary} onPress={() => setOpen(false)}><Text style={s.secondaryText}>Cancel</Text></Pressable>
          </View>
        </Screen>
      </Modal>
    </Screen>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: "#ffffff", borderRadius: 14, borderWidth: 1, borderColor: "#e2e8f0", padding: 16, gap: 8 },
  brand: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 12, color: "#475569" },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a", marginTop: 8 },
  section: { marginTop: 8, fontSize: 16, fontWeight: "700", color: "#0f172a" },
  body: { fontSize: 14, color: "#334155", lineHeight: 20 },
  box: { borderRadius: 12, borderWidth: 1, borderColor: "#cbd5e1", backgroundColor: "#fff", padding: 10 },
  boxTitle: { fontWeight: "700", color: "#0f172a" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 10 },
  cta: { borderRadius: 14, backgroundColor: "#2563eb", paddingVertical: 14, alignItems: "center", marginTop: 8 },
  ctaText: { color: "#fff", fontWeight: "800" },
  secondary: { borderRadius: 12, borderWidth: 1, borderColor: "#93c5fd", backgroundColor: "#fff", paddingVertical: 12, alignItems: "center", marginTop: 4 },
  secondaryText: { color: "#1d4ed8", fontWeight: "700" },
});
