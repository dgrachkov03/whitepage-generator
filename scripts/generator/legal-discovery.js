import fs from "node:fs";
import path from "node:path";
import { legalDocumentsDirectory } from "./config.js";

function discoverLegalVariants(prefix) {
  if (!fs.existsSync(legalDocumentsDirectory)) {
    throw new Error(`Missing legal directory: ${legalDocumentsDirectory}`);
  }

  const variants = fs
    .readdirSync(legalDocumentsDirectory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(".pug") &&
        entry.name.startsWith(`${prefix}-`) &&
        !entry.name.startsWith("_"),
    )
    .map((entry) => path.join(legalDocumentsDirectory, entry.name))
    .sort((left, right) => left.localeCompare(right));

  if (!variants.length) {
    throw new Error(
      `No legal ${prefix} variants found in ${legalDocumentsDirectory}`,
    );
  }

  return variants;
}

export function discoverLegalDocumentVariants() {
  return discoverLegalVariants("document");
}

export function discoverLegalHeaderVariants() {
  return discoverLegalVariants("header");
}

export function discoverLegalFooterVariants() {
  return discoverLegalVariants("footer");
}
