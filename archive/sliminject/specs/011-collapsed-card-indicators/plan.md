# Implementation Plan: Collapsed Entry Card Indicators

**Branch**: `011-collapsed-card-indicators` | **Date**: 2026-03-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/011-collapsed-card-indicators/spec.md`

## Summary

Add two subtle visual indicators to the collapsed state of log entry cards: a coloured dot for side-effect presence (brand green for mild, amber for severe) and a compact score summary for hunger/food noise. Modifies the existing `LogEntryCard` component only — no new files, no data changes.

## Technical Context

**Language/Version**: TypeScript 5.9 / React 19
**Primary Dependencies**: React Router 7, Tailwind CSS 4
**Storage**: No changes — reads existing `ProgressEntry` data
**Testing**: Vitest 4.1 + Testing Library (setup exists)
**Target Platform**: Mobile-first web app (responsive)
**Project Type**: Prototype web application
**Performance Goals**: No impact — adds a few DOM elements to existing cards
**Constraints**: No new dependencies, design tokens only
**Scale/Scope**: 3 cards on patient dashboard, 5 on doctor view

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | N/A | Applies to Jekyll site, not prototypes |
| II. Content-Driven Architecture | N/A | Applies to Jekyll site |
| III. Design Integrity | PASS | Adds polish to existing cards — design-driven change |
| IV. No Regression on v1 | N/A | Scoped to `prototypes/sliminject/` |
| V. Performance by Default | PASS | Negligible DOM additions |
| VI. Tools are Sandboxed | PASS | All changes within `prototypes/sliminject/` |
| VII. Security First | PASS | Display-only, no new data exposure |

All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/011-collapsed-card-indicators/
├── spec.md
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (files to modify)

```text
prototypes/sliminject/src/
├── features/
│   └── patient/
│       └── dashboard/
│           └── LogEntryCard.tsx    # MODIFY — add indicators to collapsed row
└── i18n/
    └── nl.ts                      # MODIFY — add score summary labels
```

**Structure Decision**: No new files. All changes go into the existing `LogEntryCard.tsx` component. The indicators are internal subcomponents (functions) within that file.

## Implementation Phases

### Phase A: Side-effect dot indicator

1. **Add `SideEffectDot` subcomponent** — Renders a 6–8px coloured circle. Brand colour (`#2D7A5E`) when all severities ≤ 3, amber (`#A85C0A`) when any severity ≥ 4. Returns null when symptoms array is empty.

2. **Place dot in collapsed header row** — Insert between date and weight/chevron section.

### Phase B: Compact score summary

3. **Add `ScoreSummary` subcomponent** — Renders compact abbreviated scores. Format: small text like "H3" for hunger 3/5 and "V2" for food noise 2/5, in muted colour. Returns null when neither score is present.

4. **i18n keys** — Add abbreviated labels for hunger and food noise score summaries.

### Phase C: Integration and polish

5. **Place score summary in collapsed header row** — Insert alongside the side-effect dot. Verify the row doesn't wrap on mobile with all indicators present.

6. **Test edge cases** — Minimal entry (no indicators), maximal entry (all indicators), severe symptoms, doctor view consistency.
