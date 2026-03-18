# Implementation Plan: Treatment Phase Summary Cards

**Branch**: `012-treatment-summary-cards` | **Date**: 2026-03-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/012-treatment-summary-cards/spec.md`

## Summary

Auto-generated milestone summary cards at treatment weeks 4, 8, 12, and 16 showing cumulative weight change, log count, wellbeing trends (hunger, food noise, energy, mood, confidence, symptoms), and injection adherence. Dismissible via localStorage. Visible on the patient dashboard (most recent unacknowledged) and doctor patient profile (all milestones).

## Technical Context

**Language/Version**: TypeScript 5.9 / React 19
**Primary Dependencies**: React Router 7, Tailwind CSS 4, Supabase JS v2, Dexie.js 4
**Storage**: Supabase PostgreSQL (read-only queries), localStorage (dismissal state)
**Testing**: Vitest 4.1 + Testing Library (setup exists)
**Target Platform**: Mobile-first web app (responsive)
**Project Type**: Prototype web application
**Performance Goals**: No measurable impact — summary computed from existing data on mount
**Constraints**: No new dependencies, no new database tables, Dutch language only
**Scale/Scope**: <100 patients, 4 milestones per patient, 6 wellbeing signals

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | N/A | Applies to Jekyll site, not prototypes |
| II. Content-Driven Architecture | N/A | Applies to Jekyll site |
| III. Design Integrity | PASS | Warm editorial tone is a spec requirement |
| IV. No Regression on v1 | N/A | Scoped to `prototypes/sliminject/` |
| V. Performance by Default | PASS | No new assets; computed from existing queries |
| VI. Tools are Sandboxed | PASS | All changes within `prototypes/sliminject/` |
| VII. Security First | PASS | Reads existing patient data via RLS-scoped queries |

All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/012-treatment-summary-cards/
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
│   │   ├── milestones/
│   │   │   ├── useTreatmentMilestone.ts    # NEW — milestone logic + data aggregation
│   │   │   └── MilestoneSummaryCard.tsx    # NEW — milestone card UI component
│   │   └── dashboard/
│   │       └── PatientDashboard.tsx        # MODIFY — add milestone card to celebration zone
│   └── doctor/
│       └── patient/
│           └── PatientProfile.tsx          # MODIFY — add milestones section in Overzicht tab
└── i18n/
    └── nl.ts                              # MODIFY — add milestone i18n keys
```

**Structure Decision**: New `features/patient/milestones/` directory for milestone logic and UI. The hook computes milestone eligibility and aggregates data from existing hooks/queries. No new Supabase tables — dismissal uses localStorage.

## Implementation Phases

### Phase A: Milestone logic hook

1. **Create `useTreatmentMilestone` hook** — Fetches `treatment_start_date` from the patients table, calculates which milestones (4, 8, 12, 16 weeks) have been reached, checks localStorage for dismissals, and returns the most recent unacknowledged milestone (or null).

2. **Milestone data aggregation** — For the active milestone, computes:
   - **Weight change**: first ever `weight_kg` from `progress_entries` vs most recent
   - **Log count**: total `progress_entries` count in the milestone period
   - **Adherence**: confirmed / total from `injection_adherence` in the milestone period
   - **Wellbeing trend**: compare average hunger, food noise, symptom frequency between first half and second half of treatment. For energy/mood/confidence, compare earliest and latest `weekly_wellbeing_checkins`. Return the most notable positive trend as a localised string.

3. **Dismissal persistence** — localStorage key pattern: `sliminject_milestone_dismissed_week_{N}`. Mark as dismissed when the dismiss callback is called.

### Phase B: Milestone card component

4. **Create `MilestoneSummaryCard` component** — Accepts milestone data (week number, weight change, log count, adherence, trend observation). Renders a warm, editorial card with:
   - Phase label heading (e.g., "Week 8 — Jouw samenvatting")
   - Data sections rendered conditionally (only non-null)
   - Warm body text with supportive tone
   - Dismiss button
   - Visually distinct from alerts/celebrations (different background, typography)

5. **i18n keys** — Add all milestone-related keys: headings per milestone week, weight change template, log count template, adherence template, trend observation templates, dismiss label.

### Phase C: Patient dashboard integration

6. **Update PatientDashboard** — Import and render `MilestoneSummaryCard` in the celebration zone (Zone 4), using data from `useTreatmentMilestone`. Milestone card takes priority over existing celebration cards (food noise milestone, wellbeing dimension milestones) when present.

### Phase D: Doctor view integration

7. **Update PatientProfile** — Add a "Behandeloverzicht" section in the Overzicht tab showing all reached milestone summaries for the patient. Reuse `MilestoneSummaryCard` in a non-dismissible, compact variant. Requires a `useTreatmentMilestones` (plural) variant that returns all reached milestones regardless of dismissal.

### Phase E: Polish

8. **Edge cases** — Patient with no weight data, patient with no logs in period, patient who missed multiple milestones (only most recent shown), new patient (<4 weeks).
