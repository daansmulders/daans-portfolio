# Feature Specification: Shareable Visit Summary

**Feature Branch**: `005-visit-summary`
**Created**: 2026-03-17
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Patient generates and views visit summary (Priority: P1)

A patient preparing for a doctor's appointment taps a secondary button on their dashboard labelled "Samenvatting voor afspraak." A full-screen, share-optimised view opens showing a compact snapshot of their progress, which they can show their doctor on their phone during the consultation.

**Why this priority**: Research Theme 11 shows patients often feel more informed about GLP-1 treatment than their doctors, creating friction at consultations. A one-tap summary removes that friction and is independently valuable without the doctor-side shortcut.

**Independent Test**: Can be fully tested by a patient with at least 4 weeks of log data — open the summary, verify all required data sections are present and readable, confirm it renders correctly on a phone-sized screen.

**Acceptance Scenarios**:

1. **Given** a patient is on the dashboard, **When** they tap "Samenvatting voor afspraak", **Then** a full-screen summary view opens without navigating away from the app.
2. **Given** the summary view is open, **When** the patient views it, **Then** it displays: patient name, treatment duration (weeks since first log), current dose, weight change (start → current in kg and %), last 4 weeks of log entries (date, weight, hunger score, side effects), active or recent side effects (past 4 weeks), open concerns or most recent doctor response, and wellbeing trend if weekly check-in data exists.
3. **Given** a data section has no data (e.g. no wellbeing check-ins), **When** the patient views the summary, **Then** that section is either omitted or shows a clean "Geen gegevens" label — no errors or broken layouts.
4. **Given** the summary view is open, **When** the patient taps "Deel", **Then** the native device share sheet opens allowing them to share the summary as a PDF or via messaging apps.
5. **Given** the summary defaults to the last 4 weeks, **When** the patient views it, **Then** the time window is clearly labelled so the doctor understands the scope.

---

### User Story 2 — Doctor opens patient visit summary (Priority: P2)

A doctor viewing a patient's profile during or before a consultation taps "Bekijk samenvatting" on the Overzicht tab, opening the same summary view the patient would share — without needing to navigate across multiple tabs.

**Why this priority**: Doctors need quick access to the same consolidated view during busy consultations. Depends on the summary view built in Story 1.

**Independent Test**: Can be tested by a doctor navigating to a patient profile with sufficient data and confirming the summary opens from the Overzicht tab with one tap, showing identical content to the patient view.

**Acceptance Scenarios**:

1. **Given** a doctor is on a patient's Overzicht tab, **When** they tap "Bekijk samenvatting", **Then** the same summary view opens showing that patient's data.
2. **Given** the doctor's summary view is open, **When** they view it, **Then** the content is identical to what the patient would see when generating their own summary.
3. **Given** a patient has very little data (e.g. only 1 week of logs), **When** the doctor opens the summary, **Then** it renders gracefully with whatever data is available — no empty-state errors.

---

### Edge Cases

- What if the patient has no log entries at all? → The summary button is hidden on the dashboard until the patient has at least one log entry. The doctor's shortcut shows an appropriate empty state.
- What if the patient's first log is recent (less than 4 weeks)? → The summary shows all available data with the actual date range labelled (e.g. "Afgelopen 2 weken") rather than defaulting to a blank 4-week window.
- What if the share sheet or PDF export is not supported by the device? → The share action gracefully falls back to allowing the patient to screenshot the view. The "Deel" button is not shown if the Web Share API is unavailable.
- What if the summary contains sensitive open concerns? → The summary is only accessible to the authenticated patient or their assigned doctor — no public links or unauthenticated access.
- What if there are no open concerns and no doctor responses? → The concerns/responses section is omitted from the summary entirely rather than showing a placeholder.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The patient dashboard MUST display a "Samenvatting voor afspraak" button as a secondary action, visible only when the patient has at least one log entry.
- **FR-002**: Tapping the button MUST open a full-screen summary view without losing the patient's current dashboard state.
- **FR-003**: The summary view MUST display the following sections when data is available: patient name and treatment duration, current dose, weight progress (start → current, kg and %), last 4 weeks of log entries, recent side effects (past 4 weeks), open concerns or most recent doctor response, and wellbeing trend (if check-in data exists).
- **FR-004**: Sections with no available data MUST be omitted or show a minimal "Geen gegevens" label — no error states, no broken layouts.
- **FR-005**: The summary MUST clearly label the data time window (e.g. "Afgelopen 4 weken") so context is unambiguous.
- **FR-006**: The summary view MUST include a "Deel" action that triggers the device's native share sheet when the Web Share API is available, enabling sharing as PDF or via messaging apps.
- **FR-007**: The "Deel" action MUST be hidden when the device does not support native sharing — no broken share flows.
- **FR-008**: The summary view MUST be optimised for readability on a phone screen — large enough text, sufficient contrast, no horizontal scrolling.
- **FR-009**: The doctor's patient Overzicht tab MUST include a "Bekijk samenvatting" shortcut that opens the same summary view for that patient.
- **FR-010**: The summary content shown to the doctor MUST be identical to the content the patient sees for themselves.
- **FR-011**: The summary MUST only be accessible to the authenticated patient (for their own data) or their assigned doctor — no unauthenticated access.

### Key Entities

- **Visit Summary View**: A read-only, derived view — not stored. Assembled at render time from existing data: `progress_entries`, `dosage_schedule_entries`, `concerns`, `advice`, and `weekly_wellbeing_checkins` (if feature 004 is implemented).
- **Summary Data Window**: The time range displayed in the summary. Defaults to last 4 weeks from today; adjusts to available data range if shorter.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A patient can open the visit summary in under 2 seconds from tapping the dashboard button.
- **SC-002**: The summary fits on a single phone screen without scrolling for patients with up to 4 weeks of data — or scrolls cleanly without layout breaks for more data.
- **SC-003**: The share action successfully triggers the native share sheet on supported devices 100% of the time; gracefully hides itself on unsupported devices.
- **SC-004**: A doctor can open a patient's summary from the Overzicht tab in one tap — no intermediate navigation required.
- **SC-005**: The summary renders correctly (no broken sections, no error states) for patients with as little as 1 log entry.

## Assumptions

- The visit summary is a purely read-only, derived view — it introduces no new stored entities. All data comes from tables already present in the prototype.
- Feature 004 (wellbeing tracking) may or may not be implemented when this feature ships. The wellbeing section is conditionally rendered only when check-in data exists — no hard dependency.
- PDF generation uses the browser's built-in print-to-PDF via `window.print()` on a print-optimised stylesheet, rather than a third-party PDF library. This keeps the dependency surface minimal.
- The Web Share API is used for native sharing on mobile; on desktop the share button may be absent or fall back to print/copy.
- The summary is not persisted or cached — it is generated fresh each time it is opened.
- "Treatment duration" is calculated from the patient's first `progress_entries` record, consistent with how the prototype already computes treatment context.
