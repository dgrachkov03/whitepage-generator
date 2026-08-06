export const TYPOGRAPHY_PRESETS = [
  {
    id: "balanced",
    display: "inter",
    body: "inter",
    mono: "ibm-plex-mono",
    rhythm: "balanced",
  },
  {
    id: "modern",
    display: "space-grotesk",
    body: "instrument-sans",
    mono: "jetbrains-mono",
    rhythm: "tight",
  },
  {
    id: "swiss",
    display: "bricolage-grotesque",
    body: "instrument-sans",
    mono: "ibm-plex-mono",
    rhythm: "compact",
  },
  {
    id: "warm",
    display: "bricolage-grotesque",
    body: "instrument-sans",
    mono: "dm-mono",
    rhythm: "airy",
  },
  {
    id: "tech",
    display: "sora",
    body: "plus-jakarta-sans",
    mono: "jetbrains-mono",
    rhythm: "tight",
  },
  {
    id: "humanist",
    display: "manrope",
    body: "instrument-sans",
    mono: "space-mono",
    rhythm: "balanced",
  },
  {
    id: "corporate",
    display: "montserrat",
    body: "noto-sans",
    mono: "ibm-plex-mono",
    rhythm: "compact",
  },
  {
    id: "friendly",
    display: "poppins",
    body: "noto-sans",
    mono: "dm-mono",
    rhythm: "airy",
  },
  {
    id: "marketing",
    display: "poppins",
    body: "instrument-sans",
    mono: "jetbrains-mono",
    rhythm: "balanced",
  },
  {
    id: "outfit-clean",
    display: "outfit",
    body: "instrument-sans",
    mono: "space-mono",
    rhythm: "tight",
  },
];

export function getTypographyPresetById(id) {
  const preset = TYPOGRAPHY_PRESETS.find((entry) => entry.id === id);

  if (!preset) {
    throw new Error(`Unknown typography preset: ${id}`);
  }

  return preset;
}
