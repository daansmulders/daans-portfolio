# Research: Treatment Phase Summary Cards

**Feature**: 012-treatment-summary-cards
**Date**: 2026-03-18

## Decision 1: Data computation approach

**Decision**: Compute milestone data on-the-fly from existing queries (progress_entries, injection_adherence, weekly_wellbeing_checkins) rather than pre-computing and storing summaries.

**Rationale**: The data volume is tiny (<100 entries per patient). Computing a weight diff, count, and averages from existing data is instant. Pre-computing would add a storage table and sync complexity for no performance benefit at this scale.

**Alternatives considered**:
- Pre-computed summary table (unnecessary complexity, sync issues if entries are edited)
- Background worker to generate summaries (overkill for <100 patients)

## Decision 2: Wellbeing trend heuristic

**Decision**: Compare averages from the first half of treatment to the second half. For each signal (hunger, food noise, symptom count, energy, mood, confidence), compute the average in each half. The signal with the largest positive change becomes the featured trend observation.

**Rationale**: Simple halving avoids the need for rolling windows or statistical models. Comparing first-half to second-half naturally captures improvement direction. Showing only the most notable positive trend keeps the card focused and warm — no negative trends are surfaced.

**Alternatives considered**:
- Linear regression per signal (over-engineered for a prototype)
- Compare last 7 days to overall average (too short-term, sensitive to outliers)
- Show all improving signals (too much data for a summary card)

## Decision 3: Treatment start date source

**Decision**: Fetch `treatment_start_date` from the `patients` table via Supabase. The patient's own auth ID maps to their patient record.

**Rationale**: This field is already set during doctor intake (`PatientIntakeForm.tsx`). It's the canonical source for "when treatment began." No new queries needed — just add it to the patient data fetch.

**Alternatives considered**:
- Derive from first log entry date (inaccurate — patient may log before treatment starts)
- Derive from first dosage schedule entry (misses patients with delayed schema setup)

## Decision 4: Dismissal storage

**Decision**: Use localStorage with key pattern `sliminject_milestone_dismissed_week_{N}`, storing `"true"` as the value. Consistent with existing dismissal patterns (dose announcements, wellbeing milestones, consecutive miss nudge).

**Rationale**: localStorage is the established pattern in this app for dismissals. It's per-device, which is acceptable for a prototype with single-device usage. No server-side storage needed.

**Alternatives considered**:
- Supabase column/table for dismissals (overkill, adds write complexity)
- sessionStorage (would re-show on new session, defeating the purpose)

## Decision 5: Doctor view data access

**Decision**: Create a `useTreatmentMilestones(patientId)` variant that returns all reached milestones for a given patient, ignoring dismissal state. Reuses the same data aggregation logic but skips localStorage checks.

**Rationale**: The doctor needs to see all milestones regardless of what the patient dismissed. A single hook with an optional `patientId` parameter cleanly separates the two use cases: patient (own data, dismissals apply) vs doctor (specific patient, no dismissals).
