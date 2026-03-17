# Research: Unified Injection-Day Experience

## Decision 1: Where energy score from the injection-day card is stored

**Decision**: Save the energy score (and optional note from the injection-day card) as a `weekly_wellbeing_checkins` row — the same table used by the existing `WellbeingCheckIn`.

**Rationale**: `weekly_wellbeing_checkins` already has `energy_score`, `mood_score`, `confidence_score`, and `note` columns. Storing injection-day energy data there means: (1) no schema changes, (2) it automatically appears in the doctor's `WellbeingDoctorSummary` alongside other check-in data, and (3) the existing `useWellbeingCheckIn` `isDue` logic (7-day gate) naturally suppresses the standalone wellbeing card on injection day — the injection-day card subsumes it.

**Alternatives considered**:
- Add `energy_score` to `progress_entries`: would require a schema change and conflate two conceptually different record types.
- Store nowhere (drop energy from injection-day card): loses the non-scale victory signal that is central to the product's value proposition.

---

## Decision 2: How to detect injection-day entries for visual distinction (no schema change)

**Decision**: Derive a `Set<string>` of injection-day date strings (YYYY-MM-DD) from the dosage schedule, then compare each log entry's `logged_at` date against that set in the dashboard and doctor views.

**Rationale**: `dosage_schedule_entries` already exists and is fetched on the dashboard via `usePatientDosageSchedule` and in the doctor's Medicatie tab via `useDosageSchedule`. Each schedule entry's `start_date` is the injection date for that dose period (weekly cadence). Cross-referencing is O(n) at most and can be done inside a `useMemo`.

**Alternatives considered**:
- Add `is_injection_day boolean` column to `progress_entries`: cleaner long-term but violates the no-schema-change constraint.
- Use the adherence records as a proxy (if an adherence record exists for a schedule entry whose `start_date` matches the log date): works but requires the adherence data to be loaded in the patient dashboard, which it currently is not (only loaded in the doctor view and within `useAdherenceCheckIn`). Adds a fetch.
- Accept visual distinction only for future entries (not historical): simplest but loses value for existing data.

**Selected approach**: Derive from schedule. The schedule is already in memory on both the patient dashboard (via `usePatientDosageSchedule`) and doctor profile (via `useDosageSchedule`). Pass the injection date set as a prop to the entries list renderer.

---

## Decision 3: Whether to suppress the standalone WellbeingCheckIn on injection days

**Decision**: Yes — if the injection-day card is shown (i.e. `isDue` for adherence), suppress the standalone `<WellbeingCheckIn>` card. The injection-day card collects energy and note, which covers the most critical dimension. After the injection-day card is submitted, `useWellbeingCheckIn.isDue` will become false for 7 days (standard gate) since a check-in record was just saved.

**Rationale**: Showing both the injection-day card and the wellbeing card on the same day would reintroduce the "two separate tasks" problem we're solving. The injection-day card's energy question satisfies the check-in requirement for that week.

**Alternatives considered**:
- Show both: reverts to the original problem.
- Show wellbeing card after injection-day card is completed: adds sequential friction on an already busy day.

---

## Decision 4: Offline behaviour for the three-record save

**Decision**: The injection-day card saves records in this order: (1) `progress_entries` via the existing offline queue (Dexie), (2) `injection_adherence` directly to Supabase (online-only, matching the existing `useAdherenceCheckIn` behaviour), (3) `weekly_wellbeing_checkins` directly to Supabase (online-only, matching existing `useWellbeingCheckIn` behaviour).

**Rationale**: Maintains the existing offline strategy: weight/hunger/food-noise data is the most clinically valuable and already has offline support. Adherence and wellbeing check-ins are currently online-only and that remains unchanged.

**Alternatives considered**:
- Queue all three offline: significant scope expansion; adherence and wellbeing have never been offline-capable and adding Dexie support for them is a separate backlog item.
- Block submission if offline: bad UX; patients should always be able to log their injection day data.

**Consequence**: If the patient is offline on injection day, the progress entry is queued and synced later, but the adherence and wellbeing records are not saved. A toast informs the patient of the partial save.
