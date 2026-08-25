# Research: Dose Adherence Tracking

**Feature**: 003-dose-adherence-tracking
**Date**: 2026-03-17

---

## Decision 1: Where adherence records attach

**Decision**: Each adherence record links to a `dosage_schedule_entries` row (one record per injection cycle per patient).

**Rationale**: The `dosage_schedule_entries` table already holds the scheduled injection date (`start_date`) and is keyed by `patient_id`. Attaching adherence to it avoids duplicating date/dose data and makes the per-cycle indicator on the doctor's Medicatie tab straightforward — one join, one row per timeline entry.

**Alternatives considered**:
- Standalone table keyed only by `(patient_id, cycle_date)` — rejected because it duplicates the schedule and breaks if the doctor edits the schedule.

---

## Decision 2: How to determine the "current" injection cycle

**Decision**: The current cycle is the most recent `dosage_schedule_entries` row where `start_date <= today` for the patient, using the same `localDate()` parsing already in `usePatientDosageSchedule.ts` to avoid UTC offset issues.

**Rationale**: This mirrors the existing "current dose" logic on the patient medication timeline. No new date logic needed.

**Alternatives considered**:
- Fixed weekly cadence from a start date — rejected because patients may be on daily schedules or have irregular titration steps.

---

## Decision 3: Storage — Supabase only (no Dexie queue for adherence)

**Decision**: Adherence responses are written directly to Supabase. No offline queue via Dexie.

**Rationale**: The offline queue exists for progress log entries, which patients may fill in during commutes or without connectivity. Adherence check-ins are a deliberate, dashboard-level action — patients are almost certainly online. Adding Dexie support would require a new Dexie table, a sync hook, and migration logic for minimal gain. If the patient is offline, a short error message ("Geen verbinding — probeer het later opnieuw") is sufficient.

**Alternatives considered**:
- Dexie offline queue for adherence — rejected to avoid unnecessary complexity for an edge case.

---

## Decision 4: Consecutive-miss detection

**Decision**: Computed at read time from the last two adherence records for the current patient. No separate stored field.

**Rationale**: The spec defines this as a derived state (Consecutive Miss State entity). Computing it client-side on dashboard load from the two most recent adherence responses avoids a trigger/function in Supabase and is simple with the small data volume of a prototype.

**Algorithm**:
1. Fetch the two most recent adherence records ordered by `recorded_at` DESC.
2. If both have `response = 'skipped'` → show nudge.
3. If either is 'confirmed' or 'adjusted' → no nudge (streak reset).
4. 'no response' (null) does NOT count as a skip for this purpose.

---

## Decision 5: Dashboard placement of the check-in prompt

**Decision**: Render the check-in prompt between the Log CTA (section 2) and doctor messages (section 3).

**Rationale**: The research shows the dashboard order is: header → Log CTA → doctor messages → treatment updates → chart → entries → content → reminder. The check-in is a weekly action of similar urgency to the log CTA. Placing it immediately after ensures visibility without burying it. It only renders when due (once per cycle, unanswered), so it will not clutter the dashboard on most visits.

---

## Decision 6: Doctor view integration point

**Decision**: Add adherence indicators to the existing Medicatie tab in the doctor's patient profile. Each `dosage_schedule_entries` row in the timeline gets an adherence badge sourced from a join with the new `injection_adherence` table.

**Rationale**: The Medicatie tab already renders the titration timeline. Augmenting it requires only a new query join and a badge component — no new tab or navigation needed.
