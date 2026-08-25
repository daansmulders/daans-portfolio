<!-- Sync Impact Report
Version change: 1.2.0 → 2.0.0 (MAJOR — Principle IV removed)
Amendment date: 2026-08-25
Rationale: The v2 interaction model is being restructured — dropping the step-carousel /
snap-scroll experience (found too "fussy," obscuring media and copy) in favor of long-form,
per-project pages. This makes the legacy v1 layout and the steps/case-content JSON pipeline
obsolete; both are being removed rather than preserved alongside v2.
Modified principles:
  - II. Content-Driven Architecture — reworded to describe one continuous markdown body per
    project instead of front matter + case-content step files.
Removed principles:
  - IV. No Regression on v1 (v1 is deleted outright, not preserved)
Principle renumbering: V→IV (Performance by Default), VI→V (Tools are Sandboxed),
  VII→VI (Security First for Personal Data)
Added sections: none
Removed sections: none (Content Architecture section rewritten, not removed)
Modified sections:
  - Content Architecture — rewritten for single-body-per-project model, no case-content/steps
  - Deployment & Quality — dropped the v1 verification requirement
Templates checked for propagation:
  - .specify/templates/plan-template.md — ✅ no project-specific references, no update needed
  - .specify/templates/spec-template.md — ✅ no project-specific references, no update needed
  - .specify/templates/tasks-template.md — ✅ no project-specific references, no update needed
Deferred TODOs: none
-->

# Daan Smulders Portfolio Constitution

## Core Principles

### I. Simplicity First
This is a static Jekyll site with no build pipeline, no npm, no bundler. Every change MUST be achievable with plain HTML, CSS, Markdown, or vanilla JavaScript. Dependencies MUST NOT be introduced without explicit justification. If something can be done with a CSS rule instead of JavaScript, use CSS. If something can be done with Jekyll Liquid instead of JavaScript, use Liquid.

### II. Content-Driven Architecture
Projects live as data in `_projects/*.md` — front matter carries metadata only (title, year, company, role, summary, hero_image, and an optional `hidden` flag), and the project's full content is a single continuous Markdown body rendered server-side by Jekyll via `{{ content }}`. New project content MUST be expressible as front matter fields plus that one Markdown body — no per-step files, no client-side content fetching. Logic that reads or renders project data belongs in Jekyll templates (or `v2.js` for genuine interactivity), not scattered inline.

### III. Design Integrity
This is a UX/Product Designer's portfolio. Visual quality, interaction polish, and typographic consistency are non-negotiable. Changes that affect the visual presentation MUST be tested across viewport sizes and both light/dark themes before being considered done.

### IV. Performance by Default
Assets MUST remain minimal. Images and videos MUST be appropriately sized/compressed before committing. JavaScript MUST NOT block rendering. No third-party scripts may be added without explicit approval.

### V. Tools are Sandboxed
Each tool or web app under `prototypes/` is a self-contained project with its own tech stack. Tools MAY use npm, bundlers, frameworks, or any dependencies appropriate for the job. Changes inside a tool's directory MUST NOT affect the main Jekyll site, shared assets, or other tools. Each tool MUST be independently runnable and deployable without touching the rest of the repo. The main site only links to tools — it does not depend on them.

### VI. Security First for Personal Data
Any tool that handles personal, medical, or otherwise sensitive user data MUST treat security as a first-class requirement — not an afterthought. This means: data access MUST be scoped to the minimum necessary, transmission and storage MUST be encrypted, authentication MUST be required with no public fallback, and sensitive data MUST NOT leak into URLs, logs, or client-side state. These requirements apply regardless of whether the tool is a prototype or production system.
Each tool or web app under `prototypes/` is a self-contained project with its own tech stack. Tools MAY use npm, bundlers, frameworks, or any dependencies appropriate for the job. Changes inside a tool's directory MUST NOT affect the main Jekyll site, shared assets, or other tools. Each tool MUST be independently runnable and deployable without touching the rest of the repo. The main site only links to tools — it does not depend on them.

## Content Architecture

All project content follows this structure:
- Front matter in `_projects/<slug>.md` defines metadata: `title`, `year`, `company`, `role`, `summary`, `hero_image`, and an optional `hidden` flag to exclude a project from homepage listing without unpublishing its page.
- The project's body — everything below the front matter in `_projects/<slug>.md` — is one continuous Markdown document (prose, headings, `<figure>` images, video grids) rendered server-side by Jekyll/kramdown via `{{ content }}` in the project layout.
- Media (images/videos) lives under `assets/images/<project>/`; inline video play/pause is handled by the standalone `assets/js/video-control.js`.
- There is no client-side content fetching and no `case-content/` directory — all content is present in the rendered HTML at build time.

New projects MUST follow this structure without introducing new rendering patterns unless the constitution is amended.

## Deployment & Quality

- The site is deployed to [daansmulders.nl](https://www.daansmulders.nl) via standard Jekyll build.
- `_site/` is build output — never edit files there directly.
- Before shipping visual changes, manually verify the homepage (`/`), each project page (`/projects/:title/`), and the About page (`/about/`) — in both light and dark theme, across viewport sizes.
- The `prototypes/hypotheekversneller/` directory is standalone and MUST NOT be affected by changes to the main Jekyll layouts.

## Governance

This constitution supersedes all informal conventions. Amendments require:
1. A clear rationale for the change.
2. An update to this file with an incremented version.
3. A review of whether dependent templates or docs require updates.

Versioning policy:
- MAJOR: Removal or redefinition of a core principle.
- MINOR: New principle or section added.
- PATCH: Clarifications, wording fixes, non-semantic refinements.

All implementation plans and specs MUST be checked against these principles before execution.

**Version**: 2.0.0 | **Ratified**: 2026-03-14 | **Last Amended**: 2026-08-25
