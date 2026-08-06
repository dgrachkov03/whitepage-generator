import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { legalDocumentsDirectory } from "./config.js";

test("legal documents category includes five variants", () => {
  const variants = fs
    .readdirSync(legalDocumentsDirectory)
    .filter(
      (entry) =>
        entry.endsWith(".pug") &&
        entry.startsWith("document-") &&
        !entry.startsWith("_"),
    )
    .sort();

  assert.equal(variants.length, 5);
  assert.deepEqual(variants, [
    "document-classic.pug",
    "document-compact.pug",
    "document-indexed.pug",
    "document-panel.pug",
    "document-split-intro.pug",
  ]);
});

test("legal document variants live outside blocks directory", () => {
  assert.notEqual(path.basename(path.dirname(legalDocumentsDirectory)), "blocks");
});
