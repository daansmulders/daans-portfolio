# Research: Wellbeing Tracking — Food Noise & Non-Scale Victories

**Feature**: 004-wellbeing-tracking
**Date**: 2026-03-17

---

## Decision 1: Food noise storage — column on progress_entries

**Decision**: Add a nullable `food_noise_score int` column to the existing `progress_entries` table.

**Rationale**: This is identical to how `hunger_score` was added in migration 012. Food noise is logged daily alongside weight, hunger, and symptoms — it belongs on the same record. No join needed, no schema complexity, no change to existing queries (the column is nullable so all existing inserts continue to work without change).

**Alternatives considered**:
- Separate `food_noise_entries` table — rejected; no benefit for a scalar daily value that maps 1:1 to a log entry.

---

## Decision 2: Weekly wellbeing check-in storage — new table

**Decision**: New `weekly_wellbeing_checkins` table with patient_id, submitted_at, energy_score, mood_score, confidence_score (all nullable int 1–5), and note (text, max 200 chars).

**Rationale**: Weekly check-ins are structurally distinct from daily log entries — different cadence, different dimensions, optional individual scores. A separate table is clean and matches the existing pattern for distinct data types (concerns, advice, appointments each have their own table).

**7-day gate**: Computed client-side by checking whether `max(submitted_at)` from the patient's check-ins is within the last 7 days. Same localStorage-free approach as the adherence check-in gate.

---

## Decision 3: Progress chart — food noise as 3rd toggleable series

**Decision**: Add a `showFoodNoise` toggle prop to the existing `ProgressChart` component. When enabled, render a third `<path>` in violet (`#7C5CBF`) using the same `toY(v, 1, 5)` scale as hunger. Gate visibility at 3+ data points.

**Rationale**: The existing chart already maps 1–5 hunger scores to the same Y-axis as weight via a normalisation function. Food noise uses the same 1–5 scale so it fits naturally as a third series. Off by default to keep the default chart uncluttered.

**Alternatives considered**:
- Separate chart for food noise — rejected; patients benefit from seeing food noise trend alongside weight trend on the same timeline.

---

## Decision 4: Milestone detection — client-side hooks

**Decision**: Two hooks: `useFoodNoiseMilestone` and `useWellbeingMilestone`, both following the `useConsecutiveMiss` pattern from feature 003 — compute state client-side from fetched data, store dismissal in `localStorage` keyed to a data fingerprint.

**Rationale**: Consistent with the established pattern. Avoids Supabase functions or triggers. Data volumes are small enough that client-side computation adds no meaningful latency.

**Food noise milestone logic**: Sustained drop from ≥4 to ≤2 over 4+ weeks — check whether all food noise entries in each of the last 4 calendar weeks have a mean ≤2, and at least one entry in the 4 weeks prior had a score ≥4.

**Wellbeing milestone logic**: For each dimension, if the score improved by 2+ points from the check-in 4 weeks ago to the most recent check-in, trigger the milestone.

---

## Decision 5: Dashboard placement of weekly check-in prompt

**Decision**: Render the weekly check-in prompt as a new section between the `AdherenceCheckIn` card and the consecutive-miss nudge — effectively position 1d in the dashboard order.

**Rationale**: Both are weekly, action-oriented prompts. Grouping them together keeps the top of the dashboard focused on weekly tasks before moving to passive content (doctor messages, chart, etc.).

**Suppression**: A `localStorage` key stores the timestamp of the last submission. The prompt is hidden if `now - lastSubmitted < 7 days`.

---

## Decision 6: Doctor view — Overzicht tab additions

**Decision**: Add food noise toggle to the existing `ProgressChart` already on the Overzicht tab (passes `showFoodNoise` prop). Add a new `WellbeingDoctorSummary` component below the chart showing the patient's most recent check-in scores and trend direction per dimension.

**Rationale**: No new tab needed — the Overzicht tab is already the place for progress overview. Additive changes only; the existing `ProgressChart` and layout are preserved.
