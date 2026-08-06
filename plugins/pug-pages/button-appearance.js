export const BUTTON_ICON_PRESETS = [
  { icon: "none" },
  { icon: "arrow-right" },
  { icon: "arrow-long-right" },
  { icon: "arrow-up-right" },
];

const GLOBAL_BUTTON_ICONS = new Set(
  BUTTON_ICON_PRESETS.filter((preset) => preset.icon !== "none").map(
    (preset) => preset.icon,
  ),
);

const LINK_BUTTON_VARIANTS = new Set(["primary", "inverse", "inverse-outline"]);

export { resolveButtonLibraryIcon } from "./assets/icon-aliases.js";

export function resolveButtonIcon(options = {}, pageAppearance = {}) {
  const variant = options.variant || "primary";

  if (options.icon) {
    return options.icon;
  }

  if (!LINK_BUTTON_VARIANTS.has(variant)) {
    return null;
  }

  const globalIcon = pageAppearance?.controls?.button?.icon;

  if (!globalIcon || globalIcon === "none") {
    return null;
  }

  if (!GLOBAL_BUTTON_ICONS.has(globalIcon)) {
    throw new Error(
      `Unknown page button icon "${globalIcon}". Expected: ${[...GLOBAL_BUTTON_ICONS, "none"].join(", ")}`,
    );
  }

  return globalIcon;
}
