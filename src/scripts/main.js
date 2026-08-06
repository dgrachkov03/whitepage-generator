const components = [
  {
    selector: "[data-js-header]",
    load: () => import("./components/Header.js"),
  },
  {
    selector: "[data-js-consent-banner]",
    load: () => import("./components/ConsentBanner.js"),
  },
  {
    selector: "[data-js-form]",
    load: () => import("./components/StaticForm.js"),
  },
  {
    selector: "[data-js-carousel]",
    load: () => import("./components/Carousel.js"),
  },
];

components.forEach(({ selector, load }) => {
  const elements = document.querySelectorAll(selector);

  if (!elements.length) return;

  load()
    .then(({ default: Component }) => {
      elements.forEach((element) => {
        new Component(element);
      });
    })
    .catch((error) => {
      console.error(`Failed to initialize component "${selector}"`, error);
    });
});
