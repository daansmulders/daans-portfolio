# Tasks: Treatment Phase Summary Cards

**Input**: Design documents from `/specs/012-treatment-summary-cards/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Foundational (Shared Infrastructure)

**Purpose**: Milestone logic hook and i18n keys that all user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Add milestone-related i18n keys to `prototypes/sliminject/src/i18n/nl.ts`: milestone headings per week (e.g., "Week 4 — Jouw samenvatting"), weight change template ("Je bent {change} kg {richting} sinds de start"), log count template ("{n} metingen bijgehouden"), adherence template ("{n} van {total} injecties bevestigd"), trend observation templates for each signal (hunger down, food noise down, fewer symptoms, energy up, mood up, confidence up), empty period encouragement text, and dismiss label
- [x] T002 Create `useTreatmentMilestone` hook in `prototypes/sliminject/src/features/patient/milestones/useTreatmentMilestone.ts`:
  - Fetch `treatment_start_date` from `patients` table for current user (or for a given `patientId` prop)
  - Calculate which milestone weeks (4, 8, 12, 16) have been reached based on current date
  - Check localStorage (`sliminject_milestone_dismissed_week_{N}`) for dismissals
  - Return the most recent unacknowledged milestone week (or null) plus a `dismiss(week)` callback
  - Accept optional `patientId` parameter for doctor view (skip dismissal checks when provided)
- [x] T003 Add milestone data aggregation to `useTreatmentMilestone` in `prototypes/sliminject/src/features/patient/milestones/useTreatmentMilestone.ts`:
  - **Weight change**: query first ever `weight_kg` from `progress_entries` and most recent — return difference (null if no weight data)
  - **Log count**: count `progress_entries` in the milestone period (week 0 to milestone week)
  - **Wellbeing trend**: compare averages of hunger_score, food_noise_score, symptom count from first half vs second half of progress_entries; compare earliest vs latest weekly_wellbeing_checkins for energy/mood/confidence. Return the i18n key for the most notable positive trend (or null if no clear improvement)
  - Return a `MilestoneData` object: `{ week, weightChange, logCount, trendObservation }`
- [x] T004 Add `allMilestones` return value to `useTreatmentMilestone` for doctor view: when `patientId` is provided, return an array of `MilestoneData` for all reached milestones (ignore dismissal state) in `prototypes/sliminject/src/features/patient/milestones/useTreatmentMilestone.ts`

**Checkpoint**: Milestone hook ready — returns data for the most recent unacknowledged milestone. Doctor variant returns all reached milestones.

---

## Phase 2: User Story 1 — Patient Sees Milestone Summary (Priority: P1) MVP

**Goal**: Patient sees a warm, dismissible summary card on the dashboard at treatment weeks 4, 8, 12, 16

**Independent Test**: Adjust seed data so a patient's treatment_start_date is 28+ days ago. Log in as that patient. A milestone card appears in the celebration zone showing weight change, log count, and wellbeing trend. Dismiss it — card does not reappear.

### Implementation for User Story 1

- [x] T005 [US1] Create `MilestoneSummaryCard` component in `prototypes/sliminject/src/features/patient/milestones/MilestoneSummaryCard.tsx`: accepts `MilestoneData` + optional `onDismiss` callback. Renders:
  - Warm editorial heading using i18n key for the milestone week
  - Weight change line (if available): "Je bent X kg lichter/zwaarder sinds de start"
  - Log count line: "X metingen bijgehouden"
  - Wellbeing trend observation line (if available): localised trend string
  - Dismiss button (only if `onDismiss` is provided)
  - Visually distinct from alerts: use a warm background (e.g., brand-50), left border accent, serif heading. Not an alert or celebration card style.
- [x] T006 [US1] Integrate `MilestoneSummaryCard` into `PatientDashboard`: import `useTreatmentMilestone` and `MilestoneSummaryCard`. Render the card in Zone 4 (celebration zone). Milestone card takes priority over existing celebration cards when present — show milestone OR celebration, not both. In `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx`

**Checkpoint**: Patient sees milestone card at week 4/8/12/16. Dismissal works. Card is visually warm and distinct.

---

## Phase 3: User Story 2 — Adherence Context (Priority: P2)

**Goal**: Milestone card includes injection adherence summary when data is available

**Independent Test**: Patient with adherence data sees "X van Y injecties bevestigd" on their milestone card. Patient with no adherence data sees no adherence line.

### Implementation for User Story 2

- [x] T007 [US2] Add adherence aggregation to `useTreatmentMilestone`: query `injection_adherence` for the milestone period, count confirmed responses vs total records. Add `adherenceConfirmed` and `adherenceTotal` to `MilestoneData` (both null if no data). In `prototypes/sliminject/src/features/patient/milestones/useTreatmentMilestone.ts`
- [x] T008 [US2] Add adherence display to `MilestoneSummaryCard`: render "X van Y injecties bevestigd" line when `adherenceConfirmed` and `adherenceTotal` are non-null. Use supportive tone — no colour-coding or pass/fail. In `prototypes/sliminject/src/features/patient/milestones/MilestoneSummaryCard.tsx`

**Checkpoint**: Adherence context visible on milestone card when data exists. No adherence line when no data.

---

## Phase 4: User Story 3 — Doctor Sees Patient Milestones (Priority: P3)

**Goal**: Doctor can view all reached milestone summaries for a patient in the Overzicht tab

**Independent Test**: Log in as doctor, open a patient profile. Overzicht tab shows a "Behandeloverzicht" section with milestone cards for all reached milestones. No dismiss buttons.

### Implementation for User Story 3

- [x] T009 [US3] Add milestones section to `PatientProfile` Overzicht tab: import `useTreatmentMilestone(patientId)` to get `allMilestones`. Render a "Behandeloverzicht" section heading followed by `MilestoneSummaryCard` for each milestone (no `onDismiss` → no dismiss button). Show most recent first. If no milestones reached yet, omit the section. In `prototypes/sliminject/src/features/doctor/patient/PatientProfile.tsx`

**Checkpoint**: Doctor sees all reached milestones for any patient. Same data as patient view, no dismiss buttons.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, seed data, and visual verification

- [x] T010 [P] Update seed data to set `treatment_start_date` for Lars to 35+ days ago (week 5) so the week 4 milestone is testable out of the box. In `prototypes/sliminject/supabase/seed.js`
- [x] T011 [P] Verify edge cases: patient with no weight data (weight line omitted), patient with no logs in period (encouragement text shown), patient who missed multiple milestones (only most recent shown), new patient <4 weeks (no card shown), patient with all milestones dismissed (no card shown)
- [x] T012 [P] Visual polish: verify milestone card looks warm and distinct from alerts/celebrations on mobile. Ensure consistent spacing with other dashboard zones. Test with minimal data (only log count) and maximal data (all fields present)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on Phase 1 (needs hook + i18n)
- **US2 (Phase 3)**: Depends on Phase 2 (extends hook + card)
- **US3 (Phase 4)**: Depends on Phase 1 (needs hook with `allMilestones`). Can run in parallel with US2 since it uses a different return value.
- **Polish (Phase 5)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 1
- **US2 (P2)**: Depends on US1 (extends the card and hook)
- **US3 (P3)**: Can start after Phase 1 — parallel with US1/US2 (different file: PatientProfile.tsx)

### Parallel Opportunities

- T003 and T004 can run in parallel (different return values, same file but independent logic)
- T009 (US3) can run in parallel with T007-T008 (US2) — different files
- T010, T011, T012 can all run in parallel in Polish phase

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Hook + i18n
2. Complete Phase 2: US1 — Milestone card on dashboard
3. **STOP and VALIDATE**: Adjust seed data, verify card appears at week 4, dismiss works
4. Patients can now see treatment milestone summaries

### Incremental Delivery

1. Phase 1 → Hook and i18n ready
2. Phase 2 (US1) → Milestone card on patient dashboard → **MVP**
3. Phase 3 (US2) → Adherence context added to card
4. Phase 4 (US3) → Doctor can see patient milestones
5. Phase 5 → Polish and edge cases

Each phase adds value without breaking previous work.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- New files go in `prototypes/sliminject/src/features/patient/milestones/`
- All strings must use i18n keys — no hardcoded Dutch text in components
- Use design tokens (brand/warm/accent colors) — no hardcoded hex
- Dismissal uses localStorage pattern consistent with existing milestones
- Commit after each phase
