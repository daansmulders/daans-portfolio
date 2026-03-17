# Tasks: Side Effect Support

**Input**: `/specs/008-side-effect-support/`
**Stack**: TypeScript 5.9, React 19, Tailwind CSS 4, Sonner
**Root**: `prototypes/sliminject/src/`

---

## Phase 1: Setup

**Purpose**: Add i18n keys, new symptom names, tip content map, and throttle hook shared by both user stories.

- [X] T001 [P] Add i18n keys and new symptom names to `prototypes/sliminject/src/i18n/nl.ts`: `tip_bij_symptoom`, `tip_eerste_injectie`, `tip_dosisverhoging_bijwerking`, `tip_terug_dashboard`, `symptoom_haaruitval` ("Haaruitval"), `symptoom_injectieplaatsreactie` ("Injectieplaatsreactie")
- [X] T002 [P] Create `prototypes/sliminject/src/features/patient/symptoms/symptomTips.ts` — export `SYMPTOM_TIPS` array (6 entries: Misselijkheid priority 1, Vermoeidheid 2, Diarree 3, Obstipatie 4, Haaruitval 5, Injectieplaatsreactie 6, each with symptom key + tip text) and `selectTip(loggedSymptoms, wasShownRecently)` function that returns the highest-priority eligible tip or null
- [X] T003 [P] Create `prototypes/sliminject/src/features/patient/symptoms/useSymptomTipThrottle.ts` — export `{ wasShownRecently, markShown }` hook; `wasShownRecently(symptom)` checks `localStorage.getItem('sliminject_tip_last_{symptom}')` against 7-day window; `markShown(symptom)` writes current timestamp

---

## Phase 2: Foundational

**Purpose**: Add `isFirstInjection` to the existing `useDoseChanges` hook — needed by US2 and independent of the tip map.

- [X] T004 Add `isFirstInjection` boolean to `prototypes/sliminject/src/features/patient/medication/useDoseChanges.ts` — true when `adherenceRecords.length === 0 && current !== null`; export alongside existing fields

**Checkpoint**: T001–T004 complete. Both user stories can now begin.

---

## Phase 3: User Story 1 — Reactive side effect tips after logging (Priority: P1) 🎯 MVP

**Goal**: After submitting a log with symptoms, a tip card appears in the confirmation screen with per-symptom guidance. Auto-navigate is disabled when a tip is shown — patient taps "Terug naar dashboard" manually.

**Independent Test**: Log in as Lars. Submit a log with "Misselijkheid" → tip card appears with nausea guidance + "Terug naar dashboard" button. Submit again within the same week with "Misselijkheid" → no tip (throttled). Submit with "Vermoeidheid" → fatigue tip appears.

- [X] T005 [US1] Add Haaruitval and Injectieplaatsreactie to the symptom chips in `prototypes/sliminject/src/features/patient/dashboard/LogEntryForm.tsx` — add `nl.symptoom_haaruitval` and `nl.symptoom_injectieplaatsreactie` to the `SECONDARY_SYMPTOMS` array
- [X] T006 [US1] Update `prototypes/sliminject/src/features/patient/dashboard/LogEntryForm.tsx` — import `selectTip` and `useSymptomTipThrottle`; after successful log submission, call `selectTip(symptomen, wasShownRecently)`; if a tip is returned, set `succes` to `'tip'` and call `markShown(tip.symptom)`, do NOT set setTimeout for auto-navigate; if no tip, keep existing auto-navigate behaviour; add a new `succes === 'tip'` render block showing the success message, the tip card (`.card` with `bg-warm-50`, `border-l-2 border-brand-600`, tip header with symptom name, tip body text), and a "Terug naar dashboard" button (`btn btn-primary w-full`) that navigates to `/patient/dashboard`

**Checkpoint**: US1 fully functional. Reactive tips shown after symptom logging, throttled per week, priority ordered.

---

## Phase 4: User Story 2 — Proactive side effect guidance on injection day (Priority: P2)

**Goal**: On the first-ever injection day and dose-increase injection days, a brief anticipatory tip appears in the injection-day card's confirm step.

**Independent Test**: Log in as Sara (first injection day). The injection-day card shows a proactive tip: "Dit is je eerste injectie..." in the confirm step. After confirming, the tip disappears in the log step.

- [X] T007 [US2] Update `prototypes/sliminject/src/features/patient/adherence/InjectionDayCard.tsx` — add `isFirstInjection?: boolean` prop; when `step === 'confirm'` and `isFirstInjection` is true, render a subtle card (`bg-warm-50 rounded-lg px-3 py-2 text-sm`) with `nl.tip_eerste_injectie`; when `step === 'confirm'` and `isNewDose` is true (not first injection), render a similar card with `nl.tip_dosisverhoging_bijwerking`; position below the "Nieuwe dosis" marker (if present) and above the confirmation question; only show in confirm step
- [X] T008 [US2] Update `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx` — pass `isFirstInjection={doseChanges.isFirstInjection}` to `<InjectionDayCard />`

**Checkpoint**: US2 functional. Proactive tips shown on first injection and dose-increase days.

---

## Phase 5: Polish & Validation

**Purpose**: Type check and verify.

- [X] T009 Run `npx tsc --noEmit` in `prototypes/sliminject/` and fix any TypeScript errors

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)**: No dependencies. T001, T002, T003 can all run in parallel.
- **Phase 2 (Foundational)**: No dependency on Phase 1 (different file). Can run in parallel with Phase 1.
- **Phase 3 (US1)**: Depends on T001 (i18n keys), T002 (tip map), T003 (throttle hook)
- **Phase 4 (US2)**: Depends on T001 (i18n keys), T004 (isFirstInjection)
- **Phase 5 (Polish)**: Depends on all user stories

### User story dependencies

- **US1 (P1)**: Independent of US2. Only needs the tip map and throttle hook.
- **US2 (P2)**: Independent of US1. Only needs `isFirstInjection` from useDoseChanges.
- US1 and US2 can run in parallel after setup.

### Parallel opportunities

- T001, T002, T003 can all run in parallel (different files)
- T004 can run in parallel with T001–T003 (different file)
- T005 and T007 can run in parallel (LogEntryForm vs InjectionDayCard)
- T006 depends on T005 (same file — sequential)

---

## Parallel Example: After Setup

```
T005+T006 — LogEntryForm reactive tips      (LogEntryForm.tsx)
T007      — InjectionDayCard proactive tips  (InjectionDayCard.tsx)
T008      — Dashboard wiring                 (PatientDashboard.tsx)
```

T005+T006 and T007 can run simultaneously (different files). T008 depends on T004.

---

## Implementation Strategy

### MVP (US1 only — 5 tasks)

1. T001 — i18n keys + symptom names
2. T002 — symptomTips map + selectTip
3. T003 — useSymptomTipThrottle hook
4. T005 — Add new symptoms to log form
5. T006 — LogEntryForm tip card integration
6. **STOP**: Verify Scenarios 1–5 from quickstart.md

### Full delivery

Add T004 (isFirstInjection) → T007–T008 (proactive tips) → T009 (tsc check)
