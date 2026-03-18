# Data Model: Treatment Phase Summary Cards

**Feature**: 012-treatment-summary-cards
**Date**: 2026-03-18

## Entity Changes

None. This feature computes milestone data from existing tables and stores dismissal state in localStorage.

## Data Sources (read-only)

### patients table

| Field | Used for |
|-------|----------|
| treatment_start_date | Calculate which milestones (4, 8, 12, 16 weeks) have been reached |

### progress_entries table

| Field | Used for |
|-------|----------|
| weight_kg | Cumulative weight change (first ever vs most recent at milestone) |
| logged_at | Log count within milestone period; temporal bucketing for trend analysis |
| hunger_score | Wellbeing trend: hunger average comparison (first half vs second half) |
| food_noise_score | Wellbeing trend: food noise average comparison |
| symptoms | Wellbeing trend: symptom frequency comparison |

### injection_adherence table

| Field | Used for |
|-------|----------|
| response | Count confirmed vs total scheduled in milestone period |
| recorded_at | Filter to milestone period |

### weekly_wellbeing_checkins table

| Field | Used for |
|-------|----------|
| energy_score | Wellbeing trend: energy comparison |
| mood_score | Wellbeing trend: mood comparison |
| confidence_score | Wellbeing trend: confidence comparison |
| submitted_at | Filter to milestone period |

## Computed Milestone Data (not stored)

| Field | Type | Description |
|-------|------|-------------|
| week | number | Milestone week (4, 8, 12, or 16) |
| weightChange | number \| null | Cumulative kg change since first weight entry |
| logCount | number | Total progress entries in milestone period |
| adherenceConfirmed | number \| null | Confirmed injections in period |
| adherenceTotal | number \| null | Total scheduled injections in period |
| trendObservation | string \| null | i18n key for the most notable positive wellbeing trend |

## Dismissal State (localStorage)

| Key pattern | Value | Description |
|-------------|-------|-------------|
| `sliminject_milestone_dismissed_week_{N}` | `"true"` | Set when patient dismisses milestone N |
