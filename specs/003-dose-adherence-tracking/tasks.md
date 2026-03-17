# Tasks: Dose Adherence Tracking

**Input**: Design documents from `/specs/003-dose-adherence-tracking/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: New feature directory and migration file in place before any story work begins.

- [x] T001 Create feature directory `prototypes/sliminject/src/features/patient/adherence/`
- [x] T002 Create Supabase migration file `prototypes/sliminject/supabase/migrations/016_injection_adherence.sql` with `injection_adherence` table, unique constraint `(patient_id, schedule_entry_id)`, check constraint on `response`, and RLS policies (patient INSERT/SELECT own rows; doctor SELECT via `get_my_patient_ids()`)

**Checkpoint**: Migration file ready — can be applied to the local Supabase instance before story work.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared data hook used by both the patient check-in (US1) and the doctor view (US3).

- [x] T003 Create `prototypes/sliminject/src/hooks/useAdherence.ts` — exports `usePatientAdherence(patientId)` that fetches all `injection_adherence` rows for a given patient, ordered by `recorded_at` DESC; used by both patient dashboard and doctor profile

**Checkpoint**: Shared hook available — US1 and US3 can now proceed independently.

---

## Phase 3: User Story 1 — Patient logs injection check-in (Priority: P1) 🎯 MVP

**Goal**: Patient sees a check-in prompt on their dashboard on/after injection day, responds, and the answer is saved.

**Independent Test**: Log in as a patient with an active dosage schedule. Confirm the prompt appears on the dashboard on/after the scheduled injection date. Submit each of the three responses in turn and verify the prompt disappears and the entry appears in log history. Confirm the prompt does not reappear until the next cycle.

### Implementation

- [x] T004 [P] [US1] Create `prototypes/sliminject/src/features/patient/adherence/useAdherenceCheckIn.ts` — hook that determines whether the check-in prompt is due (current cycle's `dosage_schedule_entries` row has no matching `injection_adherence` record and `start_date <= today`) and exposes a `submitAdherence(response, note?)` function that inserts to Supabase; show Sonner error toast on failure
- [x] T005 [P] [US1] Create `prototypes/sliminject/src/features/patient/adherence/AdherenceCheckIn.tsx` — card component rendering the prompt with three response buttons ("Ja, genomen" / "Nee, overgeslagen" / "Andere dosis"); "Andere dosis" expands an optional free-text note field before submitting; use existing `.card`, `.btn`, `.btn-primary`, `.btn-ghost`, `.input` token classes; component is self-dismissing on successful submit
- [x] T006 [US1] Integrate `AdherenceCheckIn` into `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx` — render between the Log CTA section and the doctor messages section; conditionally render only when `useAdherenceCheckIn` returns `isDue: true`

**Checkpoint**: US1 fully functional. Patient can complete the check-in flow end-to-end. Prompt disappears after submission and does not reappear in the same cycle.

---

## Phase 4: User Story 2 — Consecutive missed dose nudge (Priority: P2)

**Goal**: After two consecutive skipped injection cycles the patient sees a gentle nudge on the dashboard linking to the concern submission screen.

**Independent Test**: Using a patient account, submit "Nee, overgeslagen" for two consecutive scheduled injection cycles. Reload the dashboard and confirm the nudge appears. Tap the CTA and confirm the concern screen opens. Dismiss the nudge and confirm it does not reappear. Submit "Ja, genomen" for the next cycle and confirm the nudge is absent.

### Implementation

- [x] T007 [US2] Create `prototypes/sliminject/src/features/patient/adherence/useConsecutiveMiss.ts` — derives consecutive-miss state from the last two adherence records (both must be `response === 'skipped'`; `null`/no-response does not count); exposes `isConsecutiveMiss: boolean` and `dismiss()` (stores dismissal in `localStorage` keyed to the last skipped record's `id` to prevent re-showing until a new miss occurs)
- [x] T008 [US2] Add consecutive-miss nudge UI to `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx` — render a dismissible `.alert-amber` card ("Je hebt je injectie twee keer overgeslagen — wil je je arts een berichtje sturen?") with a CTA that navigates to the concern submission route; render below the `AdherenceCheckIn` prompt using `useConsecutiveMiss`

**Checkpoint**: US2 fully functional. Nudge appears reliably after two consecutive skips, CTA links to concerns, dismissal persists across reloads, and confirming an injection clears the nudge.

---

## Phase 5: User Story 3 — Doctor views adherence on patient profile (Priority: P3)

**Goal**: Doctor sees a per-cycle adherence indicator alongside each titration timeline entry on the patient's Medicatie tab.

**Independent Test**: Open a patient profile in the doctor view with at least 3 weeks of schedule entries, one of which has a confirmed response, one skipped, and one with no response. Confirm each entry on the Medicatie tab shows the correct indicator. Confirm no error state appears for the no-response entry.

### Implementation

- [x] T009 [US3] Update the doctor's patient Medicatie tab in `prototypes/sliminject/src/features/doctor/patient/MedicatieTab.tsx` (or equivalent file) to call `useAdherence(patientId)` (from T003) and LEFT JOIN adherence data onto each `dosage_schedule_entries` row by `schedule_entry_id`
- [x] T010 [US3] Add `AdherenceBadge` inline component in `prototypes/sliminject/src/features/doctor/patient/MedicatieTab.tsx` — renders a small status pill per timeline entry: "Genomen" (brand-600 green), "Overgeslagen" (accent-600 amber), "Aangepaste dosis" (warm-400 neutral), "Niet ingevuld" (warm-200 muted); use existing `.badge` token class with appropriate color variants

**Checkpoint**: US3 fully functional. Doctor sees adherence status per cycle without leaving the Medicatie tab.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T011 [P] Add `injection_adherence` type to `prototypes/sliminject/src/lib/supabase.ts` (or the project's generated types file) so all hooks benefit from TypeScript inference
- [x] T012 Smoke-test the full flow end-to-end: patient check-in → consecutive miss nudge → doctor Medicatie tab view, across at least one weekly and one daily injection schedule

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (migration must exist before the hook queries it)
- **Phase 3 (US1)**: Depends on Phase 2
- **Phase 4 (US2)**: Depends on Phase 3 (consecutive-miss reads the same adherence records US1 creates)
- **Phase 5 (US3)**: Depends on Phase 2 only — can run in parallel with US1/US2 after T003
- **Phase 6 (Polish)**: Depends on all story phases complete

### User Story Dependencies

- **US1 (P1)**: Foundational phase complete → can start
- **US2 (P2)**: US1 complete (needs real adherence records to test consecutive miss)
- **US3 (P3)**: Foundational phase complete → can run in parallel with US1

### Parallel Opportunities

- T004 and T005 (US1 hook + component) can be built in parallel — different files
- T009 and T010 can be developed together — same file, sequential
- T011 can be done at any point after T003

---

## Parallel Example: User Story 1

```
# These two tasks have no shared dependencies — build in parallel:
T004: useAdherenceCheckIn.ts  (hook logic, Supabase insert)
T005: AdherenceCheckIn.tsx    (UI component, no data fetching)

# Then wire together:
T006: PatientDashboard.tsx    (depends on T004 + T005)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003)
3. Complete Phase 3: User Story 1 (T004–T006)
4. **STOP and VALIDATE**: Patient can complete the check-in end-to-end
5. Demo if ready

### Incremental Delivery

1. Phase 1 + 2 → infrastructure ready
2. US1 (T004–T006) → check-in prompt live, independently testable
3. US2 (T007–T008) → consecutive-miss nudge live
4. US3 (T009–T010) → doctor view complete
5. Phase 6 → types + smoke test

---

## Notes

- No Dexie offline queue for adherence — online-only write (see research.md Decision 3)
- "No response" is represented by the absence of a row, not a null `response` field — the unique constraint ensures one record per cycle
- The `localDate()` utility in `usePatientDosageSchedule.ts` should be reused in `useAdherenceCheckIn.ts` to avoid UTC offset issues when comparing `start_date` to today
- Dismissal of the consecutive-miss nudge is stored in `localStorage` (same pattern as notification preferences) — no backend call needed
