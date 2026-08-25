# Feature Specification: Dose Adherence Tracking

**Feature Branch**: `003-dose-adherence-tracking`
**Created**: 2026-03-17
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Patient logs weekly injection (Priority: P1)

A patient opens the app on or after their scheduled injection day and sees a prompt asking whether they took their injection. They respond and the answer is saved alongside their other log data.

**Why this priority**: Without recording whether the injection was actually taken, all other logged data (weight, symptoms, hunger) lacks clinical context. This is the foundational data point for the feature.

**Independent Test**: Can be fully tested by a patient with an active dosage schedule — confirm the prompt appears on injection day, all three response options work, and the answer appears in the log history.

**Acceptance Scenarios**:

1. **Given** a patient has an active dosage schedule with a scheduled injection day, **When** they open the dashboard on or after that day and haven't responded this cycle yet, **Then** an injection check-in prompt is shown on the dashboard.
2. **Given** the prompt is visible, **When** the patient taps "Ja, genomen", **Then** the response is saved and the prompt disappears.
3. **Given** the prompt is visible, **When** the patient taps "Nee, overgeslagen", **Then** the response is saved as a missed dose and the prompt disappears.
4. **Given** the prompt is visible, **When** the patient taps "Andere dosis", **Then** they can add a free-text note before saving.
5. **Given** the patient has already responded this cycle, **When** they return to the dashboard, **Then** the prompt does not appear again until the next injection cycle.

---

### User Story 2 — Consecutive missed dose nudge (Priority: P2)

After a patient misses two injections in a row, the app surfaces a gentle nudge suggesting they message their doctor.

**Why this priority**: Two consecutive missed doses is a meaningful clinical signal. Catching it early — before the patient silently discontinues — supports retention. Depends on Story 1.

**Independent Test**: Can be tested by logging two consecutive "Nee, overgeslagen" responses and confirming the nudge appears on the next dashboard visit.

**Acceptance Scenarios**:

1. **Given** a patient has skipped two consecutive scheduled injections, **When** they open the dashboard, **Then** a nudge appears: "Je hebt je injectie twee keer overgeslagen — wil je je arts een berichtje sturen?"
2. **Given** the nudge is visible, **When** the patient taps the CTA, **Then** they are taken to the concern submission screen.
3. **Given** the nudge is visible, **When** the patient dismisses it, **Then** it does not reappear unless a new consecutive-miss condition occurs.
4. **Given** a patient missed once but then confirms the next injection, **When** they view the dashboard, **Then** no nudge is shown (streak resets on confirmed dose).

---

### User Story 3 — Doctor views adherence on patient profile (Priority: P3)

A doctor reviewing a patient's profile can see per treatment cycle whether the patient confirmed, skipped, or adjusted their dose — alongside the existing titration timeline.

**Why this priority**: The clinical value is fully realised when the doctor can act on it. Without doctor visibility, Stories 1 and 2 only help the patient. Depends on Story 1.

**Independent Test**: Can be tested by a doctor opening a patient profile with at least 4 weeks of adherence data and verifying the Medicatie tab shows indicators per cycle.

**Acceptance Scenarios**:

1. **Given** a patient has submitted adherence responses for multiple cycles, **When** a doctor opens the Medicatie tab on that patient's profile, **Then** each scheduled dose entry shows an adherence indicator (confirmed / skipped / adjusted / no response).
2. **Given** a patient skipped a dose, **When** the doctor views that cycle's entry, **Then** the skipped status is visually distinct but not alarmist.
3. **Given** a patient has no adherence responses yet, **When** the doctor views the Medicatie tab, **Then** entries show a neutral "Niet ingevuld" state with no error or warning.

---

### Edge Cases

- What happens when a patient has no dosage schedule defined? → The check-in prompt must not appear; it is entirely dependent on a scheduled injection date existing.
- What if the patient never responds to the prompt for a given cycle? → The cycle is stored as "Niet ingevuld" (no response) — distinct from a confirmed skip, so it does not count toward the consecutive-miss trigger.
- What happens when a patient edits their dosage schedule after submitting adherence responses? → Past responses are preserved; future prompts align to the updated schedule.
- What if a patient is on a daily injection rather than weekly? → The prompt cadence follows the actual schedule frequency, not a hardcoded weekly assumption.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display an injection check-in prompt on the patient dashboard on or after the patient's scheduled injection day, when no response has been recorded for that cycle.
- **FR-002**: The check-in prompt MUST offer three response options: confirmed ("Ja, genomen"), skipped ("Nee, overgeslagen"), and adjusted dose ("Andere dosis").
- **FR-003**: The "Andere dosis" option MUST allow the patient to add a free-text note before saving.
- **FR-004**: The system MUST store the adherence response (confirmed / skipped / adjusted / no response) linked to the corresponding scheduled dose entry.
- **FR-005**: The system MUST suppress the check-in prompt for the current cycle once the patient has responded.
- **FR-006**: The system MUST detect when a patient has recorded two consecutive skipped injection cycles and display a nudge prompting them to contact their doctor.
- **FR-007**: The nudge MUST include a direct action that opens the concern submission screen.
- **FR-008**: The nudge MUST be dismissible and MUST NOT reappear until a new consecutive-miss condition is triggered.
- **FR-009**: The doctor's Medicatie tab MUST display a per-cycle adherence indicator alongside each titration timeline entry.
- **FR-010**: The adherence indicator MUST visually distinguish between: confirmed, skipped, adjusted, and no response — in a way that is informative but not alarmist.
- **FR-011**: The check-in prompt cadence MUST respect the patient's actual injection schedule frequency rather than assuming a fixed weekly interval.

### Key Entities

- **Adherence Record**: A patient's response for a single injection cycle. Key attributes: patient reference, scheduled dose entry reference, response type (confirmed / skipped / adjusted / no response), optional free-text note, recorded timestamp.
- **Dosage Schedule Entry**: Existing entity representing a scheduled dose on a specific date. Adherence records attach to this entity.
- **Consecutive Miss State**: Derived at display time from the last N adherence records — used to trigger the nudge. Not stored as a separate entity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Patients with an active dosage schedule can complete an adherence check-in in under 10 seconds.
- **SC-002**: Doctors can identify at a glance which cycles a patient skipped their injection without leaving the Medicatie tab.
- **SC-003**: The consecutive-miss nudge appears after exactly two consecutive skipped cycles — no false positives, no missed triggers.
- **SC-004**: The check-in prompt never appears for patients without a defined dosage schedule.
- **SC-005**: Skipped and "no response" states are visually distinguishable on the doctor's patient view.

## Assumptions

- The existing dosage schedule provides a reliable source of scheduled injection dates per patient.
- Weekly and daily injection frequencies are sufficient for this iteration; variable or irregular schedules are out of scope.
- "Andere dosis" covers both self-reduced and self-increased doses; a free-text note is sufficient without a structured dose-amount field.
- The concern submission screen is already functional — the nudge CTA links to it without requiring changes to that screen.
- Adherence data does not need to sync in real-time to the doctor's view; refreshing the patient profile is sufficient.
