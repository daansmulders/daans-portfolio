# Tasks: Sliminject Dashboard

**Input**: Design documents from `/specs/001-sliminject-dashboard/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Organization**: Tasks grouped by user story. Each phase is independently testable.
**Tests**: Not included (not requested in spec).

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on other incomplete tasks)
- **[Story]**: Maps to user story from spec.md (US1–US7)

---

## Phase 1: Setup

**Purpose**: Project scaffold and tooling.

- [x] T001 Create `prototypes/sliminject/` directory and initialise Vite + React + TypeScript project (`npm create vite@latest`)
- [x] T002 Install and configure Tailwind CSS in `prototypes/sliminject/tailwind.config.ts` and `src/index.css`
- [x] T003 [P] Install Radix UI primitives (`@radix-ui/react-*`) and add to `package.json`
- [x] T004 [P] Install Supabase JS client (`@supabase/supabase-js`) and add to `package.json`
- [x] T005 [P] Install Dexie.js (`dexie`) and add to `package.json`
- [x] T006 [P] Configure Vitest in `prototypes/sliminject/vitest.config.ts`
- [x] T007 Create `.env.example` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` placeholders in `prototypes/sliminject/`
- [x] T008 Create Dutch UI strings constants file at `prototypes/sliminject/src/i18n/nl.ts` with placeholder keys for all screens

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Auth, database schema, RLS, routing infrastructure. MUST be complete before any user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T009 Create Supabase client singleton at `prototypes/sliminject/src/lib/supabase.ts`
- [x] T010 Write Supabase migration for `profiles` table (id, role, full_name, created_at) in `prototypes/sliminject/supabase/migrations/001_profiles.sql`
- [x] T011 Write Supabase migration for `patients` table (id, doctor_id, treatment_start_date, current_dosage_mg) in `prototypes/sliminject/supabase/migrations/002_patients.sql`
- [x] T012 Write Supabase migration for `doctors` table in `prototypes/sliminject/supabase/migrations/003_doctors.sql`
- [x] T013 Write RLS policies for `profiles`, `patients`, and `doctors` tables per `contracts/database.md` in `prototypes/sliminject/supabase/migrations/004_rls_core.sql`
- [x] T014 Implement auth flow (login, logout, session expiry) in `prototypes/sliminject/src/auth/AuthProvider.tsx`
- [x] T015 Implement `ProtectedRoute` with role-based redirect (patient → `/patient/dashboard`, doctor → `/dokter/overzicht`) in `prototypes/sliminject/src/auth/ProtectedRoute.tsx`
- [x] T016 Set up React Router with routes for all screens defined in `contracts/ui-contracts.md` in `prototypes/sliminject/src/App.tsx`
- [x] T017 Create login screen (P-01) with email/password fields and error handling in `prototypes/sliminject/src/features/auth/LoginScreen.tsx`
- [x] T018 Create shared navigation component (patient nav + doctor nav) in `prototypes/sliminject/src/components/Navigation.tsx`
- [x] T019 Configure Dexie offline database with `OfflineProgressEntry` table in `prototypes/sliminject/src/lib/db.ts`

**Checkpoint**: Auth works, roles route correctly, DB schema is live with RLS — user story work can now begin.

---

## Phase 3: User Story 1 — Patient Progress Tracking (Priority: P1) 🎯 MVP

**Goal**: Patient can log progress entries (online + offline) and see a chart of their history.

**Independent Test**: Log in as `patient@demo.nl`, submit an entry while online, go offline and submit another, reconnect — both entries appear in the chart.

- [x] T020 Write Supabase migration for `progress_entries` table with RLS policies in `prototypes/sliminject/supabase/migrations/005_progress_entries.sql`
- [x] T021 [US1] Create `useProgressEntries` hook (fetch, create, offline-queue) in `prototypes/sliminject/src/features/patient/dashboard/useProgressEntries.ts`
- [x] T022 [US1] Implement offline sync hook that flushes Dexie queue to Supabase on reconnect in `prototypes/sliminject/src/hooks/useOfflineSync.ts`
- [x] T023 [P] [US1] Build log entry form component (weight, wellbeing 1–5, symptom tags, notes) with offline indicator in `prototypes/sliminject/src/features/patient/dashboard/LogEntryForm.tsx`
- [x] T024 [P] [US1] Build progress chart component (weight + wellbeing over time) in `prototypes/sliminject/src/features/patient/dashboard/ProgressChart.tsx`
- [x] T025 [US1] Assemble patient dashboard screen (P-02) with chart, log CTA, and empty state in `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx`

**Checkpoint**: Patient dashboard fully functional — progress logging works online and offline, chart renders.

---

## Phase 4: User Story 2 — Doctor Patient Overview (Priority: P1)

**Goal**: Doctor can view all assigned patients with status indicators and open concern badges.

**Independent Test**: Log in as `dokter@demo.nl`, see 3 demo patients with last check-in dates; one patient with an open concern is visually prioritised.

- [x] T026 [US2] Create `usePatients` hook (fetch assigned patients with last entry date and open concern count) in `prototypes/sliminject/src/features/doctor/overview/usePatients.ts`
- [x] T027 [P] [US2] Build patient list item component (name, last check-in, dosage stage, concern badge) in `prototypes/sliminject/src/features/doctor/overview/PatientListItem.tsx`
- [x] T028 [US2] Assemble doctor overview screen (D-01) with patient list, sorting by open concerns, and empty state in `prototypes/sliminject/src/features/doctor/overview/DoctorOverview.tsx`

**Checkpoint**: Doctor overview fully functional — patient list visible with badges. Both P1 stories now complete.

---

## Phase 5: User Story 3 — Symptom & Concern Signalling (Priority: P2)

**Goal**: Patient submits a concern; doctor sees it flagged and can respond; patient sees the response.

**Independent Test**: Submit a concern as patient, log in as doctor and respond — patient sees the response in the app.

- [x] T029 Write Supabase migration for `concerns` table with RLS policies in `prototypes/sliminject/supabase/migrations/006_concerns.sql`
- [x] T030 Write RLS policies for `concerns` in `prototypes/sliminject/supabase/migrations/006_concerns.sql` (append to same file)
- [x] T031 [P] [US3] Create `useConcerns` hook (fetch, submit, respond) in `prototypes/sliminject/src/features/patient/concerns/useConcerns.ts`
- [x] T032 [P] [US3] Build concern submission form (severity + description) and concern history list in `prototypes/sliminject/src/features/patient/concerns/ConcernScreen.tsx` (maps to P-05)
- [x] T033 [US3] Build doctor concern inbox with response form (per patient) in `prototypes/sliminject/src/features/doctor/patient/ConcernInbox.tsx`
- [x] T034 [US3] Update patient dashboard (P-02) to show badge when doctor has responded to a concern in `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx`
- [x] T035 [US3] Update doctor overview (D-01) to show concern badge and sort patients with open concerns first in `prototypes/sliminject/src/features/doctor/overview/DoctorOverview.tsx`

**Checkpoint**: Concern loop is complete end-to-end — patient signals, doctor responds, patient sees reply.

---

## Phase 6: User Story 4 — Personalise Medication & Advice (Priority: P2)

**Goal**: Doctor sets/edits a patient's dosage schedule and writes personal advice; patient sees both.

**Independent Test**: As doctor, add a dosage step and write an advice note for a patient — log in as that patient and see both reflected immediately.

- [x] T036 Write Supabase migrations for `dosage_schedule_entries` and `advice` tables with RLS in `prototypes/sliminject/supabase/migrations/007_medication_advice.sql`
- [x] T037 [P] [US4] Create `useDosageSchedule` hook (fetch, create, update, delete entries) in `prototypes/sliminject/src/features/doctor/schedule/useDosageSchedule.ts`
- [x] T038 [P] [US4] Create `useAdvice` hook (fetch, create, update) in `prototypes/sliminject/src/features/doctor/patient/useAdvice.ts`
- [x] T039 [US4] Build dosage schedule editor screen (D-03) in `prototypes/sliminject/src/features/doctor/schedule/ScheduleEditor.tsx`
- [x] T040 [US4] Build advice note editor (inline, within patient profile D-02) in `prototypes/sliminject/src/features/doctor/patient/AdviceEditor.tsx`
- [x] T041 [US4] Build patient-facing advice display section in `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx`
- [x] T042 [US4] Assemble full doctor patient profile screen (D-02) combining progress, concerns, schedule, and advice in `prototypes/sliminject/src/features/doctor/patient/PatientProfile.tsx`

**Checkpoint**: Doctor can fully manage a patient's schedule and advice. Patient sees personalised data.

---

## Phase 7: User Story 6 — Dosage Schedule View for Patient (Priority: P3)

**Goal**: Patient can view their current dose, past doses, upcoming increases, and a 7-day alert.

**Independent Test**: As patient (with a schedule set by doctor in Phase 6), open medication view and see full timeline with upcoming increase highlighted.

*Note: Depends on Phase 6 (dosage schedule data exists).*

- [x] T043 [US6] Create `usePatientDosageSchedule` hook (fetch own schedule, derive upcoming increases) in `prototypes/sliminject/src/features/patient/medication/usePatientDosageSchedule.ts`
- [x] T044 [US6] Build medication timeline screen (P-04) with past/current/upcoming doses and 7-day alert in `prototypes/sliminject/src/features/patient/medication/MedicationScreen.tsx`
- [x] T045 [US6] Add upcoming dosage increase alert to patient dashboard (P-02) when increase is within 7 days in `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx`

**Checkpoint**: Patient can self-serve dosage information without asking their doctor.

---

## Phase 8: User Story 5 — Educational Content Triggered by Progress Events (Priority: P3)

**Goal**: Relevant articles and videos surface automatically when a patient reaches a defined progress event.

**Independent Test**: Log a "nausea" symptom as a patient — a nausea-related video appears. Viewing it marks it as seen; logging nausea again does not re-surface it.

*Note: Depends on Phase 3 (progress entries) and Phase 6 (dosage schedule) for trigger evaluation.*

- [x] T046 Write Supabase migrations for `educational_content`, `content_triggers`, and `patient_content_view` tables with RLS in `prototypes/sliminject/supabase/migrations/008_content.sql`
- [x] T047 [US5] Implement progress event evaluation engine (evaluates all trigger types: SYMPTOM_FIRST_LOG, DOSAGE_INCREASE, WEIGHT_MILESTONE, WEIGHT_PLATEAU, TREATMENT_WEEK) — folded into `useEducationalContent.ts` rather than a separate file
- [x] T048 [US5] Create `useEducationalContent` hook (fetch triggered content, mark viewed) in `prototypes/sliminject/src/features/patient/content/useEducationalContent.ts`
- [x] T049 [US5] Build educational content screen (P-06) with triggered content list, article reader, and video player in `prototypes/sliminject/src/features/patient/content/ContentScreen.tsx`
- [x] T050 [US5] Add content notification badge to patient dashboard (P-02) when new content has been triggered in `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx`
- [ ] T051 [US5] Seed `educational_content` and `content_triggers` tables with demo content in `prototypes/sliminject/supabase/seed.sql`

**Checkpoint**: Content surfaces at the right moments in a patient's journey and is not repeated once viewed.

---

## Phase 9: User Story 7 — Appointment Scheduling (Priority: P3)

**Goal**: Doctor schedules an appointment; patient sees it in the app with a 48-hour reminder.

**Independent Test**: As doctor, create an appointment for a patient — log in as patient and see it. Set date to tomorrow and confirm the reminder appears on the dashboard.

- [x] T052 Write Supabase migration for `appointments` table with RLS in `prototypes/sliminject/supabase/migrations/009_appointments.sql`
- [x] T053 [US7] Create `useAppointments` hook (fetch, create) in `prototypes/sliminject/src/features/doctor/appointments/useAppointments.ts`
- [x] T054 [US7] Build appointment creation screen (D-04) in `prototypes/sliminject/src/features/doctor/appointments/AppointmentForm.tsx`
- [x] T055 [US7] Add upcoming appointment display to patient dashboard (P-02) with 48-hour reminder in `prototypes/sliminject/src/features/patient/dashboard/PatientDashboard.tsx`

**Checkpoint**: Full appointment loop works end-to-end.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: WCAG AA audit, offline UX, security hardening, demo seed, and final validation.

- [x] T056 [P] Add offline indicator component (shown in patient app when offline) to `prototypes/sliminject/src/components/OfflineIndicator.tsx`
- [x] T057 [P] Audit all screens for WCAG 2.1 AA compliance: colour contrast, focus rings, ARIA labels, touch targets — fix any issues found across `prototypes/sliminject/src/`
- [x] T058 [P] Verify no patient health data or identifiers appear in URLs, browser history, or console logs — audit `App.tsx` routes and all hooks
- [x] T059 Add demo seed script with fictional patient data to `prototypes/sliminject/supabase/seed.js` and wire up `npm run seed` in `package.json`
- [x] T060 Validate all Dutch strings are in `src/i18n/nl.ts` and no hardcoded non-Dutch text remains in components
- [ ] T061 Run through `specs/001-sliminject-dashboard/quickstart.md` end-to-end and confirm all steps work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — blocks all user story phases
- **Phase 3 (US1) + Phase 4 (US2)**: Depend on Phase 2 — can run in parallel
- **Phase 5 (US3) + Phase 6 (US4)**: Depend on Phase 2 — can start after Phase 2, parallel to each other
- **Phase 7 (US6)**: Depends on Phase 6 (dosage schedule must exist)
- **Phase 8 (US5)**: Depends on Phase 3 (progress entries) and Phase 6 (dosage schedule)
- **Phase 9 (US7)**: Depends on Phase 2 only — can proceed independently
- **Phase 10 (Polish)**: Depends on all desired user story phases being complete

### Parallel Opportunities

- T003–T006 (dependency installs) can all run in parallel after T001
- T010–T013 (DB migrations) can be written in parallel
- T023–T024 (log form + chart) can be built in parallel
- T031–T032 (concern hooks + form) can be built in parallel
- T037–T038 (schedule + advice hooks) can be built in parallel
- T056–T058 (polish tasks) can all run in parallel

---

## Implementation Strategy

### MVP (Phase 1 + 2 + 3 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: Patient Progress Tracking (US1)
4. **STOP and VALIDATE**: Patient can log entries offline and see a chart
5. This alone is a working, demonstrable prototype

### Incremental Delivery

1. Phases 1–3 → Patient logging MVP
2. Phase 4 → Doctor overview added → bidirectional app
3. Phases 5–6 → Concern signalling + medication management
4. Phases 7–9 → Full feature set (content, schedule view, appointments)
5. Phase 10 → Production-quality polish

---

## Notes

- All paths are relative to `prototypes/sliminject/`
- RLS policies are the primary security mechanism — application checks are secondary
- Demo data must use fictional names and values only (no real patient data, ever)
- `patient_id` in INSERT operations must always be enforced via RLS, not client payload
- Mark tasks complete with `[x]` as you go
