// assets/js/v2.js
// v2 paging + case carousel + cursor navigation
// - Desktop: wheel = one case per gesture (unchanged)
// - Mobile: scroll reads within a case; only at top/bottom + harder swipe (on release) pages
// - Mobile: tap anywhere advances step (forward only)

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function isMobileUI() {
  return (
    window.matchMedia("(max-width: 900px)").matches ||
    (window.matchMedia("(pointer: coarse)").matches &&
      window.matchMedia("(hover: none)").matches)
  );
}

/* ----------------------------
   Header height measurement
---------------------------- */
function setV2HeaderHeight() {
  const root = document.documentElement;
  const header = document.querySelector(".v2-header");
  const headerH = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
  if (headerH > 0) root.style.setProperty("--v2-header-h", `${headerH}px`);
}

function setV2ScrollbarWidth() {
  const scroller = document.querySelector(".v2-snap");
  if (!scroller) return;

  const scrollbarW = scroller.offsetWidth - scroller.clientWidth;
  document.documentElement.style.setProperty("--v2-scrollbar-w", `${scrollbarW}px`);
}

/* ----------------------------
   Overlays (About / Overview)
---------------------------- */
function initPanels() {
  const overlays = document.querySelectorAll("[data-overlay]");

  function open(name) {
    closeAll(); // ensure only one overlay at a time
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
   Cursor-follow label
   (previous / next)
---------------------------- */
function initCursorNav() {
  // Don’t show cursor label on touch devices
  if (isMobileUI()) return;

  const el = document.querySelector(".v2-cursorNext");
  if (!el) return;

  function show(text) {
    el.textContent = text;
    el.hidden = false;
  }

  function hide() {
    el.hidden = true;
  }

  document.addEventListener("mousemove", (e) => {
    const isInsideCase = e.target.closest(".v2-case");
    if (!isInsideCase) {
      hide();
      return;
    }

    const midX = window.innerWidth / 2;

    if (e.clientX < midX) show("previous");
    else show("next");

    el.style.transform = `translate(${e.clientX + 12}px, ${e.clientY + 10}px)`;
  });

  document.addEventListener("mouseleave", () => hide());
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

  // Click/tap anywhere on the case:
  // - Mobile: always NEXT (forward-only)
  // - Desktop: left half = prev, right half = next
  caseEl.addEventListener("click", (e) => {
    // Don't hijack clicks on UI controls/links
    if (e.target.closest("button, a, input, textarea, select, label")) return;

    if (isMobileUI()) {
      next();
      return;
    }

    const midX = window.innerWidth / 2;
    if (e.clientX < midX) prev();
    else next();
  });

  render();
}

/* ----------------------------
   Paging between cases
---------------------------- */
function initSnapPaging() {
  const scroller = document.querySelector(".v2-snap");
  if (!scroller) return;

  const cases = Array.from(scroller.querySelectorAll(".v2-case"));
  if (cases.length < 2) return;

  const mobile = isMobileUI();

  let isAnimating = false;
  let gestureLocked = false;

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
    animateTo(cases[next].offsetTop, mobile ? 220 : 140);
  }

  function currentCaseEl() {
    return cases[findNearestIndex()];
  }

  function isNearTop(el, px = 40) {
    const top = el.offsetTop;
    return scroller.scrollTop <= top + px;
  }

  function isNearBottom(el, px = 56) {
    const bottom = el.offsetTop + el.offsetHeight;
    const viewportBottom = scroller.scrollTop + scroller.clientHeight;
    return viewportBottom >= bottom - px;
  }

  // Safari momentum cancel trick: stops native scrolling before we animate
  function forceStopScroll(el) {
    const y = el.scrollTop;
    el.scrollTop = y + 1;
    el.scrollTop = y;
  }

  // -----------------------------
  // Desktop: wheel paging (one gesture = one case)
  // -----------------------------
  if (!mobile) {
    let wheelIdleTimer = null;
    let wheelAccum = 0;

    scroller.addEventListener(
      "wheel",
      (e) => {
        if (e.ctrlKey) return;
        e.preventDefault();

        if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
        wheelIdleTimer = setTimeout(() => {
          gestureLocked = false;
          wheelAccum = 0;
        }, 40);

        if (gestureLocked || isAnimating) return;

        const deltaY = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
        wheelAccum += deltaY;

        const THRESH = 300; // deliberate, calm

        if (wheelAccum > THRESH) {
          gestureLocked = true;
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

    return;
  }

  // -----------------------------
  // Mobile: boundary-aware touch paging (decide on release)
  // -----------------------------
  let startY = 0;
  let accum = 0;
  let intent = 0; // -1 prev, +1 next, 0 none

  const ARM_PX = 12;   // ignore tiny jitter at boundary
  const PAGE_PX = 120; // “slightly bigger/harder” swipe

  scroller.addEventListener(
    "touchstart",
    (e) => {
      if (!e.touches || e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
      accum = 0;
      intent = 0;
    },
    { passive: true }
  );

  scroller.addEventListener(
    "touchmove",
    (e) => {
      if (gestureLocked || isAnimating) return;
      if (!e.touches || e.touches.length !== 1) return;

      const el = currentCaseEl();
      const y = e.touches[0].clientY;

      // dy > 0: user swiped up (wants to scroll DOWN)
      // dy < 0: user swiped down (wants to scroll UP)
      const dy = startY - y;

      const atBottom = isNearBottom(el);
      const atTop = isNearTop(el);

      // Not at a boundary: allow native scrolling
      if (!atBottom && !atTop) return;

      if (atBottom && dy > ARM_PX) {
        // paging intent to NEXT
        e.preventDefault();
        accum += dy;
        intent = +1;
      } else if (atTop && dy < -ARM_PX) {
        // paging intent to PREV
        e.preventDefault();
        accum += dy;
        intent = -1;
      }
    },
    { passive: false }
  );

  scroller.addEventListener(
    "touchend",
    () => {
      if (gestureLocked || isAnimating) return;
      if (intent === 0) return;

      if (intent === +1 && accum > PAGE_PX) {
        gestureLocked = true;
        forceStopScroll(scroller);
        go(+1);
      } else if (intent === -1 && accum < -PAGE_PX) {
        gestureLocked = true;
        forceStopScroll(scroller);
        go(-1);
      }

      intent = 0;
      accum = 0;

      window.setTimeout(() => {
        gestureLocked = false;
      }, 240);
    },
    { passive: true }
  );
}

/* ----------------------------
   Main
---------------------------- */
(function main() {
  initPanels();
  initCursorNav();

  setV2HeaderHeight();
  setV2ScrollbarWidth();

  const onResize = () => {
    window.requestAnimationFrame(() => {
      setV2HeaderHeight();
      setV2ScrollbarWidth();
    });
  };

  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);

  initSnapPaging();

  const caseEls = Array.from(document.querySelectorAll("[data-case]"));
  caseEls.forEach(initCase);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setV2HeaderHeight);
  }
})();
