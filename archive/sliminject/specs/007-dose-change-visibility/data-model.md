# Data Model: Dose Change Visibility

## No schema changes

This feature is entirely derived from existing data. No new tables, columns, or migrations are needed.

## Existing entities used

### `dosage_schedule_entries` (read-only)

| Field | Type | Role in this feature |
|-------|------|---------------------|
| `id` | uuid | Used as key for localStorage dismissal |
| `patient_id` | uuid | Filter to current patient |
| `dose_mg` | decimal | Displayed on chart markers, announcement card, injection-day marker |
| `start_date` | date (YYYY-MM-DD) | Determines marker position on chart; drives 7-day lookahead for announcement |
| `status` | enum ('draft', 'approved') | Only 'approved' entries are visible (FR-013) |

### `injection_adherence` (read-only)

| Field | Type | Role in this feature |
|-------|------|---------------------|
| `schedule_entry_id` | uuid | Links adherence to a specific dose step |
| `response` | enum ('confirmed', 'skipped', 'adjusted') | Only 'confirmed' counts toward the 2-injection threshold (FR-018) |

### `progress_entries` (read-only)

| Field | Type | Role in this feature |
|-------|------|---------------------|
| `logged_at` | timestamp | Used to map dose step dates to chart x-positions |

## Derived concepts

### Dose change list

Computed client-side from `dosage_schedule_entries`:

```
Input:  approved entries ordered by start_date ascending
Output: [{date, dose_mg}] for entries where dose_mg differs from the previous entry
```

Excludes the first entry (it's the starting dose, not a "change").

### Announcement eligibility

```
For each upcoming approved dose entry where dose_mg > current dose_mg:
  IF start_date is within 7 days AND entry.id not in localStorage dismissals
  THEN show announcement card
```

### Injection-day new dose status

```
For the current dose level:
  Count injection_adherence records with response='confirmed' for entries at this dose_mg
  IF count < 2 AND current dose_mg > previous dose_mg
  THEN show "Nieuwe dosis" marker
```

## Client-side persistence

### localStorage keys

| Key pattern | Value | Purpose |
|-------------|-------|---------|
| `sliminject_dose_dismissed_{entryId}` | `"1"` | Tracks which announcement cards have been dismissed |
