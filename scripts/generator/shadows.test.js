import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const shadowsDirectory = path.resolve(
  testDirectory,
  "..",
  "..",
  "src",
  "pug",
  "design",
  "shadows",
);

const EXPECTED_SHADOWS = [
  "_crisp.css",
  "_dramatic.css",
  "_flat.css",
  "_lifted.css",
  "_soft.css",
  "_subtle.css",
];

test("shadows includes six presets", () => {
  const shadows = fs
    .readdirSync(shadowsDirectory)
    .filter((entry) => entry.endsWith(".css"))
    .sort();

  assert.equal(shadows.length, 6);
  assert.deepEqual(shadows, EXPECTED_SHADOWS);
});

test("each shadow preset defines card shadow token", () => {
  for (const shadowFile of EXPECTED_SHADOWS) {
    const contents = fs.readFileSync(
      path.join(shadowsDirectory, shadowFile),
      "utf8",
    );

    assert.match(contents, /--design-shadow-card:/);
  }
});
