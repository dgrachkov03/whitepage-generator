import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const shapesDirectory = path.resolve(
  testDirectory,
  "..",
  "..",
  "src",
  "pug",
  "design",
  "shapes",
);

const EXPECTED_SHAPES = [
  "_balanced.css",
  "_compact.css",
  "_editorial.css",
  "_rounded.css",
  "_sharp.css",
  "_soft.css",
];

test("shapes includes six presets", () => {
  const shapes = fs
    .readdirSync(shapesDirectory)
    .filter((entry) => entry.endsWith(".css"))
    .sort();

  assert.equal(shapes.length, 6);
  assert.deepEqual(shapes, EXPECTED_SHAPES);
});

test("each shape preset defines a shared radius token", () => {
  for (const shapeFile of EXPECTED_SHAPES) {
    const contents = fs.readFileSync(path.join(shapesDirectory, shapeFile), "utf8");

    assert.match(
      contents,
      /--design-radius:/,
      `${shapeFile} must define --design-radius`,
    );
    assert.doesNotMatch(
      contents,
      /--design-radius-(card|button):/,
      `${shapeFile} must not define separate card/button radius tokens`,
    );
  }
});
