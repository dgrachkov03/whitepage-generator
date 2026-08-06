import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validatePalette } from "./palette.js";
import { parseFixedPalette } from "./palettes.js";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const fixedPalettesDirectory = path.resolve(
  testDirectory,
  "..",
  "..",
  "src",
  "pug",
  "design",
  "palettes",
);

function getFixedPaletteFiles(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return getFixedPaletteFiles(entryPath);
      }

      return entry.isFile() && entry.name.endsWith(".css") ? [entryPath] : [];
    });
}

function getCssColorToken(source, name) {
  return source.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6});`, "i"))?.[1];
}

function relativeLuminance(hex) {
  const channels = [1, 3, 5].map((offset) => {
    const normalized = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
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

test("fixed palettes provide the complete gradient token contract", () => {
  const gradientTokens = [
    "--design-gradient-primary",
    "--design-gradient-secondary",
    "--design-gradient-accent",
    "--design-gradient-primary-strength",
    "--design-gradient-secondary-strength",
    "--design-gradient-accent-strength",
    "--design-button-gradient-start",
    "--design-button-gradient-end",
  ];
  const structuralTokens = [
    "--design-border",
    "--design-border-strong",
    "--design-hero-scrim",
    "--design-hero-on-photo",
  ];

  getFixedPaletteFiles(fixedPalettesDirectory).forEach((filePath) => {
    const source = fs.readFileSync(filePath, "utf8");

    gradientTokens.forEach((token) => {
      assert.match(source, new RegExp(`${token}:`), `${token} missing in ${filePath}`);
    });

    structuralTokens.forEach((token) => {
      assert.match(source, new RegExp(`${token}:`), `${token} missing in ${filePath}`);
    });

    const inverse = getCssColorToken(source, "--design-ink-inverse");

    ["--design-button-gradient-start", "--design-button-gradient-end"].forEach(
      (token) => {
        const endpoint = getCssColorToken(source, token);
        assert.ok(
          contrastRatio(inverse, endpoint) >= 4.6,
          `${token} has unsafe text contrast in ${filePath}`,
        );
      },
    );
  });
});

test("fixed palettes parse into the generator token contract", () => {
  getFixedPaletteFiles(fixedPalettesDirectory).forEach((filePath) => {
    const tokens = parseFixedPalette(filePath);

    assert.match(tokens.primary, /^#[0-9a-f]{6}$/);
    assert.match(tokens.colorScheme, /^(light|dark)$/);
    assert.ok(tokens.gradientPrimaryStrength >= 10);
  });
});

test("palette validation rejects unsafe contrast", () => {
  const unsafe = {
    colorScheme: "light",
    primary: "#777777",
    primaryHover: "#707070",
    secondary: "#777777",
    accent: "#777777",
    gradientPrimary: "#777777",
    gradientSecondary: "#777777",
    gradientAccent: "#777777",
    buttonGradientStart: "#777777",
    buttonGradientEnd: "#777777",
    gradientPrimaryStrength: 38,
    gradientSecondaryStrength: 32,
    gradientAccentStrength: 26,
    surface: "#ffffff",
    surfaceAlt: "#f5f5f5",
    ink: "#111111",
    inkMuted: "#777777",
    inkInverse: "#ffffff",
  };
  const validation = validatePalette(unsafe);

  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((error) => error.includes("contrast")));
});
