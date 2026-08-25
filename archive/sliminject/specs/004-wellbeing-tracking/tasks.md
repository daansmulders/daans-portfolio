# Tasks: Wellbeing Tracking — Food Noise & Non-Scale Victories

**Input**: Design documents from `/specs/004-wellbeing-tracking/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Migrations)

**Purpose**: Create Supabase migration SQL files. These must be applied to the Supabase dashboard before any UI changes can function end-to-end.

- [x] T001 [P] Write prototypes/sliminject/supabase/migrations/017_food_noise_score.sql — `ALTER TABLE progress_entries ADD COLUMN food_noise_score int CHECK (food_noise_score BETWEEN 1 AND 5)`; no RLS change needed
- [x] T002 [P] Write prototypes/sliminject/supabase/migrations/018_weekly_wellbeing_checkins.sql — CREATE TABLE with id, patient_id (FK → patients CASCADE), submitted_at (default now()), energy_score, mood_score, confidence_score (all nullable int 1–5 with CHECK), note (text max 200); RLS: patients INSERT/SELECT own rows via `patient_id = auth.uid()`, doctors SELECT via `get_my_patient_ids()`; no UPDATE/DELETE

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: TypeScript type definitions that all user story code depends on.

**⚠️ CRITICAL**: No user story code can be written until this phase is complete.

- [x] T003 Update prototypes/sliminject/src/lib/supabase.ts — add `food_noise_score: number | null` to `progress_entries` Row type; add full `weekly_wellbeing_checkins` type (Row, Insert with patient_id + optional scores + optional note, Update: never)

**Checkpoint**: Types in place — user story implementation can now begin.

---

## Phase 3: User Story 1 — Food Noise in Daily Log + Progress Chart (Priority: P1) 🎯 MVP

**Goal**: Patients can log a daily food noise score (1–5) alongside their existing log entry, and see it as a third toggleable violet series on the progress chart.

**Independent Test**: Log a new entry with a food noise score → open the progress chart → toggle the food noise series on → confirm the data point appears. Requires at least 3 data points for the series to render.

### Implementation for User Story 1

- [x] T004 [P] [US1] Update prototypes/sliminject/src/features/patient/log/LogForm.tsx — add food noise score field: label "Voedselruis vandaag", five radio/button options 1–5 (1 = geen last, 5 = overweldigend), optional (nullable), positioned below hunger score field; include in form submit payload
- [x] T005 [P] [US1] Update prototypes/sliminject/src/features/patient/dashboard/useProgressEntries.ts — add `food_noise_score` to the Supabase select query and expose it in the returned entries array
- [x] T006 [US1] Update prototypes/sliminject/src/features/patient/dashboard/ProgressChart.tsx — add `showFoodNoise: boolean` and `onToggleFoodNoise: () => void` props; render a third `<path>` in violet (`#7C5CBF`) using the existing `toY(v, 1, 5)` normalisation (same scale as hunger); gate visibility at 3+ data points with the same pattern as hunger; add a third toggle button in the series legend row (depends on T005)
- [x] T007 [US1] Create prototypes/sliminject/src/features/patient/wellbeing/useWellbeingMilestones.ts — implement `useFoodNoiseMilestone(entries)`: triggered when mean food noise per calendar week across the last 4 weeks is all ≤2 AND at least one entry in those 4 weeks had a score ≥4; dismissal keyed to `localStorage` using a fingerprint of the triggering data window (same pattern as `useConsecutiveMiss`)
- [x] T008 [US1] Update prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx — import `useFoodNoiseMilestone` from the new wellbeing directory; add `showFoodNoise` state (default false) with toggle handler; pass `showFoodNoise`/`onToggleFoodNoise` props to `<ProgressChart>`; render a dismissible food noise milestone card when `isFoodNoiseMilestone` is true (green card, "Voedselruis sterk gedaald" heading, brief celebration copy, dismiss button)

**Checkpoint**: US1 complete. Log form shows food noise field. Chart has working food noise toggle. Milestone card appears and can be dismissed.

---

## Phase 4: User Story 2 — Weekly Wellbeing Check-In (Priority: P2)

**Goal**: Patients see a weekly prompt on their dashboard to rate energy, mood, and body confidence (1–5 each). The check-in is due every 7 days, completable in under 60 seconds.

**Independent Test**: Complete a weekly check-in → confirm the prompt disappears for 7 days → check again after simulating 7 days (clear localStorage key) → confirm prompt reappears. Optionally improve a dimension score by 2+ points across two check-ins → confirm milestone card appears.

### Implementation for User Story 2

- [x] T009 [P] [US2] Create prototypes/sliminject/src/features/patient/wellbeing/useWellbeingHistory.ts — fetch all `weekly_wellbeing_checkins` for the current patient ordered by `submitted_at DESC`; expose `checkins`, `loading`, `refresh`
- [x] T010 [P] [US2] Create prototypes/sliminject/src/features/patient/wellbeing/useWellbeingCheckIn.ts — compute `isDue` using `max(submitted_at)` from check-ins (≥7 days ago or no prior submission); `submitCheckIn({ energy_score, mood_score, confidence_score, note? })` inserts to Supabase and calls `refresh()`; client-side validation: at least one score must be non-null; Sonner error toast on submit failure (same pattern as `useAdherenceCheckIn`)
- [x] T011 [US2] Create prototypes/sliminject/src/features/patient/wellbeing/WellbeingCheckIn.tsx — card component shown when `isDue` is true; three 1–5 score pickers (energy, mood, body confidence) each with emoji/icon labels; optional note textarea (max 200 chars); submit button; self-dismissing on successful submit via `isDue` going false; uses `.card`, `.btn`, `.btn-primary`, `.input` token classes (depends on T010)
- [x] T012 [US2] Extend prototypes/sliminject/src/features/patient/wellbeing/useWellbeingMilestones.ts — add `useWellbeingDimensionMilestones(checkins)`: for each dimension (energy, mood, confidence), triggered when the most recent check-in score is 2+ points higher than the check-in from ~4 weeks prior (nearest check-in between 21–35 days ago); each dimension has its own `localStorage` dismissal key (depends on T007, T009)
- [x] T013 [US2] Update prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx — import `WellbeingCheckIn`, `useWellbeingCheckIn`, `useWellbeingDimensionMilestones`, `useWellbeingHistory`; position `<WellbeingCheckIn>` between `<AdherenceCheckIn>` and the consecutive-miss nudge; render dismissible milestone cards for any triggered wellbeing dimension milestones (depends on T011, T012)

**Checkpoint**: US2 complete. Dashboard shows weekly check-in card when due. Milestone cards appear for energy/mood/confidence improvements.

---

## Phase 5: User Story 3 — Doctor View (Priority: P3)

**Goal**: Doctors can see a patient's food noise trend on the progress chart and a concise wellbeing summary showing recent check-in scores and trend direction.

**Independent Test**: Navigate to a patient's Overzicht tab → toggle food noise series on the chart → confirm it renders → confirm WellbeingDoctorSummary shows the most recent check-in scores and trend arrows per dimension.

### Implementation for User Story 3

- [x] T014 [P] [US3] Update prototypes/sliminject/src/features/doctor/patient/PatientProfile.tsx — add `showFoodNoise` state (default false) with toggle; pass `showFoodNoise`/`onToggleFoodNoise` to the existing `<ProgressChart>` on the Overzicht tab (the chart already accepts these props after T006)
- [x] T015 [US3] Create `WellbeingDoctorSummary` component inline in prototypes/sliminject/src/features/doctor/patient/PatientProfile.tsx — fetches `weekly_wellbeing_checkins` for the patient; shows the most recent check-in scores per dimension with a trend indicator (↑ ↓ → compared to the prior check-in); rendered below the progress chart on the Overzicht tab; shows "Geen check-ins" when no data (depends on T014)

**Checkpoint**: US3 complete. Doctor Overzicht tab has food noise chart toggle and wellbeing summary.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T016 [P] Review prototypes/sliminject/src/features/patient/dashboard/ProgressChart.tsx — verify the food noise series guard (`entries.filter(e => e.food_noise_score != null).length >= 3`) is in place and the toggle button is hidden when insufficient data, consistent with the hunger score guard pattern
- [x] T017 [P] Review all new components for empty-state handling — WellbeingCheckIn hides when not due, WellbeingDoctorSummary shows "Geen check-ins" when empty, milestone cards do not render without data; no broken layouts or undefined access errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001 and T002 can run in parallel immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (migrations define table shape; types must match) — BLOCKS all user story code
- **US1 (Phase 3)**: Depends on Phase 2 — T004 and T005 can run in parallel; T006 depends on T005; T007 depends on nothing beyond Phase 2; T008 depends on T007
- **US2 (Phase 4)**: Depends on Phase 2 — T009 and T010 can run in parallel; T011 depends on T010; T012 depends on T007 and T009; T013 depends on T011 and T012
- **US3 (Phase 5)**: Depends on Phase 3 (ProgressChart must accept `showFoodNoise` prop) — T014 and T015 can run in sequence
- **Polish (Phase 6)**: Depends on all user story phases complete

### Parallel Opportunities

- T001 + T002 (migration files) — parallel
- T004 + T005 (LogForm + useProgressEntries) — parallel within US1
- T009 + T010 (useWellbeingHistory + useWellbeingCheckIn) — parallel within US2
- T016 + T017 (polish reviews) — parallel

---

## Parallel Example: User Story 1

```bash
# Run T004 and T005 simultaneously (different files, no dependency):
Task: "Update LogForm.tsx — add food noise score field"
Task: "Update useProgressEntries.ts — expose food_noise_score"

# After both complete, run T006:
Task: "Update ProgressChart.tsx — add violet food noise series + toggle"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Migrations (T001, T002)
2. Complete Phase 2: Types (T003)
3. Complete Phase 3: US1 (T004–T008)
4. **STOP and VALIDATE**: Log a food noise score, verify chart series renders at 3+ points
5. Migrations must be applied to Supabase dashboard by user before testing end-to-end

### Incremental Delivery

1. Setup + Foundational → migrations + types ready
2. US1 → food noise in log form and chart → validate → deploy
3. US2 → weekly check-in card → validate → deploy
4. US3 → doctor view additions → validate → deploy
5. Polish → clean up guards and empty states

---

## Notes

- Migrations (T001, T002) create SQL files only — the user must apply them via the Supabase dashboard SQL editor before testing Supabase-dependent features end-to-end
- Food noise milestone logic must use `localStorage` for dismissal keyed to a data fingerprint — same pattern as `useConsecutiveMiss` in feature 003
- The `toY(v, 1, 5)` normalisation function already exists in `ProgressChart.tsx` for hunger scores — food noise reuses it exactly
- `localDate()` utility from `usePatientDosageSchedule.ts` should be reused for UTC-safe date comparisons in any 7-day gate or calendar-week logic
- All new components must use existing token classes (`.card`, `.btn`, `.btn-primary`, `.btn-ghost`, `.input`, `.badge`) — no inline colour values except the violet chart series `#7C5CBF`
