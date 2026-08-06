const TONE_CLASSES = {
  base: "block-tone--surface",
  alternate: "block-tone--alt",
  primary: "block-tone--primary",
  transparent: "block-tone--transparent",
};

const DIVIDER_CLASSES = {
  none: "",
  top: "block-divider--top",
  bottom: "block-divider--bottom",
  both: "block-divider--both",
};

const SURFACE_CLASSES = {
  inherit: "",
  transparent: "block-surface--transparent",
  solid: "block-surface--solid",
};

const PATTERN_CLASSES = {
  none: "",
  "subtle-grid": "block-pattern--subtle-grid",
  dots: "block-pattern--dots",
  diamond: "block-pattern--diamond",
};

const ALLOWED_OPTIONS = new Set(["tone", "divider", "surface", "pattern"]);

export function blockClasses(options = {}) {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new Error("Block appearance must be an object");
  }

  const unknownOptions = Object.keys(options).filter(
    (option) => !ALLOWED_OPTIONS.has(option),
  );

  if (unknownOptions.length) {
    throw new Error(
      `Unknown block appearance options: ${unknownOptions.join(", ")}`,
    );
  }

  const tone = options.tone || "base";
  const divider = options.divider || "none";
  const surface = options.surface || "inherit";
  const pattern = options.pattern || "none";

  if (!TONE_CLASSES[tone]) {
    throw new Error(
      `Unknown block tone "${tone}". Expected: ${Object.keys(TONE_CLASSES).join(", ")}`,
    );
  }

  if (!(divider in DIVIDER_CLASSES)) {
    throw new Error(
      `Unknown block divider "${divider}". Expected: ${Object.keys(DIVIDER_CLASSES).join(", ")}`,
    );
  }

  if (!(surface in SURFACE_CLASSES)) {
    throw new Error(
      `Unknown block surface "${surface}". Expected: ${Object.keys(SURFACE_CLASSES).join(", ")}`,
    );
  }

  if (!(pattern in PATTERN_CLASSES)) {
    throw new Error(
      `Unknown block pattern "${pattern}". Expected: ${Object.keys(PATTERN_CLASSES).join(", ")}`,
    );
  }

  return [
    TONE_CLASSES[tone],
    SURFACE_CLASSES[surface],
    PATTERN_CLASSES[pattern],
    DIVIDER_CLASSES[divider],
  ]
    .filter(Boolean)
    .join(" ");
}
