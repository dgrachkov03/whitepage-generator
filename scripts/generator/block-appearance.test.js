import assert from "node:assert/strict";
import test from "node:test";
import { blockClasses } from "../../plugins/pug-pages/block-appearance.js";
import { pageBackgroundClasses } from "../../plugins/pug-pages/page-background.js";
import { createBlockAppearance } from "./composition.js";

const sampleComposition = {
  topBlocks: [
    { appearanceKey: "topbar" },
    { appearanceKey: "header" },
  ],
  mainBlocks: [
    { appearanceKey: "hero" },
    { appearanceKey: "services" },
    { appearanceKey: "reviews" },
  ],
  bottomBlocks: [{ appearanceKey: "footer" }],
};

function appearanceHasDivider(appearance) {
  return Object.values(appearance).some((block) => "divider" in block);
}

test("page background selects one page-level style", () => {
  assert.equal(
    pageBackgroundClasses({ style: "dots", dotsOn: "alternate" }),
    "page-background page-background--dots page-background--dots-on-alt",
  );
});

test("page background places dots on base or alternate blocks", () => {
  assert.equal(
    pageBackgroundClasses({ style: "dots", dotsOn: "base" }),
    "page-background page-background--dots page-background--dots-on-base",
  );
  assert.equal(
    pageBackgroundClasses({ style: "dots" }),
    "page-background page-background--dots page-background--dots-on-alt",
  );
});

test("page background supports block-level decorative styles", () => {
  assert.equal(
    pageBackgroundClasses({ style: "subtle-grid" }),
    "page-background page-background--subtle-grid page-background--strong-borders",
  );
  assert.equal(
    pageBackgroundClasses({ style: "block-glow" }),
    "page-background page-background--block-glow",
  );
  assert.equal(
    pageBackgroundClasses({ style: "mesh-blocks" }),
    "page-background page-background--mesh-blocks",
  );
});

test("page background supports gradient and defaults to none", () => {
  assert.equal(
    pageBackgroundClasses(),
    "page-background page-background--none",
  );
  assert.equal(
    pageBackgroundClasses({ style: "gradient" }),
    "page-background page-background--gradient",
  );
});

test("page background rejects unknown styles", () => {
  assert.throws(
    () => pageBackgroundClasses({ style: "neon" }),
    /Unknown page background style "neon"/,
  );
});

test("page background rejects dotsOn with non-dots styles", () => {
  assert.throws(
    () => pageBackgroundClasses({ style: "none", dotsOn: "base" }),
    /dotsOn.*only valid with style "dots"/,
  );
});

test("page background keeps dots blocks opaque", () => {
  assert.doesNotThrow(() =>
    pageBackgroundClasses({ style: "dots", dotsOn: "base" }),
  );
  assert.equal(
    pageBackgroundClasses({ style: "dots", dotsOn: "alternate" }).includes(
      "page-background--pattern",
    ),
    false,
  );
});

test("block appearance combines tone, surface, and divider roles", () => {
  assert.equal(
    blockClasses({
      tone: "alternate",
      surface: "solid",
      divider: "top",
    }),
    "block-tone--alt block-surface--solid block-divider--top",
  );
});

test("block appearance inherits the page surface by default", () => {
  assert.equal(blockClasses(), "block-tone--surface");
});

test("block appearance supports manual block patterns", () => {
  assert.equal(
    blockClasses({ tone: "base", pattern: "diamond" }),
    "block-tone--surface block-pattern--diamond",
  );
  assert.equal(
    blockClasses({ tone: "alternate", pattern: "subtle-grid", divider: "top" }),
    "block-tone--alt block-pattern--subtle-grid block-divider--top",
  );
  assert.equal(
    blockClasses({ pattern: "dots" }),
    "block-tone--surface block-pattern--dots",
  );
});

test("block appearance rejects unknown block patterns", () => {
  assert.throws(
    () => blockClasses({ pattern: "hex" }),
    /Unknown block pattern "hex"/,
  );
});

test("block appearance rejects unknown surface overrides", () => {
  assert.throws(
    () => blockClasses({ surface: "gradient" }),
    /Unknown block surface "gradient"/,
  );
});

test("generated block appearance keeps dividers for subtle-grid background", () => {
  for (let index = 0; index < 20; index += 1) {
    const appearance = createBlockAppearance(sampleComposition);

    assert.equal(appearanceHasDivider(appearance), true);
  }
});

test("generated block appearance keeps dividers for plain backgrounds", () => {
  for (let index = 0; index < 20; index += 1) {
    const appearance = createBlockAppearance(sampleComposition);

    assert.equal(appearance.header.divider, "bottom");
    assert.equal(appearance.footer.divider, "top");
  }
});
