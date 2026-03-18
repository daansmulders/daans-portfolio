# Implementation Plan: Log Entry Card Redesign

**Branch**: `010-log-entry-cards` | **Date**: 2026-03-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/010-log-entry-cards/spec.md`

## Summary

Redesign the log entry cards on the patient dashboard and doctor's patient view to display all logged data fields (weight, hunger, food noise, symptoms with severity, notes) instead of just date, weight, and hunger. Two layout variants (expandable accordion and full-detail inline) are built behind a developer toggle so both can be evaluated with real data before committing to one.

## Technical Context

**Language/Version**: TypeScript 5.9 / React 19
**Primary Dependencies**: React Router 7, Tailwind CSS 4, Supabase JS v2, Dexie.js 4
**Storage**: No changes — reads existing `ProgressEntry` data
**Testing**: Vitest 4.1 + Testing Library (setup exists)
**Target Platform**: Mobile-first web app (responsive)
**Project Type**: Prototype web application
**Performance Goals**: No measurable impact — UI-only change, no new data fetching
**Constraints**: Offline-capable, Dutch language only, no new dependencies
**Scale/Scope**: <100 patients, 3 entries on patient dashboard, 5 on doctor view

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | N/A | Applies to Jekyll site, not prototypes |
| II. Content-Driven Architecture | N/A | Applies to Jekyll site |
| III. Design Integrity | PASS | Two variants built for design evaluation — visual quality is the goal |
| IV. No Regression on v1 | N/A | Changes scoped to `prototypes/sliminject/` |
| V. Performance by Default | PASS | No new assets, no new data fetching |
| VI. Tools are Sandboxed | PASS | All changes within `prototypes/sliminject/` |
| VII. Security First | PASS | No new data exposure — displays data already available to the viewer |

All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/010-log-entry-cards/
├── spec.md
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (files to modify/create)

```text
prototypes/sliminject/src/
├── features/
│   ├── patient/
│   │   └── dashboard/
│   │       ├── PatientDashboard.tsx        # MODIFY — replace inline entry cards with LogEntryCard
│   │       └── LogEntryCard.tsx            # NEW — shared card component with Variant A/B
│   └── doctor/
│       └── patient/
│           └── PatientProfile.tsx          # MODIFY — replace inline entry cards with LogEntryCard
└── i18n/
    └── nl.ts                              # MODIFY — add card-related i18n keys
```

**Structure Decision**: One new shared component (`LogEntryCard`) used by both patient dashboard and doctor patient view. No new directories needed. The variant toggle is a URL search parameter (`?card=a` or `?card=b`), defaulting to Variant B.

## Implementation Phases

### Phase A: Shared LogEntryCard component

1. **Create LogEntryCard** — New component that renders a single log entry with all non-null fields. Accepts a `variant` prop (`'expandable' | 'detail'`) and an entry object. Handles:
   - Date (always shown), weight, hunger score, food noise score
   - Symptom chips with severity (max 3 visible, "+N meer" overflow)
   - Truncated notes (2-line clamp)
   - Injection day badge (passed as prop)
   - Legacy symptom format (name only, no severity badge)

2. **Variant A — Expandable accordion** — Collapsed state shows date + weight + injection badge. Tapping toggles open to reveal remaining fields. Chevron affordance rotates on expand. `expandedId` state managed by parent (accordion: only one open at a time).

3. **Variant B — Full detail inline** — All non-null fields rendered immediately. Compact layout: scores as a row of small badges, symptoms as mini-chips below, notes as italic truncated text.

### Phase B: Variant toggle mechanism

4. **URL parameter toggle** — Read `?card=a` or `?card=b` from the URL search params. Default to `b` (full detail). Pass the resolved variant to LogEntryCard. Developer-only — not linked in navigation.

### Phase C: Integration into patient dashboard

5. **Update PatientDashboard** — Replace the inline `entries.slice(0, 3).map(...)` block with `LogEntryCard` components. Pass `expandedId` / `onToggle` for Variant A accordion behavior. Preserve injection day badge logic.

### Phase D: Integration into doctor patient view

6. **Update PatientProfile** — Replace the inline entry rendering in the Overzicht tab with `LogEntryCard` components. Same variant toggle, same component. Show 5 entries.

### Phase E: i18n + polish

7. **i18n keys** — Add keys for food noise label, "+N meer" overflow text, and any new card labels.

8. **Visual polish** — Ensure both variants look polished on mobile (≤ 700px). Verify dark/light doesn't apply (Sliminject has its own theme, not dark mode). Test with minimal, moderate, and maximal data entries.
