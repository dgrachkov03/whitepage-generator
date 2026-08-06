class ConsentBanner {
  selectors = {
    root: "[data-js-consent-banner]",
    preferences: "[data-js-consent-banner-preferences]",
    acceptAll: "[data-js-consent-banner-accept-all]",
    rejectAll: "[data-js-consent-banner-reject-all]",
    configure: "[data-js-consent-banner-configure]",
    save: "[data-js-consent-banner-save]",
    toggles: "[data-js-consent-banner-toggle]",
  };

  storageKey = "site-consent";
  consentVersion = 1;

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root);

    if (!this.rootElement) return;

    this.preferencesElement = this.rootElement.querySelector(
      this.selectors.preferences,
    );
    this.acceptAllElement = this.rootElement.querySelector(
      this.selectors.acceptAll,
    );
    this.rejectAllElement = this.rootElement.querySelector(
      this.selectors.rejectAll,
    );
    this.configureElement = this.rootElement.querySelector(
      this.selectors.configure,
    );
    this.saveElement = this.rootElement.querySelector(this.selectors.save);
    this.toggleElements = [
      ...this.rootElement.querySelectorAll(this.selectors.toggles),
    ];

    const requiredElements = {
      acceptAll: this.acceptAllElement,
      rejectAll: this.rejectAllElement,
    };
    const missingElements = Object.entries(requiredElements)
      .filter(([, element]) => !element)
      .map(([name]) => name);

    if (missingElements.length) {
      console.warn(
        `ConsentBanner was not initialized. Missing elements: ${missingElements.join(", ")}`,
      );
      return;
    }

    this.hasPreferences =
      Boolean(this.preferencesElement) &&
      Boolean(this.configureElement) &&
      Boolean(this.saveElement);

    if (this.hasStoredConsent()) {
      this.hide({ animate: false });
      return;
    }

    this.show({ animate: false });
    this.bindEvents();
  }

  hasStoredConsent() {
    return Boolean(this.readStoredConsent());
  }

  readStoredConsent() {
    try {
      const rawValue =
        window.localStorage.getItem(this.storageKey) ??
        window.localStorage.getItem("cookie-consent");

      if (!rawValue) return null;

      const parsedValue = JSON.parse(rawValue);

      if (
        !parsedValue ||
        typeof parsedValue !== "object" ||
        parsedValue.version !== this.consentVersion ||
        typeof parsedValue.categories !== "object"
      ) {
        return null;
      }

      return parsedValue;
    } catch {
      return null;
    }
  }

  getCategoryDefaults() {
    return Object.fromEntries(
      this.toggleElements.map((toggle) => [
        toggle.dataset.categoryId,
        toggle.defaultChecked,
      ]),
    );
  }

  getCategorySelection() {
    return Object.fromEntries(
      this.toggleElements.map((toggle) => [
        toggle.dataset.categoryId,
        toggle.checked,
      ]),
    );
  }

  setCategorySelection(categories) {
    this.toggleElements.forEach((toggle) => {
      const categoryId = toggle.dataset.categoryId;
      const isRequired = toggle.disabled;

      if (isRequired) {
        toggle.checked = true;
        return;
      }

      toggle.checked = Boolean(categories[categoryId]);
    });
  }

  buildConsentRecord(categories) {
    return {
      version: this.consentVersion,
      categories,
      timestamp: new Date().toISOString(),
    };
  }

  persistConsent(categories) {
    window.localStorage.setItem(
      this.storageKey,
      JSON.stringify(this.buildConsentRecord(categories)),
    );
    window.localStorage.removeItem("cookie-consent");
  }

  getAcceptAllCategories() {
    return Object.fromEntries(
      this.toggleElements.map((toggle) => [toggle.dataset.categoryId, true]),
    );
  }

  getRejectAllCategories() {
    return Object.fromEntries(
      this.toggleElements.map((toggle) => [
        toggle.dataset.categoryId,
        toggle.disabled || false,
      ]),
    );
  }

  show({ animate = true } = {}) {
    this.rootElement.hidden = false;
    this.rootElement.setAttribute("aria-hidden", "false");

    if (!animate) {
      this.rootElement.classList.add("is-visible");
      this.acceptAllElement.focus();
      return;
    }

    requestAnimationFrame(() => {
      this.rootElement.classList.add("is-visible");
      this.acceptAllElement.focus();
    });
  }

  hide({ animate = true } = {}) {
    this.rootElement.classList.remove("is-visible");
    this.rootElement.setAttribute("aria-hidden", "true");
    this.closePreferences();

    if (!animate) {
      this.rootElement.hidden = true;
      return;
    }

    const onTransitionEnd = (event) => {
      if (event.target !== this.rootElement || event.propertyName !== "opacity") {
        return;
      }

      this.rootElement.hidden = true;
      this.rootElement.removeEventListener("transitionend", onTransitionEnd);
    };

    this.rootElement.addEventListener("transitionend", onTransitionEnd);
    window.setTimeout(() => {
      if (!this.rootElement.classList.contains("is-visible")) {
        this.rootElement.hidden = true;
      }
    }, 300);
  }

  openPreferences() {
    if (!this.hasPreferences) return;

    this.preferencesElement.hidden = false;
    this.configureElement.setAttribute("aria-expanded", "true");
  }

  closePreferences() {
    if (!this.hasPreferences) return;

    this.preferencesElement.hidden = true;
    this.configureElement.setAttribute("aria-expanded", "false");
  }

  saveAndClose(categories) {
    this.persistConsent(categories);
    this.hide();
  }

  onAcceptAllClick = () => {
    this.saveAndClose(this.getAcceptAllCategories());
  };

  onRejectAllClick = () => {
    this.saveAndClose(this.getRejectAllCategories());
  };

  onConfigureClick = () => {
    if (!this.hasPreferences) return;

    const isOpen = this.configureElement.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      this.closePreferences();
      return;
    }

    this.setCategorySelection(this.getCategoryDefaults());
    this.openPreferences();
    this.preferencesElement
      .querySelector(this.selectors.toggles)
      ?.focus();
  };

  onSaveClick = () => {
    this.saveAndClose(this.getCategorySelection());
  };

  bindEvents() {
    this.acceptAllElement.addEventListener("click", this.onAcceptAllClick);
    this.rejectAllElement.addEventListener("click", this.onRejectAllClick);

    if (this.configureElement) {
      this.configureElement.addEventListener("click", this.onConfigureClick);
    }

    if (this.saveElement) {
      this.saveElement.addEventListener("click", this.onSaveClick);
    }
  }

  destroy() {
    this.acceptAllElement.removeEventListener("click", this.onAcceptAllClick);
    this.rejectAllElement.removeEventListener("click", this.onRejectAllClick);

    if (this.configureElement) {
      this.configureElement.removeEventListener("click", this.onConfigureClick);
    }

    if (this.saveElement) {
      this.saveElement.removeEventListener("click", this.onSaveClick);
    }
  }
}

export default ConsentBanner;
