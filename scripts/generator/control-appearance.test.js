import assert from "node:assert/strict";
import test from "node:test";
import { controlAppearanceClasses } from "../../plugins/pug-pages/control-appearance.js";
import { CONTROL_PRESETS } from "./config.js";

test("controls appearance combines shared size with component styles", () => {
  assert.equal(
    controlAppearanceClasses({
      size: "large",
      button: { style: "gradient" },
      input: { style: "filled" },
    }),
    "controls controls--large controls-buttons--gradient controls-inputs--filled",
  );
});

test("controls appearance supports optional button hover effects", () => {
  assert.equal(
    controlAppearanceClasses({
      button: { style: "gradient", hover: "lift" },
    }),
    "controls controls--medium controls-buttons--gradient controls-buttons-hover--lift controls-inputs--outlined",
  );

  assert.throws(
    () =>
      controlAppearanceClasses({
        button: { style: "solid", hover: "pulse" },
      }),
    /Unknown button hover "pulse"/,
  );

  assert.throws(
    () =>
      controlAppearanceClasses({
        button: { style: "solid", hover: "lift", ripple: true },
      }),
    /Unknown button appearance options: ripple/,
  );
});

test("controls appearance provides a coherent default", () => {
  assert.equal(
    controlAppearanceClasses(),
    "controls controls--medium controls-buttons--solid controls-inputs--outlined",
  );
});

test("all generator control presets satisfy the appearance contract", () => {
  CONTROL_PRESETS.forEach((preset) => {
    assert.doesNotThrow(() =>
      controlAppearanceClasses({
        size: preset.size,
        button: { style: preset.buttonStyle },
        input: { style: preset.inputStyle },
      }),
    );
  });
});

test("controls appearance rejects unknown component styles", () => {
  assert.throws(
    () =>
      controlAppearanceClasses({
        input: { style: "gradient" },
      }),
    /Unknown input style "gradient"/,
  );
});
