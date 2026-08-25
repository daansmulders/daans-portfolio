# Research: Dose Change Visibility

## Decision 1: Chart marker positioning strategy

**Decision**: Map dose step dates to the chart's existing sequential x-axis by finding the nearest progress entry by date, rather than introducing a time-based x-axis.

**Rationale**: The `ProgressChart` currently uses sequential indexing (`toX(i, total)`) — each data point gets equal spacing regardless of time gaps. Converting to a date-based axis would be a large refactor affecting all existing chart lines. Instead, for each dose change we find the closest progress entry by date and place the marker at that entry's x-position. If no entry exists near the dose date, the marker is placed at the interpolated position between the nearest entries.

**Alternatives considered**:
- **Time-based x-axis**: Most accurate placement, but requires rewriting all path calculations and breaking the existing chart layout. Rejected as too large a change for this feature.
- **Append dose dates as phantom entries**: Would mess with data line rendering. Rejected.

## Decision 2: Dose change detection — which entries count

**Decision**: Compare consecutive `dosage_schedule_entries` with status `'approved'` ordered by `start_date`. A "dose change" is any entry where `dose_mg` differs from the previous entry.

**Rationale**: The existing `usePatientDosageSchedule` hook already fetches all entries ordered by start_date with status. Filtering to approved-only and comparing consecutive doses gives a clean list of actual changes. Draft entries are excluded per spec (FR-013).

**Alternatives considered**:
- **Server-side computed dose changes**: Would require a new Supabase query or view. Overkill for a prototype with small data volumes.
- **Using `current` vs `nextIncrease` from existing hook**: Only gives the latest change, not the full history needed for chart markers.

## Decision 3: Announcement card dismissal persistence

**Decision**: Use localStorage with a key pattern `sliminject_dose_dismissed_{entryId}` set to `"1"`.

**Rationale**: Simple, matches existing patterns in the codebase (reminder preferences already use localStorage). Persists across page refreshes and sessions on the same device. Acceptable for prototype scope — production would move to server-side.

**Alternatives considered**:
- **Supabase table for dismissals**: Robust but requires a schema change, which is out of scope.
- **Session storage**: Too ephemeral — dismissed cards would reappear on new sessions.
- **React state only**: Lost on refresh, poor UX.

## Decision 4: "Nieuwe dosis" marker — counting confirmed injections

**Decision**: Count `injection_adherence` records with `response = 'confirmed'` for schedule entries at the current dose level. If count < 2, show the marker.

**Rationale**: The `useAdherence` hook already fetches all adherence records for the patient. Filtering by the current dose's schedule entries and counting confirmed responses is a pure client-side computation — no new queries needed.

**Alternatives considered**:
- **Count any adherence response (including skipped/adjusted)**: Spec says only "confirmed" counts (FR-018). A patient who skipped their first injection at a new dose should still see the marker on their next injection day.

## Decision 5: Passing dose data to ProgressChart

**Decision**: Add an optional `doseSteps` prop to `ProgressChart` — an array of `{ date: string; dose_mg: number }`. The chart component handles positioning and rendering internally.

**Rationale**: Keeps the chart component self-contained. Both patient dashboard and doctor view already have access to schedule entries (via `usePatientDosageSchedule` and `useDosageSchedule` respectively) and can derive the dose steps array before passing it as a prop.

**Alternatives considered**:
- **ProgressChart fetches its own dose data**: Violates the existing pattern where the chart is a pure rendering component that receives data via props. Rejected.
