# Data Model: Wellbeing Tracking — Food Noise & Non-Scale Victories

**Feature**: 004-wellbeing-tracking
**Date**: 2026-03-17

---

## Modified Entity: `progress_entries` (existing)

Add one nullable column:

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `food_noise_score` | int | YES | New column. Score 1–5. `CHECK (food_noise_score BETWEEN 1 AND 5)`. All existing rows remain valid (NULL = not recorded). |

No RLS changes needed — the existing policies on `progress_entries` already cover this column.

**Migration**: `017_food_noise_score.sql`

---

## New Entity: `weekly_wellbeing_checkins`

Stores a patient's weekly self-assessment across three wellbeing dimensions.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | uuid | NO | Primary key, auto-generated |
| `patient_id` | uuid | NO | FK → `patients(id)` CASCADE DELETE |
| `submitted_at` | timestamptz | NO | Timestamp of submission, default now() |
| `energy_score` | int | YES | 1–5. `CHECK (energy_score BETWEEN 1 AND 5)` |
| `mood_score` | int | YES | 1–5. `CHECK (mood_score BETWEEN 1 AND 5)` |
| `confidence_score` | int | YES | 1–5. `CHECK (confidence_score BETWEEN 1 AND 5)` |
| `note` | text | YES | Free text. `CHECK (char_length(note) <= 200)` |

**Constraints**:
- At least one score must be non-null at the application level (enforced client-side, not DB constraint, consistent with prototype conventions).

**Row Level Security**:
- Patients can INSERT and SELECT their own records: `patient_id = auth.uid()`.
- Doctors can SELECT records for their assigned patients via `get_my_patient_ids()`.
- No UPDATE or DELETE — submissions are final.

**Migration**: `018_weekly_wellbeing_checkins.sql`

---

## Derived States (computed client-side, not stored)

**Wellbeing Streak**
- Computed from `weekly_wellbeing_checkins` ordered by `submitted_at` DESC.
- Count consecutive submissions where each is within 14 days of the previous (allows a 1-week grace window).

**7-day Check-in Gate**
- `isDue = now() - max(submitted_at) >= 7 days` (or no prior submission).
- Stored locally in `localStorage` timestamp for instant UI response before data loads.

**Food Noise Milestone**
- Triggered when: mean food noise in each of the last 4 calendar weeks is ≤2, AND at least one entry in the preceding 4 weeks had a score ≥4.
- Dismissal keyed to `localStorage` with a fingerprint of the triggering data window.

**Wellbeing Dimension Milestone**
- Per dimension: triggered when the most recent check-in score is 2+ points higher than the check-in from 4 weeks prior.
- Each dimension tracked independently with its own localStorage dismissal key.

---

## Relationships

```
patients (1) ──────────────────────── (N) weekly_wellbeing_checkins
patients (1) ──────────────────────── (N) progress_entries (existing, + food_noise_score)
```

---

## Migrations

- `017_food_noise_score.sql` — ALTER TABLE progress_entries, add food_noise_score column
- `018_weekly_wellbeing_checkins.sql` — CREATE TABLE, RLS policies
