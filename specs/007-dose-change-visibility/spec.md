# Feature Specification: Dose Change Visibility

**Feature Branch**: `007-dose-change-visibility`
**Created**: 2026-03-17
**Status**: Draft
**Input**: Backlog items 7 (Dose increase announcement) and 8 (Dose annotations on progress chart), shipped together as one coherent "make dose changes visible" feature.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Dose annotations on the progress chart (Priority: P1)

As a patient reviewing my progress chart, I want to see where my dose increased over time, so that I can understand how each titration step affected my weight and hunger — and feel more confident that the treatment is working.

**Why this priority**: The progress chart is already the primary data visualisation for both patients and doctors. Adding dose markers immediately makes it clinically legible — a patient who sees a weight plateau after a dose change now has context, and a doctor no longer needs to cross-reference the medication timeline. This is a permanent, always-visible improvement that benefits every user who has ever had a dose change.

**Independent Test**: Open the patient dashboard as a patient with 2+ dose steps in their schedule. The progress chart should display a subtle vertical marker at each dose change date. Tap a marker and see "0.5 mg — gestart op [datum]". Verify the same markers appear on the doctor's patient profile Overzicht tab.

**Acceptance Scenarios**:

1. **Given** a patient with 2 dose schedule entries (0.25 mg and 0.5 mg), **When** the progress chart renders, **Then** a vertical marker appears at the date the 0.5 mg dose started.
2. **Given** a patient with only 1 dose schedule entry, **When** the progress chart renders, **Then** no dose markers are shown.
3. **Given** a patient with 3+ dose steps, **When** viewing the chart, **Then** a marker appears at each dose step date, each labelled with the corresponding dose.
4. **Given** the doctor's patient profile Overzicht tab, **When** viewing a patient with 2+ doses, **Then** the same dose markers are visible on the chart.
5. **Given** a dose marker on the chart, **When** the user taps or hovers the marker, **Then** a tooltip appears: "[X] mg — gestart op [datum]".

---

### User Story 2 — Pre-increase announcement card (Priority: P2)

As a patient whose dose is about to increase, I want the app to tell me in advance, so that I'm not caught off guard by renewed side effects and understand that this is a normal step in my treatment.

**Why this priority**: The week before a dose increase is a high-anxiety moment. A simple contextual card transforms the experience from "what happened to me?" to "I was expecting this." This directly addresses the most common treatment moment where patients feel unsupported (Journey Map Phase 4 gap).

**Independent Test**: Set up a patient whose next scheduled dose increase is within 7 days. Open the dashboard. The pre-increase card should appear. Dismiss it and verify it does not reappear. Visit the dashboard on a day where no dose increase is within 7 days — the card should not appear.

**Acceptance Scenarios**:

1. **Given** a patient with a scheduled dose increase in 5 days, **When** the dashboard loads, **Then** a card appears: "Volgende week gaat je dosis omhoog naar [X] mg".
2. **Given** a patient with no upcoming dose increases, **When** the dashboard loads, **Then** no announcement card appears.
3. **Given** the pre-increase card is visible, **When** the patient dismisses it, **Then** the card does not reappear for that dose step.
4. **Given** a dose increase that was already in the past, **When** the dashboard loads, **Then** no retroactive announcement card appears for that dose step.

---

### User Story 3 — Injection-day new dose marker (Priority: P3)

As a patient injecting a new dose for the first time, I want the injection-day card to acknowledge that this is my first injection at a higher dose and prepare me for possible side effects, so that I feel supported during the transition.

**Why this priority**: This builds on the existing injection-day card (Feature 006) and the pre-increase card (US2). It's the "day of" companion to the "week before" notice. It completes the anticipatory guidance loop but is not essential if US1 and US2 are already in place.

**Independent Test**: Set up a patient whose injection day is today and whose current dose is the first or second injection at a new dose level. The injection-day card should include a "Nieuwe dosis" marker with brief side-effect guidance. After 2 completed injections at that dose, the marker should no longer appear.

**Acceptance Scenarios**:

1. **Given** a patient whose injection day is today and this is their first injection at a new dose, **When** the injection-day card renders, **Then** a "Nieuwe dosis" marker appears with the dose amount and a brief anticipatory message about possible side effects.
2. **Given** a patient on their second injection at a new dose, **When** the injection-day card renders, **Then** the marker still appears (second injection at new dose).
3. **Given** a patient who has completed 2 injections at the current dose, **When** the injection-day card renders, **Then** no "Nieuwe dosis" marker appears — the card looks like a standard injection-day card.
4. **Given** a patient on their very first dose ever (starting treatment), **When** the injection-day card renders, **Then** no "Nieuwe dosis" marker appears — there is no previous dose to compare against.

---

### Edge Cases

- What happens when a dose increase is scheduled but has "draft" status (not yet approved by the doctor)? — Draft dose entries do not trigger announcement cards or chart markers. Only "approved" entries are shown.
- What happens when a dose increase is cancelled or modified after the announcement card has already been shown? — The card does not reappear. If the dose date changes, a new card may appear for the updated date if it falls within the 7-day window.
- What happens when the patient has no progress entries (empty chart)? — Dose markers are not rendered since there is no chart to annotate.
- What happens when a dose step date falls outside the chart's visible date range? — Markers that fall outside the visible range are simply not rendered. No scrolling or pan-to-marker behaviour is required.
- What happens when multiple dose increases are within 7 days of each other? — Only the next upcoming increase triggers an announcement card. After that card is dismissed or the dose day passes, the next increase can trigger its own card.

## Requirements *(mandatory)*

### Functional Requirements

**Dose annotations on progress chart:**

- **FR-001**: The progress chart MUST display a vertical marker at each dose change date when the patient has 2 or more dose schedule entries with status "approved"
- **FR-002**: Each dose marker MUST show a tooltip on tap or hover displaying the dose amount and start date (e.g. "0.5 mg — gestart op 17 feb 2026")
- **FR-003**: Dose markers MUST be visually distinct from data lines — rendered as thin dashed vertical rules, not data points
- **FR-004**: If only one dose exists in the schedule, no markers MUST be shown
- **FR-005**: Dose markers MUST appear on both the patient dashboard chart and the doctor's patient profile Overzicht tab chart
- **FR-006**: Dose markers MUST be non-interactive beyond the tooltip — they do not affect chart zoom, pan, or data selection

**Pre-increase announcement card:**

- **FR-007**: A contextual card MUST appear on the patient dashboard when a scheduled dose increase (status "approved") has a start date within the next 7 days
- **FR-008**: The card MUST display the upcoming dose amount: "Volgende week gaat je dosis omhoog naar [X] mg"
- **FR-009**: The card MUST include a brief anticipatory message about possible side effects returning temporarily
- **FR-010**: The card MUST be dismissible — once dismissed, it does not reappear for that specific dose step
- **FR-011**: Dismissal state MUST persist across sessions (not lost on page refresh or re-login)
- **FR-012**: The card MUST NOT appear for dose increases that are already in the past
- **FR-013**: The card MUST NOT appear for dose entries with "draft" status

**Injection-day new dose marker:**

- **FR-014**: On injection day, if the current dose is a new dose level (first or second injection at this dose), the injection-day card MUST include a "Nieuwe dosis" marker
- **FR-015**: The marker MUST display the new dose amount and a brief message: "Je eerste injectie op [X] mg — bijwerkingen kunnen tijdelijk terugkomen"
- **FR-016**: After 2 completed injections at the current dose level, the marker MUST no longer appear
- **FR-017**: The marker MUST NOT appear for the patient's very first dose (no previous dose to compare against — this is not an "increase")
- **FR-018**: The "2 completed injections" count is derived from adherence records with response "confirmed" for entries at the current dose level

### Key Entities

- **Dose schedule entry**: An existing entity representing one dose level in the patient's titration plan. Key attributes: dose amount, start date, status (approved/draft), drug type. Multiple entries form the titration timeline.
- **Dose change**: A derived concept — the transition from one dose level to the next. Identified by comparing consecutive approved dose schedule entries ordered by start date. Drives both chart markers and announcement cards.
- **Announcement dismissal**: A client-side record tracking which dose steps the patient has dismissed the announcement card for. Persisted in local storage by dose schedule entry identifier.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Patients with 2+ dose steps see dose markers on their progress chart within 1 second of chart render — no additional navigation required
- **SC-002**: 100% of upcoming dose increases (within 7 days) are surfaced proactively via announcement cards — zero dose increases go unnoticed by patients who use the app
- **SC-003**: Dose markers are visible on both patient and doctor chart views — doctors can correlate weight changes to dose steps without switching tabs
- **SC-004**: Announcement cards are shown and dismissed within a single interaction — no multi-step flows or configuration needed
- **SC-005**: The injection-day "Nieuwe dosis" marker appears only for the first 2 injections at a new dose — patients are guided during transition without persistent noise

## Assumptions

- Dose schedule entries with status "approved" are the source of truth for all dose-related features. Draft entries are excluded from visibility.
- The existing titration protocol (semaglutide reference: 0.25 → 0.5 → 1.0 → 1.7 → 2.4 mg) means patients typically experience 4 dose increases in the first 16 weeks.
- Dismissal of announcement cards is stored client-side (local storage). This is acceptable for a prototype — production would use server-side persistence.
- The "2 completed injections" threshold for the injection-day marker is based on "confirmed" adherence records only — "skipped" and "adjusted" do not count.
- The injection-day card from Feature 006 is already in place and will be extended with the "Nieuwe dosis" marker.
