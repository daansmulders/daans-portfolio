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

### One multi-page site

The site is a set of ordinary Jekyll pages sharing one visual system — no single-page carousel, no client-side content fetching. Every page uses plain server-rendered HTML/Liquid, styled by `assets/v2.css`.

- **Homepage (`/`)** — `index.md` uses `layout: v2-home`. Hero intro text + an editorial case index (`.case-index`) — alternating image-left/right entries linking to each project's own page. Projects with `hidden: true` in their front matter are excluded from this list without being unpublished.
- **Project pages (`/projects/:title/`)** — each `_projects/*.md` file, rendered via `layout: v2-project`. Long-form: hero image, title/meta, Goal/Outcome/Role/Team grid (`.project-intro-grid`), then the project's own Markdown body.
- **About (`/about/`)** — `about.md`, rendered via `layout: v2-default`.

### Project data flow

Projects live in `_projects/*.md` as Jekyll collection items. Front matter carries metadata only: `title`, `year`, `company`, `role`, `summary`, `hero_image`, and an optional `hidden` flag. Everything below the front matter is **one continuous Markdown body** — prose, headings, `<figure>` images, and (where relevant) a `.video-grid` of autoplaying/pausable clips — rendered server-side by Jekyll/kramdown via `{{ content }}` in `_layouts/v2-project.html`. There is no per-step content, no JSON serialization, and no runtime fetching.

Media lives under `assets/images/<project>/`.

### JavaScript

There is no site-wide JS framework or SPA logic — only two small, independent scripts loaded where needed:
- **`assets/js/preferences.js`** — wires up the `#theme-toggle` button, toggles `body.theme-dark`, persists the choice in `localStorage`. Loaded on every page via `v2-default.html`.
- **`assets/js/video-control.js`** — autoplay + pause/play toggle for any `.project-video` element on a page. Loaded only by `_layouts/v2-project.html` (harmless no-op on projects with no video).

### Styling

- `assets/v2.css` — the only stylesheet. CSS custom properties (`--bg`, `--fg`, `--muted`, `--border-subtle`, `--accent`, `--link`) are redefined under `body.theme-dark` for dark mode.
- Two typefaces, loaded via Google Fonts `<link>` tags in `_layouts/v2-default.html` (no self-hosted font files, no build step): **Bricolage Grotesque** (`--font-display`) for headlines/titles, **Public Sans** (`--font-body`) for everything else. This intentionally supersedes the earlier "no new web fonts" rule — see git history around 2026-08-25 for the rationale (TimesTen read as archaic for long-form reading). Bricolage Grotesque has no true italic — section headers that want emphasis use the `--accent` color instead of `font-style: italic` (see `.project-content h2` / `.about-content h2` in `assets/v2.css`).

### Layouts

- `_layouts/v2-default.html` — shared chrome (head, fixed header with Home/About/theme-toggle nav, footer scripts). Every other layout extends this.
- `_layouts/v2-home.html` — homepage: hero + case-grid.
- `_layouts/v2-project.html` — individual case study pages.

### Prototypes

`prototypes/hypotheekversneller/` is a standalone vanilla JS/HTML prototype (mortgage calculator), included as a static file via `_config.yml`'s `include` list.

The **Sliminject** prototype (GLP-1 treatment tracking app) has been moved to its own repository: [github.com/daansmulders/sliminject](https://github.com/daansmulders/sliminject). The design specs (`specs/001-012`) have been archived to `archive/sliminject/specs/`.

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

### Portfolio (`assets/`, `_layouts/`, `_projects/`)

**Stack:** Jekyll static site, plain CSS, vanilla JS — no build tools, no npm

**Design tokens** — CSS custom properties in `assets/v2.css`:

```css
--bg, --fg, --muted, --border-subtle, --accent, --link   /* theme colours; --link is an alias of --accent */
--font-display, --font-body                              /* Bricolage Grotesque / Public Sans */
--v2-pad-x: 48px                                          /* horizontal padding */
--v2-space-sm/md/lg/xl                                    /* spacing scale */
--v2-content-max: 760px                                   /* prose/content max width */
--v2-index-max: 1080px                                    /* homepage case-index max width */
```

**IMPORTANT: Never hardcode colors.** Use the CSS variables above.

**Dark mode:** toggled via `body.theme-dark` class (set in `assets/js/preferences.js`); all color variables must have a dark-mode override in the existing `body.theme-dark {}` block.

**Responsive:** mobile breakpoint is `@media (max-width: 700px)`. Horizontal padding drops to `20px`, layout shifts from multi-column grid to stacked.

**Typography:** `Bricolage Grotesque` (display/headlines) + `Public Sans` (body/UI), loaded via Google Fonts in `_layouts/v2-default.html`. Do not add further web fonts beyond this pairing without deliberate art-direction review.

**Chrome:** buttons, nav links, and the back-link avoid borders/boxes — hover states use color shift to `--accent` and a thin animated underline (see `.v2-link` in `assets/v2.css`), not bordered pills.

**Asset paths:**
- Portfolio images → `assets/images/{project}/`
