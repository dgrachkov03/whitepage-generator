import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { fontCatalog } from "../../plugins/pug-pages/fonts/catalog.js";
import {
  TYPOGRAPHY_PRESETS,
  getTypographyPresetById,
} from "./typography-presets.js";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const typographyDirectory = path.resolve(
  testDirectory,
  "..",
  "..",
  "src",
  "pug",
  "design",
  "typography",
);

const EXPECTED_RHYTHMS = [
  "_airy.css",
  "_balanced.css",
  "_compact.css",
  "_display-heavy.css",
  "_editorial.css",
  "_tight.css",
];

test("typography rhythms include six presets", () => {
  const rhythms = fs
    .readdirSync(typographyDirectory)
    .filter((entry) => entry.endsWith(".css"))
    .sort();

  assert.equal(rhythms.length, 6);
  assert.deepEqual(rhythms, EXPECTED_RHYTHMS);
});

test("typography presets include ten curated font pairs", () => {
  assert.equal(TYPOGRAPHY_PRESETS.length, 10);

  const ids = TYPOGRAPHY_PRESETS.map((preset) => preset.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("every typography preset references valid fonts and rhythm files", () => {
  for (const preset of TYPOGRAPHY_PRESETS) {
    assert.ok(fontCatalog[preset.display], `${preset.id} display font exists`);
    assert.ok(fontCatalog[preset.body], `${preset.id} body font exists`);
    assert.ok(fontCatalog[preset.mono], `${preset.id} mono font exists`);
    assert.ok(
      fontCatalog[preset.display].roles.includes("display"),
      `${preset.id} display role`,
    );
    assert.ok(
      fontCatalog[preset.body].roles.includes("body"),
      `${preset.id} body role`,
    );
    assert.ok(
      fontCatalog[preset.mono].roles.includes("mono"),
      `${preset.id} mono role`,
    );

    const displayFamily = fontCatalog[preset.display].family;
    const bodyFamily = fontCatalog[preset.body].family;
    const monoFamily = fontCatalog[preset.mono].family;

    assert.notEqual(
      monoFamily,
      displayFamily,
      `${preset.id} mono must differ from display`,
    );
    assert.notEqual(
      monoFamily,
      bodyFamily,
      `${preset.id} mono must differ from body`,
    );

    const rhythmPath = path.join(
      typographyDirectory,
      `_${preset.rhythm}.css`,
    );
    assert.ok(fs.existsSync(rhythmPath), `${preset.id} rhythm file exists`);
  }
});

test("getTypographyPresetById resolves known presets", () => {
  assert.equal(getTypographyPresetById("modern").display, "space-grotesk");
  assert.throws(() => getTypographyPresetById("missing"), /Unknown typography preset/);
});
