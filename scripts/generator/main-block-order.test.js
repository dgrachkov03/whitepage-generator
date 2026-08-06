import assert from "node:assert/strict";
import test from "node:test";
import {
  MAIN_BLOCKS,
} from "./config.js";
import {
  MAIN_ORDER_TEMPLATES,
  orderMainBlocks,
} from "./main-block-order.js";

function createAlwaysChance(results) {
  let index = 0;

  return () => {
    const result = results[Math.min(index, results.length - 1)];
    index += 1;
    return result;
  };
}

function createTemplatePick(templateIndex) {
  return () => MAIN_ORDER_TEMPLATES[templateIndex];
}

function selectMainBlocks(optionalDirectories) {
  return MAIN_BLOCKS.filter(
    (slot) =>
      slot.required || optionalDirectories.includes(slot.directory),
  );
}

test("contact is required in every main composition", () => {
  assert.ok(MAIN_BLOCKS.some((slot) => slot.directory === "contact"));
  assert.equal(
    MAIN_BLOCKS.find((slot) => slot.directory === "contact")?.required,
    true,
  );
});

test("orderMainBlocks keeps hero first and contact in the bottom two slots", () => {
  const mainBlocks = selectMainBlocks(["about", "features", "faq"]);

  for (let index = 0; index < MAIN_ORDER_TEMPLATES.length; index += 1) {
    const ordered = orderMainBlocks(
      mainBlocks,
      () => index % 2 === 0,
      createTemplatePick(index),
    );
    const directories = ordered.map((slot) => slot.directory);
    const contactIndex = directories.indexOf("contact");

    assert.equal(directories[0], "hero");
    assert.ok(
      contactIndex === directories.length - 1 ||
        contactIndex === directories.length - 2,
    );
    assert.deepEqual(
      new Set(directories),
      new Set(mainBlocks.map((slot) => slot.directory)),
    );
  }
});

test("orderMainBlocks ends with contact when footer reorder is enabled", () => {
  const mainBlocks = selectMainBlocks(["about", "features", "process"]);
  const ordered = orderMainBlocks(
    mainBlocks,
    createAlwaysChance([true]),
    createTemplatePick(0),
  );

  assert.equal(ordered.at(-1)?.directory, "contact");
});

test("orderMainBlocks keeps template order when footer reorder is disabled", () => {
  const mainBlocks = selectMainBlocks(["about", "why-us", "faq"]);
  const ordered = orderMainBlocks(
    mainBlocks,
    createAlwaysChance([false]),
    createTemplatePick(0),
  );

  assert.equal(ordered.at(-1)?.directory, "contact");
  assert.equal(ordered.at(-2)?.directory, "faq");
  assert.equal(ordered.at(-3)?.directory, "reviews");
});

test("orderMainBlocks keeps faq near the footer across templates", () => {
  const mainBlocks = selectMainBlocks(["about", "features", "process", "faq"]);

  for (let index = 0; index < MAIN_ORDER_TEMPLATES.length; index += 1) {
    const ordered = orderMainBlocks(
      mainBlocks,
      createAlwaysChance([false]),
      createTemplatePick(index),
    );
    const directories = ordered.map((slot) => slot.directory);
    const faqIndex = directories.indexOf("faq");
    const contactIndex = directories.indexOf("contact");

    assert.ok(faqIndex >= 0);
    assert.ok(contactIndex - faqIndex <= 2);
    assert.ok(faqIndex > directories.indexOf("features"));
    assert.ok(faqIndex > directories.indexOf("about"));
  }
});

test("orderMainBlocks places pricing before reviews when both are selected", () => {
  const mainBlocks = selectMainBlocks(["about", "features", "pricing", "faq"]);
  const ordered = orderMainBlocks(
    mainBlocks,
    createAlwaysChance([false]),
    createTemplatePick(0),
  );

  const directories = ordered.map((slot) => slot.directory);
  const pricingIndex = directories.indexOf("pricing");
  const reviewsIndex = directories.indexOf("reviews");

  assert.ok(pricingIndex >= 0);
  assert.ok(reviewsIndex >= 0);
  assert.ok(pricingIndex < reviewsIndex);
});

test("orderMainBlocks places services after features when both are selected", () => {
  const mainBlocks = selectMainBlocks(["about", "features", "services", "faq"]);
  const ordered = orderMainBlocks(
    mainBlocks,
    createAlwaysChance([false]),
    createTemplatePick(0),
  );

  const directories = ordered.map((slot) => slot.directory);
  const featuresIndex = directories.indexOf("features");
  const servicesIndex = directories.indexOf("services");

  assert.ok(featuresIndex >= 0);
  assert.ok(servicesIndex >= 0);
  assert.ok(servicesIndex > featuresIndex);
});

test("orderMainBlocks uses classic template order when selected", () => {
  const mainBlocks = selectMainBlocks(["about", "features", "why-us", "faq"]);
  const ordered = orderMainBlocks(
    mainBlocks,
    createAlwaysChance([false]),
    createTemplatePick(0),
  );

  assert.deepEqual(
    ordered.map((slot) => slot.directory),
    ["hero", "about", "features", "why-us", "reviews", "faq", "contact"],
  );
});

test("orderMainBlocks can produce multiple template-driven orderings", () => {
  const mainBlocks = selectMainBlocks(["about", "features", "process", "faq"]);
  const seen = new Set(
    MAIN_ORDER_TEMPLATES.map((_, index) =>
      orderMainBlocks(
        mainBlocks,
        createAlwaysChance([false]),
        createTemplatePick(index),
      )
        .map((slot) => slot.directory)
        .join("|"),
    ),
  );

  assert.ok(seen.size > 1);
});
