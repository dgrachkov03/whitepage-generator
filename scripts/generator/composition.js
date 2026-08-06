import { randomInt } from "node:crypto";
import path from "node:path";
import { BUTTON_ICON_PRESETS } from "../../plugins/pug-pages/button-appearance.js";
import { EYEBROW_VARIANTS } from "../../plugins/pug-pages/eyebrow-appearance.js";
import {
  HEADER_BURGERS,
  HEADER_MENUS,
} from "../../plugins/pug-pages/header-appearance.js";
import {
  BOTTOM_BLOCKS,
  CONTROL_PRESETS,
  MAIN_BLOCKS,
  MAX_OPTIONAL_MAIN_BLOCKS,
  MIN_OPTIONAL_MAIN_BLOCKS,
  SAFE_TONES,
  TOP_BLOCKS,
} from "./config.js";
import { resolveConsentBannerCorner } from "./overlays-source.js";
import { selectPageBackground } from "./page-background-selection.js";
import { orderMainBlocks } from "./main-block-order.js";
import {
  getPaletteColorScheme,
  selectBalancedPalette,
} from "./palettes.js";

function pick(options, label) {
  if (!options.length) {
    throw new Error(`Cannot select ${label}: no options are available`);
  }

  return options[randomInt(options.length)];
}

function chance(percent) {
  return randomInt(100) < percent;
}

function sample(options, count) {
  const shuffled = [...options];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled.slice(0, count);
}

function selectBlockComposition() {
  const optionalMainBlocks = MAIN_BLOCKS.filter((slot) => !slot.required);
  const minimumOptionalBlocks = Math.min(
    MIN_OPTIONAL_MAIN_BLOCKS,
    optionalMainBlocks.length,
  );
  const maximumOptionalBlocks = Math.min(
    MAX_OPTIONAL_MAIN_BLOCKS,
    optionalMainBlocks.length,
  );
  let optionalBlockCount = minimumOptionalBlocks;

  if (maximumOptionalBlocks > minimumOptionalBlocks) {
    optionalBlockCount = randomInt(
      minimumOptionalBlocks,
      maximumOptionalBlocks + 1,
    );
  }

  const selectedOptionalDirectories = new Set(
    sample(optionalMainBlocks, optionalBlockCount).map(
      (slot) => slot.directory,
    ),
  );

  return {
    topBlocks: TOP_BLOCKS.filter((slot) => slot.required),
    mainBlocks: orderMainBlocks(
      MAIN_BLOCKS.filter(
        (slot) =>
          slot.required || selectedOptionalDirectories.has(slot.directory),
      ),
      chance,
      pick,
    ),
    bottomBlocks: BOTTOM_BLOCKS.filter((slot) => slot.required),
  };
}

function selectBlockVariants(variantsByCategory, composition) {
  const selectedSlots = [
    ...composition.topBlocks,
    ...composition.mainBlocks,
    ...composition.bottomBlocks,
  ];

  return Object.fromEntries(
    selectedSlots.map((slot) => [
      slot.directory,
      {
        ...slot,
        filePath: pick(
          variantsByCategory[slot.directory],
          `${slot.directory} block`,
        ),
      },
    ]),
  );
}

function createToneSequence(length) {
  const tones = [pick(SAFE_TONES, "initial block tone")];

  for (let index = 1; index < length; index += 1) {
    const previousTone = tones[index - 1];
    let nextTone = previousTone;

    if (chance(65)) {
      nextTone = SAFE_TONES.find((tone) => tone !== previousTone);
    }

    tones.push(nextTone);
  }

  return tones;
}

export function createBlockAppearance(composition) {
  const appearance = {};
  const headerTone = pick(SAFE_TONES, "header tone");
  const mainTones = createToneSequence(composition.mainBlocks.length);

  composition.topBlocks.forEach((slot) => {
    appearance[slot.appearanceKey] = {
      tone: headerTone,
      divider: "bottom",
    };
  });

  composition.mainBlocks.forEach((slot, index) => {
    const tone = mainTones[index];
    const previousTone = index > 0 ? mainTones[index - 1] : null;

    appearance[slot.appearanceKey] = {
      tone,
      ...(tone === previousTone ? { divider: "top" } : {}),
    };
  });

  const lastMainTone = mainTones.at(-1);

  composition.bottomBlocks.forEach((slot) => {
    appearance[slot.appearanceKey] = {
      tone: SAFE_TONES.find((tone) => tone !== lastMainTone),
      divider: "top",
    };
  });

  return appearance;
}

export function createSelection(options) {
  const composition = selectBlockComposition();
  const controlPreset = pick(CONTROL_PRESETS, "controls preset");
  const buttonIconPreset = pick(BUTTON_ICON_PRESETS, "button icon preset");
  const eyebrowEnabled = pick([true, false], "eyebrow enabled");
  const eyebrowVariant = pick(EYEBROW_VARIANTS, "eyebrow variant");
  const headerMenu = pick(HEADER_MENUS, "header menu");
  const headerBurger = pick(HEADER_BURGERS, "header burger");
  const headerSticky = pick([true, false], "header sticky");
  const palette = selectBalancedPalette(options.palettes, pick);
  const colorScheme = getPaletteColorScheme(palette);
  const typography = pick(options.typographyPresets, "typography preset");
  const background = selectPageBackground(colorScheme, pick);
  const blocks = selectBlockVariants(options.variantsByCategory, composition);
  const legalDocumentPath = pick(
    options.legalDocumentVariants,
    "legal document",
  );
  const legalHeaderPath = pick(options.legalHeaderVariants, "legal header");
  const legalFooterPath = pick(options.legalFooterVariants, "legal footer");
  const consentBannerPath = pick(
    options.consentBannerVariants,
    "consent banner",
  );

  return {
    blocks,
    composition,
    legalDocument: {
      filePath: legalDocumentPath,
    },
    legalHeader: {
      filePath: legalHeaderPath,
    },
    legalFooter: {
      filePath: legalFooterPath,
    },
    consentBanner: {
      filePath: consentBannerPath,
    },
    consentBannerCorner: resolveConsentBannerCorner(consentBannerPath, pick),
    appearance: createBlockAppearance(composition),
    pageAppearance: {
      background,
      controls: {
        size: controlPreset.size,
        button: {
          style: controlPreset.buttonStyle,
          icon: buttonIconPreset.icon,
        },
        input: {
          style: controlPreset.inputStyle,
        },
      },
      eyebrow: {
        enabled: eyebrowEnabled,
        variant: eyebrowVariant,
      },
      header: {
        menu: headerMenu,
        burger: headerBurger,
        sticky: headerSticky,
      },
    },
    palette,
    colorScheme,
    shape: pick(options.shapes, "shape"),
    shadow: pick(options.shadows, "shadow"),
    spacing: pick(options.spacing, "spacing"),
    interaction: pick(options.interactions, "interaction"),
    typography,
    displayFont: typography.display,
    bodyFont: typography.body,
    monoFont: typography.mono,
    optionRoots: options,
  };
}
