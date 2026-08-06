const COLOR_TOKEN_NAMES = [
  "primary",
  "primaryHover",
  "secondary",
  "accent",
  "gradientPrimary",
  "gradientSecondary",
  "gradientAccent",
  "buttonGradientStart",
  "buttonGradientEnd",
  "surface",
  "surfaceAlt",
  "ink",
  "inkMuted",
  "inkInverse",
];

const GRADIENT_STRENGTH_TOKEN_NAMES = [
  "gradientPrimaryStrength",
  "gradientSecondaryStrength",
  "gradientAccentStrength",
];

const CONTRAST_PAIRS = [
  ["ink", "surface"],
  ["ink", "surfaceAlt"],
  ["inkMuted", "surface"],
  ["inkMuted", "surfaceAlt"],
  ["inkInverse", "primary"],
  ["inkInverse", "buttonGradientStart"],
  ["inkInverse", "buttonGradientEnd"],
  ["primary", "surface"],
  ["primary", "surfaceAlt"],
  ["inkInverse", "primaryHover"],
  ["secondary", "surface"],
  ["secondary", "surfaceAlt"],
  ["accent", "surface"],
  ["accent", "surfaceAlt"],
];

const MINIMUM_TEXT_CONTRAST = 4.6;
const MINIMUM_SURFACE_CONTRAST = 1.08;
const MAXIMUM_SURFACE_CONTRAST = 2;
const MINIMUM_HOVER_CONTRAST = 1.12;
const MINIMUM_ACCENT_DISTANCE = 40;
const MINIMUM_GRADIENT_STRENGTH = 10;
const MAXIMUM_GRADIENT_STRENGTH = 45;

function hexToRgb(hex) {
  return {
    red: Number.parseInt(hex.slice(1, 3), 16),
    green: Number.parseInt(hex.slice(3, 5), 16),
    blue: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function relativeLuminance(hex) {
  const { red, green, blue } = hexToRgb(hex);
  const channels = [red, green, blue].map((channel) => {
    const normalized = channel / 255;

    return normalized <= 0.04045 ?
        normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return (
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  );
}

function contrastRatio(first, second) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);

  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  );
}

function colorDistance(first, second) {
  const firstRgb = hexToRgb(first);
  const secondRgb = hexToRgb(second);

  return Math.hypot(
    firstRgb.red - secondRgb.red,
    firstRgb.green - secondRgb.green,
    firstRgb.blue - secondRgb.blue,
  );
}

export function validatePalette(tokens) {
  const errors = [];
  let minimumContrast = Number.POSITIVE_INFINITY;

  if (!["dark", "light"].includes(tokens.colorScheme)) {
    errors.push(`Unknown color scheme: ${tokens.colorScheme}`);
  }

  COLOR_TOKEN_NAMES.forEach((tokenName) => {
    if (!/^#[0-9a-f]{6}$/i.test(tokens[tokenName] || "")) {
      errors.push(`Invalid ${tokenName} color: ${tokens[tokenName]}`);
    }
  });

  GRADIENT_STRENGTH_TOKEN_NAMES.forEach((tokenName) => {
    const value = tokens[tokenName];

    if (
      !Number.isFinite(value) ||
      value < MINIMUM_GRADIENT_STRENGTH ||
      value > MAXIMUM_GRADIENT_STRENGTH
    ) {
      errors.push(
        `Invalid ${tokenName}: ${value}; expected ${MINIMUM_GRADIENT_STRENGTH}-${MAXIMUM_GRADIENT_STRENGTH}`,
      );
    }
  });

  if (errors.length) {
    return { valid: false, errors, minimumContrast: 0 };
  }

  CONTRAST_PAIRS.forEach(([foreground, background]) => {
    if (
      tokens.colorScheme === "light" &&
      ["primary", "accent"].includes(foreground) &&
      ["surface", "surfaceAlt"].includes(background) &&
      relativeLuminance(tokens[foreground]) >
        relativeLuminance(tokens[background])
    ) {
      return;
    }

    if (
      tokens.colorScheme === "light" &&
      foreground === "primary" &&
      ["surface", "surfaceAlt"].includes(background) &&
      contrastRatio(tokens.ink, tokens.primary) >= MINIMUM_TEXT_CONTRAST
    ) {
      return;
    }

    if (
      tokens.colorScheme === "light" &&
      foreground === "accent" &&
      ["surface", "surfaceAlt"].includes(background) &&
      contrastRatio(tokens.ink, tokens.accent) >= MINIMUM_TEXT_CONTRAST
    ) {
      return;
    }

    if (
      tokens.colorScheme === "light" &&
      foreground === "inkInverse" &&
      ["primary", "primaryHover"].includes(background)
    ) {
      return;
    }

    const ratio = contrastRatio(tokens[foreground], tokens[background]);

    minimumContrast = Math.min(minimumContrast, ratio);

    if (ratio < MINIMUM_TEXT_CONTRAST) {
      errors.push(
        `${foreground}/${background} contrast is ${ratio.toFixed(2)}:1`,
      );
    }
  });

  const surfaceContrast = contrastRatio(tokens.surface, tokens.surfaceAlt);

  if (
    surfaceContrast < MINIMUM_SURFACE_CONTRAST ||
    surfaceContrast > MAXIMUM_SURFACE_CONTRAST
  ) {
    errors.push(
      `surface contrast is ${surfaceContrast.toFixed(2)}:1; expected ${MINIMUM_SURFACE_CONTRAST}-${MAXIMUM_SURFACE_CONTRAST}:1`,
    );
  }

  const hoverContrast = contrastRatio(tokens.primary, tokens.primaryHover);

  if (hoverContrast < MINIMUM_HOVER_CONTRAST) {
    errors.push(
      `primary hover contrast is ${hoverContrast.toFixed(2)}:1; expected at least ${MINIMUM_HOVER_CONTRAST}:1`,
    );
  }

  if (
    relativeLuminance(tokens.primaryHover) >=
    relativeLuminance(tokens.primary)
  ) {
    errors.push("primaryHover must be darker than primary");
  }

  const accentDistance = colorDistance(tokens.primary, tokens.accent);

  if (accentDistance < MINIMUM_ACCENT_DISTANCE) {
    errors.push(
      `primary/accent distance is ${accentDistance.toFixed(1)}; expected at least ${MINIMUM_ACCENT_DISTANCE}`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    minimumContrast,
  };
}
