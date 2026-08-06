import assert from "node:assert/strict";
import { randomInt } from "node:crypto";
import test from "node:test";
import {
  PAGE_BACKGROUND_SCHEMES,
  PAGE_BACKGROUND_WEIGHTS,
} from "./config.js";
import {
  filterBackgroundWeightsByScheme,
  selectPageBackground,
} from "./page-background-selection.js";
import { pickWeighted } from "./weighted-pick.js";

function pick(options, label) {
  if (!options.length) {
    throw new Error(`Cannot select ${label}: no options are available`);
  }

  return options[randomInt(options.length)];
}

test("page background weights sum to one hundred", () => {
  const totalWeight = Object.values(PAGE_BACKGROUND_WEIGHTS).reduce(
    (sum, weight) => sum + weight,
    0,
  );

  assert.equal(totalWeight, 100);
});

test("every background style declares supported palette schemes", () => {
  Object.keys(PAGE_BACKGROUND_WEIGHTS).forEach((style) => {
    assert.ok(
      PAGE_BACKGROUND_SCHEMES[style]?.length,
      `Missing scheme rules for ${style}`,
    );
  });
});

test("weighted page background selection is roughly balanced", () => {
  const counts = Object.fromEntries(
    Object.keys(PAGE_BACKGROUND_WEIGHTS).map((style) => [style, 0]),
  );

  for (let index = 0; index < 6000; index += 1) {
    counts[pickWeighted(PAGE_BACKGROUND_WEIGHTS, "page background")] += 1;
  }

  Object.values(counts).forEach((count) => {
    assert.ok(count >= 700 && count <= 1300);
  });
});

test("pickWeighted returns only configured styles", () => {
  for (let index = 0; index < 200; index += 1) {
    assert.ok(
      pickWeighted(PAGE_BACKGROUND_WEIGHTS, "page background")
        in PAGE_BACKGROUND_WEIGHTS,
    );
  }
});

test("pickWeighted rejects empty option sets", () => {
  assert.throws(
    () => pickWeighted({}, "page background"),
    /Cannot select page background/,
  );
});

test("dark palettes exclude light-only background styles", () => {
  const weights = filterBackgroundWeightsByScheme("dark");

  assert.equal(weights.dots, undefined);
  assert.equal(weights["subtle-grid"], undefined);
  assert.equal(weights.none, 17);
  assert.equal(weights["block-glow"], 17);
  assert.equal(
    Object.values(weights).reduce((sum, weight) => sum + weight, 0),
    67,
  );
});

test("light palettes keep the full background pool", () => {
  const weights = filterBackgroundWeightsByScheme("light");

  assert.equal(Object.keys(weights).length, Object.keys(PAGE_BACKGROUND_WEIGHTS).length);
  assert.equal(weights.dots, 17);
  assert.equal(weights["subtle-grid"], 16);
});

test("selectPageBackground respects palette color scheme", () => {
  for (let index = 0; index < 500; index += 1) {
    const background = selectPageBackground("dark", pick, pickWeighted);

    assert.notEqual(background.style, "dots");
    assert.notEqual(background.style, "subtle-grid");
  }
});

test("light palettes still allow dots and subtle grid", () => {
  const counts = { dots: 0, "subtle-grid": 0 };

  for (let index = 0; index < 4000; index += 1) {
    const background = selectPageBackground("light", pick, pickWeighted);

    if (background.style === "dots") {
      counts.dots += 1;
    }

    if (background.style === "subtle-grid") {
      counts["subtle-grid"] += 1;
    }
  }

  assert.ok(counts.dots >= 400);
  assert.ok(counts["subtle-grid"] >= 400);
});
