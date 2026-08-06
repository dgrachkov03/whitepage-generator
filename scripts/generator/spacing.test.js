import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const spacingDirectory = path.resolve(
  testDirectory,
  "..",
  "..",
  "src",
  "pug",
  "design",
  "spacing",
);

const EXPECTED_SPACING = [
  "_airy.css",
  "_balanced.css",
  "_compact.css",
  "_dense.css",
  "_relaxed.css",
];

test("spacing includes five presets", () => {
  const spacing = fs
    .readdirSync(spacingDirectory)
    .filter((entry) => entry.endsWith(".css"))
    .sort();

  assert.equal(spacing.length, 5);
  assert.deepEqual(spacing, EXPECTED_SPACING);
});

test("each spacing preset defines responsive section spacing", () => {
  for (const spacingFile of EXPECTED_SPACING) {
    const contents = fs.readFileSync(
      path.join(spacingDirectory, spacingFile),
      "utf8",
    );

    assert.match(contents, /--design-spacing-section:/);
    assert.match(contents, /@media \(min-width: 40rem\)/);
    assert.match(contents, /@media \(min-width: 64rem\)/);
  }
});
