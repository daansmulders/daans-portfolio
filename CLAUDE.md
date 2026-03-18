# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal portfolio site for Daan Smulders (UX / Product Designer), built with Jekyll and deployed to [daansmulders.nl](https://www.daansmulders.nl). No build tools, no npm — just Jekyll and static files.

## Commands

```bash
# Serve locally with live reload
jekyll serve

# Build to _site/
jekyll build
```

Ruby version: 3.1.4 (see `.ruby-version`).

The `_site/` directory is the build output — don't edit files there directly.

## Architecture

### Two distinct UIs

There are two different portfolio layouts that coexist:

1. **v2 (current main, `/`)** — `index.md` uses `layout: v2-cases`. This is the primary interactive presentation. It renders all projects as full-screen snap-scrolling "cases" with a step-by-step carousel per case.

2. **v1 (`/v1/`)** — Legacy layout using `layout: default`. Kept around but not the primary view.

### Project data flow (v2)

Projects live in `_projects/*.md` as Jekyll collection items. Each project's front matter contains a `steps` array, where each step has:
- `heading` — short title
- `body` — path to a `.md` file in `case-content/<project>/steps/`
- `image` or `video` — media asset path

Jekyll serializes the `steps` array as JSON into a `<script type="application/json" data-steps>` tag inside each `.v2-case` section. The `v2.js` JavaScript reads this JSON at runtime.

Step body `.md` files are fetched at runtime via `fetch()` in `MarkdownLoader` (in `assets/js/v2.js`) — they're not rendered server-side. The loader has a simple custom Markdown-to-HTML renderer (paragraphs, bullet lists, bold, italic) and caches responses.

### JavaScript (`assets/js/v2.js`)

Key classes:
- **`CaseCarousel`** — manages step navigation (prev/next) within a single case. Click left half = previous step, right half = next step.
- **`SnapPaging`** — scroll snapping between cases. Uses `IntersectionObserver` + scroll-settle timeout. Mobile and desktop behave differently (mobile allows free scroll, desktop snaps more eagerly).
- **`VideoController`** — handles muted looping video per step, with visibility-based play/pause.
- **`OverlayManager`** — "Overview" panel (grid of all cases) and "About" header expansion.
- **`CursorNav`** — shows a floating "Previous/Next" label that follows the cursor.

Carousels are stored in `window.caseCarousels[]` for cross-component access (e.g., overview thumbnail navigation).

### Styling

- `assets/styles.css` — styles for the `default` layout (v1, project detail pages)
- `assets/v2.css` — styles for the v2 layout
- Dark mode is toggled via `body.theme-dark` class, persisted in `localStorage` via `assets/js/preferences.js`

### Layouts

- `_layouts/default.html` — wraps standard pages; loads `styles.css` + `preferences.js`
- `_layouts/projects.html` — extends `default`, used for individual project detail pages (`/projects/:title/`)
- `_layouts/v2-cases.html` — standalone layout for the v2 UI; does NOT extend `default`

### Prototypes

`prototypes/hypotheekversneller/` is a standalone vanilla JS/HTML prototype (mortgage calculator), included as a static file via `_config.yml`'s `include` list.

The **Sliminject** prototype (GLP-1 treatment tracking app) has been moved to its own repository: [github.com/daansmulders/sliminject](https://github.com/daansmulders/sliminject). The design specs (`specs/001-012`) remain in this repo as case study documentation.

### Analytics

GoatCounter is loaded on all pages via a script tag in the layouts.

## Figma MCP Integration Rules

These rules apply whenever implementing UI from Figma designs. Follow this workflow for every Figma-driven change.

### Required flow (do not skip)

1. Call `get_design_context` with the nodeId and fileKey from the Figma URL
2. Call `get_screenshot` for visual reference of the exact node being implemented
3. If the response is too large, call `get_metadata` first to get the node map, then re-fetch specific nodes
4. Only after you have both outputs: download any needed assets and start coding
5. Validate the final UI against the screenshot before marking complete

### Portfolio (`assets/`, `_layouts/`, `_projects/`, `case-content/`)

**Stack:** Jekyll static site, plain CSS, vanilla JS — no build tools, no npm

**Design tokens** — CSS custom properties in `assets/v2.css`:

```css
--bg, --fg, --muted, --border-subtle, --link   /* theme colours */
--v2-pad-x: 48px                               /* horizontal padding */
--v2-space-sm/md/lg/xl                         /* spacing scale */
--v2-snap-gap: 32px                            /* snap scroll gap */
--v2-grid-gap: 64px                            /* content grid */
```

**IMPORTANT: Never hardcode colors.** Use the CSS variables above.

**Dark mode:** toggled via `body.theme-dark` class (set in `assets/js/preferences.js`); all color variables must have a dark-mode override in the existing `:root body.theme-dark {}` block.

**Responsive:** mobile breakpoint is `@media (max-width: 700px)`. Horizontal padding drops to `20px`, layout shifts from multi-column grid to stacked.

**Typography:** `TimesTen LT Std` serif loaded from `assets/fonts/`. Do not add new web fonts.

**Asset paths:**
- Portfolio images → `assets/images/`
- Case step media → `case-content/{project}/images/`
