import {
  getFocusedRouteNameFromRoute,
  NavigationContainer,
  type NavigatorScreenParams,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { StatusBar } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import AccessibilityPage from "./app/patients/accessibility";
import ConsultationPage from "./app/patients/consultation";
import EmergencyPage from "./app/patients/emergency";
import FindPharmacyPage from "./app/patients/findPharmacy";
import PatientsLanding from "./app/patients";
import DataPrivacyPage from "./app/patients/dataPrivacy";
import PrivacyPage from "./app/patients/privacy";
import ProfilePage from "./app/patients/profile";
import ResultPage from "./app/patients/result";
import SplashPage from "./app/patients/splash";
import SymptomSelectionPage from "./app/patients/symptomSelection";
import TermsPage from "./app/patients/terms";
import AdvicePage from "./app/tabs/advice";
import ChecksPage from "./app/tabs/checks";
import TrackPage from "./app/tabs/track";
import { BOTTOM_NAV_ITEMS, BOTTOM_TAB_BAR, bottomTabBarWithInsets, type BottomNavRoute } from "./components/BottomNavItems";
import { COLORS } from "./lib/theme";

export type RootStackParamList = {
  Patients: undefined;
  SymptomSelection: { initialCodes?: string };
  Consultation: { pathways?: string };
  Emergency: { question?: string; from?: string; flags?: string[] };
  FindPharmacy: undefined;
  Result: {
    id?: string;
    ids?: string;
    outcome?: string;
    outcomeReason?: string;
    pathwayCodes?: string;
    reasoningSteps?: string;
    actionLine?: string;
    answersSnapshot?: string;
  };
  Privacy: undefined;
  Terms: undefined;
  DataPrivacy: { consultationId?: string };
  Accessibility: undefined;
};

type RootAppStackParamList = {
  Splash: undefined;
  MainTabs: undefined;
};

export type RootTabParamList = {
  Home: NavigatorScreenParams<RootStackParamList> | undefined;
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
      <Stack.Screen name="Consultation" component={ConsultationPage} options={{ keyboardHandlingEnabled: true }} />
      <Stack.Screen name="Emergency" component={EmergencyPage} />
      <Stack.Screen name="FindPharmacy" component={FindPharmacyPage} />
      <Stack.Screen name="Result" component={ResultPage} />
      <Stack.Screen name="Privacy" component={PrivacyPage} />
      <Stack.Screen name="DataPrivacy" component={DataPrivacyPage} />
      <Stack.Screen name="Terms" component={TermsPage} />
      <Stack.Screen name="Accessibility" component={AccessibilityPage} />
    </Stack.Navigator>
  );
}

function RootTabs() {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const tabBarStyle = bottomTabBarWithInsets(bottomInset);

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabel: BOTTOM_NAV_ITEMS[route.name as BottomNavRoute].label,
        tabBarIcon: ({ color, focused }) => {
          const item = BOTTOM_NAV_ITEMS[route.name as BottomNavRoute];
          const name = focused ? item.iconFocused : item.icon;
          return (
            <MaterialCommunityIcons
              name={name}
              size={BOTTOM_TAB_BAR.iconSize}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: COLORS.nhsBlue,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: tabBarStyle,
        tabBarLabelStyle: {
          fontSize: BOTTOM_TAB_BAR.labelFontSize,
          fontWeight: BOTTOM_TAB_BAR.labelFontWeight,
        },
      })}
    >
      <Tabs.Screen
        name="Home"
        component={HomeStack}
        options={({ route }) => {
          const focused = getFocusedRouteNameFromRoute(route) ?? "Patients";
          const hideTabBar = focused === "Consultation" || focused === "SymptomSelection";
          return {
            tabBarStyle: hideTabBar ? { display: "none" } : tabBarStyle,
          };
        }}
      />
      <Tabs.Screen name="Checks" component={ChecksPage} />
      <Tabs.Screen name="Track" component={TrackPage} />
      <Tabs.Screen name="Advice" component={AdvicePage} />
      <Tabs.Screen name="Profile" component={ProfilePage} />
    </Tabs.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <AppStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
          <AppStack.Screen name="Splash" component={SplashPage} />
          <AppStack.Screen name="MainTabs" component={RootTabs} />
        </AppStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}