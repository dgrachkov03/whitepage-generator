import intlTelInput from "intl-tel-input/intlTelInputWithUtils";
import "intl-tel-input/styles";

class StaticForm {
  selectors = {
    root: "[data-js-form]",
    phone: "[data-js-phone-input]",
  };

  constructor() {
    this.rootElements = [...document.querySelectorAll(this.selectors.root)];
    this.phoneInstances = new Map();
    this.initPhoneInputs();
    this.bindEvents();
  }

  initPhoneInputs() {
    this.rootElements.forEach((form) => {
      const phoneInput = form.querySelector(this.selectors.phone);

      if (!phoneInput || this.phoneInstances.has(phoneInput)) return;

      const instance = intlTelInput(phoneInput, {
        initialCountry: form.dataset.phoneCountry,
        countrySearch: true,
        strictMode: true,
      });

      phoneInput.addEventListener("input", () => {
        phoneInput.setCustomValidity("");
      });

      this.phoneInstances.set(phoneInput, instance);
    });
  }

  validatePhone(form) {
    const phoneInput = form.querySelector(this.selectors.phone);

    if (!phoneInput) return true;

    const instance = this.phoneInstances.get(phoneInput);

    if (!instance) return phoneInput.checkValidity();

    if (!instance.isValidNumber()) {
      phoneInput.setCustomValidity(
        phoneInput.dataset.invalidMessage ||
          "Please enter a valid phone number.",
      );
      phoneInput.reportValidity();
      return false;
    }

    phoneInput.setCustomValidity("");
    phoneInput.value = instance.getNumber();
    return true;
  }

  onSubmit = (event) => {
    event.preventDefault();

    if (!this.validatePhone(event.currentTarget)) return;
  };

  bindEvents() {
    this.rootElements.forEach((element) => {
      element.addEventListener("submit", this.onSubmit);
    });
  }

  destroy() {
    this.phoneInstances.forEach((instance) => {
      instance.destroy();
    });
    this.phoneInstances.clear();

    this.rootElements.forEach((element) => {
      element.removeEventListener("submit", this.onSubmit);
    });
  }
}

export default StaticForm;
