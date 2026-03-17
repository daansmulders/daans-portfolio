# Data Model: Unified Injection-Day Experience

No schema changes. All records use existing tables. This document maps which fields are written by the injection-day card submission.

---

## Records written on "Ja, genomen" submission

### 1. `injection_adherence` (existing table)

| Field | Value | Notes |
|-------|-------|-------|
| `patient_id` | current user id | |
| `schedule_entry_id` | id of the current schedule entry | from `useAdherenceCheckIn` |
| `response` | `'confirmed'` | |
| `note` | `null` | adjusted-dose note not collected in the unified card |

### 2. `progress_entries` (existing table)

| Field | Value | Notes |
|-------|-------|-------|
| `patient_id` | current user id | |
| `logged_at` | now() | |
| `weight_kg` | patient input or null | optional |
| `hunger_score` | patient input | required (default 3 as in LogEntryForm) |
| `food_noise_score` | patient input or null | weekly framing: "Hoe aanwezig waren je eetgedachten deze week?" |
| `wellbeing_score` | null | not collected in this card |
| `symptoms` | `[]` | not collected in this card |
| `notes` | patient input or null | optional free text |

### 3. `weekly_wellbeing_checkins` (existing table)

Only written if the energy score field is non-null OR a note is provided.

| Field | Value | Notes |
|-------|-------|-------|
| `patient_id` | current user id | |
| `submitted_at` | now() | |
| `energy_score` | patient input or null | weekly reflection |
| `mood_score` | null | not collected in injection-day card |
| `confidence_score` | null | not collected in injection-day card |
| `note` | patient input or null | shared note field (max 200 chars) |

---

## Records written on "Nee, overgeslagen" / "Andere dosis" submission

Only `injection_adherence` is written. No progress entry or wellbeing check-in.

| Field | Value |
|-------|-------|
| `response` | `'skipped'` or `'adjusted'` |
| `note` | free-text note (adjusted only) |

---

## Injection-day detection (client-side, read-only)

No new stored field. Derived at render time:

```
injectionDates: Set<string>  ←  schedule entries' start_date values (YYYY-MM-DD)
isInjectionDayEntry(entry) = injectionDates.has(entry.logged_at.slice(0, 10))
```

Used in:
- `PatientDashboard` recent entries list → shows "Injectiedag" badge
- `PatientProfile` Medicatie tab adherence list → shows associated weight/hunger inline
