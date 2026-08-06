import {
  renderDesignBlocks,
  renderThemePageAppearance,
} from "./design-blocks-source.js";

export function createThemeSource(selection) {
  const lines = [
    "extends /layouts/main.pug",
    "",
    ...renderThemePageAppearance(selection.pageAppearance),
    "",
    ...renderDesignBlocks(selection),
  ];

  return `${lines.join("\r\n")}\r\n`;
}