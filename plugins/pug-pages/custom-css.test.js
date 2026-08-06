import assert from "node:assert/strict";
import test from "node:test";
import { customCssHref, injectCustomCssLink } from "./custom-css.js";

const mainStylesheet = `<link
      rel="stylesheet"
      crossorigin
      href="./assets/styles/main.css"
    />`;

test("injectCustomCssLink adds custom.css after main stylesheet", () => {
  const html = `<!DOCTYPE html><html><head>${mainStylesheet}</head></html>`;
  const updated = injectCustomCssLink(html);

  assert.match(
    updated,
    new RegExp(
      `${mainStylesheet}\\s*<link rel="stylesheet" href="${customCssHref.replaceAll(".", "\\.")}" />`,
    ),
  );
});

test("injectCustomCssLink is idempotent", () => {
  const html = injectCustomCssLink(`<head>${mainStylesheet}</head>`);
  const updated = injectCustomCssLink(html);

  assert.equal(
    updated.match(new RegExp(customCssHref.replaceAll(".", "\\."), "g"))?.length,
    1,
  );
});

test("injectCustomCssLink throws when main stylesheet is missing", () => {
  assert.throws(
    () => injectCustomCssLink("<head></head>"),
    /Main stylesheet link not found/,
  );
});
