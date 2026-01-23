// assets/js/v2.js
// v2 carousel + overlays, with robust header-only height measuring (no shrinking feedback loop)

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
    // Header can change slightly if fonts load late; safe to keep synced.
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
    // Make media area clickable and keyboard accessible
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

(function main() {
  initPanels();
  initCursorNext();

  // Init carousel for the (current) single case
  const caseEl = document.querySelector("[data-case]");
  if (caseEl) initCase(caseEl);

  // Measure header after first paint
  setV2HeaderHeight();

  // Keep header height in sync on resize/orientation changes
  const onResize = () => window.requestAnimationFrame(setV2HeaderHeight);
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);

  // Ensure correct after custom font loads
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => setV2HeaderHeight());
  }

  function initCursorNext() {
  const el = document.querySelector(".v2-cursorNext");
  if (!el) return;

  function show() { el.hidden = false; }
  function hide() { el.hidden = true; }

  document.addEventListener("mousemove", (e) => {
    if (el.hidden) return;
    // offset a bit so it doesn't sit directly under the pointer
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

  // Safety: if user scrolls without moving mouse, keep it from hanging around
  document.addEventListener("scroll", () => hide(), { passive: true });
}

})();
