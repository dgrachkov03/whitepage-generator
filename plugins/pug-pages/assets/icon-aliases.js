export const ICON_ALIASES = {
  lucide: {
    "arrow-narrow-right": "move-right",
    "device-mobile": "smartphone",
  },
  tabler: {
    "move-right": "arrow-narrow-right",
    smartphone: "device-mobile",
  },
};

const BUTTON_ICON_LIBRARY_NAMES = {
  "arrow-right": {
    lucide: "arrow-right",
    tabler: "arrow-right",
  },
  "arrow-long-right": {
    lucide: "move-right",
    tabler: "arrow-narrow-right",
  },
  "arrow-up-right": {
    lucide: "arrow-up-right",
    tabler: "arrow-up-right",
  },
};

export function resolveLibraryIconName(name, iconSet = "lucide") {
  if (!name) {
    return name;
  }

  const aliases = ICON_ALIASES[iconSet] || {};
  let resolved = name;

  while (aliases[resolved]) {
    resolved = aliases[resolved];
  }

  return resolved;
}

export function resolveButtonLibraryIcon(icon, iconSet = "lucide") {
  if (!icon) {
    return null;
  }

  const preset = BUTTON_ICON_LIBRARY_NAMES[icon];

  if (preset) {
    return preset[iconSet] || preset.lucide;
  }

  return resolveLibraryIconName(icon, iconSet);
}
