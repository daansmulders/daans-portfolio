# Tasks: Dose Change Visibility

**Input**: `/specs/007-dose-change-visibility/`
**Stack**: TypeScript 5.9, React 19, Tailwind CSS 4, Supabase JS v2
**Root**: `prototypes/sliminject/src/`

---

## Phase 1: Setup

**Purpose**: Add i18n keys and the shared dose change detection hook used across all user stories.

- [X] T001 [P] Add i18n keys for dose change visibility to `prototypes/sliminject/src/i18n/nl.ts`: `dosis_marker_label`, `dosis_aankondiging_titel`, `dosis_aankondiging_tekst`, `dosis_aankondiging_bijwerking`, `dosis_nieuw_label`, `dosis_nieuw_bijwerking`, `dosis_tooltip`
- [X] T002 [P] Create `prototypes/sliminject/src/features/patient/medication/useDoseChanges.ts` — derives dose steps from approved schedule entries (for chart markers), computes announcement eligibility (7-day lookahead, localStorage dismissal), computes `isNewDose` status (current dose differs from previous, fewer than 2 confirmed adherence records at current level); exports `{ doseSteps, announcement, dismissAnnouncement, isNewDose, newDoseMg, confirmedAtCurrentDose }`

---

## Phase 2: Foundational

**Purpose**: No blocking prerequisites beyond Phase 1. The `useDoseChanges` hook is the only shared dependency and is created in Phase 1.

**Checkpoint**: T001 + T002 complete — all three user stories can now begin.

---

## Phase 3: User Story 1 — Dose annotations on progress chart (Priority: P1) 🎯 MVP

**Goal**: Patients and doctors see vertical dose markers on the progress chart at each dose change date.

**Independent Test**: Log in as `patient@demo.nl` (Lars, 2 approved doses). Open dashboard → chart shows a dashed vertical marker at the 0.5 mg dose change date. Tap it → tooltip shows "0.5 mg — gestart op [datum]". Log in as `dokter@demo.nl` → open Lars's profile → same markers on the Overzicht chart.

- [X] T003 [US1] Update `prototypes/sliminject/src/features/patient/dashboard/ProgressChart.tsx` — add optional `doseSteps?: { date: string; dose_mg: number }[]` prop; for each step after the first, render a dashed vertical line (`stroke="#AAA49C"`, `strokeDasharray="2 2"`, `opacity="0.6"`) at the x-position of the nearest progress entry by date; render a small dose label (`"0.5 mg"`) at the top of each marker line; add tap/hover interaction that shows a tooltip text element: `"{dose} mg — gestart op {datum}"` formatted in Dutch locale
- [X] T004 [US1] Update `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx` — import `useDoseChanges`; pass `doseSteps` from the hook to `<ProgressChart doseSteps={doseSteps} />`
- [X] T005 [US1] Update `prototypes/sliminject/src/features/doctor/patient/PatientProfile.tsx` — import `useDosageSchedule` entries; derive `doseSteps` (approved entries mapped to `{ date, dose_mg }`); pass to `<ProgressChart doseSteps={doseSteps} />` on the Overzicht tab

**Checkpoint**: US1 fully functional. Both patient and doctor chart views show dose markers.

---

## Phase 4: User Story 2 — Pre-increase announcement card (Priority: P2)

**Goal**: A contextual card appears on the patient dashboard when a dose increase is within 7 days.

**Independent Test**: Modify seed so Lars has an approved 1.0 mg entry 5 days from now. Log in → announcement card appears. Dismiss it → refresh → card stays dismissed.

- [X] T006 [US2] Update `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx` — import `announcement` and `dismissAnnouncement` from `useDoseChanges`; when `announcement` is not null, render an `.alert-amber` card between the injection-day section and doctor messages section showing the upcoming dose, anticipatory side-effect text, and a dismiss button (✕); dismiss button calls `dismissAnnouncement(announcement.entryId)`

**Checkpoint**: US2 functional. Announcement card appears, dismisses, and persists across refreshes.

---

## Phase 5: User Story 3 — Injection-day "Nieuwe dosis" marker (Priority: P3)

**Goal**: On injection day, if this is the first or second injection at a new dose level, the injection-day card shows a "Nieuwe dosis" context block.

**Independent Test**: Modify seed so Sara has a previous lower dose before today's dose. Log in → injection-day card shows "Nieuwe dosis: 0.25 mg" alert block above the confirmation question.

- [X] T007 [US3] Update `prototypes/sliminject/src/features/patient/adherence/InjectionDayCard.tsx` — add `isNewDose?: boolean` and `newDoseMg?: number | null` props; when `isNewDose` is true and `step === 'confirm'`, render a small `.alert-amber` block inside the card before the question text showing the new dose amount and brief side-effect guidance
- [X] T008 [US3] Update `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx` — pass `isNewDose` and `newDoseMg` from `useDoseChanges` to `<InjectionDayCard />`

**Checkpoint**: US3 functional. "Nieuwe dosis" marker appears for first 2 injections at new dose.

---

## Phase 6: Polish & Validation

**Purpose**: Seed data update for testability and type check.

- [X] T009 [P] Update `prototypes/sliminject/supabase/seed.js` — change Lars's 1.0 mg entry from `status: 'draft'` to `status: 'approved'` and `start_date` to 5 days from now, so the announcement card is testable after seeding
- [X] T010 Run `npx tsc --noEmit` in `prototypes/sliminject/` and fix any TypeScript errors

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately. T001 and T002 can run in parallel.
- **Phase 3 (US1)**: Depends on T002 (useDoseChanges hook)
- **Phase 4 (US2)**: Depends on T002 (useDoseChanges hook); can run in parallel with US1
- **Phase 5 (US3)**: Depends on T002 (useDoseChanges hook); can run in parallel with US1 and US2
- **Phase 6 (Polish)**: Depends on all user stories being complete

### User story dependencies

- **US1 (P1)**: Only needs T002. Core of the feature — chart markers.
- **US2 (P2)**: Only needs T002. Independent of US1 — different dashboard section.
- **US3 (P3)**: Only needs T002. Extends InjectionDayCard — independent of US1/US2.

### Parallel opportunities

- T001 and T002 can run in parallel (different files)
- T004 and T005 can run in parallel (different files — dashboard vs doctor profile)
- US1, US2, and US3 can all begin in parallel once T002 is complete
- T009 and T010 can run in parallel

---

## Parallel Example: After Phase 1

```
T003 — ProgressChart dose markers    (ProgressChart.tsx)
T006 — Announcement card             (PatientDashboard.tsx)
T007 — Injection-day marker          (InjectionDayCard.tsx)
```

T003 and T007 can run simultaneously (different files). T004/T006/T008 all touch PatientDashboard.tsx and must be sequential.

---

## Implementation Strategy

### MVP (US1 only — 4 tasks)

1. T001 — i18n keys
2. T002 — useDoseChanges hook
3. T003 — ProgressChart dose markers
4. T004 — PatientDashboard wiring
5. T005 — Doctor profile wiring
6. **STOP**: Verify Scenario 1 + 2 from quickstart.md

### Full delivery

Add T006 (US2 announcement card) → T007–T008 (US3 injection-day marker) → T009–T010 (polish)
