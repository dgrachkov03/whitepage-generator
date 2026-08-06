class Header {
  selectors = {
    root: "[data-js-header]",
    logo: "[data-js-header-logo]",
    overlay: "[data-js-header-overlay]",
    overlayWrapper: "[data-js-header-overlay-wrapper]",
    burgerButton: "[data-js-header-burger-button]",
  };

  stateClasses = {
    isActive: "is-active",
    isLock: "is-lock",
    isScrolled: "is-scrolled",
  };

  focusableSelectors = [
    "a[href]",
    "button:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");

  constructor(rootElement = document.querySelector(this.selectors.root)) {
    this.rootElement = rootElement;

    if (!this.rootElement) return;

    this.logoElement = this.rootElement.querySelector(this.selectors.logo);
    this.overlayElement = this.rootElement.querySelector(
      this.selectors.overlay,
    );
    this.overlayWrapperElement = this.rootElement.querySelector(
      this.selectors.overlayWrapper,
    );
    this.burgerButtonElement = this.rootElement.querySelector(
      this.selectors.burgerButton,
    );
    this.menuMode = this.rootElement.dataset.headerMenu || "drawer-right";

    const requiredElements = {
      logo: this.logoElement,
      overlay: this.overlayElement,
      overlayWrapper: this.overlayWrapperElement,
      burgerButton: this.burgerButtonElement,
    };
    const missingElements = Object.entries(requiredElements)
      .filter(([, element]) => !element)
      .map(([name]) => name);

    if (missingElements.length) {
      console.warn(
        `Header was not initialized. Missing elements: ${missingElements.join(", ")}`,
      );
      return;
    }

    this.isOpen = false;
    this.focusTimer = null;
    this.mobileQuery = window.matchMedia("(max-width: 63.999rem)");
    this.reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    this.openLabel =
      this.burgerButtonElement.dataset.openLabel ||
      this.burgerButtonElement.getAttribute("aria-label") ||
      "";
    this.closeLabel =
      this.burgerButtonElement.dataset.closeLabel || this.openLabel;
    this.isSticky = this.rootElement.classList.contains("site-header--sticky");

    this.syncState({ focusMenu: false, restoreFocus: false });
    this.bindEvents();

    if (this.isSticky) {
      this.syncScrollState();
    }
  }

  syncScrollState() {
    const { isScrolled } = this.stateClasses;
    const shouldShowSurface = window.scrollY > 0 || this.isOpen;

    this.rootElement.classList.toggle(isScrolled, shouldShowSurface);
  }

  onScroll = () => {
    this.syncScrollState();
  };

  isMobile() {
    return this.mobileQuery.matches;
  }

  isDropdownMenu() {
    return this.menuMode === "dropdown";
  }

  shouldLockPage() {
    return this.isMobile() && this.isOpen && !this.isDropdownMenu();
  }

  getFocusableElements() {
    return [...this.rootElement.querySelectorAll(this.focusableSelectors)].filter(
      (element) => !element.closest("[inert]"),
    );
  }

  setPageInert(isInert) {
    const parent = this.rootElement.parentElement;

    if (!parent) return;

    parent
      .querySelectorAll(`:scope > *:not(${this.selectors.root})`)
      .forEach((element) => {
        element.toggleAttribute("inert", isInert);
      });
  }

  toggleInert() {
    if (!this.isMobile()) {
      this.setPageInert(false);
      this.overlayElement.removeAttribute("inert");
      this.logoElement.removeAttribute("inert");
      return;
    }

    const shouldInertPage = this.shouldLockPage();

    this.setPageInert(shouldInertPage);
    this.overlayElement.toggleAttribute("inert", !this.isOpen);
    this.logoElement.toggleAttribute("inert", shouldInertPage);
  }

  focusFirstMenuElement() {
    const focusableElement = this.overlayElement.querySelector(
      this.focusableSelectors,
    );

    focusableElement?.focus();
  }

  scheduleMenuFocus() {
    const focusMenu = () => {
      window.clearTimeout(this.focusTimer);
      this.focusTimer = null;
      this.focusFirstMenuElement();
    };

    if (this.reducedMotionQuery.matches) {
      requestAnimationFrame(focusMenu);
      return;
    }

    this.overlayWrapperElement.addEventListener("transitionend", focusMenu, {
      once: true,
    });
    this.focusTimer = window.setTimeout(focusMenu, 350);
  }

  syncState({ focusMenu = true, restoreFocus = true } = {}) {
    const { isActive, isLock } = this.stateClasses;

    this.burgerButtonElement.classList.toggle(isActive, this.isOpen);
    this.overlayElement.classList.toggle(isActive, this.isOpen);
    document.documentElement.classList.toggle(isLock, this.shouldLockPage());

    this.burgerButtonElement.setAttribute("aria-expanded", String(this.isOpen));
    this.burgerButtonElement.setAttribute(
      "aria-label",
      this.isOpen ? this.closeLabel : this.openLabel,
    );

    this.toggleInert();

    if (this.isSticky) {
      this.syncScrollState();
    }

    if (this.isOpen) {
      document.addEventListener("keydown", this.onFocusTrap);

      if (focusMenu) {
        this.scheduleMenuFocus();
      }
    } else {
      window.clearTimeout(this.focusTimer);
      this.focusTimer = null;
      document.removeEventListener("keydown", this.onFocusTrap);

      if (restoreFocus && this.isMobile()) {
        this.burgerButtonElement.focus();
      }
    }
  }

  toggle(options) {
    this.isOpen = !this.isOpen;
    this.syncState(options);
  }

  close(options) {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.syncState(options);
  }

  onFocusTrap = (event) => {
    if (event.key !== "Tab") return;

    const focusableElements = this.getFocusableElements();

    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  onKeydown = ({ key }) => {
    if (key === "Escape") {
      this.close();
    }
  };

  onBurgerButtonClick = () => {
    this.toggle();
  };

  onOverlayClick = ({ target }) => {
    if (target.closest("a[href]") && this.isMobile()) {
      this.close({ restoreFocus: false });
      return;
    }

    if (this.isDropdownMenu()) {
      return;
    }

    if (!this.overlayWrapperElement.contains(target)) {
      this.close();
    }
  };

  onDocumentClick = (event) => {
    if (!this.isOpen || !this.isDropdownMenu() || !this.isMobile()) {
      return;
    }

    if (!this.rootElement.contains(event.target)) {
      this.close();
    }
  };

  onMobileQueryChange = () => {
    if (!this.isMobile()) {
      this.close({ focusMenu: false, restoreFocus: false });
    }

    this.toggleInert();
  };

  bindEvents() {
    document.addEventListener("keydown", this.onKeydown);
    document.addEventListener("click", this.onDocumentClick);
    this.burgerButtonElement.addEventListener(
      "click",
      this.onBurgerButtonClick,
    );
    this.overlayElement.addEventListener("click", this.onOverlayClick);
    this.mobileQuery.addEventListener("change", this.onMobileQueryChange);

    if (this.isSticky) {
      window.addEventListener("scroll", this.onScroll, { passive: true });
    }
  }

  destroy() {
    window.clearTimeout(this.focusTimer);
    document.removeEventListener("keydown", this.onKeydown);
    document.removeEventListener("keydown", this.onFocusTrap);
    document.removeEventListener("click", this.onDocumentClick);
    this.burgerButtonElement.removeEventListener(
      "click",
      this.onBurgerButtonClick,
    );
    this.overlayElement.removeEventListener("click", this.onOverlayClick);
    this.mobileQuery.removeEventListener("change", this.onMobileQueryChange);

    if (this.isSticky) {
      window.removeEventListener("scroll", this.onScroll);
    }
    this.setPageInert(false);
    document.documentElement.classList.remove(this.stateClasses.isLock);
  }
}

export default Header;
