// assets/js/v2.js
// v2 paging + case carousel + cursor navigation

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
   Markdown loading + rendering
---------------------------- */
const mdCache = new Map();

async function loadMarkdown(url) {
  if (!url) return "";
  if (mdCache.has(url)) return mdCache.get(url);

  const p = (async () => {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    const text = await res.text();
    return markdownToHtml(text);
  })();

  mdCache.set(url, p);
  return p;
}

function prefetchMarkdown(url) {
  if (!url || mdCache.has(url)) return;
  loadMarkdown(url).catch(() => {});
}

function markdownToHtml(md) {
  const blocks = md.trim().split(/\n\s*\n/);
  let html = "";

  for (const block of blocks) {
    if (/^-\s+/m.test(block)) {
      const items = block
        .split("\n")
        .filter(line => line.trim().startsWith("- "))
        .map(line => {
          let text = line.replace(/^-+\s*/, "");
          text = text
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.+?)\*/g, "<em>$1</em>");
          return `<li>${text}</li>`;
        });

      html += `<ul>${items.join("")}</ul>`;
      continue;
    }

    let p = block
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");

    html += `<p>${p}</p>`;
  }

  return html;
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
   Overlays
---------------------------- */
function initPanels() {
  const overlays = document.querySelectorAll("[data-overlay]");

  function closeAll() {
    overlays.forEach((o) => (o.hidden = true));
  }

  function open(name) {
    closeAll();
    const el = document.querySelector(`[data-overlay="${name}"]`);
    if (el) el.hidden = false;
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
---------------------------- */
function initCursorNav() {
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
  const videoEl = caseEl.querySelector("[data-step-video]");
  const counterEl = caseEl.querySelector("[data-counter]");

  // Keep stable state for video across renders
  let activeVideoUrl = "";
  let caseIsVisible = true; // controlled by IntersectionObserver

  // Start predictable
  if (videoEl) {
    videoEl.hidden = true;
    // autoplay requirements
    videoEl.muted = true;
    videoEl.loop = true;
    videoEl.playsInline = true;
    videoEl.autoplay = true;
    videoEl.preload = "metadata";
  }
  if (imgEl) imgEl.hidden = false;

  let idx = 0;
  let renderToken = 0;

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

  function normalizeUrl(u) {
    if (!u) return "";
    const s = String(u).trim();
    if (!s) return "";
    if (/^(https?:)?\/\//i.test(s) || /^(data:|blob:)/i.test(s)) return s;
    return new URL(s, document.baseURI).toString();
  }

  function pauseVideo() {
    if (!videoEl) return;
    try { videoEl.pause(); } catch {}
  }

  function resumeVideoIfAppropriate() {
    if (!videoEl) return;
    if (!caseIsVisible) return;

    const s = steps[idx] || {};
    if (!s.video) return;

    // If it should be visible, ensure it is
    videoEl.hidden = false;

    // Try play (ignore failures)
    const p = videoEl.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }

  // Pause/resume when the whole case goes out of view (helps paging + performance)
  let io = null;
  if ("IntersectionObserver" in window && videoEl) {
    io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        caseIsVisible = !!entry && entry.isIntersecting && entry.intersectionRatio > 0.15;
        if (!caseIsVisible) pauseVideo();
        else resumeVideoIfAppropriate();
      },
      { threshold: [0, 0.15, 0.5] }
    );
    io.observe(caseEl);
  }

  // Also pause when tab hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseVideo();
    else resumeVideoIfAppropriate();
  });

  function render() {
    const s = steps[idx] || {};

    if (headingEl) headingEl.textContent = s.heading || "";

    // Prefetch markdown bodies
    const nextIdx = (idx + 1) % steps.length;
    const prevIdx = Math.max(0, idx - 1);
    prefetchMarkdown(steps[nextIdx]?.body);
    prefetchMarkdown(steps[prevIdx]?.body);

    // ----------------------------
    // MEDIA (stable)
    // ----------------------------
    if (s.video && videoEl) {
      const vUrl = normalizeUrl(s.video);

      // Show video, hide image
      if (imgEl) {
        imgEl.hidden = true;
        // IMPORTANT: don’t remove src on image here; not needed
      }

      videoEl.hidden = false;

      // Only change src when it changes (prevents reload thrash)
      if (vUrl && vUrl !== activeVideoUrl) {
        activeVideoUrl = vUrl;
        videoEl.setAttribute("src", vUrl);
        // Don’t call load() repeatedly unless src changed
        videoEl.load();
        // start from beginning when switching video source
        try { videoEl.currentTime = 0; } catch {}
      }

      resumeVideoIfAppropriate();
    } else {
      // Show image, hide (and pause) video
      if (videoEl) {
        videoEl.hidden = true;
        pauseVideo();
        // IMPORTANT: keep src (don’t remove) so it doesn’t “disappear” later
      }

      const iUrl = normalizeUrl(s.image || s.media || "");
      if (imgEl) {
        imgEl.hidden = false;
        if (iUrl) imgEl.src = iUrl;
        else imgEl.removeAttribute("src");
      }
    }

    // Markdown body
    if (bodyEl) {
      const token = ++renderToken;
      const url = s.body;

      loadMarkdown(url)
        .then((html) => {
          if (token !== renderToken) return;
          bodyEl.innerHTML = html;
          setV2HeaderHeight();
        })
        .catch((err) => {
          if (token !== renderToken) return;
          bodyEl.innerHTML = "<p style='color:red'>Missing content</p>";
          console.error(err);
        });
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

  // Click/tap anywhere on the case advances steps (including video)
  caseEl.addEventListener("click", (e) => {
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

  function forceStopScroll(el) {
    const y = el.scrollTop;
    el.scrollTop = y + 1;
    el.scrollTop = y;
  }

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

        const THRESH = 300;

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

  // Mobile touch paging
  let startY = 0;
  let accum = 0;
  let intent = 0;

  const ARM_PX = 12;
  const PAGE_PX = 120;

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

      const dy = startY - y;

      const atBottom = isNearBottom(el);
      const atTop = isNearTop(el);

      if (!atBottom && !atTop) return;

      if (atBottom && dy > ARM_PX) {
        e.preventDefault();
        accum += dy;
        intent = +1;
      } else if (atTop && dy < -ARM_PX) {
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
