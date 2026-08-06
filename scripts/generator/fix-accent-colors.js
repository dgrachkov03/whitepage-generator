/**
 * Harmonize accent with primary (legal-quality sibling pair).
 * Run: node scripts/generator/fix-accent-colors.js [--dry-run]
 */
import fs from "node:fs";
import {
  getFixedPaletteFiles,
  getPaletteRelativePath,
  readFullPaletteTokens,
} from "./fixed-palettes.js";
import {
  colorDistance,
  isLegalQualityAccent,
  isNeonAccent,
  LEGAL_MAXIMUM_ACCENT_DISTANCE,
  LEGAL_MINIMUM_ACCENT_DISTANCE,
  rgbToHsl,
} from "./palette-harmony.js";
import { validatePalette } from "./palette.js";

const TARGET_ACCENT_DISTANCE = 68;
const dryRun = process.argv.includes("--dry-run");

function rgbToHex(red, green, blue) {
  return `#${[red, green, blue]
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function hslToRgb(hue, saturation, lightness) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const hueSegment = hue * 6;
  const intermediate = chroma * (1 - Math.abs((hueSegment % 2) - 1));
  const match = lightness - chroma / 2;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (hueSegment < 1) {
    red = chroma;
    green = intermediate;
  } else if (hueSegment < 2) {
    red = intermediate;
    green = chroma;
  } else if (hueSegment < 3) {
    green = chroma;
    blue = intermediate;
  } else if (hueSegment < 4) {
    green = intermediate;
    blue = chroma;
  } else if (hueSegment < 5) {
    red = intermediate;
    blue = chroma;
  } else {
    red = chroma;
    blue = intermediate;
  }

  return rgbToHex(
    (red + match) * 255,
    (green + match) * 255,
    (blue + match) * 255,
  );
}

function needsAccentFix(tokens, validation) {
  if (!validation.valid) {
    return validation.errors.some((error) => error.includes("accent"));
  }

  if (tokens.gradientSecondary !== tokens.accent) {
    return true;
  }

  return !isLegalQualityAccent(tokens.primary, tokens.accent);
}

function scoreAccentCandidate(tokens, accent, distance) {
  const candidate = { ...tokens, accent };
  const validation = validatePalette(candidate);

  if (!validation.valid) {
    return Number.NEGATIVE_INFINITY;
  }

  if (!isLegalQualityAccent(tokens.primary, accent)) {
    return Number.NEGATIVE_INFINITY;
  }

  if (isNeonAccent(tokens.primary, accent)) {
    return Number.NEGATIVE_INFINITY;
  }

  const distancePenalty = Math.abs(distance - TARGET_ACCENT_DISTANCE);

  return validation.minimumContrast - distancePenalty * 0.25;
}

function deriveHarmoniousAccent(tokens) {
  const { hue, saturation, lightness } = rgbToHsl(tokens.primary);
  const hueNorm = hue / 360;
  const satNorm = saturation / 100;
  const lightNorm = lightness / 100;
  const isDark = tokens.colorScheme === "dark";
  const isVividPrimary = satNorm > 0.55 && lightNorm > 0.42;
  const lightnessSteps = [];

  for (let step = 0.05; step <= 0.22; step += 0.02) {
    if (isVividPrimary) {
      lightnessSteps.push(isDark ? lightNorm - step : lightNorm - step);
      lightnessSteps.push(isDark ? lightNorm + step : lightNorm + step);
    } else {
      lightnessSteps.push(isDark ? lightNorm + step : lightNorm - step);
      lightnessSteps.push(isDark ? lightNorm - step : lightNorm + step);
    }
  }

  const saturationMultipliers = [0.88, 0.94, 1, 1.04, 0.82, 1.08];
  let bestAccent = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const targetLightness of lightnessSteps) {
    for (const saturationMultiplier of saturationMultipliers) {
      const clampedLightness = Math.min(0.88, Math.max(0.1, targetLightness));
      const clampedSaturation = Math.min(
        satNorm * 1.1,
        Math.max(0, satNorm * saturationMultiplier),
      );
      const accent = hslToRgb(hueNorm, clampedSaturation, clampedLightness);
      const distance = colorDistance(tokens.primary, accent);
      const score = scoreAccentCandidate(tokens, accent, distance);

      if (score > bestScore) {
        bestScore = score;
        bestAccent = accent;
      }
    }
  }

  if (!bestAccent) {
    throw new Error(`Could not derive legal-quality accent for palette`);
  }

  return bestAccent;
}

function replaceTokenColor(source, tokenName, nextColor) {
  return source.replace(
    new RegExp(`(${tokenName}:\\s*)#[0-9a-f]{6}`, "i"),
    `$1${nextColor}`,
  );
}

function hexToRgb(hex) {
  return {
    red: Number.parseInt(hex.slice(1, 3), 16),
    green: Number.parseInt(hex.slice(3, 5), 16),
    blue: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function contrastRatio(first, second) {
  const relativeLuminance = (hex) => {
    const channels = [hex.red, hex.green, hex.blue].map((channel) => {
      const normalized = channel / 255;

      return normalized <= 0.04045 ?
          normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    });

    return (
      0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
    );
  };
  const firstRgb = hexToRgb(first);
  const secondRgb = hexToRgb(second);
  const firstLuminance = relativeLuminance(firstRgb);
  const secondLuminance = relativeLuminance(secondRgb);

  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  );
}

function buttonEndpointColor(tokens, accent) {
  if (contrastRatio(tokens.inkInverse, accent) >= 4.6) {
    return accent;
  }

  return tokens.primaryHover;
}

function applyAccentFix(filePath, tokens, nextAccent) {
  let source = fs.readFileSync(filePath, "utf8");
  const oldAccent = tokens.accent;
  const buttonEnd = buttonEndpointColor(tokens, nextAccent);

  source = replaceTokenColor(source, "--design-accent", nextAccent);
  source = replaceTokenColor(source, "--design-gradient-secondary", nextAccent);

  if (
    tokens.gradientPrimary === oldAccent ||
    tokens.gradientPrimary === tokens.accent
  ) {
    source = replaceTokenColor(
      source,
      "--design-gradient-primary",
      tokens.primary,
    );
  }

  if (tokens.buttonGradientEnd === oldAccent) {
    source = replaceTokenColor(
      source,
      "--design-button-gradient-end",
      buttonEnd,
    );
  }

  if (!dryRun) {
    fs.writeFileSync(filePath, source, "utf8");
  }

  return nextAccent;
}

const results = [];
const failures = [];

for (const filePath of getFixedPaletteFiles()) {
  const tokens = readFullPaletteTokens(filePath);
  const validation = validatePalette(tokens);

  if (!needsAccentFix(tokens, validation)) {
    continue;
  }

  try {
    const nextAccent = deriveHarmoniousAccent({ ...tokens, filePath });
    const nextDistance = colorDistance(tokens.primary, nextAccent);
    const nextValidation = validatePalette({ ...tokens, accent: nextAccent });

    applyAccentFix(filePath, tokens, nextAccent);

    results.push({
      id: getPaletteRelativePath(filePath),
      oldAccent: tokens.accent,
      newAccent: nextAccent,
      oldDistance: colorDistance(tokens.primary, tokens.accent).toFixed(1),
      newDistance: nextDistance.toFixed(1),
      valid: nextValidation.valid,
    });
  } catch (error) {
    failures.push({
      id: getPaletteRelativePath(filePath),
      error: error.message,
    });
  }
}

console.log(
  `${dryRun ? "[dry-run] " : ""}Fixed accent in ${results.length} palettes ` +
    `(target distance ${LEGAL_MINIMUM_ACCENT_DISTANCE}-${LEGAL_MAXIMUM_ACCENT_DISTANCE}):\n`,
);

results.forEach((result) => {
  console.log(
    `  ${result.id}: ${result.oldAccent} → ${result.newAccent} (distance ${result.oldDistance} → ${result.newDistance}, valid: ${result.valid})`,
  );
});

if (failures.length) {
  console.log("\nFailures:");
  failures.forEach((failure) => {
    console.log(`  ${failure.id}: ${failure.error}`);
  });
  process.exitCode = 1;
}

if (results.some((result) => !result.valid)) {
  process.exitCode = 1;
}
