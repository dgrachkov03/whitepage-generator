import path from "node:path";
import {
  blocksDirectory,
  interactionsDirectory,
  legalDocumentsDirectory,
} from "./generator/config.js";
import { createSelection } from "./generator/composition.js";
import { discoverOptions } from "./generator/discovery.js";
import { createIndexSource } from "./generator/index-source.js";
import { createLegalLayoutSource } from "./generator/legal-source.js";
import { createOverlaysSource } from "./generator/overlays-source.js";
import { createThemeSource } from "./generator/theme-source.js";
import { toVariantName } from "./generator/paths.js";
import { writeAndRender } from "./generator/transaction.js";
import {
  consentBlocksDirectory,
  indexPath,
  legalLayoutPath,
  overlaysLayoutPath,
  themeLayoutPath,
} from "./generator/config.js";

function getSelectedSlots(composition) {
  return [
    ...composition.topBlocks,
    ...composition.mainBlocks,
    ...composition.bottomBlocks,
  ];
}

function printSelection(selection) {
  const { composition, optionRoots } = selection;

  console.log("[generate] Created src/pug/pages/index.pug");
  console.log("[generate] Updated src/pug/layouts/theme.pug");
  console.log("[generate] Updated src/pug/layouts/legal.pug");
  console.log("[generate] Updated src/pug/layouts/overlays.pug");
  console.log(
    `[generate] Palette: ${toVariantName(selection.palette, optionRoots.palettesDirectory)}`,
  );
  console.log(
    `[generate] Palette scheme: ${selection.colorScheme}`,
  );

  const background = selection.pageAppearance.background;

  console.log(
    `[generate] Background: ${background.style}${background.dotsOn ? ` (dots on ${background.dotsOn})` : ""}`,
  );
  const controls = selection.pageAppearance.controls;
  console.log(
    `[generate] Controls: size=${controls.size}, buttons=${controls.button.style}, inputs=${controls.input.style}`,
  );
  console.log(
    `[generate] Header: menu=${selection.pageAppearance.header.menu}, burger=${selection.pageAppearance.header.burger}, burgerBorder=${selection.pageAppearance.header.burgerBorder !== false}, sticky=${selection.pageAppearance.header.sticky}`,
  );
  console.log(
    `[generate] Shape: ${toVariantName(selection.shape, optionRoots.shapesDirectory)}`,
  );
  console.log(
    `[generate] Shadow: ${toVariantName(selection.shadow, optionRoots.shadowsDirectory)}`,
  );
  console.log(
    `[generate] Spacing: ${toVariantName(selection.spacing, optionRoots.spacingDirectory)}`,
  );
  console.log(
    `[generate] Interaction: ${toVariantName(selection.interaction, interactionsDirectory)}`,
  );
  console.log(
    `[generate] Typography: ${selection.typography.id} (${selection.typography.rhythm}, display=${selection.displayFont}, body=${selection.bodyFont}, mono=${selection.monoFont})`,
  );
  console.log("[generate] Blocks:");

  getSelectedSlots(composition).forEach((slot) => {
    console.log(
      `  - ${slot.directory}: ${toVariantName(selection.blocks[slot.directory].filePath, path.join(blocksDirectory, slot.directory))}`,
    );
  });
  console.log(
    `[generate] Legal document: ${toVariantName(selection.legalDocument.filePath, legalDocumentsDirectory)}`,
  );
  console.log(
    `[generate] Legal header: ${toVariantName(selection.legalHeader.filePath, legalDocumentsDirectory)}`,
  );
  console.log(
    `[generate] Legal footer: ${toVariantName(selection.legalFooter.filePath, legalDocumentsDirectory)}`,
  );
  console.log(
    `[generate] Consent banner: ${toVariantName(selection.consentBanner.filePath, consentBlocksDirectory)}${selection.consentBannerCorner ? ` (${selection.consentBannerCorner})` : ""}`,
  );
}

function generate() {
  const options = discoverOptions();
  const selection = createSelection(options);
  const themeSource = createThemeSource(selection);
  const indexSource = createIndexSource(selection);
  const legalLayoutSource = createLegalLayoutSource(selection);
  const overlaysSource = createOverlaysSource(selection);

  writeAndRender([
      { filePath: themeLayoutPath, source: themeSource },
      { filePath: indexPath, source: indexSource },
      { filePath: legalLayoutPath, source: legalLayoutSource },
      { filePath: overlaysLayoutPath, source: overlaysSource },
    ]);
  printSelection(selection);
}

try {
  generate();
} catch (error) {
  console.error(`[generate] ${error.stack || error.message}`);
  process.exitCode = 1;
}
