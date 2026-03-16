<!-- Sync Impact Report
Version change: 1.0.0 → 1.2.0 (added Principle VI: Tools are Sandboxed, Principle VII: Security First for Personal Data)
Added sections: Core Principles, Content Architecture, Deployment & Quality, Governance
Removed sections: none (initial setup)
Templates requiring updates:
  - .specify/templates/plan-template.md ⚠ pending manual review
  - .specify/templates/spec-template.md ⚠ pending manual review
  - .specify/templates/tasks-template.md ⚠ pending manual review
Deferred TODOs: none
-->

# Daan Smulders Portfolio Constitution

## Core Principles

### I. Simplicity First
This is a static Jekyll site with no build pipeline, no npm, no bundler. Every change MUST be achievable with plain HTML, CSS, Markdown, or vanilla JavaScript. Dependencies MUST NOT be introduced without explicit justification. If something can be done with a CSS rule instead of JavaScript, use CSS. If something can be done with Jekyll Liquid instead of JavaScript, use Liquid.

### II. Content-Driven Architecture
Projects live as data in `_projects/*.md` front matter — not hardcoded in templates or JavaScript. Any new project content MUST be expressible as front matter fields or Markdown step files in `case-content/`. Logic that reads or renders that data belongs in `v2.js` or Jekyll templates, not scattered inline.

### III. Design Integrity
This is a UX/Product Designer's portfolio. Visual quality, interaction polish, and typographic consistency are non-negotiable. Changes that affect the visual presentation MUST be tested across viewport sizes and both light/dark themes before being considered done.

### IV. No Regression on v1
The legacy `/v1/` layout MUST continue to render correctly. Changes to shared assets (`styles.css`, `preferences.js`) MUST NOT break v1 pages.

### V. Performance by Default
Assets MUST remain minimal. Images and videos MUST be appropriately sized/compressed before committing. JavaScript MUST NOT block rendering. No third-party scripts may be added without explicit approval.

### VI. Tools are Sandboxed
Each tool or web app under `prototypes/` is a self-contained project with its own tech stack. Tools MAY use npm, bundlers, frameworks, or any dependencies appropriate for the job. Changes inside a tool's directory MUST NOT affect the main Jekyll site, shared assets, or other tools. Each tool MUST be independently runnable and deployable without touching the rest of the repo. The main site only links to tools — it does not depend on them.

### VII. Security First for Personal Data
Any tool that handles personal, medical, or otherwise sensitive user data MUST treat security as a first-class requirement — not an afterthought. This means: data access MUST be scoped to the minimum necessary, transmission and storage MUST be encrypted, authentication MUST be required with no public fallback, and sensitive data MUST NOT leak into URLs, logs, or client-side state. These requirements apply regardless of whether the tool is a prototype or production system.
Each tool or web app under `prototypes/` is a self-contained project with its own tech stack. Tools MAY use npm, bundlers, frameworks, or any dependencies appropriate for the job. Changes inside a tool's directory MUST NOT affect the main Jekyll site, shared assets, or other tools. Each tool MUST be independently runnable and deployable without touching the rest of the repo. The main site only links to tools — it does not depend on them.

## Content Architecture

All project content follows this structure:
- Front matter in `_projects/<slug>.md` defines metadata and the `steps` array.
- Each step's `body` field points to a Markdown file in `case-content/<project>/steps/`.
- Media (images/videos) lives in `assets/` or project-specific subdirectories.
- Jekyll serializes steps to JSON at build time; `v2.js` fetches and renders step bodies at runtime.

New projects MUST follow this structure without introducing new rendering patterns unless the constitution is amended.

## Deployment & Quality

- The site is deployed to [daansmulders.nl](https://www.daansmulders.nl) via standard Jekyll build.
- `_site/` is build output — never edit files there directly.
- Before shipping visual changes, manually verify in both v2 (`/`) and v1 (`/v1/`) layouts.
- Dark mode (`body.theme-dark`) and light mode MUST both be checked for any UI change.
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

**Version**: 1.2.0 | **Ratified**: 2026-03-14 | **Last Amended**: 2026-03-14
