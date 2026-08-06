import assert from "node:assert/strict";
import test from "node:test";
import {
  groupLegalSectionsByH2,
  legalSectionSlug,
} from "../../plugins/pug-pages/legal-sections.js";

test("legalSectionSlug normalizes heading text", () => {
  assert.equal(
    legalSectionSlug("1. Responsable du traitement"),
    "1-responsable-du-traitement",
  );
});

test("groupLegalSectionsByH2 splits sections by level 2 headings", () => {
  const groups = groupLegalSectionsByH2([
    { type: "paragraph", text: "Intro" },
    { type: "heading", level: 2, text: "Section A" },
    { type: "paragraph", text: "Body A" },
    { type: "heading", level: 2, text: "Section B" },
    { type: "list", items: ["One"] },
  ]);

  assert.equal(groups.length, 3);
  assert.equal(groups[0].heading, null);
  assert.deepEqual(groups[0].sections, [{ type: "paragraph", text: "Intro" }]);
  assert.equal(groups[1].heading.text, "Section A");
  assert.equal(groups[2].heading.text, "Section B");
});
