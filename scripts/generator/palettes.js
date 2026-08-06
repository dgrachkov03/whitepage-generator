import fs from "node:fs";
import path from "node:path";
import { randomInt } from "node:crypto";
import { LIGHT_PALETTE_CHANCE } from "./config.js";

const COLOR_SCHEME_PATTERN = /color-scheme:\s*(light|dark)\s*;/;

export function getPaletteColorScheme(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const match = source.match(COLOR_SCHEME_PATTERN);

  if (!match) {
    throw new Error(`Missing color-scheme in palette: ${filePath}`);
  }

  return match[1];
}

export function getPaletteFamily(filePath) {
  return path.basename(path.dirname(filePath));
}

export function getPaletteVariant(filePath) {
  return path.basename(filePath, ".css").replace(/^_/, "");
}

export function parseFixedPalette(filePath) {
  const source = fs.readFileSync(filePath, "utf8");

  const getColor = (token) => {
    const match = source.match(new RegExp(`${token}:\\s*(#[0-9a-f]{6})`, "i"));

    if (!match) {
      throw new Error(`${token} missing in ${filePath}`);
    }

    return match[1].toLowerCase();
  };

  const getStrength = (token) => {
    const match = source.match(new RegExp(`${token}:\\s*(\\d+)%`, "i"));

    if (!match) {
      throw new Error(`${token} missing in ${filePath}`);
    }

    return Number(match[1]);
  };

  return {
    colorScheme: getPaletteColorScheme(filePath),
    primary: getColor("--design-primary"),
    primaryHover: getColor("--design-primary-hover"),
    secondary: getColor("--design-secondary"),
    accent: getColor("--design-accent"),
    surface: getColor("--design-surface"),
    surfaceAlt: getColor("--design-surface-alt"),
    ink: getColor("--design-ink"),
    inkMuted: getColor("--design-ink-muted"),
    inkInverse: getColor("--design-ink-inverse"),
    gradientPrimaryStrength: getStrength("--design-gradient-primary-strength"),
    gradientSecondaryStrength: getStrength(
      "--design-gradient-secondary-strength",
    ),
    gradientAccentStrength: getStrength("--design-gradient-accent-strength"),
  };
}

export function groupPalettesByScheme(palettePaths) {
  const groups = { light: [], dark: [] };

  palettePaths.forEach((filePath) => {
    groups[getPaletteColorScheme(filePath)].push(filePath);
  });

  if (!groups.light.length || !groups.dark.length) {
    throw new Error(
      "Palette pool must include at least one light and one dark palette",
    );
  }

  return groups;
}

function selectPaletteScheme() {
  return randomInt(100) < LIGHT_PALETTE_CHANCE ? "light" : "dark";
}

export function selectBalancedPalette(palettePaths, pick) {
  const groups = groupPalettesByScheme(palettePaths);
  const scheme = selectPaletteScheme();

  return pick(groups[scheme], `${scheme} palette`);
}
