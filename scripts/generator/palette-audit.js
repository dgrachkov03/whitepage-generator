import {
  getFixedPaletteFiles,
  getPaletteRelativePath,
  readFullPaletteTokens,
} from "./fixed-palettes.js";
import {
  getAccentHueDelta,
  isHarmoniousAccent,
  isLegalQualityAccent,
  isNeonAccent,
  LEGAL_MINIMUM_ACCENT_DISTANCE,
} from "./palette-harmony.js";
import { validatePalette } from "./palette.js";

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

export const MAXIMUM_HARMONIOUS_ACCENT_DISTANCE = 100;

function collectWarnings(tokens, metrics) {
  const warnings = [];

  if (!isHarmoniousAccent(tokens.primary, tokens.accent)) {
    warnings.push(
      `primary/accent are different hue families (${getAccentHueDelta(tokens.primary, tokens.accent).toFixed(0)}° hue delta; UI alternates bg-primary and bg-accent)`,
    );
  } else if (isNeonAccent(tokens.primary, tokens.accent)) {
    warnings.push(
      "primary/accent accent is too neon compared with primary (panel-grid looks inconsistent)",
    );
  } else if (metrics.accentDistance < LEGAL_MINIMUM_ACCENT_DISTANCE) {
    warnings.push(
      `primary/accent are very close (${metrics.accentDistance.toFixed(1)} RGB distance; cards barely differ)`,
    );
  } else if (!isLegalQualityAccent(tokens.primary, tokens.accent)) {
    warnings.push(
      `primary/accent pair is outside legal-quality range (${metrics.accentDistance.toFixed(1)} RGB distance)`,
    );
  }

  if (
    tokens.colorScheme === "light" &&
    Math.max(
      tokens.gradientPrimaryStrength,
      tokens.gradientSecondaryStrength,
      tokens.gradientAccentStrength,
    ) >= 34
  ) {
    warnings.push("gradient strengths are high for a light palette (>= 34%)");
  }

  if (
    tokens.colorScheme === "dark" &&
    Math.max(
      tokens.gradientPrimaryStrength,
      tokens.gradientSecondaryStrength,
      tokens.gradientAccentStrength,
    ) >= 42
  ) {
    warnings.push("gradient strengths are high for a dark palette (>= 42%)");
  }

  if (metrics.surfaceContrast < 1.12) {
    warnings.push(
      `surface and surface-alt are very similar (${metrics.surfaceContrast.toFixed(2)}:1)`,
    );
  }

  if (metrics.surfaceContrast > 1.45) {
    warnings.push(
      `surface and surface-alt contrast is near the upper limit (${metrics.surfaceContrast.toFixed(2)}:1)`,
    );
  }

  if (metrics.inkMutedContrast < 5.5) {
    warnings.push(
      `ink-muted contrast is tight on surface (${metrics.inkMutedContrast.toFixed(2)}:1)`,
    );
  }

  return warnings;
}

export function auditFixedPalette(filePath) {
  const tokens = readFullPaletteTokens(filePath);
  const validation = validatePalette(tokens);
  const metrics = {
    minimumContrast: Number(validation.minimumContrast.toFixed(2)),
    surfaceContrast: Number(
      contrastRatio(tokens.surface, tokens.surfaceAlt).toFixed(2),
    ),
    hoverContrast: Number(
      contrastRatio(tokens.primary, tokens.primaryHover).toFixed(2),
    ),
    accentDistance: Number(colorDistance(tokens.primary, tokens.accent).toFixed(1)),
    primarySecondaryDistance: Number(
      colorDistance(tokens.primary, tokens.secondary).toFixed(1),
    ),
    inkMutedContrast: Number(
      contrastRatio(tokens.inkMuted, tokens.surface).toFixed(2),
    ),
    primaryAccentSameHex: tokens.primary === tokens.accent,
    gradientStrengthMax: Math.max(
      tokens.gradientPrimaryStrength,
      tokens.gradientSecondaryStrength,
      tokens.gradientAccentStrength,
    ),
  };
  const warnings = collectWarnings(tokens, metrics);

  return {
    id: getPaletteRelativePath(filePath),
    filePath,
    colorScheme: tokens.colorScheme,
    valid: validation.valid,
    errors: validation.errors,
    warnings,
    metrics,
  };
}

export function auditFixedPalettes(filePaths = getFixedPaletteFiles()) {
  const results = filePaths.map((filePath) => auditFixedPalette(filePath));

  return {
    total: results.length,
    valid: results.filter((result) => result.valid).length,
    invalid: results.filter((result) => !result.valid).length,
    warningCount: results.filter((result) => result.warnings.length).length,
    results,
  };
}

export function formatPaletteAuditReport(report) {
  const lines = [
    `[palette-audit] Checked ${report.total} fixed palettes`,
    `[palette-audit] Valid: ${report.valid}, invalid: ${report.invalid}, with warnings: ${report.warningCount}`,
    "",
  ];

  const invalidResults = report.results.filter((result) => !result.valid);

  if (invalidResults.length) {
    lines.push("Invalid palettes:");
    invalidResults.forEach((result) => {
      lines.push(`  - ${result.id}`);
      result.errors.forEach((error) => {
        lines.push(`      error: ${error}`);
      });
    });
    lines.push("");
  }

  const warningResults = report.results
    .filter((result) => result.warnings.length)
    .sort((left, right) => {
      if (left.valid !== right.valid) {
        return left.valid ? 1 : -1;
      }

      return left.id.localeCompare(right.id);
    });

  if (warningResults.length) {
    const clashingResults = warningResults.filter((result) =>
      result.warnings.some((warning) =>
        warning.includes("different hue families"),
      ),
    );
    const otherWarningResults = warningResults.filter(
      (result) => !clashingResults.includes(result),
    );

    if (clashingResults.length) {
      lines.push(
        "Different hue families (primary vs accent):",
      );
      clashingResults.forEach((result) => {
        const status = result.valid ? "ok" : "invalid";
        lines.push(
          `  - ${result.id} (${status}, distance ${result.metrics.accentDistance})`,
        );
        result.warnings
          .filter((warning) => warning.includes("different hue families"))
          .forEach((warning) => {
            lines.push(`      warn: ${warning}`);
          });
      });
      lines.push("");
    }

    if (otherWarningResults.length) {
      lines.push("Other warnings:");
      otherWarningResults.forEach((result) => {
        const status = result.valid ? "ok" : "invalid";
        lines.push(`  - ${result.id} (${status})`);
        result.warnings
          .filter((warning) => !warning.includes("different hue families"))
          .forEach((warning) => {
            lines.push(`      warn: ${warning}`);
          });
      });
      lines.push("");
    }
  }

  if (!invalidResults.length && !warningResults.length) {
    lines.push("All palettes passed full validation with no warnings.");
  }

  return `${lines.join("\n")}\n`;
}
