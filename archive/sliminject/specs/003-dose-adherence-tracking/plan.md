# Implementation Plan: Dose Adherence Tracking

**Branch**: `003-dose-adherence-tracking` | **Date**: 2026-03-17 | **Spec**: [spec.md](spec.md)

## Summary

Add weekly injection check-in prompts to the patient dashboard so patients can confirm, skip, or note an adjusted dose. Store responses in a new `injection_adherence` table linked to the existing dosage schedule. Surface a nudge after two consecutive skips and show per-cycle adherence indicators on the doctor's Medicatie tab.

## Technical Context

**Language/Version**: TypeScript 5.9 / React 19
**Primary Dependencies**: React Router 7, Tailwind CSS 4, Radix UI, Supabase JS v2, Sonner (toasts)
**Storage**: Supabase PostgreSQL + RLS (primary); no Dexie queue for adherence (online-only write, see research.md Decision 3)
**Testing**: Vitest + React Testing Library
**Target Platform**: Mobile-first web (iOS/Android browser)
**Project Type**: React SPA prototype (within `prototypes/sliminject/`)
**Performance Goals**: Check-in interaction completable in under 10 seconds; dashboard load unaffected
**Constraints**: All adherence data behind authentication and RLS; no data leaks to URLs or logs (Constitution VII)
**Scale/Scope**: Single-clinic prototype; one adherence record per patient per injection cycle

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | All changes inside `prototypes/sliminject/` — Jekyll site unaffected |
| II. Content-Driven Architecture | ✅ PASS | No Jekyll content changes |
| III. Design Integrity | ✅ PASS | New UI components follow existing `.card`, `.btn` token system |
| IV. No Regression on v1 | ✅ PASS | No shared assets touched |
| V. Performance by Default | ✅ PASS | One new Supabase query; adherence prompt renders conditionally |
| VI. Tools are Sandboxed | ✅ PASS | Entirely within `prototypes/sliminject/`; no cross-tool dependencies |
| VII. Security First for Personal Data | ✅ PASS | RLS scoped to `patient_id = auth.uid()`; doctor access via `get_my_patient_ids()`; no sensitive data in URLs or logs |

No violations. No complexity justification required.

## Project Structure

### Documentation (this feature)

```
specs/003-dose-adherence-tracking/
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
│       └── 015_injection_adherence.sql          ← new table + RLS
└── src/
    ├── features/
    │   ├── patient/
    │   │   ├── dashboard/
    │   │   │   ├── PatientDashboard.tsx          ← add check-in prompt card
    │   │   │   └── useAdherenceCheckIn.ts        ← new hook
    │   │   └── adherence/                        ← new feature directory
    │   │       ├── AdherenceCheckIn.tsx           ← prompt card component
    │   │       └── useConsecutiveMiss.ts          ← derived nudge state
    │   └── doctor/
    │       └── patient/
    │           └── MedicatieTab.tsx              ← add adherence indicators (existing file, updated)
    └── hooks/
        └── useAdherence.ts                       ← shared read hook for doctor view
```

**Structure Decision**: Feature-based directory structure following existing conventions. Patient-facing adherence UI lives in `src/features/patient/adherence/`. Doctor-side changes are additive to the existing `MedicatieTab`. A shared `useAdherence` hook in `src/hooks/` handles the doctor's read query (patient-scoped data across role boundary).
