# Research: Sliminject Dashboard

**Feature**: 001-sliminject-dashboard
**Date**: 2026-03-14

---

## Decision 1: Frontend Framework

**Decision**: React + Vite + TypeScript

**Rationale**: React is the most practical choice for a portfolio prototype — wide ecosystem, strong component model, and TypeScript support is first-class. Vite provides fast development builds with no configuration overhead. This keeps the tool self-contained under `prototypes/` per the constitution.

**Alternatives considered**:
- SvelteKit — lighter and excellent DX, but less familiar to most reviewers and adds SSR complexity not needed here
- Next.js — overkill for a prototype; SSR/routing complexity not justified
- Vue — viable but React has broader portfolio recognition

---

## Decision 2: Backend / Data Layer

**Decision**: Supabase (PostgreSQL + Auth + Row Level Security)

**Rationale**: Supabase provides real authentication (email/password), a hosted PostgreSQL database, and critically — Row Level Security (RLS) policies at the database level. RLS is the right primitive for enforcing the strict data isolation required by SEC-001 and SEC-007 (patients can only see their own data; doctors can only see their assigned patients). This is real security, not application-layer guards. Free tier is sufficient for a prototype.

**Alternatives considered**:
- Firebase — no real SQL, ACL model is less expressive for row-level health data isolation
- Mock/localStorage only — cannot demonstrate real auth or security; not appropriate for a health data prototype
- Custom Node.js backend — too much boilerplate for a portfolio prototype; Supabase handles auth + DB + RLS out of the box

---

## Decision 3: Offline Logging

**Decision**: Dexie.js (IndexedDB wrapper) + background sync on reconnect

**Rationale**: Dexie provides a clean Promise-based API over IndexedDB for offline progress entry storage. When connectivity is restored, queued entries sync to Supabase. This satisfies FR-017 without requiring a service worker or complex sync infrastructure.

**Alternatives considered**:
- Service Worker + Cache API — appropriate for full offline PWA, but heavier than needed for just logging entries
- localStorage — not suitable for structured data or large amounts of entries
- PouchDB/CouchDB sync — powerful but far more complexity than required

---

## Decision 4: Styling

**Decision**: Tailwind CSS

**Rationale**: Rapid iteration, excellent mobile-first utilities, and strong community support for accessible component patterns. WCAG AA compliance is easier to audit with utility classes (explicit contrast ratios, focus utilities, screen reader utilities).

**Alternatives considered**:
- CSS Modules — fine but slower for prototype iteration
- Styled Components / Emotion — CSS-in-JS runtime overhead not justified
- Plain CSS — viable but slower for layout iteration

---

## Decision 5: Accessibility (WCAG 2.1 AA)

**Decision**: Radix UI primitives + manual audit

**Rationale**: Radix UI provides unstyled, accessible React primitives (dialogs, dropdowns, navigation) with correct ARIA roles and keyboard interactions built in. Combined with Tailwind for styling, this gives WCAG AA compliance without reinventing accessible component behaviour.

**Alternatives considered**:
- shadcn/ui — built on Radix, would also work; Radix directly is lighter
- Headless UI — Tailwind Labs' accessible primitives, also valid; Radix has broader component coverage

---

## Decision 6: Testing

**Decision**: Vitest + React Testing Library

**Rationale**: Vitest integrates natively with Vite (zero config), and React Testing Library encourages testing user behaviour rather than implementation details. This aligns with the spec's acceptance scenario format.

**Alternatives considered**:
- Jest — works but requires extra config with Vite
- Playwright — appropriate for E2E; add later if needed

---

## Decision 7: Dutch Language

**Decision**: Hardcoded Dutch strings via a constants/translations file (`src/i18n/nl.ts`)

**Rationale**: Since the app is Dutch-only with no internationalisation planned, a single constants file is simpler than adding a full i18n library (react-i18next, etc.). All UI strings live in one place, making future translation straightforward if needed.

**Alternatives considered**:
- react-i18next — appropriate if multi-language is planned; over-engineered for single language
- Inline strings — harder to audit and maintain

---

## Decision 8: Progress Event System

**Decision**: Event-rule table in the database + client-side evaluation

**Rationale**: A `content_triggers` table maps (event_type, threshold) → content items. When a patient logs an entry, the client evaluates which events have been triggered and marks viewed content. This is extensible (new event types = new rows) without code changes, satisfying FR-005b.

**Trigger event types (initial)**:
- `SYMPTOM_FIRST_LOG` — first time a specific symptom is logged
- `DOSAGE_INCREASE` — when a dosage increase date is reached
- `WEIGHT_MILESTONE` — when a weight target delta is reached
- `WEIGHT_PLATEAU` — when weight hasn't changed beyond threshold over N entries
- `TREATMENT_WEEK` — when patient crosses a week-in-treatment threshold

---

## Decision 9: Project Location

**Decision**: `prototypes/sliminject/`

**Rationale**: Follows existing convention (`prototypes/hypotheekversneller/`). Self-contained under `prototypes/` per Principle VI of the constitution.
