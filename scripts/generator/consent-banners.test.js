import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { consentBlocksDirectory } from "./config.js";
import { createOverlaysSource } from "./overlays-source.js";

test("consent banner category includes three variants", () => {
  const variants = fs
    .readdirSync(consentBlocksDirectory)
    .filter((entry) => entry.endsWith(".pug") && !entry.startsWith("_"))
    .sort();

  assert.equal(variants.length, 3);
  assert.deepEqual(variants, [
    "bar-actions.pug",
    "bar-strip.pug",
    "corner-card.pug",
  ]);
});

test("overlays source includes corner placement for corner-card", () => {
  const source = createOverlaysSource({
    consentBanner: {
      filePath: `${consentBlocksDirectory}/corner-card.pug`,
    },
    consentBannerCorner: "start",
  });

  assert.match(source, /const consentBannerCorner = "start"/);
  assert.match(source, /include \/blocks\/cookies\/corner-card\.pug/);
});

test("overlays source omits corner placement for strip variant", () => {
  const source = createOverlaysSource({
    consentBanner: {
      filePath: `${consentBlocksDirectory}/bar-strip.pug`,
    },
    consentBannerCorner: null,
  });

  assert.doesNotMatch(source, /consentBannerCorner/);
  assert.match(source, /include \/blocks\/cookies\/bar-strip\.pug/);
});
