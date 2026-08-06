export const HEADER_MENUS = [
  "drawer-right",
  "fullscreen",
  "dropdown",
];

export const HEADER_BURGERS = ["stacked", "plus", "dots"];

export const HEADER_BURGER_DOT_COUNT = 9;

const HEADER_BURGER_ALIASES = {
  x: "stacked",
  fade: "dots",
};

export function resolveHeaderBurger(pageAppearance = {}) {
  const burger = pageAppearance?.header?.burger || "stacked";

  return HEADER_BURGER_ALIASES[burger] || burger;
}

export function resolveHeaderMenu(pageAppearance = {}) {
  return pageAppearance?.header?.menu || "drawer-right";
}

export function resolveHeaderSticky(pageAppearance = {}) {
  return pageAppearance?.header?.sticky === true;
}

export function resolveHeaderBurgerBorder(pageAppearance = {}) {
  return pageAppearance?.header?.burgerBorder !== false;
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

export function headerBurgerClasses(pageAppearance = {}) {
  const burger = resolveHeaderBurger(pageAppearance);

  if (!HEADER_BURGERS.includes(burger)) {
    throw new Error(
      `Unknown header burger "${burger}". Expected: ${HEADER_BURGERS.join(", ")}`,
    );
  }

  const classes = ["header-burger", `header-burger--${burger}`];

  if (resolveHeaderBurgerBorder(pageAppearance)) {
    classes.push("header-burger--bordered");
  }

  return classes.join(" ");
}
