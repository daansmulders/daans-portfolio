# Data Model: Dose Adherence Tracking

**Feature**: 003-dose-adherence-tracking
**Date**: 2026-03-17

---

## New Entity: `injection_adherence`

Stores a patient's response for a single scheduled injection cycle.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | uuid | NO | Primary key, auto-generated |
| `patient_id` | uuid | NO | FK → `patients(id)` CASCADE DELETE |
| `schedule_entry_id` | uuid | NO | FK → `dosage_schedule_entries(id)` CASCADE DELETE |
| `response` | text | NO | Enum: `'confirmed'` / `'skipped'` / `'adjusted'` |
| `note` | text | YES | Free-text note for 'adjusted' response (or any response) |
| `recorded_at` | timestamptz | NO | Timestamp when patient submitted the check-in |

**Constraints**:
- `UNIQUE (patient_id, schedule_entry_id)` — one adherence record per cycle per patient; prevents duplicate submissions.
- `response CHECK (response IN ('confirmed', 'skipped', 'adjusted'))`.

**Row Level Security**:
- Patients can INSERT and SELECT their own records: `patient_id = auth.uid()`.
- Doctors can SELECT records for their assigned patients (via existing `get_my_patient_ids()` function), matching the pattern on `dosage_schedule_entries`.
- No patient UPDATE or DELETE — submissions are final for the prototype.

---

## Derived State: Consecutive Miss

Not stored. Computed client-side on dashboard load:

```
last_two = SELECT * FROM injection_adherence
           WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 2

consecutive_miss = (count(last_two) == 2)
               AND (last_two[0].response == 'skipped')
               AND (last_two[1].response == 'skipped')
```

'no response' (missing record for a past cycle) does NOT count as a skip for the consecutive-miss trigger.

---

## Relationship to Existing Entities

```
patients (1) ──────────────────────── (N) injection_adherence
dosage_schedule_entries (1) ────────── (0..1) injection_adherence
```

Each `dosage_schedule_entries` row may have zero or one adherence record. Zero means the patient has not yet responded ("Niet ingevuld") for that cycle.

---

## No-Response State

When a past `dosage_schedule_entries` row has no corresponding `injection_adherence` record, it is treated as "Niet ingevuld" in the doctor's Medicatie tab. This is resolved by a LEFT JOIN on the adherence table — a NULL result = no response.

---

## Migration

New file: `supabase/migrations/015_injection_adherence.sql`

Creates the `injection_adherence` table, unique constraint, check constraint, and RLS policies following the same patterns as `dosage_schedule_entries`.
