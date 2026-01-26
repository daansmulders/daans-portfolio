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
   OVERLAY PANELS & HEADER EXPANSION
============================================================================= */
class OverlayManager {
  constructor() {
    this.overlays = document.querySelectorAll("[data-overlay]");
    this.header = document.querySelector(".v2-header");
    this.headerExpanded = document.querySelector(".v2-header__expanded");
    this.typewriterEl = document.querySelector(".v2-typewriter");
    this.aboutButtons = document.querySelectorAll('[data-open="about"]');
    this.overviewButtons = document.querySelectorAll('[data-open="overview"]');
    this.isAboutExpanded = false;
    this.init();
  }

  init() {
    document.addEventListener("click", this.handleClick.bind(this));
    document.addEventListener("keydown", this.handleKeydown.bind(this));
  }

  handleClick(e) {
    const openBtn = e.target.closest("[data-open]");
    if (openBtn) {
      const target = openBtn.getAttribute("data-open");

      // Special handling for "about"
      if (target === "about") {
        this.toggleAbout();
        return;
      }

      this.open(target);
      return;
    }

    if (e.target.closest("[data-close]")) {
      this.closeAll();
      return;
    }

    // Handle thumbnail clicks
    const thumbnail = e.target.closest(".v2-overview__thumb");
    if (thumbnail) {
      const stepIndex = parseInt(thumbnail.getAttribute("data-step-index"), 10);
      const caseContainer = thumbnail.closest(".v2-overview__case");
      const caseIndex = parseInt(caseContainer?.getAttribute("data-case-index"), 10);

      if (!isNaN(caseIndex) && !isNaN(stepIndex)) {
        this.closeAll();
        navigateToCaseStep(caseIndex, stepIndex);
      }
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
      if (this.isAboutExpanded) {
        this.toggleAbout();
      }
    }
  }

  closeAll() {
    this.overlays.forEach(overlay => overlay.hidden = true);

    // Reset overview button text
    this.overviewButtons.forEach(btn => {
      btn.textContent = "overview";
      btn.setAttribute("aria-pressed", "false");
    });
  }

  open(name) {
    this.closeAll();
    const el = document.querySelector(`[data-overlay="${name}"]`);
    if (el) {
      el.hidden = false;

      // Handle overview-specific actions
      if (name === 'overview') {
        setTimeout(initOverviewVideos, 100);

        // Update button text
        this.overviewButtons.forEach(btn => {
          btn.textContent = "close";
          btn.setAttribute("aria-pressed", "true");
        });
      }
    }
  }

  toggleAbout() {
    this.isAboutExpanded = !this.isAboutExpanded;

    if (this.isAboutExpanded) {
      this.expandAbout();
    } else {
      this.collapseAbout();
    }
  }

  expandAbout() {
    if (!this.header || !this.headerExpanded || !this.typewriterEl) return;

    this.header.classList.add("is-expanded");
    this.headerExpanded.hidden = false;

    // Update button text
    this.aboutButtons.forEach(btn => {
      btn.textContent = "close";
      btn.setAttribute("aria-pressed", "true");
    });

    // Update header height
    setTimeout(() => setV2HeaderHeight(), 50);

    const text = "He turns complex journeys into human-friendly products and enjoys bringing positive energy to the teams he works with. Previously at funda, Ace & Tate, Werkspot, and Powerly — now at Nationale-Nederlanden.";

    this.typewriterEl.textContent = "";
    let index = 0;

    const type = () => {
      if (index < text.length) {
        this.typewriterEl.textContent += text.charAt(index);
        index++;
        setTimeout(type, 20);
      } else {
        this.typewriterEl.classList.add("typing-done");
      }
    };

    setTimeout(type, 200);
  }

  collapseAbout() {
    if (!this.header || !this.headerExpanded) return;

    this.header.classList.remove("is-expanded");
    this.typewriterEl.classList.remove("typing-done");

    // Update button text
    this.aboutButtons.forEach(btn => {
      btn.textContent = "about";
      btn.setAttribute("aria-pressed", "false");
    });

    setTimeout(() => {
      this.headerExpanded.hidden = true;
      this.typewriterEl.textContent = "";
      setV2HeaderHeight();
    }, 400);
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

// Global video preload cache to prevent duplicate requests
const videoPreloadCache = new Map();

function preloadVideo(url) {
  if (!url || videoPreloadCache.has(url)) {
    return videoPreloadCache.get(url);
  }

  const video = document.createElement('video');
  video.preload = 'auto';
  video.src = url;
  
  const promise = new Promise((resolve, reject) => {
    video.addEventListener('loadeddata', () => resolve(url), { once: true });
    video.addEventListener('error', () => reject(new Error(`Failed to load ${url}`)), { once: true });
  });

  videoPreloadCache.set(url, promise);
  return promise;
}

class VideoController {
  constructor(videoEl, caseEl) {
    this.videoEl = videoEl;
    this.caseEl = caseEl;
    this.currentUrl = "";
    this.isVisible = true;
    this.observer = null;
    this.isActive = false; // Track if this video should be playing
    this.loadAttempts = 0;
    this.maxLoadAttempts = 3;

    if (!videoEl) return;

    this.initVideo();
    this.setupVisibilityObserver();
    this.setupPageVisibility();
    this.setupVideoEvents();
  }

  initVideo() {
    this.videoEl.hidden = true;
    this.videoEl.muted = true;
    this.videoEl.loop = true;
    this.videoEl.playsInline = true;
    this.videoEl.autoplay = true;
    this.videoEl.preload = "auto"; // Changed from "metadata" for more reliable loading
  }

  setupVideoEvents() {
    // Detect when video is ready to play
    this.videoEl.addEventListener("loadeddata", () => {
      console.log("Video loaded:", this.currentUrl);
      this.loadAttempts = 0;
      if (this.isActive && this.isVisible) {
        this.play();
      }
    });

    // Handle loading errors
    this.videoEl.addEventListener("error", (e) => {
      console.error("Video error:", this.currentUrl, e);
      this.loadAttempts++;
      
      if (this.loadAttempts < this.maxLoadAttempts) {
        console.log(`Retrying video load (attempt ${this.loadAttempts + 1})`);
        setTimeout(() => {
          if (this.currentUrl) {
            this.videoEl.load();
          }
        }, 500);
      }
    });

    // Detect when video can start playing
    this.videoEl.addEventListener("canplay", () => {
      if (this.isActive && this.isVisible && this.videoEl.paused) {
        this.play();
      }
    });
  }

  setupVisibilityObserver() {
    if (!("IntersectionObserver" in window)) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        this.isVisible = entry?.isIntersecting && entry.intersectionRatio > CONFIG.INTERSECTION_THRESHOLD;
        
        if (!this.isVisible) {
          this.pause();
        } else if (this.isActive) {
          // Give the browser a moment to render before playing
          setTimeout(() => this.play(), 100);
        }
      },
      { threshold: [0, CONFIG.INTERSECTION_THRESHOLD, 0.5] }
    );

    this.observer.observe(this.caseEl);
  }

  setupPageVisibility() {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        this.pause();
      } else if (this.isActive) {
        this.play();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  setSource(url) {
    const normalizedUrl = normalizeUrl(url);
    
    if (!normalizedUrl) {
      this.hide();
      this.isActive = false;
      return;
    }

    this.isActive = true;
    this.videoEl.hidden = false;

    // Only update src if it changed to prevent reload flicker
    if (normalizedUrl !== this.currentUrl) {
      this.currentUrl = normalizedUrl;
      this.loadAttempts = 0;
      
      // Preload the video to prevent duplicate network requests
      preloadVideo(normalizedUrl)
        .then(() => {
          // Only set src if this is still the active video
          if (this.currentUrl === normalizedUrl) {
            this.videoEl.src = normalizedUrl;
            this.videoEl.load();
            
            // Reset to beginning for new videos
            try {
              this.videoEl.currentTime = 0;
            } catch (e) {
              // Ignore - video might not be loaded yet
            }
          }
        })
        .catch((error) => {
          console.error("Video preload failed:", error);
          // Fallback: try loading directly anyway
          this.videoEl.src = normalizedUrl;
          this.videoEl.load();
        });
    }

    // Try to play immediately if already loaded
    if (this.videoEl.readyState >= 3) { // HAVE_FUTURE_DATA
      this.play();
    }
  }

  play() {
    if (!this.isVisible || !this.currentUrl || !this.isActive) return;
    
    // Check if video is ready
    if (this.videoEl.readyState < 2) { // Less than HAVE_CURRENT_DATA
      console.log("Video not ready yet, waiting...");
      return;
    }

    const playPromise = this.videoEl.play();
    if (playPromise) {
      playPromise
        .then(() => {
          console.log("Video playing:", this.currentUrl);
        })
        .catch(error => {
          console.warn("Video play failed:", error.name, error.message);
          
          // If autoplay was blocked, try again after a short delay
          if (error.name === "NotAllowedError") {
            setTimeout(() => this.play(), 200);
          }
        });
    }
  }

  pause() {
    try {
      if (!this.videoEl.paused) {
        this.videoEl.pause();
      }
    } catch (error) {
      console.warn("Video pause failed:", error);
    }
  }

  hide() {
    this.isActive = false;
    this.videoEl.hidden = true;
    this.pause();
    // Keep the src so it doesn't need to reload later
  }

  show() {
    this.isActive = true;
    this.videoEl.hidden = false;
    this.play();
  }

  destroy() {
    this.isActive = false;
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.pause();
    // Clear the source to free memory
    this.videoEl.src = "";
    this.currentUrl = "";
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
   OVERVIEW VIDEO THUMBNAILS
============================================================================= */
function initOverviewVideos() {
  const videoThumbs = document.querySelectorAll('.v2-overview__thumb--video video');

  videoThumbs.forEach(video => {
    video.addEventListener('mouseenter', () => {
      video.play().catch(() => {});
    });

    video.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });
}

/* =============================================================================
   OVERVIEW THUMBNAIL NAVIGATION
============================================================================= */
function navigateToCaseStep(caseIndex, stepIndex) {
  // Get the carousel for this case
  const carousel = window.caseCarousels?.[caseIndex];
  if (!carousel) {
    console.error('Case carousel not found:', caseIndex);
    return;
  }

  // Get the case element
  const caseEl = carousel.caseEl;
  if (!caseEl) {
    console.error('Case element not found');
    return;
  }

  // Scroll to the case
  const scroller = document.querySelector('.v2-snap');
  if (scroller) {
    scroller.scrollTo({
      top: caseEl.offsetTop,
      behavior: 'smooth'
    });
  }

  // Set the step index and render
  carousel.currentIndex = stepIndex;
  carousel.render();
}

/* =============================================================================
   INITIALIZATION
============================================================================= */
function main() {
  // Initialize UI components
  new OverlayManager();
  new CursorNav();
  initOverviewVideos();

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

  // Initialize all cases and store them globally
  window.caseCarousels = [];
  const caseElements = document.querySelectorAll("[data-case]");
  caseElements.forEach(caseEl => {
    try {
      const carousel = new CaseCarousel(caseEl);
      window.caseCarousels.push(carousel);
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