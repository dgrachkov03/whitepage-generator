import { randomInt } from "node:crypto";
import { FOOTER_REORDER_CHANCE } from "./config.js";

export const MAIN_ORDER_TEMPLATES = [
  [
    "hero",
    "about",
    "stats",
    "features",
    "services",
    "why-us",
    "process",
    "pricing",
    "reviews",
    "faq",
    "contact",
  ],
  [
    "hero",
    "features",
    "services",
    "about",
    "stats",
    "why-us",
    "process",
    "pricing",
    "reviews",
    "faq",
    "contact",
  ],
  [
    "hero",
    "about",
    "stats",
    "why-us",
    "features",
    "services",
    "process",
    "pricing",
    "reviews",
    "faq",
    "contact",
  ],
  [
    "hero",
    "features",
    "services",
    "process",
    "about",
    "stats",
    "why-us",
    "pricing",
    "reviews",
    "faq",
    "contact",
  ],
  [
    "hero",
    "about",
    "stats",
    "features",
    "services",
    "pricing",
    "reviews",
    "why-us",
    "process",
    "faq",
    "contact",
  ],
  [
    "hero",
    "features",
    "about",
    "stats",
    "services",
    "pricing",
    "reviews",
    "faq",
    "contact",
  ],
];

const FALLBACK_MIDDLE_ORDER = [
  "about",
  "stats",
  "features",
  "services",
  "why-us",
  "process",
  "pricing",
  "faq",
];

function defaultPick(options) {
  return options[randomInt(options.length)];
}

function applyFooterOrder(order) {
  const middle = order.filter(
    (directory) =>
      directory !== "reviews" && directory !== "faq" && directory !== "contact",
  );

  const tail = [];

  if (order.includes("faq")) {
    tail.push("faq");
  }

  if (order.includes("reviews")) {
    tail.push("reviews");
  }

  if (order.includes("contact")) {
    tail.push("contact");
  }

  return [...middle, ...tail];
}

function mergeMissingMiddleBlocks(order, selectedDirectories) {
  const selected = new Set(selectedDirectories);
  const missing = FALLBACK_MIDDLE_ORDER.filter(
    (directory) => selected.has(directory) && !order.includes(directory),
  );

  if (!missing.length) {
    return order;
  }

  const contactIndex = order.indexOf("contact");
  const reviewsIndex = order.indexOf("reviews");
  const insertIndex =
    contactIndex === -1
      ? reviewsIndex === -1
        ? order.length
        : reviewsIndex
      : contactIndex;

  return [
    ...order.slice(0, insertIndex),
    ...missing,
    ...order.slice(insertIndex),
  ];
}

export function orderMainBlocks(mainBlocks, chance, pick = defaultPick) {
  const slotsByDirectory = Object.fromEntries(
    mainBlocks.map((slot) => [slot.directory, slot]),
  );
  const selectedDirectories = mainBlocks.map((slot) => slot.directory);
  const selected = new Set(selectedDirectories);

  if (!selected.has("hero") || !selected.has("contact")) {
    throw new Error("Main composition must include hero and contact blocks");
  }

  const template = pick(MAIN_ORDER_TEMPLATES);
  let order = template.filter((directory) => selected.has(directory));
  order = mergeMissingMiddleBlocks(order, selectedDirectories);

  if (chance(FOOTER_REORDER_CHANCE)) {
    order = applyFooterOrder(order);
  }

  return order.map((directory) => {
    const slot = slotsByDirectory[directory];

    if (!slot) {
      throw new Error(`Missing main block slot for "${directory}"`);
    }

    return slot;
  });
}
