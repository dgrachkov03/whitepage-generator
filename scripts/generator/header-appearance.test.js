import assert from "node:assert/strict";
import test from "node:test";
import {
  HEADER_BURGERS,
  HEADER_MENUS,
  headerBurgerClasses,
  headerMenuClass,
  headerStickyClass,
  resolveHeaderBurger,
  resolveHeaderMenu,
  resolveHeaderSticky,
} from "../../plugins/pug-pages/header-appearance.js";

test("resolveHeaderMenu defaults to drawer-right", () => {
  assert.equal(resolveHeaderMenu(), "drawer-right");
  assert.equal(resolveHeaderMenu({}), "drawer-right");
});

test("resolveHeaderBurger defaults to x", () => {
  assert.equal(resolveHeaderBurger(), "x");
  assert.equal(resolveHeaderBurger({}), "x");
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
    headerBurgerClasses({ header: { burger: "arrow" } }),
    "header-burger header-burger--arrow",
  );
  assert.equal(
    headerBurgerClasses({ header: { burger: "fade" } }, { plain: true }),
    "header-burger header-burger--fade header-burger--plain",
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
  assert.deepEqual(HEADER_BURGERS, ["x", "arrow", "fade"]);
});
