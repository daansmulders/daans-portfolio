# Tasks: Log Entry Card Redesign

**Input**: Design documents from `/specs/010-log-entry-cards/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Foundational (Shared Component + Toggle)

**Purpose**: Create the LogEntryCard component and variant toggle that both user stories depend on

**CRITICAL**: No user story integration can begin until this phase is complete

- [x] T001 Add i18n keys for card labels: food noise badge label, "+N meer" overflow text, and notes section label in `prototypes/sliminject/src/i18n/nl.ts`
- [x] T002 Create `LogEntryCard` component with `variant` prop (`'expandable' | 'detail'`), accepting `ProgressEntry`, `isInjectionDay`, `isExpanded`, and `onToggle` props. Render date (always), injection day badge, and weight as the card header row in `prototypes/sliminject/src/features/patient/dashboard/LogEntryCard.tsx`
- [x] T003 Implement Variant B (full detail) layout in `LogEntryCard`: below the header row, render hunger score badge, food noise score badge, symptom chips (max 3 with "+N meer" overflow), and truncated notes (2-line clamp). Only render non-null fields. Use existing design tokens and badge/chip classes in `prototypes/sliminject/src/features/patient/dashboard/LogEntryCard.tsx`
- [x] T004 Implement Variant A (expandable accordion) layout in `LogEntryCard`: collapsed state shows header row only with a chevron affordance. Expanded state reveals the same detail content as Variant B. Chevron rotates on expand. Animate expand/collapse with CSS transition in `prototypes/sliminject/src/features/patient/dashboard/LogEntryCard.tsx`
- [x] T005 Handle legacy symptom entries in `LogEntryCard`: entries with `severity === 0` show symptom name only (no severity badge). Entries with `severity > 0` show "Name N/5" format in `prototypes/sliminject/src/features/patient/dashboard/LogEntryCard.tsx`
- [x] T006 Create `useCardVariant` hook: reads `?card=a` or `?card=b` from URL search params using `useSearchParams()`. Returns `'expandable'` for `a`, `'detail'` for `b`, defaults to `'detail'` in `prototypes/sliminject/src/features/patient/dashboard/useCardVariant.ts`

**Checkpoint**: LogEntryCard component ready with both variants. Integration can begin.

---

## Phase 2: User Story 1 — Patient Reviews Log Entries (Priority: P1) MVP

**Goal**: Patient sees all logged data in recent entries on the dashboard

**Independent Test**: Log in as patient, view dashboard. Recent entries show weight, hunger, food noise, symptoms with severity, and notes. Append `?card=a` to URL — cards collapse to date+weight, tap to expand.

### Implementation for User Story 1

- [x] T007 [US1] Update `PatientDashboard.tsx` recent entries section: replace inline entry rendering with `LogEntryCard` components. Add `expandedId` state and `onToggle` handler for accordion behavior. Pass variant from `useCardVariant()` hook in `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx`
- [x] T008 [US1] Verify injection day badge passes through correctly: ensure `isInjectionDay` prop is computed from `injectionDateSet` and passed to each `LogEntryCard` in `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx`

**Checkpoint**: Patient dashboard shows full entry data. Variant toggle works via URL parameter.

---

## Phase 3: User Story 2 — Doctor Reviews Patient Log History (Priority: P1)

**Goal**: Doctor sees full log entry details in the Overzicht tab of a patient's profile

**Independent Test**: Log in as doctor, open a patient profile. Overzicht tab shows 5 recent entries with weight, hunger, food noise, symptoms (with severity for new entries, name-only for legacy), and notes. `?card=a` works here too.

### Implementation for User Story 2

- [x] T009 [US2] Update `PatientProfile.tsx` Overzicht tab: replace the inline recent entries section (added in feature 009) with `LogEntryCard` components. Add accordion state. Pass variant from `useCardVariant()`. Show 5 entries in `prototypes/sliminject/src/features/doctor/patient/PatientProfile.tsx`

**Checkpoint**: Both patient and doctor views use the shared LogEntryCard. Both variants work in both views.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Visual polish and edge case verification

- [x] T010 [P] Verify edge cases: minimal entry (only hunger), maximal entry (all fields + 9 symptoms → shows 3 chips + "+6 meer"), entry with notes only, entry with no weight
- [x] T011 [P] Visual polish on mobile (≤ 700px): ensure both variants are readable without horizontal scroll. Test with varying data density. Verify card spacing is consistent between minimal and maximal entries
- [x] T012 [P] Clean up: remove old inline entry rendering code from PatientDashboard and PatientProfile that was replaced by LogEntryCard. Verify no hardcoded hex colors in new component — use design tokens

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on Phase 1 (needs LogEntryCard component)
- **US2 (Phase 3)**: Depends on Phase 1 (needs LogEntryCard component) — can run in parallel with US1
- **Polish (Phase 4)**: Depends on Phases 2 and 3

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 1 — no dependency on US2
- **User Story 2 (P1)**: Can start after Phase 1 — no dependency on US1
- **US1 and US2 can run in parallel** since they modify different files

### Within Each User Story

- Component before integration
- Variant B before Variant A (B is default, A extends it)
- Core rendering before edge cases

### Parallel Opportunities

- T007 and T009 can run in parallel (different files: PatientDashboard vs PatientProfile)
- T010, T011, T012 can all run in parallel in Polish phase

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: LogEntryCard + variant toggle
2. Complete Phase 2: US1 — patient dashboard integration
3. **STOP and VALIDATE**: View dashboard with both `?card=a` and `?card=b`, verify all fields visible
4. Patient can now see full entry data on dashboard

### Incremental Delivery

1. Phase 1 → Shared component ready
2. Phase 2 (US1) → Patient dashboard updated → **MVP**
3. Phase 3 (US2) → Doctor view updated
4. Phase 4 → Polish and edge cases

Each phase adds value without breaking previous work.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- New component goes in `prototypes/sliminject/src/features/patient/dashboard/`
- All strings must use i18n keys — no hardcoded Dutch text in components
- Use design tokens (brand/warm/accent colors) — no hardcoded hex
- Commit after each task or logical group
