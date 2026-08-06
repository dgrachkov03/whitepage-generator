import {
  PAGE_BACKGROUND_SCHEMES,
  PAGE_BACKGROUND_WEIGHTS,
} from "./config.js";
import { pickWeighted } from "./weighted-pick.js";

export function filterBackgroundWeightsByScheme(
  colorScheme,
  weights = PAGE_BACKGROUND_WEIGHTS,
  schemes = PAGE_BACKGROUND_SCHEMES,
) {
  return Object.fromEntries(
    Object.entries(weights).filter(([style]) =>
      (schemes[style] ?? ["light", "dark"]).includes(colorScheme),
    ),
  );
}

export function selectPageBackground(colorScheme, pick, pickWeightedFn = pickWeighted) {
  const weights = filterBackgroundWeightsByScheme(colorScheme);
  const style = pickWeightedFn(weights, "page background");
  const background = { style };

  if (style === "dots") {
    background.dotsOn = pick(["base", "alternate"], "dots on");
  }

  return background;
}
