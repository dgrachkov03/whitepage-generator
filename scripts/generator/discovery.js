import fs from "node:fs";
import path from "node:path";
import {
  BLOCK_SLOTS,
  blocksDirectory,
  designDirectory,
  interactionsDirectory,
  OVERLAY_BLOCK_CATEGORIES,
} from "./config.js";
import { TYPOGRAPHY_PRESETS } from "./typography-presets.js";
import { discoverConsentBannerVariants } from "./consent-discovery.js";
import {
  discoverLegalDocumentVariants,
  discoverLegalFooterVariants,
  discoverLegalHeaderVariants,
} from "./legal-discovery.js";
import { toVariantName } from "./paths.js";

function assertDirectory(directory, label) {
  if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
    throw new Error(`Missing ${label} directory: ${directory}`);
  }
}

function matchesPartialConvention(fileName, partialsOnly) {
  return partialsOnly ? fileName.startsWith("_") : !fileName.startsWith("_");
}

function getDirectFiles(
  directory,
  extension,
  { partialsOnly = false } = {},
) {
  assertDirectory(directory, "source");

  const files = fs
    .readdirSync(directory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(extension) &&
        matchesPartialConvention(entry.name, partialsOnly),
    )
    .map((entry) => path.join(directory, entry.name))
    .sort((left, right) => left.localeCompare(right));

  if (!files.length) {
    throw new Error(`No ${extension} variants found in ${directory}`);
  }

  return files;
}

function getRecursiveFiles(
  directory,
  extension,
  { partialsOnly = false } = {},
) {
  assertDirectory(directory, "source");

  function walk(currentDirectory) {
    return fs
      .readdirSync(currentDirectory, { withFileTypes: true })
      .flatMap((entry) => {
        const entryPath = path.join(currentDirectory, entry.name);

        if (entry.isDirectory()) {
          return walk(entryPath);
        }

        if (
          entry.isFile() &&
          entry.name.endsWith(extension) &&
          matchesPartialConvention(entry.name, partialsOnly)
        ) {
          return [entryPath];
        }

        return [];
      });
  }

  const files = walk(directory).sort((left, right) =>
    left.localeCompare(right),
  );

  if (!files.length) {
    throw new Error(`No ${extension} variants found in ${directory}`);
  }

  return files;
}

function validateBlockCategories() {
  assertDirectory(blocksDirectory, "blocks");

  const expectedCategories = new Set(
    BLOCK_SLOTS.map((slot) => slot.directory),
  );
  const discoveredCategories = fs
    .readdirSync(blocksDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const unknownCategories = discoveredCategories.filter(
    (category) =>
      !expectedCategories.has(category) &&
      !OVERLAY_BLOCK_CATEGORIES.includes(category),
  );
  const missingCategories = [...expectedCategories].filter(
    (category) => !discoveredCategories.includes(category),
  );

  if (unknownCategories.length) {
    throw new Error(
      `Block categories need an explicit composition slot: ${unknownCategories.join(", ")}`,
    );
  }

  if (missingCategories.length) {
    throw new Error(
      `Configured block categories are missing: ${missingCategories.join(", ")}`,
    );
  }
}

function validateBlockScopeNames(variantsByCategory) {
  const declarations = new Map();
  const collisions = [];
  const declarationPattern =
    /^- (?:const|let|class)\s+([A-Za-z_$][\w$]*)\b/gm;

  Object.entries(variantsByCategory).forEach(([category, variants]) => {
    variants.forEach((filePath) => {
      const source = fs.readFileSync(filePath, "utf8");

      for (const match of source.matchAll(declarationPattern)) {
        const name = match[1];
        const previous = declarations.get(name);

        if (previous && previous.category !== category) {
          collisions.push(
            `"${name}" in ${toVariantName(previous.filePath, blocksDirectory)} and ${toVariantName(filePath, blocksDirectory)}`,
          );
        } else if (!previous) {
          declarations.set(name, { category, filePath });
        }
      }
    });
  });

  if (collisions.length) {
    throw new Error(
      `Block variants declare conflicting page-scope names:\n${collisions.map((collision) => `  - ${collision}`).join("\n")}`,
    );
  }
}

function discoverBlockVariants() {
  validateBlockCategories();

  const variantsByCategory = Object.fromEntries(
    BLOCK_SLOTS.map((slot) => [
      slot.directory,
      getDirectFiles(path.join(blocksDirectory, slot.directory), ".pug"),
    ]),
  );

  validateBlockScopeNames(variantsByCategory);

  return variantsByCategory;
}

export function discoverOptions() {
  const palettesDirectory = path.join(designDirectory, "palettes");
  const shapesDirectory = path.join(designDirectory, "shapes");
  const shadowsDirectory = path.join(designDirectory, "shadows");
  const spacingDirectory = path.join(designDirectory, "spacing");
  const typographyDirectory = path.join(designDirectory, "typography");

  return {
    palettesDirectory,
    shapesDirectory,
    shadowsDirectory,
    spacingDirectory,
    typographyDirectory,
    variantsByCategory: discoverBlockVariants(),
    palettes: getRecursiveFiles(palettesDirectory, ".css", {
      partialsOnly: true,
    }),
    shapes: getDirectFiles(shapesDirectory, ".css", {
      partialsOnly: true,
    }),
    shadows: getDirectFiles(shadowsDirectory, ".css", {
      partialsOnly: true,
    }),
    spacing: getDirectFiles(spacingDirectory, ".css", {
      partialsOnly: true,
    }),
    typography: getDirectFiles(typographyDirectory, ".css", {
      partialsOnly: true,
    }),
    typographyPresets: TYPOGRAPHY_PRESETS,
    interactions: getDirectFiles(interactionsDirectory, ".css", {
      partialsOnly: true,
    }),
    legalDocumentVariants: discoverLegalDocumentVariants(),
    legalHeaderVariants: discoverLegalHeaderVariants(),
    legalFooterVariants: discoverLegalFooterVariants(),
    consentBannerVariants: discoverConsentBannerVariants(),
  };
}
