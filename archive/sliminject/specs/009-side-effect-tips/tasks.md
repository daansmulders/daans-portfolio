# Tasks: Side Effect Management Tips

**Input**: Design documents from `/specs/009-side-effect-tips/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Foundational (Data Model + Types)

**Purpose**: Type definitions and data layer changes that block all user stories

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Define `SymptomEntry` type (`{ name: string, severity: number }`) and `normalizeSymptoms()` backward-compat helper that converts legacy `string[]` entries to `SymptomEntry[]` in `prototypes/sliminject/src/lib/supabase.ts`
- [x] T002 Update Dexie schema version and `OfflineProgressEntry` interface to use `SymptomEntry[]` for symptoms in `prototypes/sliminject/src/lib/db.ts`
- [x] T003 [P] Add severity-related i18n keys to `prototypes/sliminject/src/i18n/nl.ts`: severity scale labels (1=Licht, 2=Mild, 3=Matig, 4=Ernstig, 5=Zeer ernstig), severity field label, and doctor nudge text

**Checkpoint**: Types and data layer ready — user story implementation can begin

---

## Phase 2: User Story 1 — Severity-Aware Symptom Logging (Priority: P1) MVP

**Goal**: Patients can select symptoms with a 1–5 severity score. Tapping a chip activates at severity 1; severity is adjustable but not required.

**Independent Test**: Log an entry with two symptoms at different severities. Verify severity values are stored and visible in log history.

### Implementation for User Story 1

- [x] T004 [US1] Create `SeveritySelector` component: compact inline row of 5 buttons (1–5) matching hunger score visual pattern but smaller, with severity labels from i18n, in `prototypes/sliminject/src/features/patient/symptoms/SeveritySelector.tsx`
- [x] T005 [US1] Update `LogEntryForm` symptom section: replace binary chip toggles with chip + severity flow. Tapping a chip activates at severity 1 and reveals `SeveritySelector` below it. Tapping again deselects. Store `SymptomEntry[]` instead of `string[]` on submit in `prototypes/sliminject/src/features/patient/dashboard/LogEntryForm.tsx`
- [x] T006 [US1] Update `useProgressEntries` hook: ensure `addEntry()` accepts and passes through `SymptomEntry[]` for symptoms field, and entries returned use `normalizeSymptoms()` so both legacy and new entries are consistently typed in `prototypes/sliminject/src/features/patient/dashboard/useProgressEntries.ts`

**Checkpoint**: Severity logging works end-to-end. Symptoms saved with severity scores, visible in stored entries.

---

## Phase 3: User Story 2 + User Story 4 — Contextual Tips with Full Coverage (Priority: P1/P2)

**Goal**: After logging symptoms, patient sees a brief, actionable, rotating tip for the most relevant symptom. All 9 symptoms covered with 2–3 tip variants each.

**Independent Test**: Log each of the 9 symptoms individually — each produces a tip. Log nausea again within 7 days — no tip. After 7 days — a different tip variant appears.

### Implementation for User Stories 2 & 4

- [x] T007 [US2] Restructure `symptomTips.ts`: change `SymptomTip` interface from `{ symptom, tip, priority }` to `{ symptom, tips: { heading, body }[], priority }`. Expand existing 6 symptoms to 2–3 variants each. Add tips for the 4 missing symptoms (maagklachten, hoofdpijn, droge mond, duizeligheid). All content in Dutch, warm editorial tone, 1–2 sentences per tip in `prototypes/sliminject/src/features/patient/symptoms/symptomTips.ts`
- [x] T008 [US2] Update `useSymptomTipThrottle`: change localStorage value from plain timestamp to `{ timestamp, variantIndex }` JSON. Add backward compat for old plain-number format. Add `getNextVariantIndex(symptom, totalVariants)` helper that returns the next sequential index (wrapping around) in `prototypes/sliminject/src/features/patient/symptoms/useSymptomTipThrottle.ts`
- [x] T009 [US2] Update `selectTip()` function: accept severity data parameter (for Phase 4 nudge logic). Return the correct tip variant based on rotation index from throttle. Update return type to include `{ symptom, heading, body, priority }` in `prototypes/sliminject/src/features/patient/symptoms/symptomTips.ts`
- [x] T010 [US2] Update post-log flow in `LogEntryForm`: use updated `selectTip()` with new return shape. Display tip using heading + body instead of single string. Ensure 7-day throttle and rotation work correctly in `prototypes/sliminject/src/features/patient/dashboard/LogEntryForm.tsx`
- [x] T011 [P] [US4] Add all tip variant i18n content to `prototypes/sliminject/src/i18n/nl.ts` — tip headings and bodies for all 9 symptoms (18–22 variants total), ensuring consistent warm editorial tone

**Checkpoint**: All 9 symptoms produce rotating tips. Throttle works per-symptom with 7-day cooldown. Tip variants rotate on repeat views.

---

## Phase 4: User Story 3 — Doctor-Contact Nudge (Priority: P2)

**Goal**: When any symptom is logged at severity 4–5, a caring doctor-contact nudge replaces the regular tip on the post-log screen.

**Independent Test**: Log nausea at severity 5 — doctor nudge appears (no regular tip). Log nausea at severity 2 — regular tip appears (no nudge).

**Depends on**: Phase 2 (severity data) and Phase 3 (tip flow)

### Implementation for User Story 3

- [x] T012 [US3] Create `DoctorNudge` component: warm-toned card with heading (e.g., "Je arts kan je helpen"), body text referencing the severe symptom, and a button linking to `/patient/concerns`. Visually distinct from regular tip cards (different border/background color, slightly more prominent) in `prototypes/sliminject/src/features/patient/symptoms/DoctorNudge.tsx`
- [x] T013 [US3] Update post-log flow in `LogEntryForm`: after submit, check if any symptom has severity >= 4. If yes → show `DoctorNudge` instead of tip card (nudge replaces tip). If no → show tip per existing logic. If no eligible tip → navigate to dashboard. Handle edge case: multiple severe symptoms → single nudge referencing highest-priority symptom in `prototypes/sliminject/src/features/patient/dashboard/LogEntryForm.tsx`

**Checkpoint**: Severity 4–5 triggers doctor nudge. Severity 1–3 shows regular tip. Nudge links to concerns flow.

---

## Phase 5: User Story 5 — Editorial Tip Card Design (Priority: P3)

**Goal**: Tip cards and doctor nudges are visually polished with editorial quality — warm, readable, with symptom-category icons.

**Independent Test**: Visual review of tip cards across all 9 symptom types + doctor nudge. Consistent layout, warm tone, clear visual distinction between tips and nudges.

### Implementation for User Story 5

- [x] T014 [US5] Extract tip display from `LogEntryForm` into a dedicated `TipCard` component: symptom-specific inline SVG icon, heading with typography hierarchy, body text, dismiss button. Use design tokens (brand colors, warm palette, card patterns) in `prototypes/sliminject/src/features/patient/symptoms/TipCard.tsx`
- [x] T015 [US5] Update `LogEntryForm` to use the extracted `TipCard` component for tip display and `DoctorNudge` for severity 4–5 flow in `prototypes/sliminject/src/features/patient/dashboard/LogEntryForm.tsx`
- [x] T016 [P] [US5] Refine `DoctorNudge` visual design: ensure it is visually distinct from `TipCard` (more prominent but not alarming), uses appropriate color tokens (e.g., accent or warm palette, not danger-red), includes a caring icon in `prototypes/sliminject/src/features/patient/symptoms/DoctorNudge.tsx`

**Checkpoint**: Tip cards and nudges are editorially polished. Visual review confirms warm, helpful tone.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Doctor-side visibility (FR-011), edge cases, and cleanup

- [x] T017 Update `PatientProfile` Overzicht tab: add symptom chips with severity indicators to log entries display. Use `normalizeSymptoms()` for backward compat — historical entries show symptom name only (no severity badge), new entries show name + severity in `prototypes/sliminject/src/features/doctor/patient/PatientProfile.tsx`
- [x] T018 [P] Verify edge cases: multiple severe symptoms → single nudge with highest-priority symptom; all tips throttled → standard success + auto-navigate; offline logging → tips and nudges work identically; first-time logger → always shows tip; historical entries → display gracefully without severity
- [x] T019 [P] Review and clean up unused code: remove old single-tip `SymptomTip` interface remnants, verify no hardcoded hex colors in new components, ensure all new strings use i18n keys from `prototypes/sliminject/src/i18n/nl.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on Phase 1 (needs SymptomEntry type)
- **US2+US4 (Phase 3)**: Depends on Phase 1 (needs SymptomEntry type for selectTip severity parameter)
- **US3 (Phase 4)**: Depends on Phase 2 (severity data) + Phase 3 (tip flow to branch from)
- **US5 (Phase 5)**: Depends on Phase 3 (TipCard extraction) + Phase 4 (DoctorNudge exists)
- **Polish (Phase 6)**: Depends on Phases 2–5

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 1 — no dependency on other stories
- **US2+US4 (P1/P2)**: Can start after Phase 1 — parallel with US1
- **US3 (P2)**: Needs US1 (severity data in form) and US2 (tip flow to branch from)
- **US5 (P3)**: Needs US2 (tip card to extract) and US3 (nudge to refine)

### Within Each User Story

- Types/data before components
- Components before integration into LogEntryForm
- Core implementation before visual polish

### Parallel Opportunities

- T002 and T003 can run in parallel (different files)
- T004 and T006 can run in parallel within US1 (different files)
- T007 and T011 can run in parallel within US2/US4 (tips data vs i18n)
- T014 and T016 can run in parallel within US5 (TipCard vs DoctorNudge)
- T017, T018, T019 can all run in parallel in Polish phase
- **US1 and US2+US4 can run in parallel** after Phase 1 (different files until LogEntryForm integration)

---

## Parallel Example: After Phase 1

```text
# US1 and US2+US4 can start simultaneously:

Stream A (US1 — severity input):
  T004: SeveritySelector.tsx
  T005: LogEntryForm.tsx (symptom section)
  T006: useProgressEntries.ts

Stream B (US2+US4 — tips system):
  T007: symptomTips.ts (restructure + content)
  T008: useSymptomTipThrottle.ts (rotation)
  T009: symptomTips.ts (selectTip update)
  T011: nl.ts (tip content)

# Streams merge at T010 + T013 (LogEntryForm post-log flow)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational types
2. Complete Phase 2: US1 — severity logging
3. **STOP and VALIDATE**: Log entries with severity, verify storage
4. Patients can now indicate symptom severity (existing tips still work with old logic)

### Incremental Delivery

1. Phase 1 → Types ready
2. Phase 2 (US1) → Severity logging works → **MVP**
3. Phase 3 (US2+US4) → Enriched rotating tips for all 9 symptoms
4. Phase 4 (US3) → Doctor nudge for severe symptoms
5. Phase 5 (US5) → Visual polish on tip cards
6. Phase 6 → Doctor visibility + edge cases

Each phase adds value without breaking previous work.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- All new components go in `prototypes/sliminject/src/features/patient/symptoms/`
- All strings must use i18n keys — no hardcoded Dutch text in components
- Use design tokens (brand/warm/accent colors) — no hardcoded hex
- Commit after each task or logical group
