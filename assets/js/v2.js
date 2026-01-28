// assets/js/v2.js - Refactored
// v2 paging + case carousel + cursor navigation

/* =============================================================================
   CONSTANTS & CONFIGURATION
============================================================================= */
const CONFIG = {
  MOBILE_BREAKPOINT: 900,
  WHEEL_THRESHOLD: 300,
  WHEEL_IDLE_MS: 40,
  TOUCH_ARM_PX: 20,
  TOUCH_PAGE_PX: 160,
  DESKTOP_ANIM_MS: 600,       // Longer for smoother flow into snap
  MOBILE_ANIM_MS: 600,        // Longer for smoother flow into snap
  GESTURE_LOCK_MS: 240,
  SNAP_NEAR_TOP_PX: 40,
  SNAP_NEAR_BOTTOM_PX: 40,
  INTERSECTION_THRESHOLD: 0.15,
  IMAGE_FADE_MS: 400,         // Duration of image fade transition
  SNAP_SETTLE_MS: 150,        // Delay before snap starts - allows free scrolling
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
    this.headerMenu = document.querySelector(".v2-header__menu");
    this.typewriterEl = document.querySelector(".v2-typewriter");
    this.aboutButtons = document.querySelectorAll('[data-open="about"]');
    this.overviewButtons = document.querySelectorAll('[data-open="overview"]');
    this.menuToggleBtn = document.querySelector('[data-toggle-menu]');
    this.isAboutExpanded = false;
    this.isMenuOpen = false;
    this.init();
  }

  init() {
    document.addEventListener("click", this.handleClick.bind(this));
    document.addEventListener("keydown", this.handleKeydown.bind(this));
  }

  handleClick(e) {
    // Handle menu toggle button
    const menuToggle = e.target.closest("[data-toggle-menu]");
    if (menuToggle) {
      this.toggleMenu();
      return;
    }

    const openBtn = e.target.closest("[data-open]");
    if (openBtn) {
      const target = openBtn.getAttribute("data-open");

      // Special handling for "about"
      if (target === "about") {
        // Close overlays but keep menu open
        this.overlays.forEach(overlay => overlay.hidden = true);
        this.overviewButtons.forEach(btn => {
          btn.textContent = "overview";
          btn.setAttribute("aria-pressed", "false");
        });
        this.toggleAbout();
        return;
      }

      this.closeMenu(); // Close menu when opening overlay
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

    // Close menu if open
    this.closeMenu();
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

    const text = "Previously at funda, Ace & Tate, Werkspot, and Powerly — now at Nationale-Nederlanden. Reach me at daan.smulders@gmail.com";

    // Set text and trigger slide-down animation
    this.typewriterEl.textContent = text;

    // Use requestAnimationFrame to ensure the transition triggers
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.typewriterEl.classList.add("slide-in");
      });
    });
  }

  collapseAbout() {
    if (!this.header || !this.headerExpanded) return;

    this.header.classList.remove("is-expanded");
    this.typewriterEl.classList.remove("slide-in");

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

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;

    if (this.isMenuOpen) {
      this.openMenu();
    } else {
      this.closeMenu();
    }
  }

  openMenu() {
    if (!this.header || !this.headerMenu || !this.menuToggleBtn) return;

    this.header.classList.add("is-menu-open");
    this.headerMenu.hidden = false;

    // Update button text
    this.menuToggleBtn.textContent = "close";

    // Update header height
    setTimeout(() => setV2HeaderHeight(), 50);
  }

  closeMenu() {
    if (!this.header || !this.headerMenu || !this.menuToggleBtn) return;

    this.isMenuOpen = false;
    this.header.classList.remove("is-menu-open");

    // Update button text
    this.menuToggleBtn.textContent = "menu";

    setTimeout(() => {
      this.headerMenu.hidden = true;
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
    this.videoEl.autoplay = false; // Disable autoplay, we'll manually trigger
    this.videoEl.preload = "auto";
  }

  setupVideoEvents() {
    // Detect when video is ready to play
    this.videoEl.addEventListener("loadeddata", () => {
      this.loadAttempts = 0;
      // Try to play on load
      if (this.isActive) {
        setTimeout(() => this.play(), 50);
      }
    });

    // Handle loading errors
    this.videoEl.addEventListener("error", (e) => {
      console.error("Video error:", this.currentUrl, e);
      this.loadAttempts++;

      if (this.loadAttempts < this.maxLoadAttempts) {
        setTimeout(() => {
          if (this.currentUrl) {
            this.videoEl.load();
          }
        }, 500);
      }
    });

    // Detect when video can start playing
    this.videoEl.addEventListener("canplay", () => {
      if (this.isActive && this.videoEl.paused) {
        setTimeout(() => this.play(), 50);
      }
    });
  }

  setupVisibilityObserver() {
    if (!("IntersectionObserver" in window)) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        this.isVisible = entry?.isIntersecting && entry.intersectionRatio >= CONFIG.INTERSECTION_THRESHOLD;

        if (!this.isVisible) {
          this.pause();
        } else if (this.isActive) {
          // Give the browser a moment to render before playing
          setTimeout(() => this.play(), 100);
        }
      },
      { threshold: [0, CONFIG.INTERSECTION_THRESHOLD, 0.5, 1.0] }
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
    // IMPORTANT: Make video visible BEFORE setting source
    // Mobile browsers may not load videos that are hidden
    this.videoEl.hidden = false;

    // Only update src if it changed to prevent reload flicker
    if (normalizedUrl !== this.currentUrl) {
      this.currentUrl = normalizedUrl;
      this.loadAttempts = 0;

      // Set source and force load
      this.videoEl.src = normalizedUrl;
      this.videoEl.load();

      // Force another load after a tiny delay (helps on some mobile browsers)
      setTimeout(() => {
        this.videoEl.load();
      }, 50);

      // Try to play after a delay
      setTimeout(() => {
        this.play();
      }, 200);
    } else {
      // Video source hasn't changed, try to play if it's ready
      this.play();
    }
  }

  play() {
    if (!this.currentUrl || !this.isActive) return;

    // On mobile, IntersectionObserver can be unreliable on initial load
    // So we skip the visibility check if on mobile
    if (!this.isVisible && !isMobileUI()) return;

    // Check if video is ready
    if (this.videoEl.readyState < 2) { // Less than HAVE_CURRENT_DATA
      // Wait for it to be ready and try again
      const retryPlay = () => {
        if (this.isActive && this.isVisible) {
          this.play();
        }
      };
      this.videoEl.addEventListener("canplay", retryPlay, { once: true });
      return;
    }

    const playPromise = this.videoEl.play();
    if (playPromise) {
      playPromise.catch(error => {
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

    // Update heading
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
   SNAP PAGING - Smooth snap scrolling between cases
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

    // Initialize first case as active
    if (this.cases.length > 0) {
      const firstText = this.cases[0].querySelector('.v2-left');
      const firstMedia = this.cases[0].querySelector('.v2-right');
      const firstCounter = this.cases[0].querySelector('.v2-bottom__center');

      if (firstText) {
        firstText.classList.add('v2-left--active');
      }
      if (firstMedia) {
        firstMedia.classList.add('v2-media--visible');
      }
      if (firstCounter) {
        firstCounter.classList.add('v2-counter--active');
      }
    }

    // Observe when cases change to trigger animations
    this.observeCaseChanges();
  }

  observeCaseChanges() {
    if (!('IntersectionObserver' in window)) return;

    let lastActiveIndex = -1;

    const observer = new IntersectionObserver(
      (entries) => {
        let mostVisible = null;
        let maxRatio = 0;

        entries.forEach(entry => {
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisible = entry.target;
          }
        });

        if (mostVisible && maxRatio > 0.3) {
          const currentIndex = this.cases.indexOf(mostVisible);
          if (currentIndex !== -1 && currentIndex !== lastActiveIndex) {
            lastActiveIndex = currentIndex;
            this.switchToCase(currentIndex);
          }
        }
      },
      {
        root: this.scroller,
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
      }
    );

    this.cases.forEach(caseEl => observer.observe(caseEl));
  }

  switchToCase(index) {
    // Hide all text, media, and counter containers
    this.cases.forEach(caseEl => {
      const textContainer = caseEl.querySelector('.v2-left');
      const mediaContainer = caseEl.querySelector('.v2-right');
      const counterContainer = caseEl.querySelector('.v2-bottom__center');

      if (textContainer) {
        textContainer.classList.remove('v2-left--active');
      }
      if (mediaContainer) {
        mediaContainer.classList.remove('v2-media--visible');
      }
      if (counterContainer) {
        counterContainer.classList.remove('v2-counter--active');
      }
    });

    // Show and animate the active case's text, media, and counter
    const activeCase = this.cases[index];
    if (activeCase) {
      const mediaContainer = activeCase.querySelector('.v2-right');
      const counterContainer = activeCase.querySelector('.v2-bottom__center');
      const textContainer = activeCase.querySelector('.v2-left');

      // Show media and counter immediately
      if (mediaContainer) {
        void mediaContainer.offsetWidth;
        mediaContainer.classList.add('v2-media--visible');
      }

      if (counterContainer) {
        counterContainer.classList.add('v2-counter--active');
      }

      // Delay text appearance slightly to avoid overlap
      if (textContainer) {
        setTimeout(() => {
          textContainer.classList.add('v2-left--active');
          textContainer.classList.add('v2-text--slidein');
          setTimeout(() => {
            textContainer.classList.remove('v2-text--slidein');
          }, 800);
        }, 150);
      }
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
    // Smoother easing - ease-in-out for more natural flow
    const easeInOut = (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    this.isAnimating = true;

    const frame = (now) => {
      const progress = Math.min(1, (now - startTime) / durationMs);
      this.scroller.scrollTop = startTop + delta * easeInOut(progress);

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
    let scrollTimeout = null;

    this.scroller.addEventListener(
      "scroll",
      () => {
        if (this.isAnimating) return;

        // Clear previous timeout
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }

        // After scroll settles, snap to nearest case with minimal delay
        scrollTimeout = setTimeout(() => {
          const currentIdx = this.findNearestIndex();
          this.animateTo(this.cases[currentIdx].offsetTop, CONFIG.DESKTOP_ANIM_MS);
        }, CONFIG.SNAP_SETTLE_MS);
      },
      { passive: true }
    );
  }

  initTouchPaging() {
    let scrollTimeout = null;

    this.scroller.addEventListener(
      "scroll",
      () => {
        if (this.isAnimating) return;

        // Clear previous timeout
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }

        // After scroll settles, only snap if near the top of a case
        scrollTimeout = setTimeout(() => {
          const currentIdx = this.findNearestIndex();
          const nearestCase = this.cases[currentIdx];
          const scrollTop = this.scroller.scrollTop;
          const caseTop = nearestCase.offsetTop;
          const distanceFromTop = Math.abs(scrollTop - caseTop);

          // Only snap if within 150px of the case top (user is transitioning)
          // Otherwise let them read freely without snapping
          if (distanceFromTop < 150) {
            this.animateTo(caseTop, CONFIG.MOBILE_ANIM_MS);
          }
        }, CONFIG.SNAP_SETTLE_MS);
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

  // Initialize snap paging after cases are set up
  const scroller = document.querySelector(".v2-snap");
  if (scroller) {
    window.snapPaging = new SnapPaging(scroller);
  }

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