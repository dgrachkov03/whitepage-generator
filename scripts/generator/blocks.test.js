import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { blocksDirectory } from "./config.js";

const aboutDirectory = path.join(blocksDirectory, "about");
const topbarDirectory = path.join(blocksDirectory, "topbar");
const contactDirectory = path.join(blocksDirectory, "contact");
const faqDirectory = path.join(blocksDirectory, "faq");
const featuresDirectory = path.join(blocksDirectory, "features");
const heroDirectory = path.join(blocksDirectory, "hero");
const pricingDirectory = path.join(blocksDirectory, "pricing");
const processDirectory = path.join(blocksDirectory, "process");
const reviewsDirectory = path.join(blocksDirectory, "reviews");
const servicesDirectory = path.join(blocksDirectory, "services");
const statsDirectory = path.join(blocksDirectory, "stats");
const whyUsDirectory = path.join(blocksDirectory, "why-us");
const headerDirectory = path.join(blocksDirectory, "header");

test("header category includes three block variants", () => {
  const variants = fs
    .readdirSync(headerDirectory)
    .filter((entry) => entry.endsWith(".pug") && !entry.startsWith("_"))
    .sort();

  assert.equal(variants.length, 3);
  assert.deepEqual(variants, [
    "nav-end.pug",
    "nav-split.pug",
    "nav-start.pug",
  ]);
});

test("about category includes six block variants", () => {
  const variants = fs
    .readdirSync(aboutDirectory)
    .filter((entry) => entry.endsWith(".pug"))
    .sort();

  assert.equal(variants.length, 6);
  assert.deepEqual(variants, [
    "centered-story.pug",
    "editorial-banner.pug",
    "image-left.pug",
    "image-right.pug",
    "quote-panel.pug",
    "values-grid.pug",
  ]);
});

test("topbar category includes eight block variants", () => {
  const variants = fs
    .readdirSync(topbarDirectory)
    .filter((entry) => entry.endsWith(".pug"))
    .sort();

  assert.equal(variants.length, 8);
  assert.deepEqual(variants, [
    "button-cta.pug",
    "centered-action.pug",
    "contact-icons.pug",
    "inline-separators.pug",
    "message-only.pug",
    "split-action.pug",
    "split-info.pug",
    "stacked-contacts.pug",
  ]);
});

test("features category includes seven block variants", () => {
  const variants = fs
    .readdirSync(featuresDirectory)
    .filter((entry) => entry.endsWith(".pug"))
    .sort();

  assert.equal(variants.length, 7);
  assert.deepEqual(variants, [
    "alternating-media.pug",
    "editorial-lead.pug",
    "icon-cards.pug",
    "media-cards.pug",
    "numbered-grid.pug",
    "split-icon-list-left.pug",
    "split-icon-list-right.pug",
  ]);
});

test("contact category includes eight block variants", () => {
  const variants = fs
    .readdirSync(contactDirectory)
    .filter((entry) => entry.endsWith(".pug"))
    .sort();

  assert.equal(variants.length, 8);
  assert.deepEqual(variants, [
    "centered-form-details-bottom.pug",
    "centered-form-details-top.pug",
    "centered-form.pug",
    "channel-grid-left.pug",
    "channel-grid-right.pug",
    "split-form-benefits-left.pug",
    "split-form-benefits-right.pug",
    "split-form.pug",
  ]);
});

test("faq category includes ten block variants", () => {
  const variants = fs
    .readdirSync(faqDirectory)
    .filter((entry) => entry.endsWith(".pug"))
    .sort();

  assert.equal(variants.length, 10);
  assert.deepEqual(variants, [
    "accordion.pug",
    "centered-accordion.pug",
    "centered-joined-accordion.pug",
    "columns-accordion.pug",
    "compact-accordion.pug",
    "numbered-grid.pug",
    "split-accordion-left.pug",
    "split-accordion-right.pug",
    "split-image-accordion-left.pug",
    "split-image-accordion-right.pug",
  ]);
});

test("hero category includes nine block variants", () => {
  const variants = fs
    .readdirSync(heroDirectory)
    .filter((entry) => entry.endsWith(".pug"))
    .sort();

  assert.equal(variants.length, 9);
  assert.deepEqual(variants, [
    "overlay-bottom.pug",
    "overlay-centered.pug",
    "overlay-left.pug",
    "split-bleed-left.pug",
    "split-bleed-right.pug",
    "split-image-left.pug",
    "split-image-right.pug",
    "split-panel-left.pug",
    "split-panel-right.pug",
  ]);
});

test("services category includes six block variants", () => {
  const variants = fs
    .readdirSync(servicesDirectory)
    .filter((entry) => entry.endsWith(".pug"))
    .sort();

  assert.equal(variants.length, 6);
  assert.deepEqual(variants, [
    "band-strip.pug",
    "catalog-rows.pug",
    "featured-split.pug",
    "offer-table.pug",
    "panel-grid.pug",
    "spotlight-alternating.pug",
  ]);
});

test("pricing category includes five block variants", () => {
  const variants = fs
    .readdirSync(pricingDirectory)
    .filter((entry) => entry.endsWith(".pug"))
    .sort();

  assert.equal(variants.length, 5);
  assert.deepEqual(variants, [
    "comparison-table.pug",
    "highlight-rows.pug",
    "menu-dotted.pug",
    "spectrum-rail.pug",
    "tier-cards.pug",
  ]);
});

test("reviews category includes six block variants", () => {
  const variants = fs
    .readdirSync(reviewsDirectory)
    .filter((entry) => entry.endsWith(".pug"))
    .sort();

  assert.equal(variants.length, 6);
  assert.deepEqual(variants, [
    "cards-carousel-header.pug",
    "cards-carousel.pug",
    "cards-grid.pug",
    "centered-cards-actions.pug",
    "featured-split.pug",
    "spotlight-fade.pug",
  ]);
});

test("process category includes seven block variants", () => {
  const variants = fs
    .readdirSync(processDirectory)
    .filter((entry) => entry.endsWith(".pug"))
    .sort();

  assert.equal(variants.length, 7);
  assert.deepEqual(variants, [
    "accordion-flow.pug",
    "alternating-path.pug",
    "card-grid.pug",
    "horizontal-timeline.pug",
    "split-steps-left.pug",
    "split-steps-right.pug",
    "watermark-steps.pug",
  ]);
});

test("stats category includes seven block variants", () => {
  const variants = fs
    .readdirSync(statsDirectory)
    .filter((entry) => entry.endsWith(".pug"))
    .sort();

  assert.equal(variants.length, 7);
  assert.deepEqual(variants, [
    "accent-band.pug",
    "centered.pug",
    "highlight.pug",
    "inline.pug",
    "split-panel-left.pug",
    "split-panel-right.pug",
    "spotlight-bento.pug",
  ]);
});

test("why-us category includes nine block variants", () => {
  const variants = fs
    .readdirSync(whyUsDirectory)
    .filter((entry) => entry.endsWith(".pug"))
    .sort();

  assert.equal(variants.length, 9);
  assert.deepEqual(variants, [
    "accent-rows.pug",
    "checklist-panel-left.pug",
    "checklist-panel-right.pug",
    "editorial-split-left.pug",
    "editorial-split-right.pug",
    "icon-columns.pug",
    "icon-list-gallery-left.pug",
    "icon-list-gallery-right.pug",
    "statement-bento.pug",
  ]);
});

test("footer category includes four block variants", () => {
  const variants = fs
    .readdirSync(path.join(blocksDirectory, "footer"))
    .filter((name) => name.endsWith(".pug"))
    .sort();

  assert.equal(variants.length, 4);
  assert.deepEqual(variants, [
    "brand-description-contact-bar.pug",
    "brand-nav-legal-bar.pug",
    "columns-contact.pug",
    "cta-brand-panel.pug",
  ]);
});

