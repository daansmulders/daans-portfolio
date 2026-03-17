# Implementation Plan: Dose Change Visibility

**Branch**: `007-dose-change-visibility` | **Date**: 2026-03-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-dose-change-visibility/spec.md`

## Summary

Make dose changes visible across two surfaces: (1) vertical markers on the ProgressChart SVG at each dose step date, with tap/hover tooltip, visible on both patient and doctor views; (2) a pre-increase announcement card on the dashboard 7 days before a scheduled dose increase, dismissible and persisted in localStorage; (3) a "Nieuwe dosis" marker on the injection-day card for the first 2 injections at a new dose level.

## Technical Context

**Language/Version**: TypeScript 5.9
**Primary Dependencies**: React 19, React Router 7, Tailwind CSS 4, Radix UI, Supabase JS v2, Dexie.js 4, Sonner
**Storage**: Supabase PostgreSQL (primary); localStorage for announcement dismissals
**Testing**: Manual testing via seed data
**Target Platform**: Mobile-first web app (patient), responsive desktop (doctor)
**Project Type**: Web application (single SPA)
**Performance Goals**: Chart renders dose markers within 1 second; no additional network requests
**Constraints**: No schema changes; all data derived from existing `dosage_schedule_entries`
**Scale/Scope**: 5 patients in seed data, 2–4 dose steps per patient

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | N/A | Applies to Jekyll site, not prototypes |
| II. Content-Driven Architecture | N/A | Applies to Jekyll site |
| III. Design Integrity | PASS | Dose markers use existing design tokens; announcement card uses existing `.card`, `.alert-amber` patterns |
| IV. No Regression on v1 | N/A | Changes are inside `prototypes/sliminject/` |
| V. Performance by Default | PASS | No new assets; markers are SVG elements computed from existing data |
| VI. Tools are Sandboxed | PASS | All changes inside `prototypes/sliminject/`; no impact on Jekyll site |
| VII. Security First for Personal Data | PASS | No new data exposed; dose schedule is already accessible to the patient; dismissal state stored client-side only |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/007-dose-change-visibility/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── DoseChangeVisibility.md
└── tasks.md                    # Created by /speckit.tasks
```

### Source Code

```text
prototypes/sliminject/src/
├── features/
│   ├── patient/
│   │   ├── dashboard/
│   │   │   ├── ProgressChart.tsx          # MODIFIED — add dose markers + tooltip
│   │   │   └── PatientDashboard.tsx       # MODIFIED — add announcement card
│   │   ├── adherence/
│   │   │   └── InjectionDayCard.tsx       # MODIFIED — add "Nieuwe dosis" marker
│   │   └── medication/
│   │       └── useDoseChanges.ts          # NEW — derived dose change detection hook
│   └── doctor/
│       └── patient/
│           └── PatientProfile.tsx          # MODIFIED — pass scheduleEntries to ProgressChart
├── i18n/
│   └── nl.ts                              # MODIFIED — new i18n keys
└── (no new directories needed)
```

**Structure Decision**: All new logic goes into a single new hook (`useDoseChanges`). The existing `ProgressChart` gains an optional `doseSteps` prop. No new components — the announcement card is inline JSX in `PatientDashboard`, and the injection-day marker is a conditional block in `InjectionDayCard`.
