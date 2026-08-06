const SIZE_CLASSES = {
  compact: "controls--compact",
  medium: "controls--medium",
  large: "controls--large",
};

const BUTTON_STYLE_CLASSES = {
  solid: "controls-buttons--solid",
  gradient: "controls-buttons--gradient",
  outline: "controls-buttons--outline",
};

const BUTTON_HOVER_CLASSES = {
  darken: "controls-buttons-hover--darken",
  brighten: "controls-buttons-hover--brighten",
  lift: "controls-buttons-hover--lift",
  glow: "controls-buttons-hover--glow",
};

const INPUT_STYLE_CLASSES = {
  outlined: "controls-inputs--outlined",
  filled: "controls-inputs--filled",
  underline: "controls-inputs--underline",
};

const ALLOWED_OPTIONS = new Set(["size", "button", "input"]);
const ALLOWED_BUTTON_OPTIONS = new Set(["style", "hover", "icon"]);
const ALLOWED_INPUT_OPTIONS = new Set(["style"]);

function validateButtonComponent(component) {
  if (!component || typeof component !== "object" || Array.isArray(component)) {
    throw new Error("Button appearance must be an object");
  }

  const unknownOptions = Object.keys(component).filter(
    (option) => !ALLOWED_BUTTON_OPTIONS.has(option),
  );

  if (unknownOptions.length) {
    throw new Error(
      `Unknown button appearance options: ${unknownOptions.join(", ")}`,
    );
  }

  const styleClass = BUTTON_STYLE_CLASSES[component.style || "solid"];

  if (!styleClass) {
    throw new Error(
      `Unknown button style "${component.style}". Expected: ${Object.keys(BUTTON_STYLE_CLASSES).join(", ")}`,
    );
  }

  const hover = component.hover;

  if (hover === undefined) {
    return styleClass;
  }

  const hoverClass = BUTTON_HOVER_CLASSES[hover];

  if (!hoverClass) {
    throw new Error(
      `Unknown button hover "${hover}". Expected: ${Object.keys(BUTTON_HOVER_CLASSES).join(", ")}`,
    );
  }

  return `${styleClass} ${hoverClass}`;
}

function validateInputComponent(component) {
  if (!component || typeof component !== "object" || Array.isArray(component)) {
    throw new Error("Input appearance must be an object");
  }

  const unknownOptions = Object.keys(component).filter(
    (option) => !ALLOWED_INPUT_OPTIONS.has(option),
  );

  if (unknownOptions.length) {
    throw new Error(
      `Unknown input appearance options: ${unknownOptions.join(", ")}`,
    );
  }

  const styleClass = INPUT_STYLE_CLASSES[component.style || "outlined"];

  if (!styleClass) {
    throw new Error(
      `Unknown input style "${component.style}". Expected: ${Object.keys(INPUT_STYLE_CLASSES).join(", ")}`,
    );
  }

  return styleClass;
}

export function controlAppearanceClasses(options = {}) {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new Error("Controls appearance must be an object");
  }

  const unknownOptions = Object.keys(options).filter(
    (option) => !ALLOWED_OPTIONS.has(option),
  );

  if (unknownOptions.length) {
    throw new Error(
      `Unknown controls appearance options: ${unknownOptions.join(", ")}`,
    );
  }

  const size = options.size || "medium";
  const sizeClass = SIZE_CLASSES[size];

  if (!sizeClass) {
    throw new Error(
      `Unknown controls size "${size}". Expected: ${Object.keys(SIZE_CLASSES).join(", ")}`,
    );
  }

  const buttonClass = validateButtonComponent(
    options.button || { style: "solid" },
  );
  const inputClass = validateInputComponent(
    options.input || { style: "outlined" },
  );

  return ["controls", sizeClass, buttonClass, inputClass].join(" ");
}
