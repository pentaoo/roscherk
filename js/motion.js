window.ShejiMotion = {
  root: null,
  reducedMotion: false,

  init() {
    this.root = document.documentElement;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },

  durationMs(tokenName) {
    if (this.reducedMotion) {
      return 0;
    }

    const raw = getComputedStyle(this.root).getPropertyValue(tokenName).trim();
    return parseFloat(raw) || 0;
  },

  px(tokenName) {
    const raw = getComputedStyle(this.root).getPropertyValue(tokenName).trim();
    return parseFloat(raw) || 0;
  },

  expandedWidth() {
    const max = this.px("--width-expanded-max");
    return `${Math.min(max, window.innerWidth)}px`;
  },

  expandedHeight() {
    return `${window.innerHeight}px`;
  },
};
