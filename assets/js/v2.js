// assets/js/v2.js
// v2 carousel + overlays + cursor-next + trackpad paging snap between cases

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// Measure ONLY the header (bottom is handled by normal flow in CSS grid)
function setV2HeaderHeight() {
  const root = document.documentElement;
  const header = document.querySelector(".v2-header");
  const headerH = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
  if (headerH > 0) root.style.setProperty("--v2-header-h", `${headerH}px`);
}

/* ----------------------------
   Overlays (About / Overview)
---------------------------- */
function initPanels() {
  const overlays = document.querySelectorAll("[data-overlay]");

  function open(name) {
    const el = document.querySelector(`[data-overlay="${name}"]`);
    if (el) el.hidden = false;
  }

  function closeAll() {
    overlays.forEach((o) => (o.hidden = true));
  }

  document.addEventListener("click", (e) => {
    const openBtn = e.target.closest("[data-open]");
    if (openBtn) open(openBtn.getAttribute("data-open"));

    if (e.target.closest("[data-close]")) closeAll();

    const overlay = e.target.closest("[data-overlay]");
    if (overlay && e.target === overlay) closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
}

/* ----------------------------
   Cursor-follow "next" label
---------------------------- */
function initCursorNext() {
  const el = document.querySelector(".v2-cursorNext");
  if (!el) return;

  function show() {
    el.hidden = false;
  }
  function hide() {
    el.hidden = true;
  }

  document.addEventListener("mousemove", (e) => {
    if (el.hidden) return;
    const x = e.clientX + 12;
    const y = e.clientY + 10;
    el.style.transform = `translate(${x}px, ${y}px)`;
  });

  document.addEventListener("mouseover", (e) => {
    const media = e.target.closest("[data-media]");
    if (media) show();
  });

  document.addEventListener("mouseout", (e) => {
    const media = e.target.closest("[data-media]");
    if (media) hide();
  });

  // If user scrolls without moving mouse, don't leave "next" hanging
  document.addEventListener("scroll", () => hide(), { passive: true });
}

/* ----------------------------
   Case carousel (per case)
---------------------------- */
function initCase(caseEl) {
  const stepsScript = caseEl.querySelector("script[data-steps]");
  let steps = [];
  try {
    steps = JSON.parse(stepsScript?.textContent || "[]");
  } catch {
    steps = [];
  }

  if (!Array.isArray(steps) || steps.length === 0) {
    steps = [{ heading: "", body: "", image: "" }];
  }

  const headingEl = caseEl.querySelector("[data-step-heading]");
  const bodyEl = caseEl.querySelector("[data-step-body]");
  const imgEl = caseEl.querySelector("[data-step-image]");
  const mediaEl = caseEl.querySelector("[data-media]");
  const counterEl = caseEl.querySelector("[data-counter]");

  let idx = 0;

  function renderCounter() {
    if (!counterEl) return;
    counterEl.innerHTML = "";

    steps.forEach((_, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "v2-counterItem";
      btn.textContent = String(i + 1);
      btn.setAttribute("aria-current", i === idx ? "true" : "false");
      btn.addEventListener("click", () => {
        idx = i;
        render();
      });
      counterEl.appendChild(btn);
    });
  }

  function render() {
    const s = steps[idx] || {};
    if (headingEl) headingEl.textContent = s.heading || "";
    if (bodyEl) bodyEl.textContent = s.body || "";

    if (imgEl) {
      if (s.image) {
        imgEl.src = s.image;
        imgEl.style.visibility = "visible";
      } else {
        imgEl.removeAttribute("src");
        imgEl.style.visibility = "hidden";
      }
    }

    renderCounter();
    setV2HeaderHeight();
  }

  function next() {
    idx = (idx + 1) % steps.length;
    render();
  }

  function prev() {
    idx = clamp(idx - 1, 0, steps.length - 1);
    render();
  }

  if (mediaEl) {
    mediaEl.addEventListener("click", next);

    mediaEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    });
  }

  render();
}

/* ----------------------------
   Trackpad paging snap (no skipping)
   - Intercepts wheel on .v2-snap
   - Converts scroll intent into +1/-1 case jumps
---------------------------- */
function initSnapPaging() {
  const scroller = document.querySelector(".v2-snap");
  if (!scroller) return;

  const cases = Array.from(scroller.querySelectorAll(".v2-case"));
  if (cases.length < 2) return;

  let isAnimating = false;

  // Gesture gating: after we page once, we lock until wheel input stops
  let gestureLocked = false;
  let wheelIdleTimer = null;

  // Accumulate small deltas into a “commit”
  let wheelAccum = 0;
  let accumResetTimer = null;

  function findNearestIndex() {
    const st = scroller.scrollTop;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < cases.length; i++) {
      const d = Math.abs(cases[i].offsetTop - st);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  }

  function animateTo(targetTop, durationMs) {
    const startTop = scroller.scrollTop;
    const delta = targetTop - startTop;
    if (delta === 0) return;

    const start = performance.now();
    const easeOut = (x) => 1 - Math.pow(1 - x, 3);

    isAnimating = true;

    function frame(now) {
      const t = Math.min(1, (now - start) / durationMs);
      scroller.scrollTop = startTop + delta * easeOut(t);
      if (t < 1) requestAnimationFrame(frame);
      else isAnimating = false;
    }

    requestAnimationFrame(frame);
  }

  function go(step) {
    const idx = findNearestIndex();
    const next = Math.max(0, Math.min(cases.length - 1, idx + step));
    animateTo(cases[next].offsetTop, 140);
  }

  scroller.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey) return; // allow pinch zoom

      // We control scrolling
      e.preventDefault();

      // Reset idle timer: when wheel quiets down, unlock next gesture
      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
      wheelIdleTimer = setTimeout(() => {
        gestureLocked = false;
        wheelAccum = 0;
      }, 40);

      // If we already paged this gesture (or we're animating), ignore remaining momentum
      if (gestureLocked || isAnimating) return;

      const deltaY = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      wheelAccum += deltaY;

      // reset accumulator if user pauses mid-gesture
      if (accumResetTimer) clearTimeout(accumResetTimer);
      accumResetTimer = setTimeout(() => {
        wheelAccum = 0;
      }, 120);

      // Your “deliberate” threshold.
      // Fixed: 300 works fine
      // Or scalable: scroller.clientHeight * 0.25 (~300 on tall screens)
      const THRESH = 300;

      if (wheelAccum > THRESH) {
        gestureLocked = true; // <-- key: only one page per gesture
        wheelAccum = 0;
        go(+1);
      } else if (wheelAccum < -THRESH) {
        gestureLocked = true;
        wheelAccum = 0;
        go(-1);
      }
    },
    { passive: false }
  );
}



/* ----------------------------
   Main
---------------------------- */
(function main() {
  initPanels();
  initCursorNext();
  // Measure header after first paint
  setV2HeaderHeight();

  initSnapPaging();

  // Init carousel for all cases on the page
  const caseEls = Array.from(document.querySelectorAll("[data-case]"));
  caseEls.forEach(initCase);


  // Keep header height in sync on resize/orientation changes
  const onResize = () => window.requestAnimationFrame(setV2HeaderHeight);
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);

  // Ensure correct after custom font loads
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => setV2HeaderHeight());
  }
})();
