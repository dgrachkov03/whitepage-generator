export const EYEBROW_VARIANTS = ["dot", "line", "badge"];

const EYEBROW_OVERRIDE_VARIANTS = ["photo", "inverse"];

const ALL_EYEBROW_VARIANTS = new Set([
  ...EYEBROW_VARIANTS,
  ...EYEBROW_OVERRIDE_VARIANTS,
]);

export function isEyebrowEnabled(pageAppearance = {}) {
  return pageAppearance?.eyebrow?.enabled !== false;
}

export function resolveEyebrowVariant(options = {}, pageAppearance = {}) {
  const override = options.eyebrowVariant;

  if (override !== undefined && override !== null && override !== "") {
    if (!ALL_EYEBROW_VARIANTS.has(override)) {
      throw new Error(
        `Unknown eyebrow variant "${override}". Expected: ${[...ALL_EYEBROW_VARIANTS].join(", ")}`,
      );
    }

    return override;
  }

  const globalVariant = pageAppearance?.eyebrow?.variant;

  if (globalVariant) {
    if (!EYEBROW_VARIANTS.includes(globalVariant)) {
      throw new Error(
        `Unknown page eyebrow variant "${globalVariant}". Expected: ${EYEBROW_VARIANTS.join(", ")}`,
      );
    }

    return globalVariant;
  }

  return "line";
}
