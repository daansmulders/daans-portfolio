# Tasks: Unified Injection-Day Experience

**Input**: `/specs/006-injection-day-experience/`
**Stack**: TypeScript 5.9, React 19, Tailwind CSS 4, Supabase JS v2, Dexie.js 4, Sonner
**Root**: `prototypes/sliminject/src/`

---

## Phase 1: Setup

**Purpose**: Add i18n keys and derive the injection-date utility used across all user stories.

- [X] T001 Add i18n keys for InjectionDayCard to `prototypes/sliminject/src/i18n/nl.ts`: `injectiedag_titel`, `injectiedag_vraag`, `injectiedag_bevestigd_label`, `injectiedag_log_subtitel`, `injectiedag_sla_log_over`, `injectiedag_bevestiging`, `injectiedag_badge`, `log_voedselruis_week`, `log_energie`
- [X] T002 Add `injectionDates(scheduleEntries)` pure helper to `prototypes/sliminject/src/features/patient/adherence/injectionDates.ts` — returns a `Set<string>` of YYYY-MM-DD strings from an array of `{ start_date: string }` objects

---

## Phase 2: Foundational

**Purpose**: The combined hook `useInjectionDayCard` that all UI stories depend on.

**⚠️ CRITICAL**: US1 and US2 both require this hook before any UI can be built.

- [X] T003 Create `prototypes/sliminject/src/features/patient/adherence/useInjectionDayCard.ts` — composes `useAdherenceCheckIn` for `isDue` / `currentEntry` / `submitAdherence`, `addEntry` from `useProgressEntries`, and a direct `supabase.from('weekly_wellbeing_checkins').insert` for the energy + note; manages `step: 'confirm' | 'log' | 'done'`; exports `{ isDue, step, submitting, confirmInjection, submitLog, skipInjection, adjustInjection }`

**Checkpoint**: Hook compiles with no TypeScript errors (`npx tsc --noEmit`). US1 and US2 can now begin.

---

## Phase 3: User Story 1 — Guided injection-day check-in (Priority: P1) 🎯 MVP

**Goal**: On injection day the patient sees one card, confirms the injection, fills in optional log fields, and receives an acknowledgement.

**Independent Test**: Open dashboard as Lars on a scheduled injection day → unified card appears → complete all steps → three records saved → acknowledgement shown → card gone on reload.

- [X] T004 [US1] Create `prototypes/sliminject/src/features/patient/adherence/InjectionDayCard.tsx` — step='confirm': show title ("Injectiedag"), question, three buttons (Ja genomen / Nee overgeslagen / Andere dosis); step='log': show weight input, hunger 1–5, food noise 1–5 weekly-framed, energy 1–5, note textarea, Submit + "Sla log over" ghost button; step='done': show `.alert-brand` acknowledgement text; returns null when `!isDue`; uses only existing `.btn`, `.card`, `.input`, `.hunger-btn`, `.alert-brand` classes and design tokens
- [X] T005 [US1] Update `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx` — import `InjectionDayCard` and `useInjectionDayCard`; replace `<AdherenceCheckIn />` with `<InjectionDayCard .../>` passing hook props; suppress `<WellbeingCheckIn>` when `injectionCardIsDue` is true (add `injectionCardIsDue` condition to the WellbeingCheckIn render guard)

**Checkpoint**: US1 fully functional. Lars sees the unified card on injection day, completes it, records saved.

---

## Phase 4: User Story 2 — Skipped / adjusted injection (Priority: P2)

**Goal**: "Nee, overgeslagen" and "Andere dosis" paths work correctly; consecutive-miss nudge still fires.

**Independent Test**: Select "Nee, overgeslagen" in the card → only adherence record saved → card closes → no log entry created. Skip twice → consecutive-miss nudge fires.

- [X] T006 [US2] Verify skip and adjust paths in `InjectionDayCard.tsx` — "Nee, overgeslagen" calls `skipInjection()` directly; "Andere dosis" reveals note textarea then calls `adjustInjection(note)`; no log fields shown for either path; confirm `useConsecutiveMiss` still reads from the same `injection_adherence` table and requires no changes

**Checkpoint**: All three injection response paths work. Consecutive-miss nudge fires correctly.

---

## Phase 5: User Story 3 — Non-injection days unchanged (Priority: P3)

**Goal**: On non-injection days `InjectionDayCard` renders nothing and the existing log CTA + `LogEntryForm` flow is untouched.

**Independent Test**: Open dashboard on a non-injection day → standard "Log vandaag" CTA visible → no InjectionDayCard → LogEntryForm submits normally.

- [X] T007 [US3] Verify in `PatientDashboard.tsx` that the `isDue` guard from `useInjectionDayCard` returns false on non-injection days and the existing log CTA (`Link to="/patient/log"`) and `<WellbeingCheckIn>` remain fully functional — no code changes expected; add a seed note confirming the test user (Anouk) has no injection scheduled for today

**Checkpoint**: Non-injection days completely unaffected. US3 regression-free.

---

## Phase 6: Polish & Visual Distinction

**Purpose**: Injection-day entries are visually marked in patient history and doctor adherence view.

- [X] T008 [P] Update recent entries list in `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx` — import `injectionDates` helper; derive `injectionDateSet` from `usePatientDosageSchedule` entries inside a `useMemo`; in the entries list renderer add an "Injectiedag" badge (`bg-[#EDF7F4] text-[#2D7A5E]`) next to the "Week N" badge for entries whose `logged_at` date is in `injectionDateSet`
- [X] T009 [P] Update `prototypes/sliminject/src/features/doctor/patient/PatientProfile.tsx` — in the Medicatie tab adherence list, for each confirmed adherence record find the matching `progress_entries` row by date (cross-reference `adherenceByEntryId` schedule entry `start_date` against `entries`); if a match exists render weight and hunger score as a secondary line below the dose/date row: `83.2 kg · Honger 2/5` in `text-xs` warm-grey
- [X] T010 Update seed data in `prototypes/sliminject/supabase/seed.js` — ensure Lars has an injection day falling on today (or document the date offset used) so Scenario 1 from quickstart.md is immediately testable after `npm run seed`
- [X] T011 Run `npx tsc --noEmit` in `prototypes/sliminject/` and fix any TypeScript errors

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (i18n keys consumed by hook)
- **Phase 3 (US1)**: Depends on Phase 2 — hook must exist before UI is built
- **Phase 4 (US2)**: Depends on Phase 3 — builds on the same `InjectionDayCard`
- **Phase 5 (US3)**: Can run in parallel with Phase 4 — independent regression check
- **Phase 6 (Polish)**: Depends on Phase 3 — needs `injectionDates` helper and real entries

### User story dependencies

- **US1 (P1)**: Blocked by Foundational (T003). Core of the feature.
- **US2 (P2)**: Depends on US1 card existing (same component, additional paths in `useInjectionDayCard`)
- **US3 (P3)**: Independent — verifies no regression, can run alongside US2

### Parallel opportunities

- T001 and T002 can run in parallel (different files)
- T008 and T009 can run in parallel (different files — dashboard vs. doctor profile)
- T010 and T011 can run in parallel with T008/T009

---

## Parallel Example: Phase 6

```
T008 — Patient entries list badge     (PatientDashboard.tsx)
T009 — Doctor adherence list inline   (PatientProfile.tsx)
T010 — Seed update                    (seed.js)
T011 — TypeScript check               (terminal)
```

All four can run simultaneously.

---

## Implementation Strategy

### MVP (US1 only — 4 tasks)

1. T001 — i18n keys
2. T002 — injectionDates helper
3. T003 — useInjectionDayCard hook
4. T004 — InjectionDayCard component
5. T005 — PatientDashboard wiring
6. **STOP**: verify Scenario 1 from quickstart.md end-to-end

### Full delivery

Add T006 (US2 skip/adjust paths) → T007 (US3 regression check) → T008–T011 (polish + visual distinction)
