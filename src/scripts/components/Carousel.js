import Swiper from "swiper";
import { Navigation, Pagination, A11y, EffectFade, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "../../styles/components/carousel.css";

const DEFAULT_BREAKPOINTS = {
  0: { slidesPerView: 1, spaceBetween: 16 },
  640: { slidesPerView: 2, spaceBetween: 20 },
  1024: { slidesPerView: 3, spaceBetween: 24 },
};

class Carousel {
  selectors = {
    root: "[data-js-carousel]",
    swiper: ".swiper",
    prev: "[data-js-carousel-prev]",
    next: "[data-js-carousel-next]",
    pagination: "[data-js-carousel-pagination]",
  };

  constructor() {
    this.roots = [...document.querySelectorAll(this.selectors.root)];

    if (!this.roots.length) return;

    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    this.instances = this.roots
      .map((root) => this.createInstance(root))
      .filter(Boolean);
  }

  createInstance(root) {
    const swiperElement = root.querySelector(this.selectors.swiper);
    const prevElement = root.querySelector(this.selectors.prev);
    const nextElement = root.querySelector(this.selectors.next);
    const paginationElement = root.querySelector(this.selectors.pagination);

    if (!swiperElement) {
      console.warn("Carousel was not initialized. Missing swiper element.");
      return null;
    }

    const slideCount = swiperElement.querySelectorAll(".swiper-slide").length;
    const isFade = root.dataset.carouselEffect === "fade";
    const autoplay = this.resolveAutoplay(root);
    const breakpoints = this.resolveBreakpoints(root);
    const maxSlidesPerView = Math.max(
      ...Object.values(breakpoints).map((point) => point.slidesPerView),
    );
    const modules = isFade
      ? [Navigation, Pagination, A11y, EffectFade]
      : [Navigation, Pagination, A11y];

    if (autoplay) {
      modules.push(Autoplay);
    }

    const swiperConfig = {
      modules,
      slidesPerView: 1,
      spaceBetween: isFade ? 0 : 16,
      speed: this.reducedMotion ? 0 : isFade ? 550 : 450,
      watchOverflow: true,
      loop: isFade
        ? slideCount > 1 && !this.reducedMotion
        : slideCount > maxSlidesPerView && !this.reducedMotion,
      navigation: {
        prevEl: prevElement,
        nextEl: nextElement,
      },
      pagination: {
        el: paginationElement,
        clickable: true,
      },
      a11y: {
        prevSlideMessage:
          root.dataset.carouselPrevLabel || "Previous slide",
        nextSlideMessage: root.dataset.carouselNextLabel || "Next slide",
      },
    };

    if (autoplay) {
      swiperConfig.autoplay = autoplay;
    }

    if (isFade) {
      swiperConfig.effect = "fade";
      swiperConfig.fadeEffect = { crossFade: true };
    } else {
      swiperConfig.breakpoints = breakpoints;
    }

    const swiper = new Swiper(swiperElement, swiperConfig);

    this.syncControlVisibility(root, swiper);

    if (root.hasAttribute("data-carousel-equal-height")) {
      this.syncEqualSlideHeights(root, swiper);
    }

    return swiper;
  }

  syncEqualSlideHeights(root, swiper) {
    const slides = [...swiper.slides].filter(
      (slide) => slide.querySelector(".ui-spotlight-slide"),
    );

    if (!slides.length) {
      return;
    }

    const measure = () => {
      swiper.el.style.removeProperty("height");

      let maxHeight = 0;

      slides.forEach((slide) => {
        const content = slide.querySelector(".ui-spotlight-slide");

        if (!content) {
          return;
        }

        maxHeight = Math.max(maxHeight, content.offsetHeight);
      });

      if (maxHeight <= 0) {
        return;
      }

      swiper.el.style.height = `${maxHeight}px`;
    };

    measure();

    swiper.on("resize", measure);
    swiper.on("update", measure);
    swiper.on("slideChangeTransitionEnd", measure);

    slides.forEach((slide) => {
      slide.querySelectorAll("img").forEach((image) => {
        if (!image.complete) {
          image.addEventListener("load", measure, { once: true });
        }
      });
    });

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(measure);

      slides.forEach((slide) => {
        const content = slide.querySelector(".ui-spotlight-slide");

        if (content) {
          observer.observe(content);
        }
      });
    } else {
      window.addEventListener("resize", measure);
    }
  }

  resolveAutoplay(root) {
    if (this.reducedMotion || !root.hasAttribute("data-carousel-autoplay")) {
      return false;
    }

    const raw = root.dataset.carouselAutoplay;
    const delay = raw ? Number.parseInt(raw, 10) : 5000;

    if (Number.isNaN(delay) || delay <= 0) {
      return false;
    }

    return {
      delay,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    };
  }

  resolveBreakpoints(root) {
    const slides = root.dataset.carouselSlides;

    if (!slides) {
      return DEFAULT_BREAKPOINTS;
    }

    const [mobile = 1, tablet = 2, desktop = 3] = slides
      .split(",")
      .map((value) => Number.parseInt(value.trim(), 10));

    return {
      0: { slidesPerView: mobile, spaceBetween: 16 },
      640: { slidesPerView: tablet, spaceBetween: 20 },
      1024: { slidesPerView: desktop, spaceBetween: 24 },
    };
  }

  syncControlVisibility(root, swiper) {
    const controls = [
      root.querySelector(this.selectors.prev),
      root.querySelector(this.selectors.next),
      root.querySelector(this.selectors.pagination),
    ];

    const update = () => {
      controls.forEach((element) => {
        if (!element) return;
        element.hidden = swiper.isLocked;
      });
    };

    update();
    swiper.on("resize", update);
    swiper.on("breakpoint", update);
    swiper.on("lock", update);
    swiper.on("unlock", update);
  }
}

export default Carousel;
