# Specification: Log Entry Card Redesign

**Status**: Draft
**Date**: 2026-03-18
**Author**: Product Owner + Designer

## Problem Statement

The "Recente metingen" cards on the patient dashboard and the log history on the doctor's patient view currently show only the date, weight, and hunger score per entry. Since features 004–009, daily logs also capture food noise, symptoms (with severity scores), and notes. This data is stored but invisible in the entry cards, reducing the value of the log overview for both patients and doctors.

Patients cannot review what they logged without re-opening the log form, and doctors miss symptom and food noise context when scanning a patient's recent entries.

## User Stories

### US-1: Patient reviews recent log entries (P1)

**As a** patient
**I want to** see all the details I logged in my recent entries at a glance
**So that** I can remember what I reported and track patterns in my symptoms, hunger, and food noise over time

**Acceptance criteria**:
- Each log entry card shows all non-empty fields that were logged: date, weight, hunger score, food noise score, symptoms (with severity), and notes
- Empty fields do not leave visual gaps or placeholder text
- The card remains scannable — a patient with 3 recent entries can visually distinguish them without scrolling excessively on a standard mobile screen

### US-2: Doctor reviews patient log history (P1)

**As a** doctor viewing a patient's profile
**I want to** see the full details of each log entry in the Overzicht tab
**So that** I can quickly assess the patient's recent symptom patterns, hunger trends, and any notes they've left

**Acceptance criteria**:
- Log entries in the doctor's patient view show the same data fields as the patient's recent entries
- Symptom chips include severity indicators for entries that have severity data
- Historical entries without severity data display symptom names only (no severity badge)

## User Scenarios & Testing

### Scenario 1: Patient with a rich log entry

**Given** a patient has logged weight, hunger 4/5, food noise 3/5, two symptoms (Misselijkheid severity 3, Vermoeidheid severity 1), and a note
**When** they view their dashboard
**Then** the entry card shows all five data points in a compact, readable layout

### Scenario 2: Patient with a minimal log entry

**Given** a patient has logged only hunger 3/5 (no weight, no symptoms, no food noise, no notes)
**When** they view their dashboard
**Then** the entry card shows date and hunger score only, with no empty gaps or placeholders

### Scenario 3: Injection day badge coexists with expanded data

**Given** a log entry was created on an injection day
**When** the patient views the dashboard
**Then** the injection day badge is visible alongside the full entry data without layout breakage

### Scenario 4: Doctor views patient with mixed legacy and new entries

**Given** a patient has older entries (symptoms as plain names, no severity, no food noise) and newer entries (symptoms with severity, food noise score)
**When** the doctor views the Overzicht tab
**Then** older entries show symptom names without severity badges, newer entries show symptom names with severity badges, and no errors occur

### Scenario 5: Entry with notes

**Given** a patient has written a note on a log entry
**When** the entry card is displayed
**Then** the note text is visible, truncated to a reasonable length (e.g., 2 lines) to prevent cards from becoming excessively tall

## Functional Requirements

### Display — Patient Dashboard

- **FR-001**: Each log entry card displays all non-null fields from the entry: date, weight, hunger score, food noise score, symptoms with severity, and notes
- **FR-002**: Fields that are null or empty are not rendered — no placeholder text, no empty rows, no visual gaps
- **FR-003**: Symptoms are displayed as compact chips with severity score (e.g., "Misselijkheid 3/5") for entries that include severity data. Maximum 3 chips shown; if more symptoms were logged, a "+N meer" indicator is displayed after the third chip
- **FR-004**: Notes are displayed as truncated text (maximum 2 lines) to prevent excessive card height
- **FR-005**: The injection day badge remains visible and does not conflict with the expanded card layout
- **FR-006**: The patient dashboard continues to show the 3 most recent entries

### Display — Doctor Patient View

- **FR-007**: Log entries in the doctor's Overzicht tab display the same expanded data fields as the patient dashboard cards
- **FR-008**: Historical entries with legacy symptom data (plain names, no severity) display symptom names without a severity badge
- **FR-009**: The doctor view continues to show the 5 most recent entries

### Layout

- **FR-010**: The card layout adapts gracefully to entries with varying amounts of data — a minimal entry (date + one score) should not look broken, and a maximal entry (all fields populated) should remain compact and scannable
- **FR-011**: On mobile screens (≤ 700px width), all data remains readable without horizontal scrolling

### Design Direction

- **FR-012**: Two layout variants must be built and evaluated side by side on mobile:
  - **Variant A — Expandable**: Collapsed state shows date and weight. Tapping the card expands it to reveal hunger, food noise, symptoms with severity, and notes. A visual affordance (e.g., chevron) indicates the card is expandable. Accordion behavior: only one card can be expanded at a time — expanding a card collapses the previously open one.
  - **Variant B — Full detail**: All non-null fields are shown inline on every card by default. Uses a compact layout (e.g., icon row, mini-chips) to manage vertical space.
- **FR-013**: A developer-only mechanism (e.g., URL parameter) to toggle between Variant A and Variant B must exist so both can be reviewed with real data before a final design decision is made. This toggle is not visible to patients or doctors.

## Scope

### In Scope

- Redesigning the log entry cards on the patient dashboard ("Recente metingen")
- Updating the log entry display in the doctor's patient profile Overzicht tab
- Handling both legacy (pre-severity) and current data formats gracefully

### Out of Scope

- Changing how many entries are shown (remains 3 for patient, 5 for doctor)
- Adding new data fields to the log form itself
- Full log history view or pagination (future feature)
- Chart or trend visualisations within the card

## Dependencies

- Feature 009 (side effect tips): Symptom entries now include severity scores — cards must render `SymptomEntry[]` format
- Feature 004 (wellbeing tracking): Food noise score is available on entries

## Assumptions

- The card redesign applies to the same two locations where log entries are currently shown: patient dashboard and doctor patient profile
- Notes truncation at 2 lines is sufficient — full note text is not required in the card view (it can be seen in a future detail view)
- No new data fetching is needed — all fields are already available on the `ProgressEntry` object

## Clarifications

### Session 2026-03-18

- Q: Variant A expand behavior — accordion (one at a time) or independent (multiple)? → A: Accordion — only one card expanded at a time.
- Q: Variant toggle mechanism — developer flag or user-facing toggle? → A: Developer flag (URL parameter or hidden setting), not visible to end users.
- Q: Many symptoms display — show all or truncate? → A: Truncate at 3 chips, show "+N meer" for the rest.
- Q: Final variant decision after prototyping both? → A: Variant A (expandable accordion). The symptom chip truncation already signals there's hidden data, so collapsing entirely is more consistent. Cards look cleaner collapsed. Future idea: show a small average score and side-effect indicator on the collapsed row.

## Success Criteria

- **SC-001**: 100% of non-null entry fields are visible in the card without requiring navigation to a separate screen
- **SC-002**: A patient can distinguish the content of 3 recent entries within 5 seconds of viewing the dashboard
- **SC-003**: Cards with minimal data (1–2 fields) and maximal data (all fields) both render without layout issues on mobile
- **SC-004**: No regression — existing functionality (injection day badge, chart, dashboard zones) continues to work unchanged
- **SC-005**: Doctor can identify which symptoms a patient logged and their severity directly from the Overzicht tab without opening individual entries
