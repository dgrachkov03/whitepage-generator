import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFixedPalette } from "./palettes.js";

const generatorDirectory = path.dirname(fileURLToPath(import.meta.url));
export const fixedPalettesDirectory = path.resolve(
  generatorDirectory,
  "..",
  "..",
  "src",
  "pug",
  "design",
  "palettes",
);

function getCssColorToken(source, tokenName) {
  const match = source.match(
    new RegExp(`${tokenName}:\\s*(#[0-9a-f]{6})\\s*;`, "i"),
  );

  return match ? match[1].toLowerCase() : null;
}

export function getFixedPaletteFiles(
  directory = fixedPalettesDirectory,
) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return getFixedPaletteFiles(entryPath);
      }

      return entry.isFile() && entry.name.endsWith(".css") ? [entryPath] : [];
    })
    .sort((left, right) => left.localeCompare(right));
}

export function getPaletteRelativePath(filePath) {
  return path
    .relative(fixedPalettesDirectory, filePath)
    .replace(/\\/g, "/")
    .replace(/\.css$/, "")
    .replace(/^\//, "");
}

export function readFullPaletteTokens(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const tokens = parseFixedPalette(filePath);

  return {
    ...tokens,
    gradientPrimary:
      getCssColorToken(source, "--design-gradient-primary") || tokens.primary,
    gradientSecondary:
      getCssColorToken(source, "--design-gradient-secondary") || tokens.accent,
    gradientAccent:
      getCssColorToken(source, "--design-gradient-accent") || tokens.secondary,
    buttonGradientStart:
      getCssColorToken(source, "--design-button-gradient-start") ||
      tokens.primary,
    buttonGradientEnd:
      getCssColorToken(source, "--design-button-gradient-end") || tokens.accent,
  };
}
