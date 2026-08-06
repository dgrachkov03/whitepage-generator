import assert from "node:assert/strict";
import test from "node:test";
import {
  HEADER_BURGER_DOT_COUNT,
  HEADER_BURGERS,
  HEADER_MENUS,
  headerBurgerClasses,
  headerMenuClass,
  headerStickyClass,
  resolveHeaderBurger,
  resolveHeaderBurgerBorder,
  resolveHeaderMenu,
  resolveHeaderSticky,
} from "../../plugins/pug-pages/header-appearance.js";

test("resolveHeaderMenu defaults to drawer-right", () => {
  assert.equal(resolveHeaderMenu(), "drawer-right");
  assert.equal(resolveHeaderMenu({}), "drawer-right");
});

test("resolveHeaderBurger defaults to stacked", () => {
  assert.equal(resolveHeaderBurger(), "stacked");
  assert.equal(resolveHeaderBurger({}), "stacked");
});

test("resolveHeaderBurger maps legacy burger ids to current variants", () => {
  assert.equal(resolveHeaderBurger({ header: { burger: "x" } }), "stacked");
  assert.equal(resolveHeaderBurger({ header: { burger: "fade" } }), "dots");
});

test("resolveHeaderBurgerBorder defaults to true", () => {
  assert.equal(resolveHeaderBurgerBorder(), true);
  assert.equal(resolveHeaderBurgerBorder({}), true);
  assert.equal(
    resolveHeaderBurgerBorder({ header: { burgerBorder: true } }),
    true,
  );
  assert.equal(
    resolveHeaderBurgerBorder({ header: { burgerBorder: false } }),
    false,
  );
});

test("resolveHeaderSticky defaults to false", () => {
  assert.equal(resolveHeaderSticky(), false);
  assert.equal(resolveHeaderSticky({}), false);
  assert.equal(resolveHeaderSticky({ header: { sticky: false } }), false);
  assert.equal(resolveHeaderSticky({ header: { sticky: true } }), true);
});

test("headerStickyClass maps page appearance to sticky modifier", () => {
  assert.equal(headerStickyClass(), "");
  assert.equal(headerStickyClass({ header: { sticky: false } }), "");
  assert.equal(
    headerStickyClass({ header: { sticky: true } }),
    "site-header--sticky",
  );
});

test("headerMenuClass maps page appearance to modifier class", () => {
  assert.equal(
    headerMenuClass({ header: { menu: "fullscreen" } }),
    "site-header--menu-fullscreen",
  );
});

test("headerBurgerClasses maps page appearance to burger modifiers", () => {
  assert.equal(
    headerBurgerClasses({ header: { burger: "stacked" } }),
    "header-burger header-burger--stacked header-burger--bordered",
  );
  assert.equal(
    headerBurgerClasses({ header: { burger: "plus" } }),
    "header-burger header-burger--plus header-burger--bordered",
  );
  assert.equal(
    headerBurgerClasses({
      header: { burger: "dots", burgerBorder: false },
    }),
    "header-burger header-burger--dots",
  );
  assert.equal(
    headerBurgerClasses({ header: { burger: "x" } }),
    "header-burger header-burger--stacked header-burger--bordered",
  );
});

test("header appearance rejects unknown menu and burger values", () => {
  assert.throws(() => headerMenuClass({ header: { menu: "modal" } }));
  assert.throws(() =>
    headerBurgerClasses({ header: { burger: "hamburger" } }),
  );
});

test("header appearance exports complete option sets", () => {
  assert.deepEqual(HEADER_MENUS, [
    "drawer-right",
    "fullscreen",
    "dropdown",
  ]);
  assert.deepEqual(HEADER_BURGERS, ["stacked", "plus", "dots"]);
  assert.equal(HEADER_BURGER_DOT_COUNT, 9);
});
