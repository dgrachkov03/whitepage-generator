import path from "node:path";
import { fileURLToPath } from "node:url";

const generatorDirectory = path.dirname(fileURLToPath(import.meta.url));

export const projectRoot = path.resolve(generatorDirectory, "..", "..");
export const pugRoot = path.join(projectRoot, "src", "pug");
export const pagesDirectory = path.join(pugRoot, "pages");
export const indexPath = path.join(pagesDirectory, "index.pug");
export const themeLayoutPath = path.join(pugRoot, "layouts", "theme.pug");
export const legalLayoutPath = path.join(pugRoot, "layouts", "legal.pug");
export const overlaysLayoutPath = path.join(pugRoot, "layouts", "overlays.pug");
export const legalDocumentsDirectory = path.join(pugRoot, "legal");
export const blocksDirectory = path.join(pugRoot, "blocks");
export const consentBlocksDirectory = path.join(blocksDirectory, "cookies");
export const designDirectory = path.join(pugRoot, "design");
export const interactionsDirectory = path.join(pugRoot, "interactions");

export const TOP_BLOCKS = [
  {
    directory: "topbar",
    appearanceKey: "topbar",
    required: true,
  },
  { directory: "header", appearanceKey: "header", required: true },
];

export const MAIN_BLOCKS = [
  { directory: "hero", appearanceKey: "hero", required: true },
  { directory: "about", appearanceKey: "about", required: true },
  { directory: "stats", appearanceKey: "stats", required: false },
  { directory: "features", appearanceKey: "features", required: false },
  { directory: "services", appearanceKey: "services", required: false },
  { directory: "why-us", appearanceKey: "whyUs", required: false },
  { directory: "process", appearanceKey: "process", required: false },
  { directory: "pricing", appearanceKey: "pricing", required: false },
  { directory: "reviews", appearanceKey: "reviews", required: true },
  { directory: "faq", appearanceKey: "faq", required: false },
  { directory: "contact", appearanceKey: "contact", required: true },
];

export const BOTTOM_BLOCKS = [
  { directory: "footer", appearanceKey: "footer", required: true },
];

export const BLOCK_SLOTS = [
  ...TOP_BLOCKS,
  ...MAIN_BLOCKS,
  ...BOTTOM_BLOCKS,
];

export const OVERLAY_BLOCK_CATEGORIES = ["cookies"];

export const SAFE_TONES = ["base", "alternate"];
export const PAGE_BACKGROUND_WEIGHTS = {
  none: 17,
  gradient: 17,
  "block-glow": 17,
  "mesh-blocks": 16,
  "subtle-grid": 16,
  dots: 17,
};
export const PAGE_BACKGROUND_SCHEMES = {
  none: ["light", "dark"],
  gradient: ["light", "dark"],
  "block-glow": ["light", "dark"],
  "mesh-blocks": ["light", "dark"],
  "subtle-grid": ["light"],
  dots: ["light"],
};
export const PAGE_BACKGROUND_STYLES = Object.keys(PAGE_BACKGROUND_WEIGHTS);
export const CONTROL_PRESETS = [
  { size: "compact", buttonStyle: "solid", inputStyle: "outlined" },
  { size: "medium", buttonStyle: "solid", inputStyle: "filled" },
  { size: "large", buttonStyle: "solid", inputStyle: "outlined" },
  { size: "compact", buttonStyle: "gradient", inputStyle: "filled" },
  { size: "medium", buttonStyle: "gradient", inputStyle: "outlined" },
  { size: "large", buttonStyle: "gradient", inputStyle: "filled" },
  { size: "compact", buttonStyle: "outline", inputStyle: "underline" },
  { size: "medium", buttonStyle: "outline", inputStyle: "outlined" },
  { size: "large", buttonStyle: "outline", inputStyle: "filled" },
];
export const MIN_OPTIONAL_MAIN_BLOCKS = 4;
export const MAX_OPTIONAL_MAIN_BLOCKS = 6;
export const LIGHT_PALETTE_CHANCE = 70;
export const FOOTER_REORDER_CHANCE = 50;
