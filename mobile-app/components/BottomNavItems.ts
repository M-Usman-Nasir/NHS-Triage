export type BottomNavRoute = "Home" | "Checks" | "Track" | "Advice" | "Profile";

export const BOTTOM_NAV_ITEMS: Record<BottomNavRoute, { label: string; icon: string }> = {
  Home: { label: "Home", icon: "⌂" },
  Checks: { label: "Checks", icon: "✓" },
  Track: { label: "Track", icon: "↗" },
  Advice: { label: "Advice", icon: "✦" },
  Profile: { label: "Profile", icon: "◉" },
};
