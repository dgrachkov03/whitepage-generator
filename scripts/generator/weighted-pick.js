import { randomInt } from "node:crypto";

export function pickWeighted(weights, label) {
  const entries = Object.entries(weights);

  if (!entries.length) {
    throw new Error(`Cannot select ${label}: no options are available`);
  }

  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = randomInt(totalWeight);

  for (const [key, weight] of entries) {
    roll -= weight;

    if (roll < 0) {
      return key;
    }
  }

  return entries.at(-1)[0];
}
