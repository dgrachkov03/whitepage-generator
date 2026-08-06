import path from "node:path";
import { toPugIncludePath } from "./paths.js";

export function renderDesignBlocks(selection) {
  const {
    palette,
    shape,
    shadow,
    spacing,
    interaction,
    typography,
    displayFont,
    bodyFont,
    monoFont,
    optionRoots,
  } = selection;
  const typographyRhythm = path.join(
    optionRoots.typographyDirectory,
    `_${typography.rhythm}.css`,
  );

  return [
    "block font",
    "  -",
    "    // selectedFonts — подключаемые шрифты.",
    "    const selectedFonts = {",
    "      // display: шрифт для заголовков",
    "      //   inter, space-grotesk, manrope, outfit, sora, plus-jakarta-sans,",
    "      //   bricolage-grotesque, montserrat, poppins, instrument-sans,",
    "      //   figtree, work-sans, urbanist, lexend, rubik",
    `      display: "${displayFont}",`,
    "      // body: шрифт для основного текста",
    "      //   inter, space-grotesk, manrope, outfit, sora, plus-jakarta-sans,",
    "      //   dm-sans, noto-sans, montserrat, poppins, instrument-sans,",
    "      //   figtree, work-sans, urbanist, lexend, rubik",
    `      body: "${bodyFont}",`,
    "      // mono: шрифт для моноширинного текста",
    "      //   jetbrains-mono, ibm-plex-mono, dm-mono, space-mono",
    `      mono: "${monoFont}",`,
    "    }",
    "",
    "  style!= renderFonts(selectedFonts)",
    "",
    "//- design — токены оформления (один файл из каждой папки):",
    "block design",
    "  style",
    "    //- palettes — цвета: primary, surface, текст, градиенты",
    `    include ${toPugIncludePath(palette)}`,
    "    //- shapes — скругление кнопок, карточек и полей ввода",
    `    include ${toPugIncludePath(shape)}`,
    "    //- shadows — тени карточек и выпадающих элементов",
    `    include ${toPugIncludePath(shadow)}`,
    "    //- spacing — вертикальные отступы секций (py-section)",
    `    include ${toPugIncludePath(spacing)}`,
    "    //- typography — размеры заголовков и line-height",
    `    include ${toPugIncludePath(typographyRhythm)}`,
    "",
    "//- interactions — стиль ссылок.",
    "block interactions",
    "  style",
    `    include ${toPugIncludePath(interaction)}`,
  ];
}

export function renderThemePageAppearance(pageAppearance) {
  const { background, controls, eyebrow, header } = pageAppearance;
  const lines = [
    "block themeSetup",
    "  -",
    "    // pageAppearance — глобальные настройки страницы.",
    "    pageAppearance = {",
    "      // Стили оформления страницы.",
    "      background: {",
    "        // style: none | gradient | block-glow | mesh-blocks | subtle-grid | dots",
    `        style: "${background.style}",`,
    "        // dotsOn (только для dots): base | alternate",
  ];

  if (background.dotsOn) {
    lines.push(`        dotsOn: "${background.dotsOn}",`);
  }

  lines.push(
    "      },",
    "",
    "      // Стили оформления элементов управления.",
    "      controls: {",
    "        // size: compact | medium | large (опционально)",
    `        size: "${controls.size}",`,
    "        button: {",
    "          // style: solid | gradient | outline",
    `          style: "${controls.button.style}",`,
  );

  if (controls.button.hover) {
    lines.push(
      "          // hover: darken | brighten | lift | glow (опционально)",
      `          hover: "${controls.button.hover}",`,
    );
  }

  if (controls.button.icon) {
    lines.push(
      "          // icon: none | arrow-right | arrow-long-right | arrow-up-right",
      `          icon: "${controls.button.icon}",`,
    );
  }

  lines.push(
    "        },",
    "        input: {",
    "          // style: outlined | filled | underline",
    `          style: "${controls.input.style}",`,
    "        },",
    "      },",
    "",
    "      // Стили оформления eyebrow - текста над заголовком.",
    "      eyebrow: {",
    "        // enabled: true | false,",
    `        enabled: ${eyebrow.enabled !== false},`,
    "        // variant: dot | line | badge",
    `        variant: "${eyebrow.variant}",`,
    "      },",
    "",
    "      // header — мобильное меню, анимация бургер-кнопки и поведение при скролле.",
    "      header: {",
    "        // menu: drawer-right | fullscreen | dropdown",
    `        menu: "${header.menu}",`,
    "        // burger: stacked | plus | dots",
    `        burger: "${header.burger}",`,
    "        // burgerBorder: true | false",
    `        burgerBorder: ${header.burgerBorder !== false},`,
    "        // sticky: true | false",
    `        sticky: ${header.sticky === true},`,
    "      },",
    "    }",
  );

  return lines;
}
