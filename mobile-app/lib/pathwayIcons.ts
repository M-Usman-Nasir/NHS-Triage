/** MaterialCommunityIcons names for patient pathway list rows (functional scanability). */

const PATHWAY_ICONS: Record<string, string> = {
  uti: "cup-water",
  sore_throat: "account-voice",
  sinusitis: "head-flash-outline",
  otitis_media: "ear-hearing",
  insect_bites: "bug-outline",
  impetigo: "bandage",
  shingles: "flash-outline",
};

export function pathwayIconName(code: string): string | undefined {
  return PATHWAY_ICONS[code];
}
