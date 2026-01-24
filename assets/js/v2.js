// assets/js/v2.js
// v2 paging + case carousel + cursor navigation

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
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

    if (e.clientX < midX) {
      show("previous");
    } else {
      show("next");
    }

    el.style.transform = `translate(${e.clientX + 12}px, ${e.clientY + 10}px)`;
  });

  // Hide cursor label when leaving the case area
  document.addEventListener("mouseleave", () => hide());

  // Safety: hide on scroll so it never gets stuck
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
  const prevAreaEl = caseEl.querySelector("[data-prev-area]");
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

    // Click anywhere on the case:
    // left half = previous step, right half = next step
    caseEl.addEventListener("click", (e) => {
    // Don't hijack clicks on UI controls/links
    if (e.target.closest("button, a, input, textarea, select, label")) return;

    const midX = window.innerWidth / 2;
    if (e.clientX < midX) {
      prev();
    } else {
      next();
    }
    });

  render();
}

/* ----------------------------
   Paging between cases
   (one scroll gesture = one case)
---------------------------- */
function initSnapPaging() {
  const scroller = document.querySelector(".v2-snap");
  if (!scroller) return;

  const cases = Array.from(scroller.querySelectorAll(".v2-case"));
  if (cases.length < 2) return;

  let isAnimating = false;
  let gestureLocked = false;
  let wheelIdleTimer = null;
  let wheelAccum = 0;

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
