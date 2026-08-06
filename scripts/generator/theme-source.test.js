import assert from "node:assert/strict";
import test from "node:test";
import { createSelection } from "./composition.js";
import { discoverOptions } from "./discovery.js";
import { createThemeSource } from "./theme-source.js";

test("createThemeSource writes shared theme blocks once", () => {
  const selection = createSelection(discoverOptions());
  const source = createThemeSource(selection);

  assert.match(source, /^extends \/layouts\/main\.pug/);
  assert.match(source, /block themeSetup/);
  assert.match(source, /pageAppearance = \{/);
  assert.match(source, /eyebrow: \{/);
  assert.match(source, /enabled: (true|false)/);
  assert.match(source, /variant: "(dot|line|badge)"/);
  assert.match(source, /menu: "(drawer-right|fullscreen|dropdown)"/);
  assert.match(source, /burger: "(stacked|plus|dots)"/);
  assert.match(source, /burgerBorder: (true|false)/);
  assert.match(source, /icon: "(none|arrow-right|arrow-long-right|arrow-up-right)"/);
  assert.match(source, /block font/);
  assert.match(source, /block design/);
  assert.match(source, /block interactions/);
  assert.doesNotMatch(source, /block content/);
});
