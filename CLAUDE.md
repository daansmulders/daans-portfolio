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

### Analytics

GoatCounter is loaded on all pages via a script tag in the layouts.

## Active Technologies
- TypeScript 5.9 / React 19 + React Router 7, Tailwind CSS 4, Radix UI, Supabase JS v2, Sonner (toasts) (003-dose-adherence-tracking)
- Supabase PostgreSQL + RLS (primary); no Dexie queue for adherence (online-only write, see research.md Decision 3) (003-dose-adherence-tracking)
- TypeScript 5.9 / React 19 + Vite 5, React Router 7, Tailwind CSS 4, Radix UI, Supabase JS v2, Sonner (toasts) (004-wellbeing-tracking)
- Supabase PostgreSQL + RLS; food noise as new column on `progress_entries`; weekly check-ins as new `weekly_wellbeing_checkins` table (004-wellbeing-tracking)
- TypeScript 5.9 + React 19, React Router 7, Tailwind CSS 4, Radix UI, Supabase JS v2, Dexie.js 4, Sonner (006-injection-day-experience)
- Supabase PostgreSQL (primary); Dexie IndexedDB offline queue for progress entries (006-injection-day-experience)
- Supabase PostgreSQL (primary); localStorage for announcement dismissals (007-dose-change-visibility)
- TypeScript 5.9 + React 19, React Router 7, Tailwind CSS 4, Sonner (008-side-effect-support)
- No server storage needed; localStorage for tip frequency tracking (008-side-effect-support)
- TypeScript 5.9 / React 19 + React Router 7, Tailwind CSS 4, Sonner (toasts), Supabase JS v2, Dexie.js 4 (009-side-effect-tips)
- Supabase PostgreSQL (primary), Dexie IndexedDB (offline queue), localStorage (tip throttle) (009-side-effect-tips)

### Sliminject prototype (`prototypes/sliminject/`)
- React 19, TypeScript 5.9, Vite 5, React Router 7
- Tailwind CSS 4 with custom design tokens
- Radix UI primitives (Tabs, etc.), Sonner (toasts)
- Supabase JS v2 — PostgreSQL + Row Level Security + Realtime
- Dexie.js 4 — IndexedDB offline write queue
- localStorage — notification preferences, onboarding state

## Figma MCP Integration Rules

These rules apply whenever implementing UI from Figma designs. Follow this workflow for every Figma-driven change.

### Required flow (do not skip)

1. Call `get_design_context` with the nodeId and fileKey from the Figma URL
2. Call `get_screenshot` for visual reference of the exact node being implemented
3. If the response is too large, call `get_metadata` first to get the node map, then re-fetch specific nodes
4. Only after you have both outputs: download any needed assets and start coding
5. Validate the final UI against the screenshot before marking complete

### Which codebase does the Figma design target?

There are two distinct sub-projects here. Apply different rules depending on context:

| Target | Indicator |
|--------|-----------|
| **Sliminject prototype** | Design is for a React app, uses DM Sans / Instrument Serif typography, emerald/warm colour palette |
| **Portfolio (v2/v1)** | Design is for the Jekyll site, uses TimesTen serif, muted off-white/dark palette |

---

### Sliminject (`prototypes/sliminject/`)

**Stack:** React 19 + TypeScript, Vite, Tailwind CSS 4, Radix UI, Supabase, Dexie.js, Sonner

**Design tokens** — defined in `src/index.css` using a Tailwind 4 `@theme` block:

```css
/* Color palette */
--color-brand-{950..50}   /* deep emerald */
--color-warm-{950..50}    /* warm neutrals — text & bg */
--color-accent-{700..50}  /* amber */
--color-danger-{700..50}  /* red */

/* Typography */
--font-sans: 'DM Sans', system-ui, sans-serif
--font-serif: 'Instrument Serif', Georgia, serif
```

**IMPORTANT: Never hardcode hex colors.** Always use the token names above (e.g. `text-brand-700`, `bg-warm-50`).

**Component classes** — pre-built utility classes in `src/index.css`:
- Layout: `.page`, `.page-doctor`
- Buttons: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-sm`
- Cards: `.card`, `.card-interactive`
- Forms: `.input`
- Feedback: `.badge`, `.chip`, `.alert-brand`, `.alert-amber`, `.alert-danger`, `.alert-neutral`
- Navigation: `.bottom-nav`, `.bottom-nav-tab` (patient), `.top-nav` (doctor)
- Typography: `.section-label`, `.data-num`, `.data-num-md`, `.data-num-lg`, `.data-num-xl`

**Component conventions:**
- Shared UI components → `src/components/` (PascalCase filenames)
- Feature components → `src/features/{patient|doctor}/{feature}/`
- Check for existing components before creating new ones
- Icons are inline SVG functions using `strokeWidth="1.6"` and `currentColor`; do **not** install new icon packages

**Translating Figma output to Sliminject:**
- The Figma MCP returns React + Tailwind reference code — adapt it to this project's conventions
- Replace raw hex values with token classes
- Reuse existing `.btn`, `.card`, `.input`, etc. classes instead of duplicating styles
- Respect existing routing (React Router 7) and data patterns (Supabase + Dexie offline queue)
- If Figma MCP returns a `localhost` source for an image or SVG, use it directly — do not create placeholders

---

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
- Do not put portfolio assets inside the Sliminject prototype directory

## Recent Changes
- 009-side-effect-tips: Added TypeScript 5.9 / React 19 + React Router 7, Tailwind CSS 4, Sonner (toasts), Supabase JS v2, Dexie.js 4
- 008-side-effect-support: Added TypeScript 5.9 + React 19, React Router 7, Tailwind CSS 4, Sonner
- 007-dose-change-visibility: Added TypeScript 5.9 + React 19, React Router 7, Tailwind CSS 4, Radix UI, Supabase JS v2, Dexie.js 4, Sonner
