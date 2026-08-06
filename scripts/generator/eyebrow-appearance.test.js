import assert from "node:assert/strict";
import test from "node:test";
import {
  EYEBROW_VARIANTS,
  isEyebrowEnabled,
  resolveEyebrowVariant,
} from "../../plugins/pug-pages/eyebrow-appearance.js";

test("isEyebrowEnabled defaults to true", () => {
  assert.equal(isEyebrowEnabled(), true);
  assert.equal(isEyebrowEnabled({}), true);
  assert.equal(isEyebrowEnabled({ eyebrow: {} }), true);
  assert.equal(isEyebrowEnabled({ eyebrow: { enabled: true } }), true);
});

test("isEyebrowEnabled returns false only when explicitly disabled", () => {
  assert.equal(isEyebrowEnabled({ eyebrow: { enabled: false } }), false);
});

test("resolveEyebrowVariant prefers block override over page appearance", () => {
  assert.equal(
    resolveEyebrowVariant(
      { eyebrowVariant: "inverse" },
      { eyebrow: { variant: "dot" } },
    ),
    "inverse",
  );
});

test("resolveEyebrowVariant uses page appearance when block has no override", () => {
  assert.equal(
    resolveEyebrowVariant({}, { eyebrow: { variant: "badge" } }),
    "badge",
  );
});

test("resolveEyebrowVariant defaults to line", () => {
  assert.equal(resolveEyebrowVariant(), "line");
});

test("resolveEyebrowVariant rejects unknown variants", () => {
  assert.throws(
    () => resolveEyebrowVariant({ eyebrowVariant: "underline" }),
    /Unknown eyebrow variant/,
  );
});

test("EYEBROW_VARIANTS excludes contextual photo and inverse variants", () => {
  assert.deepEqual(EYEBROW_VARIANTS, ["dot", "line", "badge"]);
});
