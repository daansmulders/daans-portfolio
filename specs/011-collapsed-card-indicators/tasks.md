# Tasks: Collapsed Entry Card Indicators

**Input**: Design documents from `/specs/011-collapsed-card-indicators/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: User Story 1 — Side-Effect Dot Indicator (Priority: P1) MVP

**Goal**: Collapsed entry cards show a coloured dot when symptoms were logged, with mild/severe distinction

**Independent Test**: Log in as patient, view dashboard. Entries with symptoms show a small dot (green for mild, amber for severity ≥ 4). Entries without symptoms show no dot.

### Implementation for User Story 1

- [x] T001 [US1] Add `SideEffectDot` subcomponent to `LogEntryCard`: renders a 7px coloured circle. Brand colour (`#2D7A5E`) when all symptom severities ≤ 3 (including legacy severity 0), amber (`#A85C0A`) when any severity ≥ 4. Returns null when `symptoms.length === 0`. In `prototypes/sliminject/src/features/patient/dashboard/LogEntryCard.tsx`
- [x] T002 [US1] Place `SideEffectDot` in the collapsed header row of `LogEntryCard`, between the date/injection-badge group and the weight/chevron group. Ensure it renders in both collapsed and expanded states. In `prototypes/sliminject/src/features/patient/dashboard/LogEntryCard.tsx`

**Checkpoint**: Collapsed cards show side-effect dots. Green for mild, amber for severe. No dot when no symptoms.

---

## Phase 2: User Story 2 — Compact Score Summary (Priority: P2)

**Goal**: Collapsed entry cards show abbreviated hunger and food noise scores

**Independent Test**: Log in as patient, view dashboard. Entries with hunger/food noise show compact "H3 V2" style indicators in muted text. Entries without scores show nothing.

### Implementation for User Story 2

- [x] T003 [P] [US2] Add i18n keys for abbreviated score labels: `card_honger_kort` ("H") and `card_voedselruis_kort` ("V") in `prototypes/sliminject/src/i18n/nl.ts`
- [x] T004 [US2] Add `ScoreSummary` subcomponent to `LogEntryCard`: renders compact abbreviated scores (e.g., "H3 V2") using muted colour (`#AAA49C`), small font size (text-xs). Shows each score only if non-null. Returns null when neither hunger_score nor food_noise_score is present. In `prototypes/sliminject/src/features/patient/dashboard/LogEntryCard.tsx`
- [x] T005 [US2] Place `ScoreSummary` in the collapsed header row of `LogEntryCard`, after `SideEffectDot` and before the weight/chevron group. In `prototypes/sliminject/src/features/patient/dashboard/LogEntryCard.tsx`

**Checkpoint**: Collapsed cards show abbreviated scores alongside the side-effect dot. Row fits on mobile without wrapping.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases and mobile layout verification

- [x] T006 [P] Verify mobile layout (375px width): collapsed row with all indicators present (injection badge + date + dot + scores + weight + chevron) does not wrap. Adjust spacing if needed in `prototypes/sliminject/src/features/patient/dashboard/LogEntryCard.tsx`
- [x] T007 [P] Verify edge cases: entry with no optional data (no indicators shown), entry with only hunger (shows "H3" only, no dot), entry with 4+ severity symptom (amber dot), legacy entry with severity 0 symptoms (green dot)

---

## Dependencies & Execution Order

### Phase Dependencies

- **US1 (Phase 1)**: No dependencies — start immediately
- **US2 (Phase 2)**: Can start after US1 (dot is placed first, score summary goes next to it)
- **Polish (Phase 3)**: Depends on both US1 and US2

### Parallel Opportunities

- T003 (i18n) can run in parallel with T001–T002 (different file)
- T006 and T007 can run in parallel in Polish phase

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Side-effect dot
2. **STOP and VALIDATE**: Check dot appears on entries with symptoms, correct colours
3. Patients can now see at a glance which days had side effects

### Incremental Delivery

1. Phase 1 (US1) → Side-effect dot works → **MVP**
2. Phase 2 (US2) → Score summary added
3. Phase 3 → Polish and edge cases

Each phase adds value without breaking previous work.

---

## Notes

- All changes go into one existing file: `LogEntryCard.tsx` (plus i18n keys)
- Use design tokens — no hardcoded hex colours except existing palette values
- Indicators render in both patient dashboard and doctor view automatically (shared component)
- Commit after each phase
