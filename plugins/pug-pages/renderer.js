import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pug from "pug";
import { libraryIcon, validateSiteLibraryIcons } from "./assets/library-icon.js";
import { placeholder } from "./assets/placeholder.js";
import { blockClasses } from "./block-appearance.js";
import { resolveButtonIcon, resolveButtonLibraryIcon } from "./button-appearance.js";
import { controlAppearanceClasses } from "./control-appearance.js";
import {
  isEyebrowEnabled,
  resolveEyebrowVariant,
} from "./eyebrow-appearance.js";
import {
  headerBurgerClasses,
  headerMenuClass,
  headerStickyClass,
  resolveHeaderBurger,
  resolveHeaderMenu,
  resolveHeaderSticky,
} from "./header-appearance.js";
import {
  groupLegalSectionsByH2,
  legalSectionSlug,
} from "./legal-sections.js";
import { pageBackgroundClasses } from "./page-background.js";
import { renderFonts } from "./fonts/index.js";
import { loadSiteData } from "./validate-site.js";

const pluginDirectory = path.dirname(fileURLToPath(import.meta.url));

export const projectRoot = path.resolve(pluginDirectory, "..", "..");
export const pugRoot = path.join(projectRoot, "src", "pug");

const pagesDirectory = path.join(pugRoot, "pages");
const dataPath = path.join(pugRoot, "data", "site.json");
const schemaPath = path.join(pugRoot, "data", "site.schema.json");

export function getPages() {
  return fs
    .readdirSync(pagesDirectory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(".pug") &&
        !entry.name.startsWith("_"),
    )
    .map((entry) => entry.name.replace(/\.pug$/, ""))
    .sort();
}

export function renderPug() {
  const site = loadSiteData(dataPath, schemaPath);
  validateSiteLibraryIcons(site);
  const defaultIconSet = site.design?.iconSet || "lucide";

  getPages().forEach((pageName) => {
    const html = pug.renderFile(path.join(pagesDirectory, `${pageName}.pug`), {
      site,
      libraryIcon: (name, iconSet = defaultIconSet) =>
        libraryIcon(name, iconSet),
      placeholder,
      renderFonts,
      blockClasses,
      controlAppearanceClasses,
      isEyebrowEnabled,
      resolveEyebrowVariant,
      resolveHeaderMenu,
      resolveHeaderBurger,
      resolveHeaderSticky,
      headerMenuClass,
      headerBurgerClasses,
      headerStickyClass,
      resolveButtonIcon,
      resolveButtonLibraryIcon,
      groupLegalSectionsByH2,
      legalSectionSlug,
      pageBackgroundClasses,
      basedir: pugRoot,
      pretty: process.env.PUG_PRETTY !== "false",
    });

    fs.writeFileSync(path.join(projectRoot, `${pageName}.html`), html);
  });
}

export function getRollupInput() {
  return Object.fromEntries(
    getPages().map((pageName) => [
      pageName,
      path.join(projectRoot, `${pageName}.html`),
    ]),
  );
}
