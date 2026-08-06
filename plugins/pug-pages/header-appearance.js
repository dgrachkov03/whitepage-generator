export const HEADER_MENUS = [
  "drawer-right",
  "fullscreen",
  "dropdown",
];

export const HEADER_BURGERS = ["x", "arrow", "fade"];

export function resolveHeaderMenu(pageAppearance = {}) {
  return pageAppearance?.header?.menu || "drawer-right";
}

export function resolveHeaderBurger(pageAppearance = {}) {
  return pageAppearance?.header?.burger || "x";
}

export function resolveHeaderSticky(pageAppearance = {}) {
  return pageAppearance?.header?.sticky === true;
}

export function headerStickyClass(pageAppearance = {}) {
  return resolveHeaderSticky(pageAppearance) ? "site-header--sticky" : "";
}

export function headerMenuClass(pageAppearance = {}) {
  const menu = resolveHeaderMenu(pageAppearance);

  if (!HEADER_MENUS.includes(menu)) {
    throw new Error(
      `Unknown header menu "${menu}". Expected: ${HEADER_MENUS.join(", ")}`,
    );
  }

  return `site-header--menu-${menu}`;
}

export function headerBurgerClasses(pageAppearance = {}, options = {}) {
  const burger = resolveHeaderBurger(pageAppearance);

  if (!HEADER_BURGERS.includes(burger)) {
    throw new Error(
      `Unknown header burger "${burger}". Expected: ${HEADER_BURGERS.join(", ")}`,
    );
  }

  const classes = ["header-burger", `header-burger--${burger}`];

  if (options.plain) {
    classes.push("header-burger--plain");
  }

  return classes.join(" ");
}
