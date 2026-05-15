/**
 * Clinical UI tokens — flat white canvas.
 * Blue (#005EB8) is for primary actions only (filled buttons, tab active, progress fill).
 * Use system fonts (Roboto / SF). No shadows or tinted panels.
 */
import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";

export const COLORS = {
  /** Primary actions only — filled buttons, tab active, progress fill. */
  nhsBlue: "#005EB8",
  nhsBlueDark: "#004A93",
  textPrimary: "#212B32",
  textSecondary: "#4C6272",
  textMuted: "#768692",
  background: "#FFFFFF",
  surface: "#FFFFFF",
  border: "#D8DDE0",
  /** Semantic — safety banners only, not decorative. */
  success: "#007F3B",
  warning: "#8B6914",
  warningBg: "#FFF9E6",
  error: "#D5281B",
  errorBg: "#FDECEA",
  selectedBorder: "#212B32",
  /** Action-section highlights only (pharmacy / GP pathways). */
  pharmacyHighlightBg: "#E8F4FC",
  pharmacyHighlightBorder: "#B3D4EF",
  gpHighlightBg: "#FFF9E6",
  gpHighlightBorder: "#E8D4A8",
} as const;

export const TYPOGRAPHY = {
  title: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const, color: COLORS.textPrimary },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: "600" as const, color: COLORS.textPrimary },
  body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const, color: COLORS.textPrimary },
  bodySecondary: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const, color: COLORS.textSecondary },
  caption: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const, color: COLORS.textSecondary },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600" as const,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
} as const;

export const RADII = {
  sm: 4,
  md: 8,
} as const;

export const COMPONENTS = StyleSheet.create({
  buttonPrimary: {
    backgroundColor: COLORS.nhsBlue,
    borderRadius: RADII.sm,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimaryText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonSecondary: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSecondaryText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  screenTitle: {
    ...TYPOGRAPHY.title,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
});

export function mergeTextStyle(base: TextStyle, extra?: TextStyle): TextStyle {
  return extra ? { ...base, ...extra } : base;
}

export function mergeViewStyle(base: ViewStyle, extra?: ViewStyle): ViewStyle {
  return extra ? { ...base, ...extra } : base;
}
