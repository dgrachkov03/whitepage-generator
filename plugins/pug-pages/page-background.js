const STYLE_CLASSES = {
  none: "page-background--none",
  dots: "page-background--dots",
  gradient: "page-background--gradient",
  "subtle-grid": "page-background--subtle-grid",
  "block-glow": "page-background--block-glow",
  "mesh-blocks": "page-background--mesh-blocks",
};

export const STRONG_BORDER_STYLES = ["subtle-grid"];

const DOTS_ON_CLASSES = {
  base: "page-background--dots-on-base",
  alternate: "page-background--dots-on-alt",
};

const ALLOWED_OPTIONS = new Set(["style", "dotsOn"]);

export function pageBackgroundClasses(options = {}) {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new Error("Page background must be an object");
  }

  const unknownOptions = Object.keys(options).filter(
    (option) => !ALLOWED_OPTIONS.has(option),
  );

  if (unknownOptions.length) {
    throw new Error(
      `Unknown page background options: ${unknownOptions.join(", ")}`,
    );
  }

  const style = options.style || "none";
  const styleClass = STYLE_CLASSES[style];

  if (!styleClass) {
    throw new Error(
      `Unknown page background style "${style}". Expected: ${Object.keys(STYLE_CLASSES).join(", ")}`,
    );
  }

  const classes = ["page-background", styleClass];

  if (STRONG_BORDER_STYLES.includes(style)) {
    classes.push("page-background--strong-borders");
  }

  if (style === "dots") {
    const dotsOn = options.dotsOn || "alternate";
    const dotsOnClass = DOTS_ON_CLASSES[dotsOn];

    if (!dotsOnClass) {
      throw new Error(
        `Unknown dots placement "${dotsOn}". Expected: ${Object.keys(DOTS_ON_CLASSES).join(", ")}`,
      );
    }

    classes.push(dotsOnClass);
  } else if (options.dotsOn) {
    throw new Error('Page background option "dotsOn" is only valid with style "dots"');
  }

  return classes.join(" ");
}
