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
- TypeScript 5.x, Node 20+ + React 18, Vite 5, Tailwind CSS 3, Radix UI, Dexie.js, Supabase JS clien (001-sliminject-dashboard)
- Supabase (PostgreSQL with Row Level Security) + IndexedDB (Dexie.js, offline queue) (001-sliminject-dashboard)
- TypeScript 5.9.3, React 19.x (package.json lists react ^19), Vite 5.x + React Router 7, Tailwind CSS 4, Radix UI primitives, Dexie.js 4, Supabase JS v2 (002-sliminject-ux-improvements)
- Supabase (PostgreSQL with RLS) + IndexedDB via Dexie.js (offline queue) + localStorage (notification prefs) (002-sliminject-ux-improvements)

## Recent Changes
- 001-sliminject-dashboard: Added TypeScript 5.x, Node 20+ + React 18, Vite 5, Tailwind CSS 3, Radix UI, Dexie.js, Supabase JS clien
