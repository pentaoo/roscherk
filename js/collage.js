function initHomeCollage(collage) {
  const items = Array.from(collage.querySelectorAll(".collage-card"));
  if (items.length === 0) {
    return;
  }

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopQuery = window.matchMedia("(min-width: 768px) and (pointer: fine)");
  const strengths = [52, 78, 64, 46, 92, 70];
  const phases = [
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    [
      [-22, 18, -4],
      [34, -10, 5],
      [-18, 30, -6],
      [28, 8, 3],
      [18, -28, -5],
      [-32, 24, 4],
    ],
    [
      [36, -8, 6],
      [-26, 26, -4],
      [24, -22, 5],
      [-34, 16, -5],
      [-12, 30, 4],
      [30, -18, -3],
    ],
    [
      [-18, -20, -5],
      [24, 14, 4],
      [36, 18, -4],
      [-22, -26, 6],
      [28, 12, -3],
      [-26, -12, 5],
    ],
  ];

  const state = {
    enabled: desktopQuery.matches && !motionQuery.matches,
    mouseX: 0,
    mouseY: 0,
    rafId: 0,
  };

  const setVar = (item, name, value, unit = "px") => {
    item.style.setProperty(name, `${value.toFixed(2)}${unit}`);
  };

  const resetCursor = () => {
    items.forEach((item) => {
      item.style.setProperty("--cursor-x", "0px");
      item.style.setProperty("--cursor-y", "0px");
    });
  };

  const renderCursor = () => {
    state.rafId = 0;

    if (!state.enabled) {
      resetCursor();
      return;
    }

    items.forEach((item, index) => {
      const strength = strengths[index] || 48;
      const direction = index % 2 === 0 ? 1 : -1;
      const verticalDirection = index % 3 === 0 ? -1 : 1;

      setVar(item, "--cursor-x", state.mouseX * strength * direction);
      setVar(item, "--cursor-y", state.mouseY * strength * 0.62 * verticalDirection);
    });
  };

  const scheduleCursorRender = () => {
    if (state.rafId) {
      return;
    }

    state.rafId = window.requestAnimationFrame(renderCursor);
  };

  const applyCollectionPhase = (activeIndex) => {
    const phase = phases[activeIndex % phases.length];

    items.forEach((item, index) => {
      const [x, y, rotate] = phase[index] || [0, 0, 0];
      setVar(item, "--scroll-x", x);
      setVar(item, "--scroll-y", y);
      setVar(item, "--scroll-rotate", rotate, "deg");
    });
  };

  const updateEnabled = () => {
    state.enabled = desktopQuery.matches && !motionQuery.matches;

    if (!state.enabled) {
      resetCursor();
    }
  };

  const listenToQuery = (query, callback) => {
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", callback);
      return;
    }

    query.addListener(callback);
  };

  window.addEventListener("pointermove", (event) => {
    if (!state.enabled) {
      return;
    }

    state.mouseX = event.clientX / window.innerWidth - 0.5;
    state.mouseY = event.clientY / window.innerHeight - 0.5;
    scheduleCursorRender();
  });

  window.addEventListener("pointerleave", () => {
    state.mouseX = 0;
    state.mouseY = 0;
    scheduleCursorRender();
  });

  window.addEventListener("sheji:collectionchange", (event) => {
    applyCollectionPhase(event.detail?.activeIndex || 0);
  });

  listenToQuery(desktopQuery, updateEnabled);
  listenToQuery(motionQuery, updateEnabled);

  applyCollectionPhase(0);
  updateEnabled();
}

window.ShejiCollage = {
  initHomeCollage,
};
