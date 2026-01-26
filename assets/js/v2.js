// assets/js/v2.js - Refactored
// v2 paging + case carousel + cursor navigation

/* =============================================================================
   CONSTANTS & CONFIGURATION
============================================================================= */
const CONFIG = {
  MOBILE_BREAKPOINT: 900,
  WHEEL_THRESHOLD: 300,
  WHEEL_IDLE_MS: 40,
  TOUCH_ARM_PX: 12,
  TOUCH_PAGE_PX: 120,
  DESKTOP_ANIM_MS: 140,
  MOBILE_ANIM_MS: 220,
  GESTURE_LOCK_MS: 240,
  SNAP_NEAR_TOP_PX: 40,
  SNAP_NEAR_BOTTOM_PX: 56,
  INTERSECTION_THRESHOLD: 0.15,
};

/* =============================================================================
   UTILITIES
============================================================================= */
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function isMobileUI() {
  return (
    window.matchMedia(`(max-width: ${CONFIG.MOBILE_BREAKPOINT}px)`).matches ||
    (window.matchMedia("(pointer: coarse)").matches &&
      window.matchMedia("(hover: none)").matches)
  );
}

function normalizeUrl(url) {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (!trimmed) return "";
  if (/^(https?:)?\/\//i.test(trimmed) || /^(data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }
  return new URL(trimmed, document.baseURI).toString();
}

/* =============================================================================
   MARKDOWN LOADING & RENDERING
============================================================================= */
class MarkdownLoader {
  constructor() {
    this.cache = new Map();
  }

  async load(url) {
    if (!url) return "";
    if (this.cache.has(url)) return this.cache.get(url);

    const promise = (async () => {
      try {
        const res = await fetch(url, { cache: "force-cache" });
        if (!res.ok) throw new Error(`Failed to load ${url}`);
        const text = await res.text();
        return this.toHtml(text);
      } catch (error) {
        console.error(`Markdown load error for ${url}:`, error);
        throw error;
      }
    })();

    this.cache.set(url, promise);
    return promise;
  }

  prefetch(url) {
    if (!url || this.cache.has(url)) return;
    this.load(url).catch(() => {});
  }

  toHtml(markdown) {
    const blocks = markdown.trim().split(/\n\s*\n/);
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
      } else {
        let p = block
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.+?)\*/g, "<em>$1</em>")
          .replace(/\n/g, "<br>");

        html += `<p>${p}</p>`;
      }
    }

    return html;
  }
}

const markdownLoader = new MarkdownLoader();

/* =============================================================================
   HEADER HEIGHT & SCROLLBAR WIDTH MEASUREMENT
============================================================================= */
function setV2HeaderHeight() {
  const root = document.documentElement;
  const header = document.querySelector(".v2-header");
  const headerH = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
  if (headerH > 0) {
    root.style.setProperty("--v2-header-h", `${headerH}px`);
  }
}

function setV2ScrollbarWidth() {
  const scroller = document.querySelector(".v2-snap");
  if (!scroller) return;

  const scrollbarW = scroller.offsetWidth - scroller.clientWidth;
  document.documentElement.style.setProperty("--v2-scrollbar-w", `${scrollbarW}px`);
}

/* =============================================================================
   OVERLAY PANELS
============================================================================= */
class OverlayManager {
  constructor() {
    this.overlays = document.querySelectorAll("[data-overlay]");
    this.init();
  }

  init() {
    document.addEventListener("click", this.handleClick.bind(this));
    document.addEventListener("keydown", this.handleKeydown.bind(this));
  }

  handleClick(e) {
    const openBtn = e.target.closest("[data-open]");
    if (openBtn) {
      this.open(openBtn.getAttribute("data-open"));
      return;
    }

    if (e.target.closest("[data-close]")) {
      this.closeAll();
      return;
    }

    const overlay = e.target.closest("[data-overlay]");
    if (overlay && e.target === overlay) {
      this.closeAll();
    }
  }

  handleKeydown(e) {
    if (e.key === "Escape") {
      this.closeAll();
    }
  }

  closeAll() {
    this.overlays.forEach(overlay => overlay.hidden = true);
  }

  open(name) {
    this.closeAll();
    const el = document.querySelector(`[data-overlay="${name}"]`);
    if (el) el.hidden = false;
  }
}

/* =============================================================================
   CURSOR-FOLLOW NAVIGATION LABEL
============================================================================= */
class CursorNav {
  constructor() {
    if (isMobileUI()) return;
    
    this.el = document.querySelector(".v2-cursorNext");
    if (!this.el) return;

    this.init();
  }

  init() {
    document.addEventListener("mousemove", this.handleMouseMove.bind(this));
    document.addEventListener("mouseleave", this.hide.bind(this));
    document.addEventListener("scroll", this.hide.bind(this), { passive: true });
  }

  handleMouseMove(e) {
    const isInsideCase = e.target.closest(".v2-case");
    if (!isInsideCase) {
      this.hide();
      return;
    }

    const midX = window.innerWidth / 2;
    this.show(e.clientX < midX ? "previous" : "next");
    this.el.style.transform = `translate(${e.clientX + 12}px, ${e.clientY + 10}px)`;
  }

  show(text) {
    this.el.textContent = text;
    this.el.hidden = false;
  }

  hide() {
    this.el.hidden = true;
  }
}

/* =============================================================================
   VIDEO CONTROLLER
============================================================================= */
class VideoController {
  constructor(videoEl, caseEl) {
    this.videoEl = videoEl;
    this.caseEl = caseEl;
    this.currentUrl = "";
    this.isVisible = true;
    this.observer = null;

    if (!videoEl) return;

    this.initVideo();
    this.setupVisibilityObserver();
    this.setupPageVisibility();
  }

  initVideo() {
    this.videoEl.hidden = true;
    this.videoEl.muted = true;
    this.videoEl.loop = true;
    this.videoEl.playsInline = true;
    this.videoEl.autoplay = true;
    this.videoEl.preload = "metadata";
  }

  setupVisibilityObserver() {
    if (!("IntersectionObserver" in window)) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        this.isVisible = entry?.isIntersecting && entry.intersectionRatio > CONFIG.INTERSECTION_THRESHOLD;
        
        if (!this.isVisible) {
          this.pause();
        } else {
          this.play();
        }
      },
      { threshold: [0, CONFIG.INTERSECTION_THRESHOLD, 0.5] }
    );

    this.observer.observe(this.caseEl);
  }

  setupPageVisibility() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.play();
      }
    });
  }

  setSource(url) {
    const normalizedUrl = normalizeUrl(url);
    
    if (!normalizedUrl) {
      this.hide();
      return;
    }

    this.videoEl.hidden = false;

    // Only update src if it changed to prevent reload flicker
    if (normalizedUrl !== this.currentUrl) {
      this.currentUrl = normalizedUrl;
      this.videoEl.src = normalizedUrl;
      // Reset to beginning for new videos
      this.videoEl.currentTime = 0;
    }

    this.play();
  }

  play() {
    if (!this.isVisible || !this.currentUrl) return;
    
    const playPromise = this.videoEl.play();
    if (playPromise) {
      playPromise.catch(error => {
        console.warn("Video play failed:", error);
      });
    }
  }

  pause() {
    try {
      this.videoEl.pause();
    } catch (error) {
      console.warn("Video pause failed:", error);
    }
  }

  hide() {
    this.videoEl.hidden = true;
    this.pause();
  }

  show() {
    this.videoEl.hidden = false;
    this.play();
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.pause();
  }
}

/* =============================================================================
   CASE CAROUSEL
============================================================================= */
class CaseCarousel {
  constructor(caseEl) {
    this.caseEl = caseEl;
    this.steps = this.loadSteps();
    this.currentIndex = 0;
    this.renderToken = 0;

    // DOM elements
    this.headingEl = caseEl.querySelector("[data-step-heading]");
    this.bodyEl = caseEl.querySelector("[data-step-body]");
    this.imgEl = caseEl.querySelector("[data-step-image]");
    this.videoEl = caseEl.querySelector("[data-step-video]");
    this.counterEl = caseEl.querySelector("[data-counter]");

    // Video controller
    this.videoController = new VideoController(this.videoEl, caseEl);

    this.init();
  }

  loadSteps() {
    const stepsScript = this.caseEl.querySelector("script[data-steps]");
    try {
      const steps = JSON.parse(stepsScript?.textContent || "[]");
      return Array.isArray(steps) && steps.length > 0 
        ? steps 
        : [{ heading: "", body: "", image: "" }];
    } catch (error) {
      console.error("Failed to parse steps:", error);
      return [{ heading: "", body: "", image: "" }];
    }
  }

  init() {
    this.caseEl.addEventListener("click", this.handleClick.bind(this));
    this.render();
  }

  handleClick(e) {
    // Don't interfere with interactive elements
    if (e.target.closest("button, a, input, textarea, select, label")) return;

    if (isMobileUI()) {
      this.next();
      return;
    }

    const midX = window.innerWidth / 2;
    if (e.clientX < midX) {
      this.prev();
    } else {
      this.next();
    }
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.steps.length;
    this.render();
  }

  prev() {
    this.currentIndex = clamp(this.currentIndex - 1, 0, this.steps.length - 1);
    this.render();
  }

  async render() {
    const step = this.steps[this.currentIndex] || {};

    // Update heading immediately
    if (this.headingEl) {
      this.headingEl.textContent = step.heading || "";
    }

    // Prefetch adjacent content
    this.prefetchAdjacent();

    // Handle media (image vs video)
    this.renderMedia(step);

    // Handle markdown body
    await this.renderBody(step.body);

    // Update counter
    this.renderCounter();

    // Recalculate header height in case content changed
    setV2HeaderHeight();
  }

  prefetchAdjacent() {
    const nextIdx = (this.currentIndex + 1) % this.steps.length;
    const prevIdx = Math.max(0, this.currentIndex - 1);
    
    markdownLoader.prefetch(this.steps[nextIdx]?.body);
    markdownLoader.prefetch(this.steps[prevIdx]?.body);
  }

  renderMedia(step) {
    if (step.video) {
      // Show video, hide image
      if (this.imgEl) this.imgEl.hidden = true;
      this.videoController.setSource(step.video);
    } else {
      // Show image, hide video
      this.videoController.hide();
      
      if (this.imgEl) {
        this.imgEl.hidden = false;
        const imageUrl = normalizeUrl(step.image || step.media || "");
        
        if (imageUrl) {
          this.imgEl.src = imageUrl;
        } else {
          this.imgEl.removeAttribute("src");
        }
      }
    }
  }

  async renderBody(bodyUrl) {
    if (!this.bodyEl) return;

    const token = ++this.renderToken;

    try {
      const html = await markdownLoader.load(bodyUrl);
      
      // Check if we're still on the same step
      if (token !== this.renderToken) return;
      
      this.bodyEl.innerHTML = html;
      setV2HeaderHeight();
    } catch (error) {
      if (token !== this.renderToken) return;
      
      this.bodyEl.innerHTML = "<p style='color:red'>Missing content</p>";
      console.error("Failed to render body:", error);
    }
  }

  renderCounter() {
    if (!this.counterEl) return;

    this.counterEl.innerHTML = "";

    this.steps.forEach((_, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "v2-counterItem";
      btn.textContent = String(index + 1);
      btn.setAttribute("aria-current", index === this.currentIndex ? "true" : "false");
      btn.addEventListener("click", () => {
        this.currentIndex = index;
        this.render();
      });
      this.counterEl.appendChild(btn);
    });
  }

  destroy() {
    this.videoController.destroy();
  }
}

/* =============================================================================
   SNAP PAGING
============================================================================= */
class SnapPaging {
  constructor(scroller) {
    this.scroller = scroller;
    this.cases = Array.from(scroller.querySelectorAll(".v2-case"));
    
    if (this.cases.length < 2) return;

    this.isMobile = isMobileUI();
    this.isAnimating = false;
    this.gestureLocked = false;

    this.init();
  }

  init() {
    if (this.isMobile) {
      this.initTouchPaging();
    } else {
      this.initWheelPaging();
    }
  }

  findNearestIndex() {
    const scrollTop = this.scroller.scrollTop;
    let bestIndex = 0;
    let bestDistance = Infinity;

    for (let i = 0; i < this.cases.length; i++) {
      const distance = Math.abs(this.cases[i].offsetTop - scrollTop);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }

    return bestIndex;
  }

  animateTo(targetTop, durationMs) {
    const startTop = this.scroller.scrollTop;
    const delta = targetTop - startTop;
    
    if (delta === 0) return;

    const startTime = performance.now();
    const easeOut = (x) => 1 - Math.pow(1 - x, 3);
    this.isAnimating = true;

    const frame = (now) => {
      const progress = Math.min(1, (now - startTime) / durationMs);
      this.scroller.scrollTop = startTop + delta * easeOut(progress);
      
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        this.isAnimating = false;
      }
    };

    requestAnimationFrame(frame);
  }

  go(direction) {
    const currentIdx = this.findNearestIndex();
    const nextIdx = clamp(currentIdx + direction, 0, this.cases.length - 1);
    const duration = this.isMobile ? CONFIG.MOBILE_ANIM_MS : CONFIG.DESKTOP_ANIM_MS;
    
    this.animateTo(this.cases[nextIdx].offsetTop, duration);
  }

  initWheelPaging() {
    let wheelIdleTimer = null;
    let wheelAccum = 0;

    this.scroller.addEventListener(
      "wheel",
      (e) => {
        if (e.ctrlKey) return;
        e.preventDefault();

        if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
        
        wheelIdleTimer = setTimeout(() => {
          this.gestureLocked = false;
          wheelAccum = 0;
        }, CONFIG.WHEEL_IDLE_MS);

        if (this.gestureLocked || this.isAnimating) return;

        const deltaY = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
        wheelAccum += deltaY;

        if (wheelAccum > CONFIG.WHEEL_THRESHOLD) {
          this.gestureLocked = true;
          wheelAccum = 0;
          this.go(+1);
        } else if (wheelAccum < -CONFIG.WHEEL_THRESHOLD) {
          this.gestureLocked = true;
          wheelAccum = 0;
          this.go(-1);
        }
      },
      { passive: false }
    );
  }

  initTouchPaging() {
    let startY = 0;
    let accum = 0;
    let intent = 0;

    const getCurrentCase = () => this.cases[this.findNearestIndex()];
    
    const isNearTop = (el) => {
      return this.scroller.scrollTop <= el.offsetTop + CONFIG.SNAP_NEAR_TOP_PX;
    };
    
    const isNearBottom = (el) => {
      const bottom = el.offsetTop + el.offsetHeight;
      const viewportBottom = this.scroller.scrollTop + this.scroller.clientHeight;
      return viewportBottom >= bottom - CONFIG.SNAP_NEAR_BOTTOM_PX;
    };

    const forceStopScroll = (el) => {
      const y = el.scrollTop;
      el.scrollTop = y + 1;
      el.scrollTop = y;
    };

    this.scroller.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches?.length !== 1) return;
        startY = e.touches[0].clientY;
        accum = 0;
        intent = 0;
      },
      { passive: true }
    );

    this.scroller.addEventListener(
      "touchmove",
      (e) => {
        if (this.gestureLocked || this.isAnimating) return;
        if (e.touches?.length !== 1) return;

        const currentCase = getCurrentCase();
        const currentY = e.touches[0].clientY;
        const deltaY = startY - currentY;

        const atBottom = isNearBottom(currentCase);
        const atTop = isNearTop(currentCase);

        if (!atBottom && !atTop) return;

        if (atBottom && deltaY > CONFIG.TOUCH_ARM_PX) {
          e.preventDefault();
          accum += deltaY;
          intent = +1;
        } else if (atTop && deltaY < -CONFIG.TOUCH_ARM_PX) {
          e.preventDefault();
          accum += deltaY;
          intent = -1;
        }
      },
      { passive: false }
    );

    this.scroller.addEventListener(
      "touchend",
      () => {
        if (this.gestureLocked || this.isAnimating) return;
        if (intent === 0) return;

        if (intent === +1 && accum > CONFIG.TOUCH_PAGE_PX) {
          this.gestureLocked = true;
          forceStopScroll(this.scroller);
          this.go(+1);
        } else if (intent === -1 && accum < -CONFIG.TOUCH_PAGE_PX) {
          this.gestureLocked = true;
          forceStopScroll(this.scroller);
          this.go(-1);
        }

        intent = 0;
        accum = 0;

        setTimeout(() => {
          this.gestureLocked = false;
        }, CONFIG.GESTURE_LOCK_MS);
      },
      { passive: true }
    );
  }
}

/* =============================================================================
   INITIALIZATION
============================================================================= */
function main() {
  // Initialize UI components
  new OverlayManager();
  new CursorNav();

  // Set initial measurements
  setV2HeaderHeight();
  setV2ScrollbarWidth();

  // Handle resize events
  const handleResize = () => {
    requestAnimationFrame(() => {
      setV2HeaderHeight();
      setV2ScrollbarWidth();
    });
  };

  window.addEventListener("resize", handleResize);
  window.addEventListener("orientationchange", handleResize);

  // Initialize snap paging
  const scroller = document.querySelector(".v2-snap");
  if (scroller) {
    new SnapPaging(scroller);
  }

  // Initialize all cases
  const caseElements = document.querySelectorAll("[data-case]");
  caseElements.forEach(caseEl => {
    try {
      new CaseCarousel(caseEl);
    } catch (error) {
      console.error("Failed to initialize case:", error);
    }
  });

  // Recalculate after fonts load
  if (document.fonts?.ready) {
    document.fonts.ready.then(setV2HeaderHeight);
  }
}

// Start the application
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}