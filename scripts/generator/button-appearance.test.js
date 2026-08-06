import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveButtonLibraryIcon,
  resolveLibraryIconName,
} from "../../plugins/pug-pages/assets/icon-aliases.js";
import {
  BUTTON_ICON_PRESETS,
  resolveButtonIcon,
} from "../../plugins/pug-pages/button-appearance.js";
import { libraryIcon } from "../../plugins/pug-pages/assets/library-icon.js";
import { readFileSync } from "node:fs";

test("resolveButtonIcon prefers explicit options.icon over page appearance", () => {
  assert.equal(
    resolveButtonIcon(
      { variant: "primary", icon: "phone" },
      { controls: { button: { icon: "arrow-right" } } },
    ),
    "phone",
  );
});

test("resolveButtonIcon uses page appearance for primary buttons", () => {
  assert.equal(
    resolveButtonIcon(
      { variant: "primary" },
      { controls: { button: { icon: "arrow-long-right" } } },
    ),
    "arrow-long-right",
  );
});

test("resolveButtonIcon uses page appearance for inverse link buttons", () => {
  assert.equal(
    resolveButtonIcon(
      { variant: "inverse" },
      { controls: { button: { icon: "arrow-right" } } },
    ),
    "arrow-right",
  );
});

test("resolveButtonIcon skips page appearance for secondary variants", () => {
  assert.equal(
    resolveButtonIcon(
      { variant: "secondary" },
      { controls: { button: { icon: "arrow-right" } } },
    ),
    null,
  );
});

test("resolveButtonIcon returns null when page icon is none", () => {
  assert.equal(
    resolveButtonIcon(
      { variant: "primary" },
      { controls: { button: { icon: "none" } } },
    ),
    null,
  );
});

test("resolveButtonIcon rejects unknown page icons", () => {
  assert.throws(
    () =>
      resolveButtonIcon(
        { variant: "primary" },
        { controls: { button: { icon: "sparkles" } } },
      ),
    /Unknown page button icon/,
  );
});

test("resolveButtonLibraryIcon maps long arrow preset per icon set", () => {
  assert.equal(
    resolveButtonLibraryIcon("arrow-long-right", "lucide"),
    "move-right",
  );
  assert.equal(
    resolveButtonLibraryIcon("arrow-long-right", "tabler"),
    "arrow-narrow-right",
  );
  assert.equal(resolveButtonLibraryIcon("arrow-right", "tabler"), "arrow-right");
});

test("resolveLibraryIconName maps cross-set content icon names", () => {
  assert.equal(resolveLibraryIconName("device-mobile", "lucide"), "smartphone");
  assert.equal(resolveLibraryIconName("move-right", "tabler"), "arrow-narrow-right");
});

test("libraryIcon resolves aliases for both icon sets", () => {
  assert.match(libraryIcon("move-right", "tabler"), /^<!-- prettier-ignore --><svg /);
  assert.match(libraryIcon("device-mobile", "lucide"), /^<!-- prettier-ignore --><svg /);
});

test("BUTTON_ICON_PRESETS includes a none option", () => {
  assert.ok(BUTTON_ICON_PRESETS.some((preset) => preset.icon === "none"));
});

test("site.json icon references resolve in the active icon set", () => {
  const site = JSON.parse(readFileSync("src/pug/data/site.json", "utf8"));
  const iconSet = site.design?.iconSet || "lucide";

  assert.doesNotThrow(() => libraryIcon("device-mobile", iconSet));
  assert.doesNotThrow(() =>
    libraryIcon(resolveButtonLibraryIcon("arrow-long-right", iconSet), iconSet),
  );
});
