# Implementation Plan: Sliminject UX Improvements

**Branch**: `002-sliminject-ux-improvements` | **Date**: 2026-03-16 | **Spec**: [spec.md](spec.md)

---

## Summary

14 user-story UX improvements to the Sliminject GLP-1 medication management prototype, covering patient retention, doctor workflow efficiency, and cross-cutting polish. All changes are scoped to `prototypes/sliminject/` — no changes to the main Jekyll site. Two new dependencies: `sonner` (toast notifications) and `@radix-ui/react-tabs` (patient profile layout). No new Supabase tables required for P1–P3; P4 uses a static config and Supabase Realtime channels on the existing `concerns` table.

---

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.x (package.json lists react ^19), Vite 5.x
**Primary Dependencies**: React Router 7, Tailwind CSS 4, Radix UI primitives, Dexie.js 4, Supabase JS v2
**Storage**: Supabase (PostgreSQL with RLS) + IndexedDB via Dexie.js (offline queue) + localStorage (notification prefs)
**Testing**: Vitest 4 + Testing Library (React + user-event)
**Target Platform**: Web, mobile-first (PWA-compatible)
**Project Type**: Standalone web prototype inside a Jekyll portfolio monorepo
**Performance Goals**: Sub-second UI interactions; offline queue must not block logging
**Constraints**: Offline-first behaviour must be preserved; all copy in `nl.ts`; changes MUST NOT touch any file outside `prototypes/sliminject/`
**Scale/Scope**: Single prototype; ~20 source files modified or created

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ Pass | Sliminject is a `prototypes/` tool — this principle applies to the main Jekyll site, not tools |
| II. Content-Driven Architecture | ✅ Pass | No changes to `_projects/` or Jekyll templates |
| III. Design Integrity | ✅ Pass | All UI changes are within the prototype; must be tested across viewport sizes |
| IV. No Regression on v1 | ✅ Pass | No changes to shared assets, `styles.css`, or `preferences.js` |
| V. Performance by Default | ✅ Pass | Two small dependencies added (Sonner ~5 KB, Radix Tabs ~3 KB); no third-party scripts on main site |
| VI. Tools are Sandboxed | ✅ Pass | All changes confined to `prototypes/sliminject/`; main site unaffected |
| VII. Security First for Personal Data | ✅ Pass | Realtime channel scoped by existing RLS; notifications fire no PHI; advice visibility is a label only; no sensitive data in localStorage keys |

**No violations. All gates pass.**

---

## Project Structure

### Documentation (this feature)

```text
specs/002-sliminject-ux-improvements/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── checklists/
│   └── requirements.md
└── tasks.md             ← Phase 2 output (/speckit.tasks)
```

### Source Code

All changes inside `prototypes/sliminject/src/`:

```text
prototypes/sliminject/
├── package.json                                         MODIFY — add sonner, @radix-ui/react-tabs
└── src/
    ├── components/
    │   ├── EmptyState.tsx                               NEW — shared empty state component
    │   ├── Navigation.tsx                               MODIFY — urgent concern badge (doctor nav)
    │   └── OfflineIndicator.tsx                         (unchanged)
    ├── features/
    │   ├── patient/
    │   │   ├── dashboard/
    │   │   │   ├── PatientDashboard.tsx                 MODIFY — log CTA, streak vs chart logic
    │   │   │   ├── LogEntryForm.tsx                     MODIFY — labelled scale, symptom groups
    │   │   │   ├── ProgressChart.tsx                    (unchanged)
    │   │   │   ├── StreakDisplay.tsx                    NEW — streak counter component
    │   │   │   └── useProgressEntries.ts                MODIFY — expose streak count
    │   │   ├── concerns/
    │   │   │   └── ConcernScreen.tsx                    MODIFY — response time message
    │   │   ├── content/
    │   │   │   ├── ContentScreen.tsx                    MODIFY — topic group layout
    │   │   │   ├── contentGroups.ts                     NEW — static topic group config
    │   │   │   └── useEducationalContent.ts             MODIFY — group-aware fetching
    │   │   ├── medication/
    │   │   │   └── (unchanged)
    │   │   └── onboarding/
    │   │       └── OnboardingScreen.tsx                 MODIFY — 4th step with first log entry
    │   └── doctor/
    │       ├── overview/
    │       │   └── DoctorOverview.tsx                   MODIFY — empty state when no patients
    │       ├── patient/
    │       │   ├── PatientProfile.tsx                   MODIFY — tabs layout
    │       │   └── AdviceEditor.tsx                     MODIFY — visibility label
    │       └── schedule/
    │           └── ScheduleEditor.tsx                   MODIFY — titration curve chart
    ├── hooks/
    │   └── useUrgentConcerns.ts                         NEW — realtime subscription hook
    └── i18n/
        └── nl.ts                                        MODIFY — ~25 new strings
```

**Structure Decision**: Single-project structure. All modifications are within the existing feature-based directory layout. New files follow established naming conventions.

---

## Implementation Phases

### Phase 0 — Dependencies & Foundations

Install new packages and build shared infrastructure used by multiple stories.

**0.1 Install dependencies**
```bash
cd prototypes/sliminject
npm install sonner @radix-ui/react-tabs
```

**0.2 Create `EmptyState` component**
- Props: `icon?`, `heading` (i18n key), `body` (i18n key), `cta?: { label, href }`
- Used by: PatientDashboard, ConcernScreen, ContentScreen, DoctorOverview

**0.3 Add Sonner `<Toaster>` to app root**
- Mount `<Toaster>` in `App.tsx` once
- Export a `toast` helper wrapping `sonner`'s `toast.success` / `toast.error`

**0.4 Extend `nl.ts` with all new strings**
- Empty state messages (per screen)
- Streak messages ("X dagen op rij!", "Begin opnieuw — elke dag telt")
- Log CTA ("Log vandaag", "Vandaag gelogd ✓")
- Hunger scale anchors ("Geen honger", "Heel veel honger")
- Symptom expand label ("Meer symptomen")
- Concern response times ("Verwacht antwoord binnen 1 werkdag", urgent variant)
- Advice visibility label ("Zichtbaar voor patiënt", "Van uw arts")
- Onboarding step 4 ("Doe je eerste meting", "Sla over")
- Content group headings ("Start hier", "Bijwerkingen", "Voeding & leefstijl")
- Toast confirmation messages (per form)

---

### Phase 1 — P1 Stories (Core Retention & Trust)

**1.1 X3: Consistent form feedback**

Apply `toast.success` / `toast.error` to all existing form submission handlers:
- `LogEntryForm.tsx` — success (online + offline variants), error
- `ConcernScreen.tsx` — success, error
- `AppointmentForm.tsx` — success, error
- `PatientIntakeForm.tsx` — success, error
- `AdviceEditor.tsx` — success, error
- `ScheduleEditor.tsx` — success, error

Each toast uses i18n strings from `nl.ts`.

**1.2 P1: Log CTA on dashboard**

Modify `PatientDashboard.tsx`:
- Check if `progressEntries` contains an entry with today's local date
- If not: render a prominent full-width button "Log vandaag" linking to `/patient/log`
- If yes: render a smaller completion badge "Vandaag gelogd ✓" with the entry time

Extend `useProgressEntries` to expose `hasLoggedToday: boolean`.

**1.3 P2: Hunger scale labelled anchors**

Modify `LogEntryForm.tsx`:
- Add "Geen honger" label below the 1 end of the scale
- Add "Heel veel honger" label below the 5 end
- Both labels from `nl.ts`; no DB change (`wellbeing_score` field name unchanged)

---

### Phase 2 — P2 Stories (First Impressions & Doctor Efficiency)

**2.1 X1: Empty states**

Apply `EmptyState` component to:
- `PatientDashboard.tsx` — when `progressEntries.length === 0`
- `ConcernScreen.tsx` — when `concerns.length === 0`
- `ContentScreen.tsx` — when `contentItems.length === 0` (loading state already handled)
- `DoctorOverview.tsx` — when `patients.length === 0`

Each empty state has a screen-specific heading, body, and CTA from `nl.ts`.

**2.2 P3: Pre-chart streak display**

Create `StreakDisplay.tsx`:
- Props: `streakDays: number`, `totalDays: number` (fixed at 7 for the milestone)
- Renders: pill with flame icon, "X dagen op rij!" text, "X/7" progress dots or bar
- Encouragement message if streak = 0

Extend `useProgressEntries` with `streakDays` calculation (Intl-based, no new deps).

Modify `PatientDashboard.tsx`:
- If `progressEntries.length < 7`: render `<StreakDisplay>` in place of `<ProgressChart>`
- If `progressEntries.length >= 7`: render `<ProgressChart>` as before

**2.3 D1: Tabbed patient profile**

Modify `PatientProfile.tsx`:
- Wrap content in `<Tabs.Root defaultValue="overzicht">`
- Tab list: Overzicht, Medicatie, Meldingen, Afspraken
- Move contact info + progress chart → Overzicht tab
- Move medication timeline → Medicatie tab
- Move concern inbox → Meldingen tab (with unread badge from open concern count)
- Move appointment form link → Afspraken tab

---

### Phase 3 — P3 Stories (Clarity & Communication)

**3.1 P7: First log entry in onboarding**

Modify `OnboardingScreen.tsx`:
- Add step 4: "Doe je eerste meting"
- Step 4 embeds a condensed version of `LogEntryForm` (weight + wellbeing_score only, symptoms optional)
- On submit: save entry, advance to dashboard with streak = 1
- Add "Sla over" link that navigates directly to dashboard

**3.2 D2: Advice editor visibility label**

Modify `AdviceEditor.tsx`:
- Add persistent label "Zichtbaar voor patiënt" above the textarea (not a tooltip; always visible)

Modify `PatientDashboard.tsx`:
- Where advice is displayed, add "Van uw arts" heading above the advice body text

**3.3 P5: Response time expectation**

Modify `ConcernScreen.tsx`:
- After successful submission, show an inline confirmation panel (not just a toast)
- Confirmation includes severity-dependent message from `nl.ts`
- Routine: "Verwacht antwoord binnen 1 werkdag"
- Urgent: "Uw melding is als urgent gemarkeerd. We nemen zo snel mogelijk contact op."
- Panel also shown alongside open concerns in the history list

**3.4 P4: Prioritised symptom checklist**

Modify `LogEntryForm.tsx`:
- Define `PRIMARY_SYMPTOMS` = ['misselijkheid', 'reactie injectieplaats', 'vermoeidheid']
- Define `SECONDARY_SYMPTOMS` = remaining 4
- Render primary symptoms always; secondary behind a toggleable `<details>` or button
- All symptoms save identically to `progress_entries.symptoms`

---

### Phase 4 — P4 Stories (Polish & Power Features)

**4.1 P6: Structured educational content**

Create `src/features/patient/content/contentGroups.ts`:
- Static array of `ContentGroup` objects: `{ id, labelKey, contentIds, isRecommendedStart }`
- Three groups: "Start hier", "Bijwerkingen", "Voeding & leefstijl"

Modify `ContentScreen.tsx`:
- Group content items by their `ContentGroup`
- Render "Start hier" group first with a visual highlight on the first unread item
- Add group-level completion indicator when all items in a group are viewed

**4.2 D3: Dosage schedule titration chart**

Modify `ScheduleEditor.tsx`:
- After the entry list, add a simple SVG line chart (following the pattern in `ProgressChart.tsx`)
- X-axis: dates from `dosage_schedule_entries.start_date`
- Y-axis: `dose_mg` values
- Chart updates reactively from the local state already used by the entry list

**4.3 D4: Real-time urgent concern badge**

Create `src/hooks/useUrgentConcerns.ts`:
- On mount (doctor role only): subscribe to Supabase `concerns` channel, filter `severity=eq.urgent`
- Track `urgentCount: number` in local state
- Expose `urgentCount` and a `clearUrgent()` callback

Modify `Navigation.tsx` (doctor view):
- Accept / call `useUrgentConcerns` and render a red badge on the overview tab link when `urgentCount > 0`
- Clear badge when doctor navigates to DoctorOverview

**4.4 X2: Daily logging reminder**

Add notification preference UI to patient settings (or as a section in `PatientDashboard.tsx`):
- Toggle to enable/disable reminders + time picker (stored in localStorage)
- On mount: request `Notification` permission if enabling for first time
- Register a `setInterval` (60-second tick) that fires a Web Notification when current time matches configured reminder time and `hasLoggedToday === false`
- Clean up interval on unmount

---

## Complexity Tracking

*No constitution violations — this section is informational only.*

| Concern | Resolution |
|---------|------------|
| Sonner vs Radix Toast | Sonner chosen for simpler API; stays within Tailwind styling system |
| Realtime subscription cleanup | `useEffect` return must call `channel.unsubscribe()` to prevent memory leaks |
| Streak timezone edge cases | `Intl.DateTimeFormat` handles DST; no date library needed |
| Onboarding embedded form | Step 4 uses a simplified subset of `LogEntryForm` fields to avoid full duplication |
