# Implementation Plan: Wellbeing Tracking — Food Noise & Non-Scale Victories

**Branch**: `004-wellbeing-tracking` | **Date**: 2026-03-17 | **Spec**: [spec.md](spec.md)

## Summary

Extend patient self-tracking beyond weight by adding (1) a daily food noise score to the existing log form, visualised as a third toggleable series on the progress chart, and (2) a weekly wellbeing check-in (energy, mood, body confidence) surfaced as a dashboard prompt. Both feed milestone cards and the doctor's patient view. Two Supabase migrations: a new nullable column on `progress_entries` and a new `weekly_wellbeing_checkins` table.

## Technical Context

**Language/Version**: TypeScript 5.9 / React 19
**Primary Dependencies**: Vite 5, React Router 7, Tailwind CSS 4, Radix UI, Supabase JS v2, Sonner (toasts)
**Storage**: Supabase PostgreSQL + RLS; food noise as new column on `progress_entries`; weekly check-ins as new `weekly_wellbeing_checkins` table
**Testing**: Vitest + React Testing Library
**Target Platform**: Mobile-first web (iOS/Android browser)
**Project Type**: React SPA prototype (within `prototypes/sliminject/`)
**Performance Goals**: Log form submission unaffected; check-in completable in under 60 seconds
**Constraints**: All data behind authentication and RLS; changes entirely within `prototypes/sliminject/`
**Scale/Scope**: Single-clinic prototype

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Changes inside `prototypes/sliminject/` only |
| II. Content-Driven Architecture | ✅ PASS | No Jekyll content changes |
| III. Design Integrity | ✅ PASS | New UI follows existing token system |
| IV. No Regression on v1 | ✅ PASS | No shared assets touched |
| V. Performance by Default | ✅ PASS | One new nullable column, one new table, chart series gated at 3+ points |
| VI. Tools are Sandboxed | ✅ PASS | Entirely within `prototypes/sliminject/` |
| VII. Security First for Personal Data | ✅ PASS | RLS on new table; food noise column inherits existing `progress_entries` policies |

No violations. No complexity justification required.

## Project Structure

### Documentation (this feature)

```
specs/004-wellbeing-tracking/
├── plan.md              ← this file
├── research.md          ← Phase 0 decisions
├── data-model.md        ← Phase 1 entity design
└── tasks.md             ← Phase 2 output (speckit.tasks)
```

### Source Code

```
prototypes/sliminject/
├── supabase/
│   └── migrations/
│       ├── 017_food_noise_score.sql          ← ALTER TABLE progress_entries
│       └── 018_weekly_wellbeing_checkins.sql  ← new table + RLS
└── src/
    ├── features/
    │   ├── patient/
    │   │   ├── dashboard/
    │   │   │   ├── PatientDashboard.tsx        ← add check-in prompt + milestone cards
    │   │   │   ├── ProgressChart.tsx           ← add food noise 3rd series + toggle
    │   │   │   └── useProgressEntries.ts       ← expose food_noise_score in entries
    │   │   ├── log/
    │   │   │   └── LogForm.tsx                 ← add food noise field
    │   │   └── wellbeing/                      ← new feature directory
    │   │       ├── useWellbeingCheckIn.ts       ← 7-day gate + submit logic
    │   │       ├── WellbeingCheckIn.tsx         ← weekly prompt card component
    │   │       ├── useWellbeingMilestones.ts    ← food noise + dimension milestones
    │   │       └── useWellbeingHistory.ts       ← fetch weekly_wellbeing_checkins
    │   └── doctor/
    │       └── patient/
    │           └── PatientProfile.tsx          ← add food noise toggle + WellbeingDoctorSummary
    └── lib/
        └── supabase.ts                         ← add weekly_wellbeing_checkins type + food_noise_score to progress_entries
```

**Structure Decision**: Feature-based directory `src/features/patient/wellbeing/` for new patient-facing hooks and components, consistent with `src/features/patient/adherence/` from feature 003. Doctor-side changes are additive to the existing `PatientProfile.tsx`.
