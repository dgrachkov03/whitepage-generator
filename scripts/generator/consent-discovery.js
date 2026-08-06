import fs from "node:fs";
import path from "node:path";
import { consentBlocksDirectory } from "./config.js";

export function discoverConsentBannerVariants() {
  if (!fs.existsSync(consentBlocksDirectory)) {
    throw new Error(`Missing consent blocks directory: ${consentBlocksDirectory}`);
  }

  const variants = fs
    .readdirSync(consentBlocksDirectory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(".pug") &&
        !entry.name.startsWith("_"),
    )
    .map((entry) => path.join(consentBlocksDirectory, entry.name))
    .sort((left, right) => left.localeCompare(right));

  if (!variants.length) {
    throw new Error(
      `No consent banner variants found in ${consentBlocksDirectory}`,
    );
  }

  return variants;
}

export function isCornerConsentBannerVariant(filePath) {
  return path.basename(filePath, ".pug") === "corner-card";
}
