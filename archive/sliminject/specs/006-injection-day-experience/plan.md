# Implementation Plan: Unified Injection-Day Experience

**Branch**: `006-injection-day-experience` | **Date**: 2026-03-17 | **Spec**: [spec.md](spec.md)

## Summary

Replace the separate `<AdherenceCheckIn>` card and daily log CTA on injection days with a single `<InjectionDayCard>` that guides the patient through: confirm injection → weight + hunger + food noise (weekly framing) + energy + note → acknowledgement. On non-injection days the existing `LogEntryForm` flow is completely unchanged. Submission saves two records as before: an `injection_adherence` row and a `progress_entries` row. Energy score from the injection-day card goes into `weekly_wellbeing_checkins` (same table as the existing wellbeing check-in). Injection-day entries are visually marked in the patient's recent entries list and in the doctor's adherence view.

## Technical Context

**Language/Version**: TypeScript 5.9
**Primary Dependencies**: React 19, React Router 7, Tailwind CSS 4, Radix UI, Supabase JS v2, Dexie.js 4, Sonner
**Storage**: Supabase PostgreSQL (primary); Dexie IndexedDB offline queue for progress entries
**Target Platform**: Mobile-first web app (PWA-capable)
**Project Type**: React single-page application within `prototypes/sliminject/`
**Performance Goals**: Card interaction completes in under 60 seconds; no additional Supabase round-trips beyond what already exists on the dashboard
**Constraints**: No database schema changes; offline-capable for the log entry portion; RLS unchanged
**Scale/Scope**: Single patient per session; all data scoped to authenticated user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Simplicity First** | N/A | Applies to Jekyll site only |
| **II. Content-Driven Architecture** | N/A | Applies to Jekyll site only |
| **III. Design Integrity** | ✓ PASS | Changes are within the Sliminject prototype; design tokens and component classes used |
| **IV. No Regression on v1** | N/A | No changes to shared Jekyll assets |
| **V. Performance by Default** | ✓ PASS | No new dependencies; no additional fetches; existing hooks reused |
| **VI. Tools are Sandboxed** | ✓ PASS | All changes are within `prototypes/sliminject/`; no effect on Jekyll site |
| **VII. Security First** | ✓ PASS | No schema changes; RLS unchanged; no new data access patterns |

No violations. Proceeding.

## Project Structure

### Documentation (this feature)

```text
specs/006-injection-day-experience/
├── plan.md              ← this file
├── research.md          ← tech decisions
├── data-model.md        ← entity reference
├── contracts/
│   └── InjectionDayCard.md
├── quickstart.md        ← test scenarios
└── tasks.md             ← /speckit.tasks output
```

### Source Code

```text
prototypes/sliminject/src/
├── features/patient/
│   ├── adherence/
│   │   ├── InjectionDayCard.tsx         [NEW] unified card component
│   │   ├── useInjectionDayCard.ts       [NEW] combined hook (adherence + log + wellbeing)
│   │   ├── AdherenceCheckIn.tsx         [KEPT — unchanged, no longer rendered on injection days]
│   │   └── useAdherenceCheckIn.ts       [KEPT — reused internally by useInjectionDayCard]
│   └── dashboard/
│       ├── PatientDashboard.tsx         [MODIFIED] swap cards; pass injection-day dates to entries list
│       └── LogEntryForm.tsx             [UNCHANGED]
├── features/doctor/patient/
│   └── PatientProfile.tsx              [MODIFIED] injection-day marker on adherence entries (Medicatie tab)
└── i18n/nl.ts                          [MODIFIED] new string keys for InjectionDayCard
```
