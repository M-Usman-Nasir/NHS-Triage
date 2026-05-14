export type BottomNavRoute = "Home" | "Checks" | "Track" | "Advice" | "Profile";

/** MaterialCommunityIcons glyph names (react-native-vector-icons). */
export type BottomNavItem = {
  label: string;
  icon: string;
  iconFocused: string;
};

export const BOTTOM_NAV_ITEMS: Record<BottomNavRoute, BottomNavItem> = {
  Home: { label: "Home", icon: "home-outline", iconFocused: "home" },
  Checks: { label: "My checks", icon: "clipboard-check-outline", iconFocused: "clipboard-check" },
  Track: { label: "Progress", icon: "chart-line", iconFocused: "chart-line" },
  Advice: { label: "Advice", icon: "shield-check-outline", iconFocused: "shield-check" },
  Profile: { label: "My profile", icon: "account-outline", iconFocused: "account" },
};

/** Tab bar layout — keep in sync with `RootTabs` in `App.tsx`. */
export const BOTTOM_TAB_BAR = {
  /** Content height excluding OS home-indicator / gesture inset (see `bottomTabBarWithInsets`). */
  height: 62,
  paddingTop: 6,
  paddingBottom: 6,
  iconSize: 24,
  labelFontSize: 12,
  labelFontWeight: "700" as const,
};

/**
 * Tab bar `height` / `paddingBottom` must include `bottomInset` so icons and labels sit above
 * Android gesture navigation and the iOS home indicator.
 */
export function bottomTabBarWithInsets(bottomInset: number) {
  const extra = Math.max(0, bottomInset);
  return {
    height: BOTTOM_TAB_BAR.height + extra,
    paddingBottom: BOTTOM_TAB_BAR.paddingBottom + extra,
    paddingTop: BOTTOM_TAB_BAR.paddingTop,
  };
}