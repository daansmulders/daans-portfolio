# Feature Specification: Wellbeing Tracking — Food Noise & Non-Scale Victories

**Feature Branch**: `004-wellbeing-tracking`
**Created**: 2026-03-17
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Patient logs food noise in daily log (Priority: P1)

A patient fills in the daily log form and sees a new optional field asking how loud their food thoughts were today. They rate it on a 1–5 scale and submit. Over time, the trend appears alongside their weight on the progress chart.

**Why this priority**: "Food noise" reduction is the most emotionally resonant benefit of GLP-1 treatment (research Theme 12, "Very high" frequency). Capturing it daily — inside the existing log form — requires minimal extra effort from the patient and produces the richest trend data. It is independently valuable without the weekly check-in.

**Independent Test**: Can be fully tested by a patient submitting several log entries with food noise scores over multiple days and confirming the scores appear in the progress chart as a secondary trend line.

**Acceptance Scenarios**:

1. **Given** a patient is filling in the daily log form, **When** they reach the new food noise field, **Then** they see a 1–5 scale labelled "Nauwelijks aanwezig" (1) to "Constant aanwezig" (5).
2. **Given** a patient skips the food noise field, **When** they submit the log, **Then** the entry is saved successfully without a food noise score (field is optional).
3. **Given** a patient has logged food noise scores on at least 3 separate days, **When** they view the progress chart, **Then** a food noise trend line is visible alongside the weight line (togglable, off by default).
4. **Given** a patient's food noise has dropped from ≥4 to ≤2 sustained over 4+ weeks, **When** the system detects this, **Then** a milestone card appears on the dashboard: "Je eetgedachten zijn de afgelopen weken flink afgenomen — een van de grootste voordelen van je behandeling."
5. **Given** a doctor views a patient's progress chart, **When** they toggle the food noise line, **Then** the same trend is visible on the doctor's patient profile.

---

### User Story 2 — Patient completes weekly wellbeing check-in (Priority: P2)

Once per week, a patient sees a prompt on their dashboard inviting them to rate their energy, mood, and body confidence, with an optional free-text note. After submitting, they see a brief comparison to last week's scores.

**Why this priority**: Weekly check-ins capture the quality-of-life wins that weight alone misses (research Theme 1: Sense of Normalcy, Theme 9: Identity Shift). Depends on Story 1 only for the shared chart visualisation; independently testable without it.

**Independent Test**: Can be tested by a patient completing two consecutive weekly check-ins and verifying that scores are stored, the dashboard comparison shows week-over-week change, and the prompt does not reappear until the following week.

**Acceptance Scenarios**:

1. **Given** 7 days have passed since the patient's last wellbeing check-in (or they have never completed one), **When** they open the dashboard, **Then** a "Hoe voel je je deze week?" prompt is visible.
2. **Given** the check-in prompt is visible, **When** the patient submits ratings for energy, mood, and body confidence (each 1–5), **Then** the scores are saved and a brief summary shows their scores vs. last week (or "Eerste check-in!" if no previous data).
3. **Given** the patient adds a free-text note ("Iets bijzonders deze week?", max 200 chars), **When** they submit, **Then** the note is saved alongside the scores.
4. **Given** a patient has just completed a check-in, **When** they return to the dashboard, **Then** the check-in prompt is not shown again until 7 days have passed.
5. **Given** a patient has completed 4 consecutive weekly check-ins, **When** they view the dashboard, **Then** a streak indicator shows "4 weken op rij ingevuld."
6. **Given** any single wellbeing dimension improves by 2+ points sustained over 4 weeks, **When** the system detects this, **Then** a milestone card appears using a lighthearted, supportive tone (e.g., "Je energie is de afgelopen weken flink toegenomen").

---

### User Story 3 — Doctor views wellbeing trends on patient profile (Priority: P3)

A doctor reviewing a patient's profile can see both the food noise trend and the weekly wellbeing scores on the Overzicht tab, alongside the existing weight chart.

**Why this priority**: Provides the full clinical picture — not just physical progress — enabling more informed consultations. Depends on data produced by Stories 1 and 2.

**Independent Test**: Can be tested by opening a doctor account, navigating to a patient with at least 2 weeks of food noise and wellbeing data, and confirming the trends are visible on the Overzicht tab.

**Acceptance Scenarios**:

1. **Given** a patient has logged food noise on multiple days, **When** a doctor views the patient's Overzicht tab, **Then** the food noise trend is accessible (toggled on or off) within the progress chart.
2. **Given** a patient has completed at least one weekly check-in, **When** a doctor views the patient's Overzicht tab, **Then** a wellbeing summary shows the most recent scores and the trend direction for each dimension.
3. **Given** a patient has no food noise or wellbeing data, **When** the doctor views the Overzicht tab, **Then** a neutral empty state is shown with no errors.

---

### Edge Cases

- What if a patient skips food noise for many days then logs it again? → The trend chart renders only the days with data; gaps are represented as breaks in the line, not zeros.
- What if a patient submits a weekly check-in less than 7 days after their last one? → The system should not allow a second check-in within the same 7-day window; the prompt does not reappear until the window expires.
- What if a patient has only 1 or 2 food noise data points? → The trend line is not shown until at least 3 data points exist; below that threshold the chart shows a "Log meer dagen om je trend te zien" nudge.
- What if a patient has no previous wellbeing check-in when submitting their first? → The post-submission summary shows "Eerste check-in! Volgende week zie je hoe je je ontwikkelt" instead of a week-over-week comparison.
- What if all three wellbeing dimensions are left unrated? → The check-in cannot be submitted without at least one dimension rated (food noise is optional, but the weekly check-in requires at least one score).

## Requirements *(mandatory)*

### Functional Requirements

**Food noise (daily log):**

- **FR-001**: The daily log form MUST include an optional food noise field with a 1–5 scale, labelled "Eetgedachten vandaag" with anchor labels "Nauwelijks aanwezig" (1) and "Constant aanwezig" (5).
- **FR-002**: The food noise field MUST be optional — skipping it MUST NOT prevent log submission.
- **FR-003**: Food noise scores MUST be stored per log entry, linked to the patient and date.
- **FR-004**: The progress chart MUST display a food noise trend line when the patient has 3 or more data points; below 3 the trend line MUST NOT be shown.
- **FR-005**: The food noise trend line MUST be togglable and OFF by default so it does not clutter the default chart view.
- **FR-006**: The system MUST detect a sustained drop in food noise (from ≥4 to ≤2 over 4+ consecutive weeks) and surface a milestone card on the patient dashboard.

**Weekly wellbeing check-in:**

- **FR-007**: The system MUST display a weekly wellbeing check-in prompt on the patient dashboard when 7 or more days have passed since the patient's last completed check-in, or when the patient has never completed one.
- **FR-008**: The check-in MUST include three dimensions — energy ("Energie"), mood ("Stemming"), body confidence ("Zelfvertrouwen") — each rated 1–5 with plain-language labels.
- **FR-009**: The check-in MUST include an optional free-text note field ("Iets bijzonders deze week?", max 200 characters).
- **FR-010**: The check-in MUST require at least one dimension to be rated before it can be submitted.
- **FR-011**: On submission, the patient MUST see a brief summary comparing their scores to the previous week's check-in (or a first-check-in message if no previous data exists).
- **FR-012**: The system MUST suppress the check-in prompt for 7 days after a successful submission.
- **FR-013**: The system MUST track and display a consecutive weekly check-in streak on the dashboard.
- **FR-014**: The system MUST detect when any single wellbeing dimension improves by 2+ points sustained over 4 weeks and surface a milestone card.

**Doctor view:**

- **FR-015**: The doctor's patient Overzicht tab MUST display the food noise trend and the most recent weekly wellbeing scores when data is available.
- **FR-016**: Both food noise and wellbeing data MUST show a neutral empty state on the doctor view when no data exists — no error states.

### Key Entities

- **Food Noise Score**: An optional field on an existing daily log entry. Attributes: log entry reference, score (1–5), date.
- **Weekly Wellbeing Check-in**: A standalone weekly record per patient. Attributes: patient reference, week start date, energy score (1–5, optional), mood score (1–5, optional), body confidence score (1–5, optional), free-text note (optional), submitted timestamp.
- **Wellbeing Streak**: Derived at display time from consecutive completed weekly check-ins. Not stored independently.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Patients can add a food noise score to their daily log in under 5 additional seconds compared to logging without it.
- **SC-002**: The weekly check-in can be completed in under 60 seconds.
- **SC-003**: The food noise trend line appears correctly after 3 or more data points — no false renders below the threshold, no missing renders above it.
- **SC-004**: The weekly check-in prompt appears exactly once per 7-day window — no duplicate prompts, no missed triggers.
- **SC-005**: Milestone cards appear within one dashboard load of the triggering condition being met.
- **SC-006**: Doctors can view food noise and wellbeing trends without navigating away from the Overzicht tab.

## Assumptions

- Food noise scores are stored as a new optional field on the existing `progress_entries` table (same as `hunger_score` was added in migration 012), not as a separate table.
- Weekly wellbeing check-ins require a new table — they are not part of daily log entries because their cadence and dimensions are distinct.
- The 7-day check-in window is calculated from the most recent submission timestamp, not calendar week boundaries (e.g., if submitted on a Wednesday, the next prompt appears on the following Wednesday or later).
- The progress chart already supports multiple data series (weight, hunger) — food noise is added as a third toggleable series using the same chart component.
- Milestone detection runs client-side on dashboard load from existing data, consistent with the consecutive-miss pattern in feature 003.
- Calorie intake tracking is explicitly out of scope for this feature (noted as lower priority in backlog).
