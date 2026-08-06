import fs from "node:fs/promises";
import path from "node:path";
import prettier from "prettier";

export const htmlFormatOptions = {
  parser: "html",
  tabWidth: 2,
  printWidth: 100,
  htmlWhitespaceSensitivity: "ignore", 
  endOfLine: "lf",
  singleAttributePerLine: true, 
  bracketSameLine: false, 
};

export async function formatHtml(html) {
  return prettier.format(html, htmlFormatOptions);
}

export async function formatHtmlFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
      .map(async (entry) => {
        const filePath = path.join(directory, entry.name);
        const html = await fs.readFile(filePath, "utf8");
        await fs.writeFile(filePath, await formatHtml(html));
      }),
  );
}
