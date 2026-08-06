import { fontCatalog } from "./catalog.js";

const FONT_ROLES = new Set(["display", "body", "mono"]);
const SCRIPT_FALLBACK_FONT_ID = "noto-sans";

function getFont(id, role) {
  if (!id || typeof id !== "string") {
    throw new Error(`A font id is required for the "${role}" role`);
  }

  const font = fontCatalog[id];

  if (!font) {
    throw new Error(
      `Unknown font "${id}". Available ${role} fonts: ${getFontsByRole(role).join(", ")}`,
    );
  }

  if (!font.roles.includes(role)) {
    throw new Error(`Font "${id}" cannot be used for the "${role}" role`);
  }

  return font;
}

function renderFontFace(font) {
  return font.files
    .map(
      (file) => `@font-face {
  font-family: "${font.family}";
  src: url("${file.src}") format("${file.format || "woff2"}");
  font-weight: ${file.weight};
  font-style: ${file.style || "normal"};
  font-display: swap;
}`,
    )
    .join("\n\n");
}

function renderGoogleFontImport(font) {
  return `@import url("https://fonts.googleapis.com/css2?family=${font.googleFonts}&display=swap");`;
}

function renderFontSource(font) {
  if (font.source === "google") {
    return renderGoogleFontImport(font);
  }

  return renderFontFace(font);
}

function buildFontStack(font) {
  const stack = [`"${font.family}"`];

  if (font.fallback === "monospace") {
    stack.push(font.fallback);
    return stack.join(", ");
  }

  if (font.family !== fontCatalog[SCRIPT_FALLBACK_FONT_ID]?.family) {
    stack.push(`"${fontCatalog[SCRIPT_FALLBACK_FONT_ID].family}"`);
  }

  stack.push(font.fallback);

  return stack.join(", ");
}

function collectFontsForRender(display, body, mono) {
  const selected = [display, body, mono];
  const fallback = fontCatalog[SCRIPT_FALLBACK_FONT_ID];

  if (
    fallback &&
    display.family !== fallback.family &&
    body.family !== fallback.family
  ) {
    selected.push(fallback);
  }

  return [...new Map(selected.map((font) => [font.family, font])).values()];
}

export function getFontsByRole(role) {
  if (!FONT_ROLES.has(role)) {
    throw new Error(`Unknown font role: ${role}`);
  }

  return Object.entries(fontCatalog)
    .filter(([, font]) => font.roles.includes(role))
    .map(([id]) => id);
}

export function renderFonts(selection) {
  if (!selection || typeof selection !== "object") {
    throw new Error("Font selection must include display, body, and mono font ids");
  }

  const display = getFont(selection.display, "display");
  const body = getFont(selection.body, "body");
  const mono = getFont(selection.mono, "mono");
  const fontsToRender = collectFontsForRender(display, body, mono);
  const fontFaces = fontsToRender.map(renderFontSource).join("\n\n");

  return `${fontFaces}

:root {
  --site-font-display: ${buildFontStack(display)};
  --site-font-body: ${buildFontStack(body)};
  --site-font-mono: ${buildFontStack(mono)};
  --site-font-display-heading-weight: ${display.displayWeights.heading};
  --site-font-display-subtitle-weight: ${display.displayWeights.subtitle};
}`;
}
