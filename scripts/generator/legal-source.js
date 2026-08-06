import { toLegalDocumentIncludePath, toPugIncludePath } from "./paths.js";
import { LEGAL_BLOCK_APPEARANCE_INTRO } from "./pug-comments.js";

export function createLegalLayoutSource(selection) {
  const { legalDocument, legalHeader, legalFooter } = selection;
  const lines = [
    "extends /layouts/theme.pug",
    "",
    "block content",
    "  -",
    ...LEGAL_BLOCK_APPEARANCE_INTRO,
    "    const blockAppearance = {",
    "      header: {",
    "        tone: \"base\",",
    "        divider: \"bottom\",",
    "      },",
    "      document: {",
    "        tone: \"base\",",
    "      },",
    "      footer: {",
    "        tone: \"base\",",
    "        divider: \"top\",",
    "      },",
    "    }",
    "",
    "  div(class=pageBackgroundClasses(pageAppearance.background))",
    `    include ${toPugIncludePath(legalHeader.filePath)}`,
    "",
    "    main(class=[\"legal-main\", blockClasses(blockAppearance.document)])",
    `      include ${toLegalDocumentIncludePath(legalDocument.filePath)}`,
    "",
    `    include ${toPugIncludePath(legalFooter.filePath)}`,
  ];

  return `${lines.join("\r\n")}\r\n`;
}
