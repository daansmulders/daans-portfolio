# Feature Specification: Sliminject UX Improvements

**Feature Branch**: `002-sliminject-ux-improvements`
**Created**: 2026-03-16
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

---

### User Story 1 – Consistent Form Feedback (Priority: P1)

Every form submission in the app — log entry, concern, appointment, advice, intake, schedule — gives the user a clear visual confirmation (success) or explanation (error). Currently forms have inconsistent feedback; some are silent on success.

**Why this priority**: Feedback is the foundation of trust. Without it, users re-submit, second-guess themselves, or lose confidence in the app. This affects every screen and every user type, so it has the highest leverage.

**Independent Test**: Submit any form and verify a toast appears confirming success. Trigger a network error and verify a clear error message appears. Delivers immediate confidence to all users.

**Acceptance Scenarios**:

1. **Given** a patient submits a log entry, **When** the entry is saved (online or queued offline), **Then** a toast notification appears confirming success with a message that distinguishes online save from offline queue.
2. **Given** a doctor submits a new appointment, **When** it is saved, **Then** a confirmation toast appears with the appointment date/time.
3. **Given** any form submission fails due to a network or validation error, **When** the error occurs, **Then** an inline error message is shown explaining what went wrong and what the user should do.
4. **Given** a doctor responds to a concern, **When** the response is saved, **Then** a success toast appears and the concern is marked as resolved in the UI.

---

### User Story 2 – Prominent Daily Log CTA on Dashboard (Priority: P1)

The patient dashboard surfaces a clear, visually prominent call-to-action button for logging today's progress. If the patient has already logged today, the CTA changes to reflect that and the streak/completion is celebrated.

**Why this priority**: The entire product's value depends on consistent daily logging. If the primary action isn't immediately obvious, patients will open the app, feel lost, and close it. This is the highest-risk gap for retention.

**Independent Test**: Open the patient dashboard and verify a "Log today" button is the most visually prominent element. Log an entry and verify the CTA changes state to "Logged today ✓".

**Acceptance Scenarios**:

1. **Given** a patient opens the dashboard and has not yet logged today, **When** they view the screen, **Then** a prominent CTA button labelled "Log vandaag" is visible above the fold.
2. **Given** a patient has already logged today, **When** they view the dashboard, **Then** the CTA changes to a completed state (e.g. "Vandaag gelogd ✓") and is no longer the primary action.
3. **Given** a patient taps the log CTA, **When** they land on the log form, **Then** the form opens immediately with no intermediate steps.

---

### User Story 3 – Hunger Scale Labelled Anchors (Priority: P1)

The 1–5 hunger scale in the log entry form displays clear text labels at each end (e.g. "Geen honger" at 1, "Heel veel honger" at 5) so patients can log consistently over time.

**Why this priority**: Without anchors, the same score means different things to different patients — or even to the same patient on different days. This undermines the clinical value of the data. A one-line fix with outsized data quality impact.

**Independent Test**: Open the log entry form and verify both ends of the hunger scale have descriptive Dutch labels. Log two entries on different days and confirm the scale feels consistent.

**Acceptance Scenarios**:

1. **Given** a patient is on the log entry form, **When** they view the hunger scale, **Then** label "Geen honger" appears at 1 and "Heel veel honger" appears at 5.
2. **Given** a patient selects a value on the scale, **When** the value is selected, **Then** the selected number is visually highlighted and its meaning is clear from the labels.

---

### User Story 4 – Empty States for All Key Screens (Priority: P2)

Every screen that can show "no data" has a designed empty state: a short explanation of what will appear here, why it's empty now, and what the user should do next.

**Why this priority**: Every new patient and every new doctor account hits empty states first. A blank screen communicates nothing — or worse, implies something is broken. This is the first impression.

**Independent Test**: Log in with a brand-new patient account and verify each screen shows a helpful empty state rather than a blank or broken layout.

**Acceptance Scenarios**:

1. **Given** a new patient has no log entries, **When** they view the dashboard, **Then** an empty state is shown explaining that progress chart and history will appear here after their first log entry, with a direct link to log.
2. **Given** a new patient has no concerns, **When** they view the concerns screen, **Then** an empty state explains what the concerns feature is for and encourages them to reach out if they have questions.
3. **Given** a doctor has no patients yet, **When** they view the overview, **Then** an empty state guides them to onboard their first patient via the intake form.
4. **Given** a patient has not viewed any educational content, **When** they open the content screen, **Then** a welcoming empty state suggests where to start.

---

### User Story 5 – Pre-Chart Motivational State (First 7 Days) (Priority: P2)

During the first 7 days before the progress chart has enough data to render, the dashboard shows a motivational progress indicator — a streak counter or "X of 7 days logged" visual — instead of an empty chart area.

**Why this priority**: The first week is the highest churn risk. Showing nothing in the chart area communicates "nothing is happening yet," which discourages continued logging. A streak indicator creates a reward loop immediately.

**Independent Test**: Create a patient account with 1–6 days of log entries and verify the dashboard shows a motivational progress element instead of an empty chart.

**Acceptance Scenarios**:

1. **Given** a patient has logged 1–6 days of entries, **When** they view the dashboard, **Then** they see a streak counter showing how many consecutive days they've logged (e.g. "3 dagen op rij!") instead of an empty chart.
2. **Given** a patient logs their 7th consecutive entry, **When** they return to the dashboard, **Then** the progress chart appears and the streak is celebrated.
3. **Given** a patient misses a day, **When** they return to the app, **Then** the streak counter resets and a gentle encouragement message is shown (e.g. "Begin opnieuw — elke dag telt").

---

### User Story 6 – Tabbed Patient Profile for Doctors (Priority: P2)

The doctor's patient profile page is reorganised into tabs or clearly separated sections — Overzicht, Medicatie, Meldingen, Afspraken — so the doctor can navigate directly to what they need without scrolling through the entire page.

**Why this priority**: The current profile page stacks everything into one scroll. Doctors using this on mobile or under time pressure will not scroll to find the concern inbox or schedule. This directly affects clinical workflow efficiency.

**Independent Test**: Open a patient profile with data in all sections and verify each section is accessible via a tab or anchor link without scrolling past unrelated content.

**Acceptance Scenarios**:

1. **Given** a doctor opens a patient profile, **When** the page loads, **Then** four tabs are visible: Overzicht, Medicatie, Meldingen, Afspraken.
2. **Given** a doctor taps the Meldingen tab, **When** it activates, **Then** they see only the concern inbox without having to scroll past contact info, chart, or medication timeline.
3. **Given** a patient has an unread concern, **When** a doctor views the profile, **Then** the Meldingen tab displays a badge with the unread count.

---

### User Story 7 – First Log Entry as Final Onboarding Step (Priority: P3)

The patient onboarding flow adds a 4th step — "Doe je eerste meting" — that prompts the patient to complete their first log entry before they reach the main dashboard.

**Why this priority**: Onboarding that doesn't prompt the first key action leaves patients without the habit scaffold. Completing one log entry during onboarding establishes the pattern immediately.

**Independent Test**: Complete the onboarding flow as a new patient and verify the final step prompts a log entry, then lands on the dashboard showing the first entry.

**Acceptance Scenarios**:

1. **Given** a new patient completes the first 3 onboarding steps, **When** they tap "Volgende" on step 3, **Then** a 4th step appears titled "Doe je eerste meting" with a condensed log form.
2. **Given** a patient completes the first log entry in onboarding, **When** they submit, **Then** they are taken to the dashboard which already shows their entry and the streak counter at 1.
3. **Given** a patient taps "Sla over" on the first log step, **When** they proceed, **Then** they land on the dashboard with the prominent log CTA visible.

---

### User Story 8 – Advice Editor Visibility Label (Priority: P3)

The advice textarea in the doctor's patient profile is clearly labelled to indicate that its content is shared with the patient and visible on their dashboard. The label is persistent (not a tooltip), so doctors always know what they're writing.

**Why this priority**: Medical professionals need to know the audience for every note they write. Ambiguity here could lead to inappropriate information being shown to patients (or useful information being withheld).

**Independent Test**: Open the advice editor on any patient profile and verify a persistent label indicates the text is visible to the patient.

**Acceptance Scenarios**:

1. **Given** a doctor views the advice section on a patient profile, **When** the section is rendered, **Then** a visible label reads "Zichtbaar voor patiënt" near the textarea.
2. **Given** a doctor saves advice, **When** the patient views their dashboard, **Then** the advice appears with a clear "Van uw arts" header.

---

### User Story 9 – Response Time Expectation After Concern Submission (Priority: P3)

After a patient submits a concern (routine or urgent), a confirmation message includes the expected response time based on severity.

**Why this priority**: Without response time context, patients may re-submit, escalate unnecessarily, or feel ignored. Setting expectations reduces anxiety in a medical context where ambiguity is harmful.

**Independent Test**: Submit a routine concern and verify a response-time message appears. Submit an urgent concern and verify the message reflects the urgency.

**Acceptance Scenarios**:

1. **Given** a patient submits a routine concern, **When** the submission succeeds, **Then** a confirmation message shows "Verwacht antwoord binnen 1 werkdag."
2. **Given** a patient submits an urgent concern, **When** the submission succeeds, **Then** a confirmation reads "Uw melding is als urgent gemarkeerd. We nemen zo snel mogelijk contact op."
3. **Given** a patient views their concern history, **When** a concern is still open, **Then** the expected response time is shown alongside the submission date.

---

### User Story 10 – Prioritised Symptom Checklist (Priority: P3)

The symptom checklist groups the top 3 most common GLP-1 side effects prominently, with remaining options accessible via an expand control.

**Why this priority**: 7 equally-weighted options is cognitive overhead for a daily task. Patients with nausea (the most common GLP-1 side effect) should be able to tap it immediately without scanning the full list.

**Independent Test**: Open the log entry form and verify the top 3 symptoms are immediately visible and the remaining options are accessible but secondary.

**Acceptance Scenarios**:

1. **Given** a patient opens the log entry form, **When** the symptom section renders, **Then** the top 3 symptoms (misselijkheid, reactie injectieplaats, vermoeidheid) are shown prominently.
2. **Given** a patient wants to log a less common symptom, **When** they tap "Meer symptomen", **Then** the remaining options expand inline.
3. **Given** a patient selects a symptom from the expanded list, **When** they submit, **Then** the symptom is saved correctly regardless of which group it belongs to.

---

### User Story 11 – Structured Educational Content (Priority: P4)

The content screen organises educational articles into topic groups (e.g. "Aan de slag," "Bijwerkingen," "Voeding & leefstijl") with a clear recommended starting point.

**Why this priority**: An unstructured list of articles is rarely read. Curriculum structure gives patients a sense of progression and ensures they encounter the most important information first.

**Independent Test**: Open the content screen and verify articles are organised into at least 2 topic groups with a "Start hier" section visible above the fold.

**Acceptance Scenarios**:

1. **Given** a patient opens the content screen, **When** it loads, **Then** articles are grouped under topic headings with a "Start hier" group at the top.
2. **Given** a patient completes all articles in a group, **When** they view the group, **Then** a completion indicator is shown on the group heading.
3. **Given** a patient has not started any content, **When** they open the screen, **Then** the first article in "Start hier" is highlighted as the recommended next action.

---

### User Story 12 – Dosage Schedule Titration Curve Preview (Priority: P4)

The doctor's schedule editor displays a live-updating visual of the dosage titration curve — a simple chart showing dose over time — below the entry list.

**Why this priority**: Managing GLP-1 titration without a visual is error-prone. The chart gives doctors immediate confirmation that the schedule is correct before committing.

**Independent Test**: Open the schedule editor with 3+ entries and verify a chart is visible showing dose over time. Add a new entry and verify the chart updates.

**Acceptance Scenarios**:

1. **Given** a doctor opens the schedule editor with existing entries, **When** the page loads, **Then** a chart is shown plotting dose over time.
2. **Given** a doctor adds a new schedule entry, **When** the entry is saved, **Then** the chart updates immediately.
3. **Given** a doctor removes an entry, **When** it is deleted, **Then** any gaps in the schedule are visually apparent in the chart.

---

### User Story 13 – Real-Time Urgent Concern Surfacing (Priority: P4)

When a patient submits an urgent concern, the doctor's navigation immediately updates to show a badge indicating an urgent item requires attention, without requiring a manual page refresh.

**Why this priority**: In a medical context, "urgent" means the doctor needs to act quickly. A polling-based approach that surfaces the concern only on next refresh is insufficient.

**Independent Test**: Submit an urgent concern as a patient and, without the doctor refreshing, verify a badge appears in the doctor's navigation within 30 seconds.

**Acceptance Scenarios**:

1. **Given** a patient submits an urgent concern, **When** the doctor's app is open, **Then** a red badge appears on the overview navigation within 30 seconds without a refresh.
2. **Given** a doctor views the overview with an urgent badge, **When** they open the affected patient, **Then** the urgent concern is shown prominently at the top of the Meldingen tab.
3. **Given** a doctor responds to the urgent concern, **When** the response is saved, **Then** the badge clears.

---

### User Story 14 – Daily Logging Reminder Notification (Priority: P4)

Patients can opt in to a daily notification reminding them to log their progress if they haven't done so by a chosen time.

**Why this priority**: Without reminders, adherence drops sharply outside the first week. This is the single highest-leverage retention mechanism for a habit-dependent product.

**Independent Test**: Enable a daily reminder at 20:00 and, without logging before that time, verify a notification appears. Log an entry before 20:00 and verify no notification fires.

**Acceptance Scenarios**:

1. **Given** a patient has enabled daily reminders at a preferred time, **When** that time arrives and no entry has been logged today, **Then** a notification is delivered with text "Vergeet je meting niet vandaag!"
2. **Given** a patient has already logged today, **When** the reminder time arrives, **Then** no notification is sent.
3. **Given** a patient opens the notification, **When** they tap it, **Then** they land directly on the log entry form.
4. **Given** a patient has not configured reminders, **When** they view their profile settings, **Then** they can enable reminders and choose a preferred daily time.

---

### Edge Cases

- What happens when a patient submits a concern while offline? The concern should be queued and the confirmation message should note "melding wordt verstuurd zodra je online bent."
- What if a patient's log streak breaks due to a sync failure rather than genuinely missing a day? Offline-queued entries must not be counted as missed days.
- What does the titration curve chart show when a doctor has only one schedule entry (a single point)? It should show a labelled point, not an empty or broken chart.
- What if educational content is not yet loaded from the server? Skeleton loading states should appear, not a blank screen.
- What happens if the doctor's real-time connection drops while waiting for urgent concern updates? Fall back to polling and show a subtle offline indicator.

---

## Requirements *(mandatory)*

### Functional Requirements

**Patient — Dashboard & Logging**

- **FR-001**: The dashboard MUST display a prominent "Log vandaag" call-to-action as the primary element when the patient has not yet logged today.
- **FR-002**: The dashboard MUST change the log CTA to a completed state when the patient has already logged today.
- **FR-003**: The hunger scale MUST display Dutch text labels at both ends of the scale.
- **FR-004**: The log entry form MUST display the top 3 most common GLP-1 symptoms prominently, with remaining symptoms accessible via an expand control.
- **FR-005**: The dashboard MUST display a streak counter when the patient has fewer than 7 days of data and the chart cannot yet render.

**Patient — Onboarding**

- **FR-006**: The onboarding flow MUST include a 4th step that prompts the patient to complete their first log entry.
- **FR-007**: The onboarding 4th step MUST offer a skip option.

**Patient — Concerns**

- **FR-008**: After submitting a concern, the system MUST display an expected response time message appropriate to the selected severity.

**Patient — Content**

- **FR-009**: The content screen MUST organise articles into named topic groups with a "Start hier" group at the top.

**Patient — Notifications**

- **FR-010**: Patients MUST be able to opt in to daily logging reminders at a configurable time.
- **FR-011**: A daily reminder MUST NOT fire on days when the patient has already logged an entry.

**Doctor — Patient Profile**

- **FR-012**: The patient profile MUST be organised into at least 4 navigable sections: Overzicht, Medicatie, Meldingen, Afspraken.
- **FR-013**: The Meldingen section MUST display an unread badge count when the patient has unresponded concerns.
- **FR-014**: The advice editor MUST display a persistent label indicating the advice is visible to the patient.

**Doctor — Schedule Editor**

- **FR-015**: The schedule editor MUST display a live-updating titration curve chart below the entry list.

**Doctor — Real-time Concerns**

- **FR-016**: When a patient submits an urgent concern, the doctor's navigation MUST update with a badge within 30 seconds without a manual refresh.
- **FR-017**: Responding to an urgent concern MUST clear the urgent badge.

**Cross-cutting**

- **FR-018**: Every screen that can render with no data MUST have a designed empty state with an explanation and a suggested next action.
- **FR-019**: Every form submission MUST produce a visible success confirmation and a visible error message on failure.
- **FR-020**: All new user-facing copy MUST be added to `nl.ts`; no hardcoded Dutch strings in components.
- **FR-021**: All improvements MUST preserve offline-first behaviour; forms submitted offline MUST queue correctly and confirm queued status to the user.

### Key Entities

- **LogEntry**: Daily patient record — weight, hunger score (1–5), selected symptoms, free-text notes, timestamp. Hunger score requires consistent interpretation; anchor labels ensure this.
- **Concern**: Patient-submitted message with severity (routine/urgent), body, submission timestamp, doctor response, resolution status, and expected response time metadata.
- **DosageScheduleEntry**: A point in a patient's titration schedule — date, drug type, dose, notes. Collection of entries forms the titration curve.
- **EducationalContentItem**: Article or video with title, topic group, recommended order within group, viewed status per patient.
- **NotificationPreference**: Per-patient setting storing daily reminder opt-in status and preferred reminder time.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new patient can identify and complete their first log entry within 60 seconds of opening the dashboard for the first time.
- **SC-002**: 100% of form submissions provide visible feedback — success confirmation or error explanation — with no silent failures.
- **SC-003**: A doctor can navigate to the concern inbox on any patient profile within 2 taps from the overview, without scrolling.
- **SC-004**: An urgent concern submitted by a patient surfaces as a badge in the doctor's navigation within 30 seconds.
- **SC-005**: Every key screen shows a meaningful empty state rather than a blank layout when viewed with no data.
- **SC-006**: Patients who opt in to daily reminders receive a notification on days they have not logged, and no notification on days they have — with 0 false positives in testing.
- **SC-007**: A returning patient can complete a log entry in under 45 seconds using the prioritised symptom checklist and labelled hunger scale.

---

## Assumptions

- The `nl.ts` translation file is the single source for all user-facing strings; all new strings will be added there.
- Offline support for new features degrades gracefully: notifications are best-effort, real-time concern badges fall back to polling when offline.
- Push notifications will use the Web Notifications API for this prototype scope (no native app shell required).
- The "Start hier" content grouping will be seeded manually in the educational content data — no CMS needed for this prototype.
- Response time expectations (1 working day for routine, ASAP for urgent) are fixed values for this prototype and not configurable per practice.
- The titration curve chart will follow the same SVG chart pattern established in ProgressChart for visual consistency.
