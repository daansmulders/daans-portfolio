# Specification: Treatment Phase Summary Cards

**Status**: Draft
**Date**: 2026-03-18
**Author**: Product Owner + Designer

## Problem Statement

Patients on GLP-1 treatment follow a multi-month titration journey, but the app provides no structured reflection moments. After weeks of logging weight, hunger, symptoms, and wellbeing, there is no summary that shows patients how far they've come. Without periodic "look back" moments, patients may feel their progress is invisible — especially during plateaus or dose adjustments when motivation dips.

Treatment phase summary cards provide auto-generated milestone moments at key treatment intervals, giving patients a warm, informative snapshot of their progress.

## User Stories

### US-1: Patient sees a treatment milestone summary (P1)

**As a** patient who has reached a treatment milestone (4, 8, 12, or 16 weeks)
**I want to** see a summary card on my dashboard showing how my treatment is going
**So that** I can reflect on my progress and feel acknowledged for sticking with the treatment

**Acceptance criteria**:
- A summary card appears on the patient dashboard when they reach week 4, 8, 12, or 16 of treatment
- The card shows a personalised summary including: weight change since treatment start, number of log entries made, and a brief wellbeing trend observation
- The card is dismissible — once dismissed, it does not reappear for that milestone
- The tone is warm and informative, not gamified (no points, badges, or competitive language)
- Only one milestone card is shown at a time (the most recent unacknowledged milestone)

### US-2: Patient sees adherence context in milestone summary (P2)

**As a** patient reviewing my milestone summary
**I want to** see how consistently I've been taking my injections
**So that** I understand my adherence pattern alongside my other progress metrics

**Acceptance criteria**:
- The milestone card includes an injection adherence summary: number of confirmed injections out of total scheduled in the milestone period
- The adherence display uses a supportive tone regardless of adherence rate (no shaming language for missed doses)
- If no adherence data exists for the period, the adherence section is omitted

### US-3: Doctor sees patient milestone summaries (P3)

**As a** doctor viewing a patient's profile
**I want to** see the milestone summaries that were shown to my patient
**So that** I can reference the same progress context during consultations

**Acceptance criteria**:
- Milestone summaries for a patient are visible in the doctor's patient profile view
- The summaries show the same data as what the patient saw
- Dismissed/undismissed state is not relevant for the doctor view — all milestones for the patient are shown

## User Scenarios & Testing

### Scenario 1: Patient reaches week 4

**Given** a patient's treatment_start_date is exactly 4 weeks ago
**When** they open the dashboard
**Then** a week 4 summary card appears showing weight change since start, number of log entries in weeks 1–4, and a brief wellbeing observation

### Scenario 2: Patient dismisses a milestone card

**Given** a patient has a week 4 summary card visible
**When** they dismiss the card
**Then** the card disappears and does not reappear on subsequent visits
**And** when they reach week 8, a new milestone card appears

### Scenario 3: Patient has missed a milestone

**Given** a patient reached week 4 two weeks ago but never opened the app
**When** they open the dashboard at week 6
**Then** the week 4 summary card is shown (the most recent unacknowledged milestone)

### Scenario 4: Patient with no weight data

**Given** a patient reached week 4 but never logged their weight
**When** the milestone card is generated
**Then** the weight change section is omitted and the card focuses on other available metrics (log count, wellbeing trend)

### Scenario 5: Patient with no log entries in the period

**Given** a patient reached week 8 but logged nothing during weeks 5–8
**When** the milestone card is generated
**Then** the card still appears with a gentle acknowledgement and encouragement to keep logging, without shaming

### Scenario 6: Multiple milestones unclaimed

**Given** a patient hasn't opened the app since week 3 and it is now week 9
**When** they open the dashboard
**Then** only the most recent milestone (week 8) is shown, not both week 4 and week 8

### Scenario 7: Doctor views patient milestones

**Given** a patient has reached weeks 4 and 8
**When** the doctor views the patient's profile
**Then** both milestone summaries are visible in a dedicated section, regardless of whether the patient dismissed them

## Functional Requirements

### Milestone Trigger

- **FR-001**: Summary cards are generated at treatment weeks 4, 8, 12, and 16, calculated from the patient's treatment start date
- **FR-002**: A milestone becomes eligible when the current date is at or past the milestone week boundary
- **FR-003**: Only the most recent unacknowledged milestone is shown on the dashboard at any time
- **FR-004**: Once a patient dismisses a milestone card, it is marked as acknowledged and does not reappear

### Card Content

- **FR-005**: Each milestone card includes the following data (when available):
  - Treatment phase label (e.g., "Week 4", "Week 8")
  - Weight change: cumulative difference between first ever recorded weight and most recent weight at the time of the milestone, displayed as "X kg" with direction (e.g., "−3,2 kg sinds start")
  - Log count: total number of progress entries logged during the milestone period
  - Wellbeing trend: a brief qualitative observation derived from all available signals — hunger scores, food noise scores, energy/mood/confidence from weekly check-ins, and symptom frequency. Shows the most notable positive trend (e.g., "je honger is afgenomen", "minder klachten gemeld", "je energie is verbeterd"). If no clear trend exists, this section is omitted.
- **FR-006**: Fields with no available data are omitted from the card — no placeholder text or zero values
- **FR-007**: The card displays a warm, editorial heading and body text personalised with the patient's data. Tone is supportive and reflective, never competitive or gamified

### Adherence Summary (US-2)

- **FR-008**: If injection adherence data exists for the milestone period, the card includes: confirmed injections out of total scheduled (e.g., "3 van 4 injecties bevestigd")
- **FR-009**: Adherence is presented without judgement — no "good" or "bad" labels, no colour-coded pass/fail

### Doctor View (US-3)

- **FR-010**: The doctor's patient profile includes a section showing all generated milestone summaries for that patient
- **FR-011**: Milestone summaries in the doctor view show the same data as the patient view
- **FR-012**: All milestones are shown in the doctor view regardless of patient dismissal state

### Dismissal

- **FR-013**: The milestone card has a dismiss affordance (e.g., close button)
- **FR-014**: Dismissal state is persisted so the card does not reappear after page refresh or re-login

### Layout & Positioning

- **FR-015**: The milestone card appears in the dashboard's alert/celebration zone (after primary action, before the progress chart)
- **FR-016**: The milestone card is visually distinct from other dashboard cards (alerts, injection day, celebrations) to signal it is a periodic summary rather than an urgent notification

## Scope

### In Scope

- Auto-generating milestone summary cards at weeks 4, 8, 12, 16
- Displaying weight change, log count, wellbeing trend, and injection adherence
- Dismissal persistence
- Doctor view of patient milestones

### Out of Scope

- Milestones beyond week 16 (future extension)
- Shareable or exportable summary cards (covered by backlog item 5)
- Push notifications for milestones
- Customisable milestone intervals
- Comparison between milestone periods (e.g., "week 8 vs week 4")

## Dependencies

- Treatment start date on the patients table (used to calculate milestone weeks)
- Progress entries for weight and log count data
- Injection adherence records for adherence summary (US-2)
- Weekly wellbeing check-ins for wellbeing trend observations (if available)
- Existing dashboard zone system for card placement

## Assumptions

- Treatment start date is always set by the doctor during patient intake — it is never null for an active patient
- The 4-week interval (4, 8, 12, 16) is fixed and does not need to be configurable
- Wellbeing trend observations are derived from available data using simple heuristics (e.g., average hunger score direction) — no complex statistical analysis
- Dismissal persistence uses local storage, consistent with the existing pattern for milestone and announcement dismissals
- The patient does not need to see historical milestone cards — only the current one. Historical milestones are visible only to doctors.

## Clarifications

### Session 2026-03-18

- Q: Weight change scope — cumulative since treatment start or incremental per period? → A: Cumulative since treatment start (first ever weight vs most recent at milestone).
- Q: Wellbeing trend data sources — which signals? → A: All available signals (hunger, food noise, energy, mood, confidence, symptom frequency). Show the most notable positive trend.

## Success Criteria

- **SC-001**: 100% of patients who reach a milestone week see a summary card on their next dashboard visit
- **SC-002**: Each milestone card displays at least one personalised data point (weight change, log count, or wellbeing observation)
- **SC-003**: Dismissed milestone cards do not reappear for the patient across sessions
- **SC-004**: A doctor can view all milestone summaries for a patient from the patient profile
- **SC-005**: The milestone card tone is perceived as warm and supportive — no gamification language (points, badges, rankings, streaks)
- **SC-006**: No regression — existing dashboard functionality (injection day, alerts, celebrations, recent entries) continues to work unchanged
