import { toPugIncludePath } from "./paths.js";
import { BLOCK_APPEARANCE_INTRO } from "./pug-comments.js";

function getSelectedSlots(composition) {
  return [
    ...composition.topBlocks,
    ...composition.mainBlocks,
    ...composition.bottomBlocks,
  ];
}

function renderBlockAppearanceConfiguration(appearance, composition) {
  const lines = [...BLOCK_APPEARANCE_INTRO, "    const blockAppearance = {"];

  getSelectedSlots(composition).forEach((slot) => {
    const options = appearance[slot.appearanceKey];

    lines.push(`      ${slot.appearanceKey}: {`);
    lines.push(`        tone: "${options.tone}",`);

    if (options.divider) {
      lines.push(`        divider: "${options.divider}",`);
    }

    lines.push("      },");
  });

  lines.push("    }");

  return lines;
}

export function createIndexSource(selection) {
  const { blocks, composition, appearance } = selection;
  const lines = [
    "extends /layouts/theme.pug",
    "",
    "block content",
    "  -",
    ...renderBlockAppearanceConfiguration(appearance, composition),
    "",
    "  div(class=[pageBackgroundClasses(pageAppearance.background), controlAppearanceClasses(pageAppearance.controls)])",
  ];

  composition.topBlocks.forEach((slot) => {
    lines.push(
      `    include ${toPugIncludePath(blocks[slot.directory].filePath)}`,
    );
  });

  lines.push("", "    main");

  composition.mainBlocks.forEach((slot) => {
    lines.push(
      `      include ${toPugIncludePath(blocks[slot.directory].filePath)}`,
    );
  });

  lines.push("");

  composition.bottomBlocks.forEach((slot) => {
    lines.push(
      `    include ${toPugIncludePath(blocks[slot.directory].filePath)}`,
    );
  });

  return `${lines.join("\r\n")}\r\n`;
}
