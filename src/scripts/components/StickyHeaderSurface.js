function getScrollTop() {
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
}

class StickyHeaderSurface {
  stateClass = "is-scrolled";

  constructor(rootElement) {
    this.rootElement = rootElement;

    if (!this.rootElement) return;

    this.onScroll = () => {
      this.syncScrollState();
    };

    this.syncScrollState();
    window.addEventListener("scroll", this.onScroll, { passive: true });
    document.addEventListener("scroll", this.onScroll, { passive: true });
  }

  syncScrollState() {
    this.rootElement.classList.toggle(this.stateClass, getScrollTop() > 0);
  }

  destroy() {
    window.removeEventListener("scroll", this.onScroll);
    document.removeEventListener("scroll", this.onScroll);
  }
}

export default StickyHeaderSurface;
