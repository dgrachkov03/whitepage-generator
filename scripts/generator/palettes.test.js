import assert from "node:assert/strict";
import { randomInt } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  getPaletteColorScheme,
  groupPalettesByScheme,
  parseFixedPalette,
  selectBalancedPalette,
} from "./palettes.js";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const palettesDirectory = path.resolve(
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

function pick(options) {
  return options[randomInt(options.length)];
}

test("fixed palette pool includes light and dark schemes", () => {
  const groups = groupPalettesByScheme(getFixedPaletteFiles(palettesDirectory));

  assert.ok(groups.light.length >= 22);
  assert.ok(groups.dark.length >= 16);
});

test("every fixed palette declares a supported color scheme", () => {
  getFixedPaletteFiles(palettesDirectory).forEach((filePath) => {
    assert.match(getPaletteColorScheme(filePath), /^(light|dark)$/);
  });
});

test("every fixed palette parses for validation", () => {
  getFixedPaletteFiles(palettesDirectory).forEach((filePath) => {
    const tokens = parseFixedPalette(filePath);

    assert.match(tokens.primary, /^#[0-9a-f]{6}$/);
    assert.match(tokens.colorScheme, /^(light|dark)$/);
  });
});

test("selectBalancedPalette prefers light palettes", () => {
  const palettePaths = getFixedPaletteFiles(palettesDirectory);
  const counts = { light: 0, dark: 0 };

  for (let index = 0; index < 4000; index += 1) {
    const palettePath = selectBalancedPalette(palettePaths, pick);
    counts[getPaletteColorScheme(palettePath)] += 1;
  }

  assert.ok(counts.light >= 2500 && counts.light <= 3100);
  assert.ok(counts.dark >= 900 && counts.dark <= 1500);
});
