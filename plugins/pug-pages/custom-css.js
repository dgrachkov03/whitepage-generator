import fs from "node:fs/promises";
import path from "node:path";
import { formatHtml } from "./format-html.js";

export const customCssRelativePath = "assets/styles/custom.css";
export const customCssHref = `./${customCssRelativePath}`;

const mainStylesheetPattern =
  /(\s*<link[\s\S]*?href="\.\/assets\/styles\/main\.css"[\s\S]*?\/>)/i;

export function injectCustomCssLink(html) {
  if (html.includes(customCssHref)) {
    return html;
  }

  if (!mainStylesheetPattern.test(html)) {
    throw new Error("Main stylesheet link not found in HTML");
  }

  return html.replace(
    mainStylesheetPattern,
    `$1\n    <link rel="stylesheet" href="${customCssHref}" />`,
  );
}

export async function setupCustomCss(directory) {
  const stylesDirectory = path.join(directory, "assets", "styles");

  await fs.mkdir(stylesDirectory, { recursive: true });
  await fs.writeFile(path.join(stylesDirectory, "custom.css"), "");

  const entries = await fs.readdir(directory, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
      .map(async (entry) => {
        const filePath = path.join(directory, entry.name);
        const html = await fs.readFile(filePath, "utf8");
        const updated = injectCustomCssLink(html);
        await fs.writeFile(filePath, await formatHtml(updated));
      }),
  );
}
