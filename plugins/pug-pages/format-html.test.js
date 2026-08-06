import assert from "node:assert/strict";
import test from "node:test";
import { formatHtml } from "./format-html.js";

test("formatHtml indents nested tags and inline styles", async () => {
  const formatted = await formatHtml(
    '<!DOCTYPE html><html><head><style>@font-face { font-family: "A"; }</style></head><body><div><a href="/">Home</a></div></body></html>',
  );

  assert.match(formatted, /^<!DOCTYPE html>\n<html>/);
  assert.match(formatted, /^\s{4}<style>/m);
  assert.match(formatted, /^\s{6}@font-face \{/m);
  assert.match(formatted, /<div><a href="\/">Home<\/a><\/div>/);
});

test("formatHtml preserves svg after prettier-ignore comment", async () => {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em"><path d="M0 0"/></svg>';
  const formatted = await formatHtml(
    `<!DOCTYPE html><html><body><!-- prettier-ignore -->${svg}</body></html>`,
  );

  assert.match(formatted, /<!-- prettier-ignore -->\n\s*<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="1em" height="1em"><path d="M0 0"\/><\/svg>/);
});
