import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { StatusBar } from "react-native";
import AccessibilityPage from "./app/patients/accessibility";
import ConsultationPage from "./app/patients/consultation";
import FindPharmacyPage from "./app/patients/findPharmacy";
import PatientsLanding from "./app/patients";
import PrivacyPage from "./app/patients/privacy";
import ProfilePage from "./app/patients/profile";
import ResultPage from "./app/patients/result";
import SplashPage from "./app/patients/splash";
import SymptomSelectionPage from "./app/patients/symptomSelection";
import TermsPage from "./app/patients/terms";
import AdvicePage from "./app/tabs/advice";
import ChecksPage from "./app/tabs/checks";
import TrackPage from "./app/tabs/track";

export type RootStackParamList = {
  Patients: undefined;
  SymptomSelection: undefined;
  Consultation: { pathways?: string };
  FindPharmacy: undefined;
  Result: undefined;
  Profile: undefined;
  Privacy: undefined;
  Terms: undefined;
  Accessibility: undefined;
};

type RootAppStackParamList = {
  Splash: undefined;
  MainTabs: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Checks: undefined;
  Track: undefined;
  Advice: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AppStack = createNativeStackNavigator<RootAppStackParamList>();
const Tabs = createBottomTabNavigator<RootTabParamList>();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Patients">
      <Stack.Screen name="Patients" component={PatientsLanding} />
      <Stack.Screen name="SymptomSelection" component={SymptomSelectionPage} />
      <Stack.Screen name="Consultation" component={ConsultationPage} />
      <Stack.Screen name="FindPharmacy" component={FindPharmacyPage} />
      <Stack.Screen name="Result" component={ResultPage} />
      <Stack.Screen name="Profile" component={ProfilePage} />
      <Stack.Screen name="Privacy" component={PrivacyPage} />
      <Stack.Screen name="Terms" component={TermsPage} />
      <Stack.Screen name="Accessibility" component={AccessibilityPage} />
    </Stack.Navigator>
  );
}

function RootTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          const iconNameByRoute: Record<keyof RootTabParamList, string> = {
            Home: focused ? "home" : "home-outline",
            Checks: focused ? "clipboard-check" : "clipboard-check-outline",
            Track: focused ? "chart-line" : "chart-line",
            Advice: focused ? "shield-check" : "shield-check-outline",
            Profile: focused ? "account" : "account-outline",
          };
          return (
            <MaterialCommunityIcons
              name={iconNameByRoute[route.name as keyof RootTabParamList]}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: { height: 62, paddingBottom: 8, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
      })}
    >
      <Tabs.Screen name="Home" component={HomeStack} />
      <Tabs.Screen name="Checks" component={ChecksPage} />
      <Tabs.Screen name="Track" component={TrackPage} />
      <Tabs.Screen name="Advice" component={AdvicePage} />
      <Tabs.Screen name="Profile" component={ProfilePage} />
    </Tabs.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <AppStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <AppStack.Screen name="Splash" component={SplashPage} />
        <AppStack.Screen name="MainTabs" component={RootTabs} />
      </AppStack.Navigator>
    </NavigationContainer>
  );
}