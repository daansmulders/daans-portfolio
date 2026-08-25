# Feature Specification: Unified Injection-Day Experience

**Feature Branch**: `006-injection-day-experience`
**Created**: 2026-03-17
**Status**: Draft

## Overview

On the day a patient is scheduled to inject, the app currently shows two separate, unrelated cards: an adherence check-in ("Heb je je injectie gezet?") and a daily log form (weight, hunger, food noise, symptoms, notes). They share no context and feel like two different apps. This feature replaces both with a single, guided "Injectiedag" card that follows the natural flow of an injection day — confirm the injection, then briefly reflect on how you're doing. On non-injection days, the daily log form remains exactly as it is today.

This is a UX consolidation. The underlying data records (adherence response and progress log entry) are unchanged; only the surface through which patients create them changes.

---

## User Scenarios & Testing

### User Story 1 — Guided injection-day check-in (Priority: P1)

On their scheduled injection day, a patient opens the app and is greeted by a single card that walks them through confirming their injection and logging a brief check-in. The flow is sequential: first confirm the injection, then — only after confirming — fill in weight, hunger, and a brief wellbeing check (energy, food noise for the week, optional note). The experience ends with a warm acknowledgement.

**Why this priority**: This is the core of the feature and the root cause of the "two separate apps" feeling identified in the journey map. It must be working before any other story is useful.

**Independent Test**: Navigate to the patient dashboard on a day matching the injection schedule. The unified card appears, the patient completes all steps, and both an adherence record and a log entry are saved. The standalone adherence card and standalone log form are absent.

**Acceptance Scenarios**:

1. **Given** today is a scheduled injection day and neither an adherence record nor a log entry exists for today, **When** the patient opens the dashboard, **Then** the unified Injectiedag card is shown in place of the standalone adherence check-in card and the daily log form.
2. **Given** the Injectiedag card is shown, **When** the patient taps "Ja, genomen", **Then** the card reveals the log fields (weight, hunger, energy, food noise for the week, note) without requiring navigation to a separate form.
3. **Given** the patient has filled in weight and hunger and submits, **Then** an adherence record ("confirmed") and a progress log entry are both saved, and a brief acknowledgement message is shown.
4. **Given** the patient taps "Ja, genomen" and submits without filling in any optional fields, **Then** the adherence record is saved and a minimal log entry is created — submission is not blocked by empty optional fields.
5. **Given** the patient has already confirmed their injection today, **When** they return to the dashboard, **Then** the Injectiedag card is no longer shown.

---

### User Story 2 — Skipped or adjusted injection (Priority: P2)

A patient who did not take their injection (or took a different dose) can still complete the Injectiedag card. The "Nee, overgeslagen" and "Andere dosis" paths behave exactly as the current standalone adherence check-in — no log fields are shown, the adherence record is saved, and the existing consecutive-miss nudge logic continues to operate.

**Why this priority**: Skipping is a common, clinically significant event. All response paths must work before the feature is shippable.

**Independent Test**: Select "Nee, overgeslagen" in the Injectiedag card. An adherence record with response "skipped" is saved. No log entry is created. The consecutive-miss nudge fires correctly after 2 skips.

**Acceptance Scenarios**:

1. **Given** the Injectiedag card is shown, **When** the patient taps "Nee, overgeslagen", **Then** an adherence record ("skipped") is saved and the card closes — no log fields are presented.
2. **Given** the patient taps "Andere dosis", **Then** a short text field appears for an optional note; submitting saves an adherence record ("adjusted") without a log entry.
3. **Given** a patient has skipped 2 consecutive injections, **When** they skip again via the Injectiedag card, **Then** the existing consecutive-miss nudge fires as before.

---

### User Story 3 — Non-injection days unchanged (Priority: P3)

On days that are not scheduled injection days, the daily log form appears exactly as it does today. No change in behaviour, layout, or content.

**Why this priority**: Regression guard. Non-injection days are the majority of days — this story ensures the feature introduces no regressions.

**Independent Test**: Open the dashboard on any non-injection day. The standard daily log form appears. No Injectiedag card is visible.

**Acceptance Scenarios**:

1. **Given** today is not a scheduled injection day, **When** the patient opens the dashboard, **Then** the daily log form appears as normal and the Injectiedag card is absent.
2. **Given** no dosage schedule has been set for the patient, **When** the patient opens the dashboard, **Then** the daily log form appears as normal — the Injectiedag card never appears without a schedule.

---

### Edge Cases

- What if the patient opens the app after already completing the standalone adherence check-in on the same day (pre-migration data)? The Injectiedag card must not reappear if an adherence record for today already exists.
- What if the doctor updates the injection schedule mid-treatment? The card reflects the updated schedule from the next injection day forward — no retroactive changes.
- What if the patient is offline on injection day? The card still appears and queues both records offline, consistent with existing offline behaviour.
- What if the patient submits only the adherence confirmation and closes the app before filling in log fields? The adherence record is saved; the log entry is omitted. No partial-record ambiguity.
- What if today matches an injection day but the patient has already logged a progress entry earlier today via a different path? The adherence confirmation step still appears; the log fields are pre-filled or suppressed based on the existing entry.

---

## Requirements

### Functional Requirements

- **FR-001**: On a scheduled injection day, the dashboard MUST display a unified Injectiedag card instead of both the standalone adherence check-in card and the daily log form.
- **FR-002**: The Injectiedag card MUST present the injection confirmation step first ("Ja, genomen" / "Nee, overgeslagen" / "Andere dosis") before revealing any log fields.
- **FR-003**: Log fields (weight, hunger, energy, a weekly food noise reflection, optional note) MUST only appear after the patient selects "Ja, genomen."
- **FR-004**: All log fields within the Injectiedag card MUST be optional — the patient can submit after confirming the injection with no other fields filled.
- **FR-005**: Submitting the Injectiedag card MUST save two separate records: an adherence response record and a progress log entry — identical in structure to the records created by the current standalone cards.
- **FR-006**: After a successful "Ja, genomen" submission, the dashboard MUST show a brief acknowledgement message (e.g. "Injectie genoteerd. Zo houd je je behandeling op koers.") before returning to the normal dashboard state.
- **FR-007**: The Injectiedag card MUST NOT reappear on the same day once an adherence response has been recorded for today.
- **FR-008**: Selecting "Nee, overgeslagen" or "Andere dosis" MUST save an adherence record and close the card without presenting log fields.
- **FR-009**: The existing consecutive-miss nudge logic (fires after 2 skipped injections) MUST continue to operate without changes.
- **FR-010**: On all non-injection days, the daily log form MUST appear exactly as it does today — no changes in layout, fields, or behaviour.
- **FR-011**: If no dosage schedule exists for the patient, the dashboard MUST fall back to the standard daily log form; the Injectiedag card MUST NOT appear.
- **FR-012**: The feature MUST function in offline conditions — adherence and log data queued offline MUST sync when connectivity returns, consistent with existing offline behaviour.
- **FR-013**: Injection-day check-in entries MUST be visually distinguished from regular daily log entries in the patient's own history view — for example with an injection-day marker or a distinct card treatment.
- **FR-014**: Injection-day check-in entries MUST be visually distinguished from regular daily log entries in the doctor's patient profile view, so the doctor can immediately identify which entries reflect a full weekly reflection.
- **FR-015**: The food noise question in the injection-day card MUST be phrased as a weekly look-back ("Hoe aanwezig waren je eetgedachten deze week?") to distinguish it from the daily log framing. The daily log food noise field and its existing framing remain unchanged.

### Key Entities

- **Injection day**: A calendar date that matches a scheduled injection in the patient's dosage schedule, determined by the schedule's start date and injection cadence (weekly).
- **Adherence record**: Records whether a patient confirmed, skipped, or adjusted their injection for a specific scheduled dose entry. Structure unchanged from the existing implementation.
- **Progress log entry**: A single-day measurement: weight (optional), hunger score, food noise score (daily framing, unchanged), and optional note. Daily log entries are not visually distinguished from each other.
- **Injection-day check-in**: A richer weekly record collected on injection day via the unified card. Contains the adherence response plus: weight, hunger, energy, food noise (weekly framing — "Hoe aanwezig waren je eetgedachten deze week?"), and optional note. This record is visually distinct from regular daily logs in both the patient history view and the doctor's patient profile — for example, shown with an injection-day marker or a different card style — so both patient and doctor can immediately see which entries reflect a full injection-week reflection vs. a routine daily log.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: On injection days, the combined completion rate of adherence confirmation + at least one log field improves compared to the current rate of patients completing both standalone cards in the same session.
- **SC-002**: The full Injectiedag card (confirm + optional fields + submit) can be completed in under 60 seconds.
- **SC-003**: Adherence records and log entries created via the unified card are structurally identical to those created via the current standalone cards — the doctor's patient profile shows no regression in data display.
- **SC-004**: On non-injection days, the log form completion rate is unchanged — verified by comparing pre- and post-deploy log entry counts per day of week.
- **SC-005**: Zero data loss on offline injection days — adherence and log records queued offline sync correctly and completely on reconnect.

---

## Assumptions

- The injection day-of-week is already encoded in the dosage schedule (`start_date` field) and the existing adherence hook already determines whether today is an injection day. This logic is reused, not rebuilt.
- Food noise is collected in both contexts: the daily log retains the existing daily-framed food noise field unchanged, and the injection-day card adds a weekly-framed food noise question. Both store a food noise score, but the weekly version carries the context of the full week and is visually surfaced differently in history and doctor views.
- The acknowledgement message after confirming the injection is a transient in-card state, not a persistent toast. It is shown within the card's completion step before the card dismisses.
- "Andere dosis" behaviour matches the current standalone card exactly: a text field appears for an optional note, submitting saves an adherence record with response "adjusted."
- The doctor-side UI requires no changes — it reads from the same underlying records.

---

## Out of Scope

- Changes to the doctor-facing UI.
- Dose increase announcement cards (backlog item 7 — separate feature).
- Proactive side-effect tips on injection day (backlog item — not yet scheduled).
- Any changes to the database schema or data model.
- Changes to how adherence or log data is displayed in the patient's own history view.
- Goal weight tracking or wellbeing history view (separate deferred items).
