import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { legalDocumentsDirectory } from "./config.js";
import { createLegalLayoutSource } from "./legal-source.js";

function getLegalVariants(prefix) {
  return fs
    .readdirSync(legalDocumentsDirectory)
    .filter(
      (entry) =>
        entry.endsWith(".pug") &&
        entry.startsWith(`${prefix}-`) &&
        !entry.startsWith("_"),
    )
    .sort();
}

test("legal chrome includes one header and two footer variants", () => {
  assert.deepEqual(getLegalVariants("header"), ["header-brand-back.pug"]);
  assert.deepEqual(getLegalVariants("footer"), [
    "footer-compact-bar.pug",
    "footer-meta-stack.pug",
  ]);
});

test("legal layout source includes selected header, document, and footer", () => {
  const source = createLegalLayoutSource({
    legalHeader: {
      filePath: `${legalDocumentsDirectory}/header-brand-back.pug`,
    },
    legalDocument: {
      filePath: `${legalDocumentsDirectory}/document-panel.pug`,
    },
    legalFooter: {
      filePath: `${legalDocumentsDirectory}/footer-compact-bar.pug`,
    },
  });

  assert.match(source, /include \/legal\/header-brand-back\.pug/);
  assert.match(source, /include \/legal\/document-panel\.pug/);
  assert.match(source, /include \/legal\/footer-compact-bar\.pug/);
  assert.doesNotMatch(source, /const footerData/);
  assert.doesNotMatch(source, /legal-footer__meta/);
});
