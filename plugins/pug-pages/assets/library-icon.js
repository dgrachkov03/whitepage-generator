import { icons as lucideIcons } from "@iconify-json/lucide";
import { icons as tablerIcons } from "@iconify-json/tabler";
import { getIconData, iconToSVG, replaceIDs } from "@iconify/utils";
import { resolveLibraryIconName } from "./icon-aliases.js";

const ICON_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const iconSets = {
  lucide: lucideIcons,
  tabler: tablerIcons,
};
const iconDataCache = new Map();

export const libraryIconSets = Object.freeze(Object.keys(iconSets));

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function libraryIcon(name, iconSet = "lucide") {
  if (!ICON_NAME.test(name || "")) {
    throw new Error(`Invalid library icon name: ${name}`);
  }

  const collection = iconSets[iconSet];

  if (!collection) {
    throw new Error(
      `Unknown icon set "${iconSet}". Expected: ${libraryIconSets.join(", ")}`,
    );
  }

  const resolvedName = resolveLibraryIconName(name, iconSet);
  const cacheKey = `${iconSet}:${resolvedName}`;
  let iconData = iconDataCache.get(cacheKey);

  if (!iconData) {
    iconData = getIconData(collection, resolvedName);

    if (!iconData) {
      throw new Error(
        `Icon "${name}" not found in icon set "${iconSet}"`,
      );
    }

    iconDataCache.set(cacheKey, iconData);
  }

  const rendered = iconToSVG(iconData, {
    width: "1em",
    height: "1em",
  });
  const attributes = {
    xmlns: "http://www.w3.org/2000/svg",
    ...rendered.attributes,
    "aria-hidden": "true",
    focusable: "false",
  };
  const attributeString = Object.entries(attributes)
    .map(([attribute, value]) => `${attribute}="${escapeAttribute(value)}"`)
    .join(" ");

  return `<!-- prettier-ignore --><svg ${attributeString}>${replaceIDs(rendered.body)}</svg>`;
}

function hasLibraryIcon(name, iconSet = "lucide") {
  if (!ICON_NAME.test(name || "")) {
    return false;
  }

  const collection = iconSets[iconSet];

  if (!collection) {
    return false;
  }

  return Boolean(getIconData(collection, resolveLibraryIconName(name, iconSet)));
}

function collectLibraryIconRefs(value, inheritedIconSet, results) {
  if (Array.isArray(value)) {
    value.forEach((entry) =>
      collectLibraryIconRefs(entry, inheritedIconSet, results),
    );
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  const iconSet = value.iconSet || inheritedIconSet;

  if (typeof value.icon === "string" && !value.icon.includes("/")) {
    results.push({
      name: value.icon,
      iconSet: iconSet || "lucide",
    });
  }

  Object.entries(value).forEach(([key, child]) => {
    if (key !== "icon") {
      collectLibraryIconRefs(child, iconSet, results);
    }
  });
}

export function validateSiteLibraryIcons(site) {
  const defaultIconSet = site.design?.iconSet || "lucide";
  const iconRefs = [];

  collectLibraryIconRefs(site, defaultIconSet, iconRefs);

  const missing = iconRefs.filter(({ name, iconSet }) => {
    return !hasLibraryIcon(name, iconSet);
  });

  if (missing.length) {
    throw new Error(
      [
        "site.json references icons that are missing from Iconify sets:",
        ...missing.map(
          ({ name, iconSet }) => `  - ${name} (${iconSet})`,
        ),
      ].join("\n"),
    );
  }
}
