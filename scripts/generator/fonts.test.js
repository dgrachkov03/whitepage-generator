import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { fontCatalog } from "../../plugins/pug-pages/fonts/catalog.js";
import { getFontsByRole, renderFonts } from "../../plugins/pug-pages/fonts/index.js";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

test("every catalog font file exists on disk", () => {
  Object.entries(fontCatalog).forEach(([id, font]) => {
    if (font.source === "google") {
      return;
    }

    font.files.forEach((file) => {
      const filePath = path.join(projectRoot, file.src.replace(/^\//, ""));

      assert.ok(
        fs.existsSync(filePath),
        `Missing font file for "${id}": ${file.src}`,
      );
    });
  });
});

test("font pools include modern display, body, and mono options", () => {
  const displayFonts = getFontsByRole("display");
  const bodyFonts = getFontsByRole("body");
  const monoFonts = getFontsByRole("mono");

  assert.ok(displayFonts.length >= 8);
  assert.ok(bodyFonts.length >= 8);
  assert.ok(monoFonts.length >= 4);
  assert.ok(displayFonts.includes("bricolage-grotesque"));
  assert.ok(displayFonts.includes("instrument-sans"));
  assert.ok(bodyFonts.includes("instrument-sans"));
  assert.ok(monoFonts.includes("ibm-plex-mono"));
  assert.ok(monoFonts.includes("jetbrains-mono"));
});

test("renderFonts adds Noto Sans as a script fallback stack", () => {
  const css = renderFonts({
    display: "poppins",
    body: "inter",
    mono: "ibm-plex-mono",
  });

  assert.match(css, /Noto Sans/);
  assert.match(
    css,
    /--site-font-body: "Inter", "Noto Sans", sans-serif;/,
  );
  assert.match(
    css,
    /--site-font-display: "Poppins", "Noto Sans", sans-serif;/,
  );
  assert.match(css, /--site-font-mono: "IBM Plex Mono", monospace;/);
});

test("renderFonts loads a display, body, and mono trio", () => {
  const css = renderFonts({
    display: "bricolage-grotesque",
    body: "instrument-sans",
    mono: "jetbrains-mono",
  });

  assert.match(css, /Bricolage Grotesque/);
  assert.match(css, /Instrument Sans/);
  assert.match(css, /JetBrains Mono/);
  assert.match(css, /--site-font-display-heading-weight: 700/);
});

test("renderFonts loads locally hosted preview fonts", () => {
  const css = renderFonts({
    display: "figtree",
    body: "work-sans",
    mono: "dm-mono",
  });

  assert.match(css, /src: url\("\/src\/assets\/fonts\/Figtree\/Figtree-VariableFont\.woff2"\)/);
  assert.match(css, /src: url\("\/src\/assets\/fonts\/Work_Sans\/WorkSans-VariableFont\.woff2"\)/);
  assert.match(css, /--site-font-display: "Figtree", "Noto Sans", sans-serif;/);
  assert.match(css, /--site-font-body: "Work Sans", "Noto Sans", sans-serif;/);
});
