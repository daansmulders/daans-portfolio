# Tasks: Sliminject UX Improvements

**Input**: Design documents from `specs/002-sliminject-ux-improvements/`
**Branch**: `002-sliminject-ux-improvements`
**Stack**: TypeScript 5.9 · React 19 · Vite 5 · Tailwind CSS 4 · Radix UI · Supabase JS v2 · Dexie.js 4

**Format**: `[ID] [P?] [Story?] Description — file path`
- **[P]**: Parallelisable (independent files, no blocking deps)
- **[USn]**: Maps to user story n from spec.md

---

## Phase 1: Setup

**Purpose**: Install dependencies and wire the Sonner toaster into the app root.

- [x] T001 Install `sonner` and `@radix-ui/react-tabs` — `prototypes/sliminject/package.json`
- [x] T002 Mount `<Toaster>` from sonner in app root — `prototypes/sliminject/src/App.tsx`

**Checkpoint**: `npm install` succeeds; `<Toaster>` renders (inspect DevTools).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure consumed by multiple user stories. MUST complete before user story phases.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Add ~25 new Dutch i18n strings: empty state messages, streak copy, log CTA labels, hunger anchors, symptom expand label, concern response times, advice visibility label, onboarding step 4 copy, content group headings, form toast messages — `prototypes/sliminject/src/i18n/nl.ts`
- [x] T004 [P] Create `EmptyState` component with props `(icon?, headingKey, bodyKey, cta?: {labelKey, href})` — `prototypes/sliminject/src/components/EmptyState.tsx`
- [x] T005 [P] Create toast utility wrapping `sonner`'s `toast.success` and `toast.error` with typed helpers `showSuccess(key)` / `showError(key)` — `prototypes/sliminject/src/lib/toast.ts`

**Checkpoint**: `EmptyState` renders in isolation; toast helpers callable from any module.

---

## Phase 3: User Story 1 — Consistent Form Feedback (Priority: P1) 🎯 MVP

**Goal**: Every form submission shows a visible success toast or inline error — no silent failures.

**Independent Test**: Submit each form → toast appears. Simulate error → error message shown.

- [x] T006 [US1] Apply `showSuccess` / `showError` toasts to log entry submission in `prototypes/sliminject/src/features/patient/dashboard/LogEntryForm.tsx` (including offline-queued variant)
- [x] T007 [P] [US1] Apply toast feedback to concern submission and doctor response in `prototypes/sliminject/src/features/patient/concerns/ConcernScreen.tsx`
- [x] T008 [P] [US1] Apply toast feedback to appointment form in `prototypes/sliminject/src/features/doctor/appointments/AppointmentForm.tsx`
- [x] T009 [P] [US1] Apply toast feedback to patient intake form in `prototypes/sliminject/src/features/doctor/intake/PatientIntakeForm.tsx`
- [x] T010 [P] [US1] Apply toast feedback to advice save in `prototypes/sliminject/src/features/doctor/patient/AdviceEditor.tsx`
- [x] T011 [P] [US1] Apply toast feedback to dosage schedule add/remove in `prototypes/sliminject/src/features/doctor/schedule/ScheduleEditor.tsx`

**Checkpoint**: All 6 forms give visible feedback on submit and on error.

---

## Phase 4: User Story 2 — Prominent Daily Log CTA (Priority: P1)

**Goal**: Patient dashboard shows a prominent "Log vandaag" button when not yet logged today, and a completion state when already logged.

**Independent Test**: Fresh patient account → "Log vandaag" button visible above the fold. Submit a log → button becomes "Vandaag gelogd ✓".

- [x] T012 [US2] Extend `useProgressEntries` to expose `hasLoggedToday: boolean` derived from today's local calendar date — `prototypes/sliminject/src/features/patient/dashboard/useProgressEntries.ts`
- [x] T013 [US2] Add prominent "Log vandaag" CTA (link to `/patient/log`) and completed "Vandaag gelogd ✓" badge to patient dashboard, conditionally rendered from `hasLoggedToday` — `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx`

**Checkpoint**: CTA visible when no log today; replaced by completion badge after logging.

---

## Phase 5: User Story 3 — Hunger Scale Labelled Anchors (Priority: P1)

**Goal**: The 1–5 wellbeing scale shows "Geen honger" at 1 and "Heel veel honger" at 5.

**Independent Test**: Open log form → both anchor labels visible flanking the scale.

- [x] T014 [US3] Add "Geen honger" (min) and "Heel veel honger" (max) anchor labels to the wellbeing score scale — `prototypes/sliminject/src/features/patient/dashboard/LogEntryForm.tsx`

**Checkpoint**: Both labels render; scale selection still saves `wellbeing_score` correctly.

---

## Phase 6: User Story 4 — Empty States for All Key Screens (Priority: P2)

**Goal**: Every screen with potential "no data" state shows a helpful empty state.

**Independent Test**: New patient account → all screens show empty states, not blank layouts.

- [x] T015 [US4] Render `<EmptyState>` in `PatientDashboard.tsx` when `progressEntries.length === 0`, with CTA linking to `/patient/log` — `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx`
- [x] T016 [P] [US4] Render `<EmptyState>` in `ConcernScreen.tsx` when `concerns.length === 0` — `prototypes/sliminject/src/features/patient/concerns/ConcernScreen.tsx`
- [x] T017 [P] [US4] Render `<EmptyState>` in `ContentScreen.tsx` when `contentItems.length === 0` (after load, not during loading) — `prototypes/sliminject/src/features/patient/content/ContentScreen.tsx`
- [x] T018 [P] [US4] Render `<EmptyState>` in `DoctorOverview.tsx` when `patients.length === 0`, with CTA linking to `/dokter/intake` — `prototypes/sliminject/src/features/doctor/overview/DoctorOverview.tsx`

**Checkpoint**: All 4 screens show a meaningful empty state with a next-action link.

---

## Phase 7: User Story 5 — Pre-Chart Streak Display (Priority: P2)

**Goal**: Patients with fewer than 7 days of data see a streak counter instead of an empty chart area.

**Independent Test**: Patient with 1–6 entries → streak counter shown. Patient with 7+ entries → progress chart shown.

- [x] T019 [US5] Add `streakDays` calculation to `useProgressEntries` using `Intl.DateTimeFormat` for local-date comparison; return `streakDays: number` and `hasEnoughDataForChart: boolean` — `prototypes/sliminject/src/features/patient/dashboard/useProgressEntries.ts`
- [x] T020 [US5] Create `StreakDisplay` component: streak count ("X dagen op rij!"), progress dots toward 7-day milestone, reset encouragement message for streak 0 — `prototypes/sliminject/src/features/patient/dashboard/StreakDisplay.tsx`
- [x] T021 [US5] Conditionally render `<StreakDisplay>` (when `!hasEnoughDataForChart`) or `<ProgressChart>` (when `hasEnoughDataForChart`) in patient dashboard — `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx`

**Checkpoint**: Streak counter updates on new entry; chart appears after 7th entry.

---

## Phase 8: User Story 6 — Tabbed Patient Profile (Priority: P2)

**Goal**: Doctor's patient profile is organised into 4 navigable tabs; concern inbox is reachable without scrolling.

**Independent Test**: Open any patient profile → 4 tab triggers visible. Click "Meldingen" → concern inbox shown immediately.

- [x] T022 [US6] Restructure `PatientProfile.tsx` with `@radix-ui/react-tabs`: `Tabs.Root` wrapping `Tabs.List` (4 triggers: Overzicht, Medicatie, Meldingen, Afspraken) and 4 `Tabs.Content` sections; distribute existing content into correct tabs — `prototypes/sliminject/src/features/doctor/patient/PatientProfile.tsx`
- [x] T023 [US6] Add unread concern count badge to the Meldingen tab trigger, derived from open concerns count — `prototypes/sliminject/src/features/doctor/patient/PatientProfile.tsx`

**Checkpoint**: All existing patient profile content accessible via tabs; badge shows when open concerns exist.

---

## Phase 9: User Story 7 — First Log Entry in Onboarding (Priority: P3)

**Goal**: Onboarding flow adds a 4th step prompting the first log entry, with a skip option.

**Independent Test**: Complete 3 onboarding steps → 4th step appears with log form. Submit → land on dashboard with streak = 1.

- [x] T024 [US7] Add step 4 "Doe je eerste meting" to `OnboardingScreen.tsx`: condensed log form (weight + wellbeing_score; symptoms optional), "Sla over" skip link — `prototypes/sliminject/src/features/patient/onboarding/OnboardingScreen.tsx`
- [x] T025 [US7] Wire step 4 form submission to `useProgressEntries` add entry, update onboarding completed flag, and navigate to `/patient/dashboard` — `prototypes/sliminject/src/features/patient/onboarding/OnboardingScreen.tsx`

**Checkpoint**: New patient completes onboarding, ends on dashboard with first entry visible and streak = 1.

---

## Phase 10: User Story 8 — Advice Editor Visibility Label (Priority: P3)

**Goal**: Advice textarea always shows "Zichtbaar voor patiënt" label; patient sees "Van uw arts" heading with the advice.

**Independent Test**: Open AdviceEditor → label visible above textarea. Patient opens dashboard → advice shown under "Van uw arts".

- [x] T026 [P] [US8] Add persistent "Zichtbaar voor patiënt" label above the advice textarea — `prototypes/sliminject/src/features/doctor/patient/AdviceEditor.tsx`
- [x] T027 [P] [US8] Add "Van uw arts" heading above advice body in patient dashboard (where advice is currently rendered) — `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx`

**Checkpoint**: Label always visible when typing; heading visible to patient when advice exists.

---

## Phase 11: User Story 9 — Response Time After Concern Submission (Priority: P3)

**Goal**: After submitting a concern, an inline confirmation shows the expected response time based on severity.

**Independent Test**: Submit routine concern → "Verwacht antwoord binnen 1 werkdag" shown. Submit urgent → urgent message shown.

- [x] T028 [US9] Add inline post-submission confirmation panel with severity-dependent response time message to concern screen; also show response time alongside open concerns in history list — `prototypes/sliminject/src/features/patient/concerns/ConcernScreen.tsx`

**Checkpoint**: Correct message per severity; confirmation shown immediately after submit.

---

## Phase 12: User Story 10 — Prioritised Symptom Checklist (Priority: P3)

**Goal**: Top 3 symptoms always visible; remaining 4 behind an expand toggle.

**Independent Test**: Open log form → 3 symptoms visible. Tap "Meer symptomen" → 4 more appear. Select one from each group → both save correctly.

- [x] T029 [US10] Reorder `LogEntryForm.tsx` symptom list: define `PRIMARY_SYMPTOMS = ['misselijkheid', 'reactie injectieplaats', 'vermoeidheid']`, render these always; wrap remaining symptoms in a toggle (`<details>` or button-controlled section) labelled "Meer symptomen" — `prototypes/sliminject/src/features/patient/dashboard/LogEntryForm.tsx`

**Checkpoint**: Primary symptoms visible by default; all 7 selectable; saved data unchanged.

---

## Phase 13: User Story 11 — Structured Educational Content (Priority: P4)

**Goal**: Content screen organises articles into 3 topic groups; "Start hier" appears first with highlighted first article.

**Independent Test**: Open content screen → 3 groups visible, "Start hier" first. Complete all items in a group → group shows completion indicator.

- [x] T030 [US11] Create static content group config with 3 groups ("Start hier", "Bijwerkingen", "Voeding & leefstijl"), each with ordered `contentIds` array and `isRecommendedStart` flag — `prototypes/sliminject/src/features/patient/content/contentGroups.ts`
- [x] T031 [US11] Refactor `ContentScreen.tsx` to render articles grouped by `contentGroups.ts` config: "Start hier" first, group headings, completion indicator per group, first unread article in "Start hier" visually highlighted — `prototypes/sliminject/src/features/patient/content/ContentScreen.tsx`
- [x] T032 [US11] Update `useEducationalContent.ts` to support group-aware item ordering using the static `contentGroups.ts` config — `prototypes/sliminject/src/features/patient/content/useEducationalContent.ts`

**Checkpoint**: Articles grouped and ordered; completion indicator appears after all group items viewed.

---

## Phase 14: User Story 12 — Dosage Schedule Titration Curve (Priority: P4)

**Goal**: Schedule editor shows a live SVG line chart (date vs dose_mg) that updates when entries change.

**Independent Test**: Open schedule editor with 3+ entries → chart visible. Add entry → chart updates.

- [x] T033 [US12] Add SVG line chart below the dosage entry list in `ScheduleEditor.tsx`: X-axis = `start_date`, Y-axis = `dose_mg`, follows the SVG pattern from `ProgressChart.tsx`, updates reactively from local schedule state — `prototypes/sliminject/src/features/doctor/schedule/ScheduleEditor.tsx`

**Checkpoint**: Chart renders with existing entries; live-updates on add/remove.

---

## Phase 15: User Story 13 — Real-Time Urgent Concern Badge (Priority: P4)

**Goal**: Doctor navigation shows a red badge within 30 seconds when a patient submits an urgent concern.

**Independent Test**: Submit urgent concern as patient → doctor nav badge appears without refresh within 30s. Doctor responds → badge clears.

- [x] T034 [US13] Create `useUrgentConcerns` hook: subscribe to Supabase Realtime `concerns` channel (INSERT, filter `severity=eq.urgent`), track `urgentCount: number`, expose `clearUrgent()` and clean up subscription on unmount — `prototypes/sliminject/src/hooks/useUrgentConcerns.ts`
- [x] T035 [US13] Integrate `useUrgentConcerns` into doctor navigation: show red badge with count when `urgentCount > 0`, call `clearUrgent()` when doctor navigates to overview — `prototypes/sliminject/src/components/Navigation.tsx`

**Checkpoint**: Badge appears within 30s of urgent concern submission; clears on navigation to overview.

---

## Phase 16: User Story 14 — Daily Logging Reminder (Priority: P4)

**Goal**: Patients can opt in to a daily notification at a chosen time; reminder fires only on days without a log entry.

**Independent Test**: Enable reminder at 20:00, don't log → notification fires. Log before 20:00 → no notification.

- [x] T036 [US14] Add notification preference UI (enable/disable toggle + time input, persisted in localStorage keys `sliminject_reminder_enabled` and `sliminject_reminder_time`) to patient dashboard settings area; request `Notification` permission on first enable — `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx`
- [x] T037 [US14] Implement `setInterval` (60-second tick) that checks current local time against `sliminject_reminder_time` and fires `new Notification("Vergeet je meting niet vandaag!")` when `!hasLoggedToday`; clean up interval on unmount — `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx`

**Checkpoint**: Notification fires only when enabled, time matches, and no entry today.

---

## Phase 17: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass across all 14 stories.

- [x] T038 [P] Audit all new and modified components for Tailwind CSS consistency: spacing, colour tokens, dark mode compatibility across viewport sizes — all modified files
- [x] T039 Run all manual validation flows from `quickstart.md` for all 14 stories and confirm each independent test criterion passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user story phases
- **Phases 3–5 (P1 stories)**: Depend on Phase 2 — can run in parallel with each other
- **Phases 6–8 (P2 stories)**: Depend on Phase 2 — can run in parallel with each other and with P1 phases
- **Phases 9–12 (P3 stories)**: Depend on Phase 2 — can start once Phase 2 is done
- **Phases 13–16 (P4 stories)**: Depend on Phase 2 — US13 also benefits from US1's toast infrastructure
- **Phase 17 (Polish)**: Depends on all story phases being complete

### User Story Dependencies

| Story | Depends On | Notes |
|-------|-----------|-------|
| US1 (Form feedback) | T005 (toast util) | T006–T011 all parallelisable |
| US2 (Log CTA) | T012 | T013 depends on T012 |
| US3 (Scale labels) | T003 (nl.ts) | Standalone, single file |
| US4 (Empty states) | T004 (EmptyState) | T015–T018 all parallelisable |
| US5 (Streak) | T019 | T020 and T019 parallelisable; T021 depends on both |
| US6 (Tabs) | none | T022 first, T023 depends on T022 |
| US7 (Onboarding) | US2's hasLoggedToday | T024 then T025 |
| US8 (Advice label) | T003 (nl.ts) | T026 and T027 fully parallelisable |
| US9 (Response time) | T003 (nl.ts) | Single file change |
| US10 (Symptoms) | T003 (nl.ts) | Single file change |
| US11 (Content groups) | none | T030 first; T031 and T032 depend on T030 |
| US12 (Titration chart) | none | Single file, independent |
| US13 (Realtime badge) | T034 | T035 depends on T034 |
| US14 (Reminders) | US2's hasLoggedToday | T036 then T037 |

### Parallel Opportunities

```
Phase 2:    T003 ─── T004 [P] ─── T005 [P]   (all in parallel)

Phase 3–5:  T006 ─── T007 [P] ─── T008 [P]   (US1 tasks in parallel)
            T012 ─── T013           (US2 sequential)
            T014                   (US3 standalone)

Phase 6–8:  T015 ─── T016 [P] ─── T017 [P] ─── T018 [P]  (US4 parallel)
            T019 ─── T020 ─── T021  (US5 sequential)
            T022 ─── T023           (US6 sequential)

Phase 9–12: T024 ─── T025           (US7)
            T026 [P] ─── T027 [P]   (US8 parallel)
            T028                   (US9 standalone)
            T029                   (US10 standalone)
```

---

## Implementation Strategy

### MVP First (User Stories 1–3 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (blocks all stories)
3. Complete Phases 3–5: US1 (form feedback), US2 (log CTA), US3 (scale labels)
4. **STOP and VALIDATE**: All P1 stories independently testable
5. Demo-ready: all forms give feedback; dashboard drives daily logging habit

### Incremental Delivery

1. **Setup + Foundational** → infrastructure ready
2. **P1 stories (US1–3)** → core retention and trust ✓ demo
3. **P2 stories (US4–6)** → first impressions and doctor efficiency ✓ demo
4. **P3 stories (US7–10)** → habit formation and clarity ✓ demo
5. **P4 stories (US11–14)** → polish and power features ✓ full demo

---

## Notes

- No test tasks generated (not requested in spec)
- All new i18n strings must go in `nl.ts` before component work begins (T003 is a hard blocker)
- `EmptyState` (T004) and toast util (T005) can be built in parallel with T003
- Offline-first behaviour must be preserved in all form changes (US1, US7)
- US13 (realtime) requires Supabase RLS to be active — verify `concerns` table has RLS enabled before testing
- Commit after each phase checkpoint to keep work reviewable in discrete increments
